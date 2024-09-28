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

const client = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

async function StartSession(req: NextApiRequest, res: NextApiResponse) {
  const { topic } = await req.body;

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
      await User.create({ auth0Id, topic });
    }

    const metadata = {
      current_topic: {
        description: SYSTEM_METADATA_PROMPTS.current_topic,
        value: topic,
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
        content: `{system_metadata: ${JSON.stringify(metadata)}}`,
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

    // @ts-ignore
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: payload,
      tools: OPENAI_TOOLS,
    });

    const response = completion;

    const OpenAIFunctionResults = await OpenAIProcessor(
      session.user,
      response,
      topic,
      res
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
