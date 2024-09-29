// GET /api/questions

import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/User";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { Question } from "@/models";
import Topic from "@/models/Topic";

async function GetQuestion(req: NextApiRequest, res: NextApiResponse) {
  // Only for GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
  if (!req.url) {
    return res.status(400).json({ message: "Invalid request" });
  }
  const params = new URLSearchParams(req.url.split("?")[1]);
  const sessionId = params.get("sessionId");

  try {
    console.log("going to get the question now!");
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
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the questions to the client

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
        questions: true,
        topics: true,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error,
    });
  }
}

export default withApiAuthRequired(GetQuestion);
