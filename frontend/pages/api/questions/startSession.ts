// PATCH /api/questions/setTopic

import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/User";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import {
  SET_TOPIC_PROMPTS,
  SYSTEM_METADATA_PROMPTS,
  OPENAI_TOOLS,
} from "@/constants";
import { OpenAIProcessor } from "@/utils/OpenAIProcessor";
import Topic from "@/models/Topic";
import {
  setOnExplanationReceiveData,
  setOnQuestionCreateReceiveData,
  setOnRegisterRelationshipReceiveData,
  setOnRegisterTopicReceiveData,
  setSendMetadataFromDatabases,
} from "@/utils/openai_endpoint";
import { Question } from "@/models";

const client = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

// Function Overrides

setOnQuestionCreateReceiveData(async (uid, session_id, question) => {
  try {
    await dbConnect();

    // We have received a new question from the OpenAI endpoint
    // We need to save this question to the database
    const {
      question: questionText,
      choice_1,
      choice_2,
      choice_3,
      choice_4,
      correct_choice,
    } = question;

    // Save the question to the database
    await Question.create({
      question: questionText,
      choices: {
        "1": choice_1,
        "2": choice_2,
        "3": choice_3,
        "4": choice_4,
      },
      correctChoice: correct_choice,
      createdBy: uid,
      createdAt: new Date(),
      sessionId: session_id,
    });
  } catch (error) {
    console.error(error);
  }
});

setOnRegisterTopicReceiveData(
  async (uid, session_id, topic_name, topic_description) => {
    try {
      await dbConnect();

      // First identify if the topic already exists
      const existingTopic = await Topic.findOne({
        name: topic_name,
        createdBy: uid,
        sessionId: session_id,
      });

      // If the topic already exists, update the description
      if (existingTopic) {
        existingTopic.description = topic_description || "";
        await existingTopic.save();
      } else {
        // If the topic does not exist, create a new topic
        await Topic.create({
          name: topic_name,
          description: topic_description || "",
          createdBy: uid,
          sessionId: session_id,
        });
      }
    } catch (error) {
      console.error(error);
    }
  }
);

setOnRegisterRelationshipReceiveData(
  async (uid, session_id, topic_name, child_topic, strength) => {
    try {
      await dbConnect();

      // Locate the prereqTopic in the database
      const prereqTopic = await Topic.findOne({
        name: topic_name,
        createdBy: uid,
        sessionId: session_id,
      });

      // If the prereqTopic is not found, return an error
      if (!prereqTopic) {
        console.error(`Prerequisite topic "${topic_name}" not found`);
        return;
      }

      // Create a new relationship object
      const newRelationship = {
        child_topic,
        strength,
      };

      // Add the new relationship to the prereqTopic
      prereqTopic.relationships.value.push(newRelationship);
      await prereqTopic.save();
    } catch (error) {
      console.error(error);
    }
  }
);
setOnExplanationReceiveData(async (uid, session_id, explanation) => {
  try {
    await dbConnect();

    // Find the current latest explanation for the user, or create it
    const user = await User.findOne({ auth0Id: uid });
    if (!user) {
      console.error("User not found");
      return;
    }

    // Update the latest explanation for the user
    user.latestExplanation = explanation;
    await user.save();
  } catch (error) {
    console.error(error);
  }
});

async function StartSession(req: NextApiRequest, res: NextApiResponse) {
  const { topic, sessionId } = await req.body;

  if (!topic || typeof topic !== "string") {
    return res.status(400).json({ message: "Invalid topic provided" });
  }

  try {
    // Connect to Database
    await dbConnect();

    // Retrieve user session & details
    const session = await getSession(req, res);
    if (!session || !session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { sub: auth0Id } = session.user;

    // Find user in database
    const user = await User.findOne({ auth0Id });
    // If the user is not found, create a new user
    if (!user) {
      await User.create({
        auth0Id,
        topic,
        name: session.user.name,
        email: session.user.email,
      });
    }

    // Get current topics for user
    const topics = await Topic.find({
      createdBy: auth0Id,
      sessionId: sessionId,
    });

    // Clean topics to remove unnecessary fields (createdBy, _id)
    const cleanedTopics = topics.map((t) => {
      let tempValue = JSON.parse(JSON.stringify(t.relationships.value));
      tempValue = tempValue.map((v) => {
        delete v._id;
        return v;
      });

      return {
        name: t.name,
        description: t.description,
        relationships: {
          description: t.relationships.description,
          value: tempValue,
        },
      };
    });

    const metadata = {
      current_topic: {
        description: SYSTEM_METADATA_PROMPTS.current_topic,
        value: topic,
      },
      registered_topics: {
        description: SYSTEM_METADATA_PROMPTS.registered_topics,
        value: cleanedTopics,
      },
      favorited_questions: {
        description: SYSTEM_METADATA_PROMPTS.favorited_questions,
        value: [],
      },
      historical_questions: {
        description: SYSTEM_METADATA_PROMPTS.historical_questions,
        value: [],
      },
    };
    const payload = [
      {
        role: SET_TOPIC_PROMPTS.agent_role.role,
        content: SET_TOPIC_PROMPTS.agent_role.content,
      },
      {
        role: SET_TOPIC_PROMPTS.system_description.role,
        content: SET_TOPIC_PROMPTS.system_description.content,
      },
      {
        role: SET_TOPIC_PROMPTS.prompt_helper.role,
        content: SET_TOPIC_PROMPTS.prompt_helper.content,
      },

      {
        role: "system",
        content: `{"system_metadata": ${JSON.stringify(metadata)}}`,
      },
      {
        role: "user",
        content: topic,
      },
      {
        role: SET_TOPIC_PROMPTS.output_conditions.role,
        content: SET_TOPIC_PROMPTS.output_conditions.content,
      },
      {
        role: "assistant",
        content:
          "This is the beginning of the session. As this is the first prompt, you should be thinking about the prerequisite and child nodes that this topic has. You should also ensure that at least one question is generated via the tool provided.",
      },
    ];

    const openAIChatCompletionObject = {
      model: "gpt-4o",
      messages: payload,
      tools: OPENAI_TOOLS,
    };

    // @typescript-eslint/ban-ts-comment
    // @ts-expect-error - I know that the completion is a string
    const completion = await client.chat.completions.create({
      ...openAIChatCompletionObject,
    });

    // Now we need to process openai completion
    const OpenAIFunctionResults = await OpenAIProcessor(
      session.user,
      sessionId,
      completion,
      topic,
      res,
      openAIChatCompletionObject,
      -1
    );

    if (!OpenAIFunctionResults) {
      return res.status(200).json({ message: "No tool calls found" });
    }

    return res.status(200).json({
      response: "Session started successfully",
      ...OpenAIFunctionResults,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error,
      stack: error.stack,
    });
  } finally {
    return res.status(200).json({ message: "Topic set successfully" });
  }
}

export default withApiAuthRequired(StartSession);
