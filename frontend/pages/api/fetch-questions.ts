// pages/api/fetch-questions.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import { Question, User } from "@/models";
import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";

interface MCQ {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res
      .status(405)
      .json({ message: `Method ${req.method} Not Allowed` });
  }

  const { topic, skip = "0", limit = "5" } = req.query;

  if (!topic || typeof topic !== "string") {
    return res.status(400).json({ message: "Invalid topic provided" });
  }

  const skipNumber = parseInt(skip as string, 10);
  const limitNumber = parseInt(limit as string, 10);

  try {
    await dbConnect();

    // Retrieve user session
    const session = await getSession(req, res);
    if (!session || !session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { sub: auth0Id } = session.user;
    const user = await User.findOne({ auth0Id });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Fetch questions from the database with pagination
    const questions = await Question.find({ topic })
      .skip(skipNumber)
      .limit(limitNumber)
      .exec();

    const formattedQuestions: MCQ[] = questions.map((q) => ({
      id: q._id.toString(),
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
    }));

    return res.status(200).json({ mcqs: formattedQuestions });
  } catch (error: any) {
    console.error("Error fetching questions:", error);
    return res.status(500).json({ message: "Failed to fetch questions" });
  }
}

export default withApiAuthRequired(handler);
