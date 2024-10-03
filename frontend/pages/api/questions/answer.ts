// /api/questions/answer
// POST - Answer a question

import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import { Question, User } from "@/models";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import Topic from "@/models/Topic";
import { INPUT_answer, Question_T } from "@/utils/openai_interface";
import "@/utils/openai_handlers";

async function answerQuestionHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { questionId, selectedChoice } = req.body;

  if (!questionId || !selectedChoice) {
    return res.status(400).json({ message: "Invalid request" });
  }

  try {
    await dbConnect();

    const session = await getSession(req, res);
    if (!session || !session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { sub: auth0Id } = session.user;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    const { sessionId } = question;

    // Update question with user's answer
    question.selectedChoice = selectedChoice;
    question.isCorrect = selectedChoice === question.correctChoice;

    await question.save();

    // Update the user's last answered question
    const user = await User.findOne({ auth0Id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.lastSubmitQuestion = questionId;
    await user.save();

    const questionInterfaceData: Question_T = {
      question: question.question,
      choice_1: question.choices["1"],
      choice_2: question.choices["2"],
      choice_3: question.choices["3"],
      choice_4: question.choices["4"],
      correct_choice: question.correctChoice,
    };

    await INPUT_answer(
      auth0Id,
      sessionId,
      questionInterfaceData,
      selectedChoice
    );

    const topics = await Topic.find({ createdBy: auth0Id, sessionId });
    const questions = await Question.find({
      createdBy: auth0Id,
      sessionId,
    });

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
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error });
  }
}

export default withApiAuthRequired(answerQuestionHandler);
