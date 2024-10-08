// @/utils/openai_handlers

// Imports
import {
  setOnQuestionCreateReceiveData,
  setOnRegisterRelationshipReceiveData,
  setOnRegisterTopicReceiveData,
  setSendMetadataFromDatabases,
  setOnSetCurrentTopicReceiveData,
  Topic_T,
  Metadata_T,
  QuestionResponse_T,
  Question_T,
  Response_T,
  setOnExplanationReceiveData,
} from "@/utils/openai_interface";
import dbConnect from "./dbConnect";
import { Question, User } from "@/models";
import Topic, { ITopic } from "@/models/Topic";
import Logger from "@/utils/logger";

setOnQuestionCreateReceiveData(
  async (uid, session_id, question) =>
    new Promise(async (resolve, reject) => {
      try {
        await dbConnect();
        Logger.info(
          `Creating new question for user ${uid}, session ${session_id}`
        );

        // We have received a new question from the OpenAI endpoint
        // We need to save this question to the database
        const {
          question: questionText,
          choice_1,
          choice_2,
          choice_3,
          choice_4,
          correct_choice,
        } = question;

        // Save the question to the database
        await Question.create({
          question: questionText,
          choices: {
            "1": choice_1,
            "2": choice_2,
            "3": choice_3,
            "4": choice_4,
          },
          correctChoice: correct_choice,
          createdBy: uid,
          createdAt: new Date(),
          sessionId: session_id,
        });
        Logger.debug(`Question created successfully for user ${uid}`);
        resolve();
      } catch (error) {
        Logger.error(`Error creating question for user ${uid}: ${error}`);
        reject();
      }
    })
);

setOnRegisterTopicReceiveData(
  async (uid, session_id, topic_name, topic_description) => {
    try {
      await dbConnect();
      Logger.info(
        `Registering/updating topic "${topic_name}" for user ${uid}, session ${session_id}`
      );

      // First identify if the topic already exists
      Logger.debug(
        `Checking if topic "${topic_name}" already exists for user ${uid} on session ${session_id}`
      );
      const existingTopic = await Topic.findOne({
        name: topic_name,
        sessionId: session_id,
      });
      Logger.debug(`Topic found: ${existingTopic}`);

      // If the topic already exists, update the description
      if (existingTopic) {
        existingTopic.description = topic_description || existingTopic.name;
        await existingTopic.save();
        Logger.debug(`Updated existing topic "${topic_name}" for user ${uid}`);
      } else {
        // If the topic does not exist, create a new topic
        await Topic.create({
          name: topic_name,
          description: topic_description || "No description yet",
          createdBy: uid,
          sessionId: session_id,
        });
        Logger.debug(`Created new topic "${topic_name}" for user ${uid}`);
      }
    } catch (error) {
      Logger.error(
        `Error registering/updating topic for user ${uid}: ${error}`
      );
    }
  }
);

setOnSetCurrentTopicReceiveData(async (uid, session_id, topic_name) => {
  try {
    await dbConnect();
    Logger.info(
      `Setting current topic to "${topic_name}" for user ${uid}, session ${session_id}`
    );

    const user = await User.findOne({ auth0Id: uid });
    if (!user) {
      Logger.error(`User not found: ${uid}`);
      return;
    }

    user.currentTopic = topic_name;

    await user.save();

    Logger.debug(`Current topic set successfully for user ${uid}`);
  } catch (error) {
    Logger.error(`Error setting current topic for user ${uid}: ${error}`);
  }
});

setOnRegisterRelationshipReceiveData(
  async (uid, session_id, topic_name, child_topic, strength) => {
    try {
      await dbConnect();
      Logger.info(
        `Registering relationship between "${topic_name}" and "${child_topic}" for user ${uid}, session ${session_id}`
      );

      // Locate the prereqTopic in the database
      let prereqTopic = (await Topic.findOne({
        name: topic_name,
        sessionId: session_id,
      })) as ITopic | null;

      // If the prereqTopic is not found, create it
      if (!prereqTopic) {
        prereqTopic = (await Topic.create({
          name: topic_name,
          description: topic_name,
          createdBy: uid,
          sessionId: session_id,
        })) as ITopic;
        Logger.debug(
          `Created new prerequisite topic "${topic_name}" for user ${uid}`
        );
      }

      // Add the new relationship to the prereqTopic
      prereqTopic.relationships.push({
        child_topic,
        strength,
      });

      await prereqTopic.save();
      Logger.debug(`Relationship registered successfully for user ${uid}`);
    } catch (error) {
      Logger.error(`Error registering relationship for user ${uid}: ${error}`);
    }
  }
);

setOnExplanationReceiveData(async (uid, session_id, explanation) => {
  try {
    await dbConnect();
    Logger.info(`Receiving explanation for user ${uid}, session ${session_id}`);

    const user = await User.findOne({ auth0Id: uid });

    if (!user) {
      Logger.error(`User not found: ${uid}`);
      return;
    }

    if (!user.currentTopic) {
      Logger.error(`User ${uid} does not have a current topic`);
      return;
    }

    // Check for an existing explanation
    if (user.latestExplanation && !user.latestExplanation.saved) {
      // find the question
      const question = await Question.findById(user.lastSubmitQuestion);
      if (!question) {
        Logger.error(`Question not found for user ${uid}`);
        return;
      }

      // Set the explanation to the question
      question.explanation = explanation;
      await question.save();
      Logger.debug(`Explanation saved to question for user ${uid}`);

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
      Logger.debug(`Latest explanation updated for user ${uid}`);
    }
  } catch (error) {
    Logger.error(`Error processing explanation for user ${uid}: ${error}`);
  }
});

setSendMetadataFromDatabases(async (uid, session_id) => {
  const metadata: Metadata_T = {
    current_topic: "",
    registered_topics: [],
    favorited_questions: [],
    historical_questions: [],
  };
  try {
    await dbConnect();
    Logger.info(`Fetching metadata for user ${uid}, session ${session_id}`);

    // Retrieve user session & details
    const user = await User.findOne({ auth0Id: uid });

    if (!user) {
      Logger.error(`User not found: ${uid}`);
      return metadata;
    }

    // Update metadata
    if (!user?.currentTopic) {
      Logger.warn(`User ${uid} does not have a current topic`);
      return metadata;
    }
    metadata.current_topic = user.currentTopic;

    // Get current topics for user
    const topics = await Topic.find({
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
      topic.relationships.forEach((relationship) => {
        const { child_topic, strength } = relationship;
        newTopic.relationships.push({
          child_topic,
          strength,
        });
      });

      // Push the new topic to the metadata
      metadata.registered_topics.push(newTopic);
    }

    // Get favorited questions
    // TODO Confirm this works as expected
    const favoritedQuestions = await Question.find({
      createdBy: uid,
      sessionId: session_id,
      favorited: true,
    });
    for (const question of favoritedQuestions) {
      const question_data: Question_T = {
        question: question.question,
        choice_1: question.choices["1"],
        choice_2: question.choices["2"],
        choice_3: question.choices["3"],
        choice_4: question.choices["4"],
        correct_choice: question.correctChoice,
      };

      const selectedChoice = question.selectedChoice?.toString() || "1";
      const selectedChoiceQuery = Object.keys(question_data).find((key) =>
        key.includes(selectedChoice.toString())
      );
      // @ts-expect-error This will not be a number
      const selectedChoiceContent: string =
        question_data[selectedChoiceQuery as keyof Question_T];
      const selectedChoiceNumber = parseInt(selectedChoice);

      const user_response: Response_T = {
        selected_choice: selectedChoiceNumber,
        selected_choice_content: selectedChoiceContent,
        is_correct: question.isCorrect || false,
      };

      metadata.favorited_questions.push({
        question_data,
        user_response,
      });
    }

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

    Logger.debug(`Metadata fetched successfully for user ${uid}`);
    // Return the metadata
  } catch (error) {
    Logger.error(`Error fetching metadata for user ${uid}: ${error}`);
  } finally {
    return metadata;
  }
});
