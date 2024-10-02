// PATCH /api/questions/setTopic

import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/User";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import Topic from "@/models/Topic";
import { INPUT_start_session } from "@/utils/openai_interface";
import { Question } from "@/models";
import "@/utils/openai_handlers";

// Function Overrides

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
  }
}

export default withApiAuthRequired(StartSession);
