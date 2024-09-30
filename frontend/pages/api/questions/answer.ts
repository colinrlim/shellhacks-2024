import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import { Question, User } from "@/models";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import Topic from "@/models/Topic";
import {
  INPUT_answer,
  Metadata_T,
  Question_T,
  QuestionResponse_T,
  Response_T,
  setOnExplanationReceiveData,
  setSendMetadataFromDatabases,
  Topic_T,
} from "@/utils/openai_endpoint";

setSendMetadataFromDatabases(async (uid, session_id) => {
  const metadata: Metadata_T = {
    current_topic: "",
    registered_topics: [],
    favorited_questions: [],
    historical_questions: [],
  };
  try {
    await dbConnect();

    // Retrieve user session & details
    const user = await User.findOne({ auth0Id: uid });

    if (!user) {
      console.error("User not found");
      return metadata;
    }

    // Update metadata
    if (!user?.currentTopic) {
      console.error("User does not have a current topic");
      return metadata;
    }
    metadata.current_topic = user.currentTopic;

    // Get current topics for user
    const topics = await Topic.find({
      createdBy: uid,
      sessionId: session_id,
    });

    // Loop through the topics creating Topic_T objects
    for (const topic of topics) {
      const newTopic: Topic_T = {
        name: topic.name,
        description: topic.description,
        relationships: [],
      };

      // Loop through the relationships creating Relationship_T objects
      for (const relationship of topic.relationships.value) {
        newTopic.relationships.push({
          child_topic: relationship.child_topic,
          strength: relationship.strength,
        });
      }

      // Push the new topic to the metadata
      metadata.registered_topics.push(newTopic);
    }

    // Get favorited questions
    // TODO Implement favorited questions

    // Get historical questions. A question is considered historical if it has been answered
    const questions = await Question.find({
      createdBy: uid,
      sessionId: session_id,
      selectedChoice: { $ne: null },
    });
    // Loop through the questions creating Question_T objects
    for (const question of questions) {
      if (!question.selectedChoice || question.isCorrect) continue;
      const question_data: Question_T = {
        question: question.question,
        choice_1: question.choices["1"],
        choice_2: question.choices["2"],
        choice_3: question.choices["3"],
        choice_4: question.choices["4"],
        correct_choice: question.correctChoice,
      };

      const selectedChoice = question.selectedChoice || "1";
      const selectedChoiceQuery = Object.keys(question_data).find((key) =>
        key.includes(selectedChoice.toString())
      );
      // @ts-expect-error This will not be a number
      const selectedChoiceContent: string =
        question_data[selectedChoiceQuery as keyof Question_T];
      const isCorrect = question.isCorrect || false;

      const user_data: Response_T = {
        selected_choice: question.selectedChoice,
        selected_choice_content: selectedChoiceContent,
        is_correct: isCorrect,
      };

      const questionResponse: QuestionResponse_T = {
        question_data,
        user_response: user_data,
      };

      // Append the question to the metadata
      metadata.historical_questions.push(questionResponse);
    }

    // Return the metadata
  } catch (error) {
    console.error(error);
  } finally {
    return metadata;
  }
});
setOnExplanationReceiveData(async (uid, session_id, explanation) => {
  try {
    await dbConnect();

    const user = await User.findOne({ auth0Id: uid });

    if (!user) {
      console.error("User not found");
      return;
    }

    if (!user.currentTopic) {
      console.error("User does not have a current topic");
      return;
    }

    // Check for an existing explanation
    if (user.latestExplanation && !user.latestExplanation.saved) {
      console.log("explanation avalalb");
      // find tghe question
      const question = await Question.findById(user.lastSubmitQuestion);
      if (!question) {
        console.error("Question not found");
        return;
      }

      // Set the explanation to the question
      question.explanation = explanation;
      console.log("Explanation", explanation);
      console.log("Question", question);
      await question.save();

      // Set the user's latestExplanation to the explanation
      user.latestExplanation = {
        explanation: "",
        saved: false,
      };

      await user.save();
    }

    // Set the user's latestExplanation to the explanation
    if (user.latestExplanation) {
      user.latestExplanation = {
        explanation,
        saved: false,
      };
      await user.save();
    }
  } catch (error) {
    console.error(error);
  }
});

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
