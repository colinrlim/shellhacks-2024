// /api/questions/index
// GET /api/questions

import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/User";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { Question } from "@/models";
import Topic from "@/models/Topic";
import AdminUser from "@/models/AdminUser";

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

    // Check if the user is an administrative user
    // ! Redo this once real rate limits are in place
    const adminUser = await AdminUser.findOne({ accountId: user._id });
    if (!adminUser || adminUser?.role !== "admin") {
      // Find the amount of questions the user has
      const questionCount = await Question.countDocuments({
        createdBy: auth0Id,
      });

      const maxQuestionsAllows = adminUser?.overrideMaxQuestions || 50;

      // If the user has more than 50 questions, return an error
      if (questionCount >= maxQuestionsAllows) {
        return res.status(403).json({
          message: `You have reached the maximum question limit  at this time. Please contact an administrator for further assistance. Max questions allowed for this account: ${maxQuestionsAllows}`,
        });
      }
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
