// pages/api/questions/[questionId]/explanation.ts

import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import { Question } from "@/models";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";

async function getExplanationHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { questionId } = req.query;

  if (!questionId) {
    return res.status(400).json({ message: "Invalid request" });
  }

  try {
    await dbConnect();

    const session = await getSession(req, res);
    if (!session || !session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { sub: auth0Id } = session.user;

    const question = await Question.findOne({
      _id: questionId,
      createdBy: auth0Id,
    });
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (!question.explanation) {
      return res.status(202).json({ message: "Explanation not ready yet" });
    }

    return res.status(200).json({
      questionId: question._id,
      explanation: question.explanation,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error });
  }
}

export default withApiAuthRequired(getExplanationHandler);
