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

async function OpenAIProcessor(req: NextApiRequest, res: NextApiResponse) {
  // verify post
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res
      .status(405)
      .json({ message: `Method ${req.method} Not Allowed` });
  }

  const { completion, topic } = await req.body;

  if (!completion || typeof completion !== "string") {
    return res.status(400).json({ message: "Invalid completion provided" });
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
      await User.create({ auth0Id, completion });
    }

    // ! Do Calls
    // @ts-ignore I don't know why its saying this
    const { tool_calls } = completion?.choices[0]?.message || "";
    if (!tool_calls || tool_calls.length === 0) {
      return res.status(200).json({ response: "No tool calls found" });
    }

    const updateFlags = {
      questions: false,
    };

    for (let i = 0; i < tool_calls.length; i++) {
      let tool_call = tool_calls[i];

      // Create multiple choice question
      if (tool_call === "create_multiple_choice_question") {
        let new_question = tool_call.arguments;

        // Add the new question to the database
        await Question.create({ ...new_question, topic, createdBy: auth0Id });

        // Update flags
        if (!updateFlags.questions) {
          updateFlags.questions = true;
        }
      }

      // Establish topic

      // Establish connection
    }

    // Craft a response that has the updates made so the client can update the redux store
    const response = {
      message: "Successfully processed completion",
      updateFlags,
      payload: {
        ...(updateFlags.questions && { questions: [] }),
      },
    };

    if (updateFlags.questions) {
      response.payload.questions = await Question.find({
        topic,
        createdBy: auth0Id,
      });
    }

    return res.status(200).json({ response });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

export default withApiAuthRequired(OpenAIProcessor);
