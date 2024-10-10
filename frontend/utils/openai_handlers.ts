// @/utils/openai_handlers

import { debounce } from "lodash";
import { Mutex } from "async-mutex";
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
import Topic from "@/models/Topic";
import Logger from "@/utils/logger";

const topicMutex = new Mutex();
const debounceTime = 500; // ms

setOnQuestionCreateReceiveData(
  async (uid, session_id, question) =>
    new Promise(async (resolve, reject) => {
      try {
        await dbConnect();
        Logger.info(
          `Creating new question for user ${uid}, session ${session_id}`
        );

        const {
          question: questionText,
          choice_1,
          choice_2,
          choice_3,
          choice_4,
          correct_choice,
        } = question;

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
    const release = await topicMutex.acquire();
    try {
      await dbConnect();
      Logger.info(
        `Registering/updating topic "${topic_name}" for user ${uid}, session ${session_id}`
      );

      Logger.debug(
        `Checking if topic "${topic_name}" already exists for user ${uid} on session ${session_id}`
      );
      let existingTopic = await Topic.findOne({
        name: topic_name,
        sessionId: session_id,
      });
      Logger.debug(`Topic found: ${existingTopic}`);

      if (existingTopic) {
        existingTopic.description = topic_description || existingTopic.name;
        await existingTopic.save();
        Logger.debug(`Updated existing topic "${topic_name}" for user ${uid}`);
      } else {
        existingTopic = await Topic.create({
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
    } finally {
      release();
    }
  }
);

const debouncedSetCurrentTopic = debounce(
  async (uid, session_id, topic_name) => {
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
  },
  debounceTime
);

setOnSetCurrentTopicReceiveData(debouncedSetCurrentTopic);

setOnRegisterRelationshipReceiveData(
  async (uid, session_id, topic_name, child_topic, strength) => {
    const release = await topicMutex.acquire();
    try {
      await dbConnect();
      Logger.info(
        `Registering relationship between "${topic_name}" and "${child_topic}" for user ${uid}, session ${session_id}`
      );

      let prereqTopic = await Topic.findOne({
        name: topic_name,
        sessionId: session_id,
      });

      if (!prereqTopic) {
        prereqTopic = await Topic.create({
          name: topic_name,
          description: topic_name,
          createdBy: uid,
          sessionId: session_id,
        });
        Logger.debug(
          `Created new prerequisite topic "${topic_name}" for user ${uid}`
        );
      }

      const existingRelationship = prereqTopic.relationships.find(
        (rel) => rel.child_topic === child_topic
      );

      if (!existingRelationship) {
        prereqTopic.relationships.push({
          child_topic,
          strength,
        });
        await prereqTopic.save();
        Logger.debug(`Relationship registered successfully for user ${uid}`);
      } else {
        Logger.debug(`Relationship already exists for user ${uid}`);
      }
    } catch (error) {
      Logger.error(`Error registering relationship for user ${uid}: ${error}`);
    } finally {
      release();
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

    if (user.latestExplanation && !user.latestExplanation.saved) {
      const question = await Question.findById(user.lastSubmitQuestion);
      if (!question) {
        Logger.error(`Question not found for user ${uid}`);
        return;
      }

      question.explanation = explanation;
      await question.save();
      Logger.debug(`Explanation saved to question for user ${uid}`);

      user.latestExplanation = {
        explanation: "",
        saved: false,
      };

      await user.save();
    }

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

    const user = await User.findOne({ auth0Id: uid });

    if (!user) {
      Logger.error(`User not found: ${uid}`);
      return metadata;
    }

    if (!user?.currentTopic) {
      Logger.warn(`User ${uid} does not have a current topic`);
      return metadata;
    }
    metadata.current_topic = user.currentTopic;

    const topics = await Topic.find({
      sessionId: session_id,
    });

    for (const topic of topics) {
      const newTopic: Topic_T = {
        name: topic.name,
        description: topic.description,
        relationships: [],
      };

      topic.relationships.forEach((relationship) => {
        const { child_topic, strength } = relationship;
        newTopic.relationships.push({
          child_topic,
          strength,
        });
      });

      metadata.registered_topics.push(newTopic);
    }

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
      type ChoiceOptions = "1" | "2" | "3" | "4";
      const selectedChoice: ChoiceOptions =
        (String(question.selectedChoice) as ChoiceOptions) || "1";

      // Add a type check and provide a default value
      const selectedChoiceContent: string = question.choices[selectedChoice];

      const selectedChoiceNumber = parseInt(String(selectedChoice));

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

    const questions = await Question.find({
      createdBy: uid,
      sessionId: session_id,
      selectedChoice: { $ne: null },
    });
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
      type ChoiceOptions = "1" | "2" | "3" | "4";
      const selectedChoice: ChoiceOptions =
        (String(question.selectedChoice) as ChoiceOptions) || "1";

      // Add a type check and provide a default value
      const selectedChoiceContent: string = question.choices[selectedChoice];

      const selectedChoiceNumber = parseInt(String(selectedChoice));

      const user_response: Response_T = {
        selected_choice: selectedChoiceNumber,
        selected_choice_content: selectedChoiceContent,
        is_correct: question.isCorrect || false,
      };

      const questionResponse: QuestionResponse_T = {
        question_data,
        user_response,
      };

      metadata.historical_questions.push(questionResponse);
    }

    Logger.debug(`Metadata fetched successfully for user ${uid}`);
  } catch (error) {
    Logger.error(`Error fetching metadata for user ${uid}: ${error}`);
  } finally {
    return metadata;
  }
});
