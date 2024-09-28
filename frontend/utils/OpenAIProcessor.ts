import type { NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import { Question } from "@/models";
import User from "@/models/User";
import { Claims } from "@auth0/nextjs-auth0";
import { IQuestion } from "@/models/Question";
import { ChatCompletion } from "openai/resources/index.mjs";
import { QuestionProp } from "@/types/Questions";
import Topic, { ITopic } from "@/models/Topic";
import { Relationship } from "@/types";

export async function OpenAIProcessor(
  sessionUser: Claims,
  sessionId: string,
  completion: object,
  topic: string,
  res: NextApiResponse
) {
  try {
    // Connect to Database
    await dbConnect();

    // Retrieve user session & details

    const { sub: auth0Id } = sessionUser;

    // Find user in database
    const user = await User.findOne({ auth0Id });
    // If the user is not found, create a new user
    if (!user) {
      await User.create({ auth0Id, completion });
    }

    // ! Do Calls

    // @ts-ignore I don't know why its saying this
    const { tool_calls } = completion?.choices[0]?.message || "";
    if (!tool_calls || tool_calls.length === 0) {
      return {};
    }

    const updateFlags = {
      questions: false,
      topics: false,
      currentTopic: false,
      questionExplanation: false,
    };

    for (let i = 0; i < tool_calls.length; i++) {
      let tool_call = tool_calls[i].function;
      console.log(tool_call);
      // Create multiple choice question
      if (tool_call.name === "create_multiple_choice_question") {
        let new_question = JSON.parse(tool_call.arguments);

        let {
          question,
          choice_1,
          choice_2,
          choice_3,
          choice_4,
          correct_choice,
        } = new_question;
        const choices: Record<"1" | "2" | "3" | "4", string> = {
          "1": choice_1,
          "2": choice_2,
          "3": choice_3,
          "4": choice_4,
        };

        await Question.create({
          question,
          choices,
          correctChoice: correct_choice,
          createdBy: auth0Id,
          sessionId,
          topic,
        }).catch((e) => console.log(e));

        // Update flags
        if (!updateFlags.questions) {
          updateFlags.questions = true;
        }
      } else if (tool_call.name === "establish_connection") {
        // Establish connection

        let connection = tool_call.arguments;
        let parentTopic = connection.prerequisite_topic;
        let childTopic = connection.child_topic;
        let strength = connection.strength;

        // Find parent topic
        let parentTopicExists = await Topic.findOne({
          name: parentTopic,
          createdBy: auth0Id,
          sessionId,
        });
        if (!parentTopicExists) {
          return res.status(400).json({
            message: `Parent topic ${parentTopic} does not exist.`,
          });
        }

        // Verify child topic exists
        let childTopicExists = await Topic.findOne({
          name: childTopic,
          createdBy: auth0Id,
          sessionId,
        });
        if (!childTopicExists) {
          return res.status(400).json({
            message: `Child topic ${childTopic} does not exist.`,
          });
        }

        // Check if relationship already exists
        let relationshipExists = parentTopicExists.relationships.find(
          (relationship: Relationship) =>
            relationship.child_topic === childTopic
        );

        // if the relationship does exist, update the strength
        if (relationshipExists) {
          relationshipExists.strength = strength;
        } else {
          parentTopicExists.relationships.push({
            child_topic: childTopic,
            strength,
          });
        }

        await parentTopicExists.save();

        // Update flags
        if (!updateFlags.topics) {
          updateFlags.topics = true;
        }
      } else if (tool_call.name === "establish_topic") {
        let newTopic = JSON.parse(tool_call.arguments);

        // Check whether the topic already exists
        let topicExists = await Topic.findOne({
          name: newTopic.name,
          createdBy: auth0Id,
        });

        // If the topic already exists, update the description
        if (topicExists) {
          topicExists.description = newTopic.description;
          await topicExists.save();
        } else {
          await Topic.create({
            name: newTopic.name,
            description: newTopic.description,
            createdBy: auth0Id,
            sessionId: sessionId,
          });

          // Set new topic as current topic
          topic = newTopic.name;
        }

        // Update flags
        if (!updateFlags.topics) {
          updateFlags.topics = true;
          updateFlags.currentTopic = true;
        }
      } else if (tool_call.name === "explain_question") {
        let explanation = tool_call.arguments;
      }
    }

    // Craft a response that has the updates made so the client can update the redux store
    interface UpdateFlagsProps {
      updateFlags: {
        questions: boolean;
        topics: boolean;
        currentTopic: boolean;
        questionExplanation: boolean;
      };
      payload: {
        questions?: IQuestion[];
        topics?: ITopic[];
        currentTopic: string;
        questionExplanation?: string;
      };
    }

    const updates: UpdateFlagsProps = {
      updateFlags,
      payload: {
        ...(updateFlags.questions && { questions: [] }),
        ...(updateFlags.topics && { topics: [] }),
        currentTopic: topic,
        questionExplanation: "",
      },
    };

    if (updateFlags.questions) {
      let updatedQuestions = (await Question.find({
        topic,
        createdBy: auth0Id,
        sessionId,
      }).catch((e) => console.log(e))) as IQuestion[];

      updates.payload.questions = updatedQuestions;
    }

    if (updateFlags.topics) {
      let updatedTopics = (await Topic.find({
        createdBy: auth0Id,
        sessionId,
      }).catch((e) => console.log(e))) as ITopic[];

      updates.payload.topics = updatedTopics;
    }

    if (updateFlags.questionExplanation) {
    }

    return updates;
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}
