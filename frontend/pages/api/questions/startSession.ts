// PATCH /api/questions/setTopic

import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/User";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import Topic from "@/models/Topic";
import {
  setOnExplanationReceiveData,
  setOnQuestionCreateReceiveData,
  setOnRegisterRelationshipReceiveData,
  setOnRegisterTopicReceiveData,
  setSendMetadataFromDatabases,
  INPUT_start_session,
  Topic_T,
  Metadata_T,
  QuestionResponse_T,
  Question_T,
  Response_T,
} from "@/utils/openai_endpoint";
import { Question } from "@/models";

// Function Overrides

setOnQuestionCreateReceiveData(
  async (uid, session_id, question) =>
    new Promise(async (resolve, reject) => {
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
        resolve();
      } catch (error) {
        console.error(error);
        reject();
      }
    })
);

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
        console.log("registering topic");
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
      let prereqTopic = await Topic.findOne({
        name: topic_name,
        createdBy: uid,
        sessionId: session_id,
      });

      // If the prereqTopic is not found, create it
      if (!prereqTopic) {
        prereqTopic = await Topic.create({
          name: topic_name,
          description: topic_name,
          createdBy: uid,
          sessionId: session_id,
        });
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
// TODO Confirm this works as expected
setSendMetadataFromDatabases(async (uid, session_id) => {
  const metadata: Metadata_T = {
    current_topic: "",
    registered_topics: [],
    favorited_questions: [],
    historical_questions: [],
  };
  try {
    await dbConnect();

    // Retrieve user session & details
    const user = await User.findOne({ auth0Id: uid });

    if (!user) {
      console.error("User not found");
      return metadata;
    }

    // Update metadata
    if (!user?.currentTopic) {
      console.error("User does not have a current topic");
      return metadata;
    }
    metadata.current_topic = user.currentTopic;

    // Get current topics for user
    const topics = await Topic.find({
      createdBy: uid,
      sessionId: session_id,
    });

    // Loop through the topics creating Topic_T objects
    for (const topic of topics) {
      const newTopic: Topic_T = {
        name: topic.name,
        description: topic.description,
        relationships: [],
      };

      // Loop through the relationships creating Relationship_T objects
      for (const relationship of topic.relationships.value) {
        newTopic.relationships.push({
          child_topic: relationship.child_topic,
          strength: relationship.strength,
        });
      }

      // Push the new topic to the metadata
      metadata.registered_topics.push(newTopic);
    }

    // Get favorited questions
    // TODO Implement favorited questions

    // Get historical questions. A question is considered historical if it has been answered
    const questions = await Question.find({
      createdBy: uid,
      sessionId: session_id,
      selectedChoice: { $ne: null },
    });
    // Loop through the questions creating Question_T objects
    for (const question of questions) {
      if (!question.selectedChoice || question.isCorrect) continue;
      const question_data: Question_T = {
        question: question.question,
        choice_1: question.choices["1"],
        choice_2: question.choices["2"],
        choice_3: question.choices["3"],
        choice_4: question.choices["4"],
        correct_choice: question.correctChoice,
      };

      const selectedChoice = question.selectedChoice || "1";
      const selectedChoiceQuery = Object.keys(question_data).find((key) =>
        key.includes(selectedChoice.toString())
      );
      // @ts-expect-error This will not be a number
      const selectedChoiceContent: string =
        question_data[selectedChoiceQuery as keyof Question_T];
      const isCorrect = question.isCorrect || false;

      const user_data: Response_T = {
        selected_choice: question.selectedChoice,
        selected_choice_content: selectedChoiceContent,
        is_correct: isCorrect,
      };

      const questionResponse: QuestionResponse_T = {
        question_data,
        user_response: user_data,
      };

      // Append the question to the metadata
      metadata.historical_questions.push(questionResponse);
    }

    // Return the metadata
  } catch (error) {
    console.error(error);
  } finally {
    return metadata;
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
    let user = await User.findOne({ auth0Id });
    // If the user is not found, create a new user
    if (!user) {
      user = await User.create({
        auth0Id,
        currentTopic: topic,
        name: session.user.name,
        email: session.user.email,
      });
    }

    // Set the current topic for the user
    user.currentTopic = topic;
    await user.save();

    // Begin the session
    await INPUT_start_session(auth0Id, sessionId, topic);

    const questions = await Question.find({
      createdBy: auth0Id,
      sessionId,
    });
    const topics = await Topic.find({
      createdBy: auth0Id,
      sessionId,
    });

    // Send the topics to the user
    return res.status(200).json({
      payload: {
        questions,
        topics,
      },
      updateFlags: {
        questions: false,
        topics: false,
      },
      message: "Session started successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error,
    });
  } finally {
    return res.status(200).json({ message: "Topic set successfully" });
  }
}

export default withApiAuthRequired(StartSession);
