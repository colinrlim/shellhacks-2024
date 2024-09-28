// pages/api/generate-questions.ts
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import dbConnect from "@/utils/dbConnect";
import { Question } from "@/models";
import User from "@/models/User";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";

const client = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
});

interface MCQ {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res
      .status(405)
      .json({ message: `Method ${req.method} Not Allowed` });
  }

  const { topic } = req.body;

  if (!topic || typeof topic !== "string") {
    return res.status(400).json({ message: "Invalid topic provided" });
  }

  try {
    await dbConnect(); // Connect to MongoDB

    // Retrieve user session
    const session = await getSession(req, res);
    if (!session || !session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, email, sub: auth0Id } = session.user;

    // Ensure the user exists in the database
    let user = await User.findOne({ auth0Id });
    if (!user) {
      user = await User.create({ auth0Id, name, email });
    }

    // Craft the prompt for OpenAI
    const prompt = `
      Create 5 multiple-choice questions for beginners about "${topic}". 
      Each question should have one correct answer and three plausible distractors. 
      Format each question with the question text, options labeled A-D, and indicate the correct option.
      
      Example:
      Q1: What is the capital of France?
      A) Berlin
      B) Madrid
      C) Paris
      D) Rome
      Correct Answer: C
      
      Q2: ...
    `;

    // Call OpenAI's API to generate questions
    const response = await client.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o-mini",
    });

    const rawText = response.choices[0].message.content;

    if (!rawText) {
      throw new Error("No response from OpenAI");
    }

    // Parse the raw text into structured MCQs
    const mcqs: MCQ[] = parseMCQs(rawText);

    // Save questions to the database
    const questionsToSave = mcqs.map((mcq) => ({
      topic,
      question: mcq.question,
      options: mcq.options,
      correctAnswer: mcq.correctAnswer,
    }));

    const savedQuestions = await Question.insertMany(questionsToSave);

    // Prepare response with question IDs
    const responseMcqs = savedQuestions.map((q) => ({
      id: q._id,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
    }));

    return res.status(200).json({ mcqs: responseMcqs });
  } catch (error) {
    console.error("Error generating questions:", error);
    return res.status(500).json({ message: "Failed to generate questions" });
  }
}

export default withApiAuthRequired(handler);

// Helper function to parse OpenAI's response into MCQ objects
function parseMCQs(rawText: string): MCQ[] {
  const lines = rawText.split("\n");
  const mcqs: MCQ[] = [];
  let currentMCQ: MCQ | null = null;

  lines.forEach((line) => {
    const questionMatch = line.match(/^Q\d+:\s*(.*)/);
    const optionMatch = line.match(/^[A-D]\)\s*(.*)/);
    const answerMatch = line.match(/^Correct Answer:\s*([A-D])/);

    if (questionMatch) {
      if (currentMCQ) {
        mcqs.push(currentMCQ);
      }
      currentMCQ = {
        id: "", // Will be populated after saving to DB
        question: questionMatch[1],
        options: [],
        correctAnswer: "",
      };
    } else if (optionMatch && currentMCQ) {
      currentMCQ.options.push(optionMatch[1]);
    } else if (answerMatch && currentMCQ) {
      const index = answerMatch[1].charCodeAt(0) - 65; // Convert 'A'-'D' to 0-3
      if (currentMCQ.options[index]) {
        currentMCQ.correctAnswer = currentMCQ.options[index];
      }
    }
  });

  if (currentMCQ) {
    mcqs.push(currentMCQ);
  }

  return mcqs;
}
