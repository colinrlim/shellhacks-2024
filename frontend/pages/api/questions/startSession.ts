// PATCH /api/questions/setTopic

import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import dbConnect from "@/utils/dbConnect";
import { Question } from "@/models";
import User from "@/models/User";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import {
  SET_TOPIC_PROMPTS,
  SYSTEM_METADATA_PROMPTS,
  OPENAI_TOOLS,
} from "@/constants";
import { OpenAIProcessor } from "@/utils/OpenAIProcessor";
import Topic from "@/models/Topic";

const client = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
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
      return {
        name: t.name,
        description: t.description,
        relationships: t.relationships,
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
    ];

    const openAIChatCompletionObject = {
      model: "gpt-4o-mini",
      messages: payload,
      tools: OPENAI_TOOLS,
    };

    // @ts-ignore
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
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error });
  } finally {
    return res.status(200).json({ message: "Topic set successfully" });
  }
}

export default withApiAuthRequired(StartSession);
