// /api/questions/[questionId]/favorite
// POST /api/questions/[questionId]/favorite

import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/User";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import {
  INPUT_favorite,
  Question_T,
  QuestionResponse_T,
} from "@/utils/openai_interface";
import { Question } from "@/models";
import "@/utils/openai_handlers";
import AdminUser from "@/models/AdminUser";

// Function Overrides

async function handleFavorite(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { questionId } = req.query;
  const { sessionId } = req.body;

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
      // Return an error if the user is not found
      return res.status(404).json({
        message: "User not found",
      });
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

    // Find the question
    const question = await Question.findOne({
      _id: questionId,
    });

    // Check if the question exists
    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    const selectedQuestion: Question_T = {
      question: question.question,
      choice_1: question.choices["1"],
      choice_2: question.choices["2"],
      choice_3: question.choices["3"],
      choice_4: question.choices["4"],
      correct_choice: question.correctChoice,
    };

    const questionResponse: QuestionResponse_T = {
      question_data: selectedQuestion,
      user_response: {
        selected_choice: 0,
        selected_choice_content: "",
        is_correct: false,
      },
    };

    // Favorite the question
    await INPUT_favorite(auth0Id, sessionId, questionResponse);

    // Send the topics to the user
    return res.status(200).json({
      message: "Question favorited successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error,
    });
  }
}

export default withApiAuthRequired(handleFavorite);
