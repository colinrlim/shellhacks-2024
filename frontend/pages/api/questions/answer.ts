import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import { Question } from "@/models";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import Topic from "@/models/Topic";
import {
  OPENAI_TOOLS,
  QUESTION_ANSWERED_PROMPTS,
  SYSTEM_METADATA_PROMPTS,
} from "@/constants";
import OpenAI from "openai";
import { OpenAIProcessor } from "@/utils/OpenAIProcessor";

const client = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

async function answerQuestionHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { questionId, selectedChoice, currentTopic } = req.body;

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
    console.log(question);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    const { sessionId } = question;

    const historicalQuestions = await Question.find({
      createdBy: auth0Id,
      isCorrect: true,
      sessionId: sessionId,
    });

    question.isCorrect = question.correctChoice === selectedChoice;
    question.selectedChoice = selectedChoice;

    await question.save();

    delete question._id;

    // Now I need to build an openai call to update the learning modules
    const topics = await Topic.find({ createdBy: auth0Id });
    const cleanedTopics = topics.map((t) => {
      return {
        name: t.name,
        description: t.description,
        relationships: t.relationships,
      };
    });

    const metadata = {
      current_topic: {
        description: SYSTEM_METADATA_PROMPTS.current_topic,
        value: currentTopic,
      },
      registered_topics: {
        description: SYSTEM_METADATA_PROMPTS.registered_topics,
        value: cleanedTopics,
      },
      favorited_questions: {
        description: SYSTEM_METADATA_PROMPTS.favorited_questions,
        value: [],
      },
      historical_questions: {
        description: SYSTEM_METADATA_PROMPTS.historical_questions,
        value: historicalQuestions,
      },
    };

    const payload = [
      {
        role: QUESTION_ANSWERED_PROMPTS.agent_role.role,
        content: QUESTION_ANSWERED_PROMPTS.agent_role.content,
      },
      {
        role: QUESTION_ANSWERED_PROMPTS.system_description.role,
        content: QUESTION_ANSWERED_PROMPTS.system_description.content,
      },
      {
        role: "system",
        content: `{system_metadata: ${JSON.stringify(metadata)}}`,
      },
      {
        role: "system",
        content: `{current_question: ${JSON.stringify(question)}}`,
      },
      {
        role: QUESTION_ANSWERED_PROMPTS.prompt_directions.role,
        content: QUESTION_ANSWERED_PROMPTS.prompt_directions.content,
      },
    ];

    const openAIChatCompletionObject = {
      model: "gpt-4o-mini",
      messages: payload,
      tools: OPENAI_TOOLS,
    };

    // @ts-ignore
    const completion = await client.chat.completions.create({
      ...openAIChatCompletionObject,
    });

    // Now we need to process openai completion
    const OpenAIFunctionResults = await OpenAIProcessor(
      session.user,
      sessionId,
      completion,
      currentTopic,
      res,
      openAIChatCompletionObject
    );

    if (!OpenAIFunctionResults) {
      return res.status(200).json({ message: "No tool calls found" });
    }

    return res.status(200).json({
      response: "Question answered successfully",
      ...OpenAIFunctionResults,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error });
  }
}

export default withApiAuthRequired(answerQuestionHandler);
