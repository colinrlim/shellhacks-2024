import type { NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import { Question } from "@/models";
import User from "@/models/User";
import { Claims } from "@auth0/nextjs-auth0";
import { IQuestion } from "@/models/Question";
import Topic, { ITopic } from "@/models/Topic";
import { Relationship } from "@/types";
import {
  GENERATE_QUESTION_PROMPT,
  OPENAI_TOOLS,
  SYSTEM_METADATA_PROMPTS,
} from "@/constants";
import OpenAI from "openai";

const { DEBUG_FLAG } = process.env;
const client = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

export async function OpenAIProcessor(
  sessionUser: Claims,
  sessionId: string,
  completion: object,
  topic: string,
  res: NextApiResponse,
  openAIChatCompletionObject: object,
  depth: number = 0
) {
  try {
    console.log("EXECUTING AT DEPTH" + depth);
    // Connect to Database
    await dbConnect();

    // Retrieve user session & details

    const { sub: auth0Id } = sessionUser;

    // Find user in database
    const user = await User.findOne({ auth0Id });
    // If the user is not found, create a new user
    if (!user) {
      await User.create({
        auth0Id,
        topic,
        name: sessionUser.name,
        email: sessionUser.email,
      });
    }

    // Verify session ID
    if (!sessionId) {
      return res.status(400).json({ message: "Invalid session ID" });
    }

    // ! Do Calls

    // @ts-ignore I don't know why its saying this
    const { tool_calls } = completion?.choices[0]?.message || "";
    if (!tool_calls || tool_calls.length === 0) {
      // If a message is returned completion.choices[0].content != null

      if (!completion?.choices[0]?.content) return {};
      let message = completion.choices[0].content;
      let newFallbackCompletion = await client.chatCompletion({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Please use the create_multiple_choice_question tool to generate 4 answer choices to this question.",
          },
          {
            role: "assistant",
            content: message,
          },
        ],
        tools: [OPENAI_TOOLS[0]],
      });

      console.log(newFallbackCompletion);

      return {};
    }

    const updateFlags = {
      questions: false,
      topics: false,
      currentTopic: false,
      questionExplanation: false,
    };
    if (!DEBUG_FLAG) console.log(openAIChatCompletionObject);
    for (let i = 0; i < tool_calls.length; i++) {
      let tool_call = tool_calls[i].function;
      if (!DEBUG_FLAG) console.log(tool_call);
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
        const relationshipExists = parentTopicExists.relationships.value.find(
          (relationship: Relationship) =>
            relationship.child_topic === childTopic
        );

        // if the relationship does exist, update the strength
        if (relationshipExists) {
          relationshipExists.strength = strength;
        } else {
          parentTopicExists.relationships.value.push({
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
          sessionId,
        });

        // If the topic already exists, update the description
        if (topicExists) {
          topicExists.description = newTopic.description;
          await topicExists.save();
        } else {
          topicExists = await Topic.create({
            name: newTopic.name,
            description: newTopic.description,
            createdBy: auth0Id,
            sessionId: sessionId,
          });

          // Set new topic as current topic
          topic = newTopic.name;
          updateFlags.topics = true;
        }
        const tArgs = JSON.parse(tool_call.arguments);

        // Check for prerequisite topics
        if (tArgs.hasOwnProperty("prerequisite_topics")) {
          // prereqs exist
          for (let i = 0; i < tArgs.prerequisite_topics.length; i++) {
            let parentTopicData = tArgs.prerequisite_topics[i];

            // Find parent topic
            let parentTopicExists = await Topic.findOne({
              name: parentTopicData.name,
              createdBy: auth0Id,
              sessionId,
            });
            // If the parent topic does not exist, create it
            if (!parentTopicExists) {
              parentTopicExists = await Topic.create({
                name: parentTopicData.name,
                description: parentTopicData.description,
                createdBy: auth0Id,
                sessionId,
              });
            }

            if (parentTopicExists && parentTopicExists.relationships) {
              // Establish the connection
              let relationshipExists =
                parentTopicExists.relationships.value.find(
                  (relationship: Relationship) =>
                    relationship.child_topic === newTopic.name
                );

              // if the relationship does exist, update the strength
              if (relationshipExists) {
                relationshipExists.strength = parentTopicData.strength;
              } else {
                parentTopicExists.relationships.value.push({
                  child_topic: newTopic.name,
                  strength: parentTopicData.strength,
                });

                await parentTopicExists.save();
              }
            } else {
              return res.status(400).json({
                message: `Parent topic ${parentTopicData.name} does not exist.`,
              });
            }
          }
        }

        // Check for child topics
        if (tArgs.hasOwnProperty("child_topics")) {
          for (let i = 0; i < tArgs.child_topics.length; i++) {
            let childTopicData = tArgs.child_topics[i];

            // Find child topic
            let childTopicExists = await Topic.findOne({
              name: childTopicData.name,
              createdBy: auth0Id,
              sessionId,
            });

            // If the child topic does not exist, create it
            if (!childTopicExists) {
              childTopicExists = await Topic.create({
                name: childTopicData.name,
                description: childTopicData.description,
                createdBy: auth0Id,
                sessionId,
              });
            }

            // Establish the connection. Since it is one way, we only need to update the parent topic
            topicExists.relationships.value.push({
              child_topic: childTopicData.name,
              strength: childTopicData.strength,
            });

            await topicExists.save();
          }

          // Update flags
          if (!updateFlags.topics) {
            updateFlags.topics = true;
            updateFlags.currentTopic = true;
          }
        }
      } else if (tool_call.name === "explain_question") {
        let explanation = tool_call.arguments;
      }
    }
    // Check to verify we received at least on create_multiple_choice_question call. If we did not, re-run the completion and return the result processed through the OpenAIProcessor
    if (depth === -1) {
      const topics = await Topic.find({
        createdBy: auth0Id,
        sessionId: sessionId,
      });

      // Clean topics to remove unnecessary fields (createdBy, _id)
      const cleanedTopics = topics.map((t) => {
        let tempValue = JSON.parse(JSON.stringify(t.relationships.value));
        tempValue = tempValue.map((v) => {
          delete v._id;
          return v;
        });

        return {
          name: t.name,
          description: t.description,
          relationships: {
            description: t.relationships.description,
            value: tempValue,
          },
        };
      });

      const metadata = {
        current_topic: {
          description: SYSTEM_METADATA_PROMPTS.current_topic,
          value: topic,
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
          value: [],
        },
      };

      // @ts-ignore
      openAIChatCompletionObject.messages[3] = {
        role: "system",
        content: `{"system_metadata": ${JSON.stringify(metadata)}}`,
      };
    }
    if (!updateFlags.questions) {
      if (depth > 12) {
        return res.status(500).json({
          message: "Failed to generate question after multiple attempts.",
          code: 200,
        });
      } else if (depth > 4) {
        // @ts-ignore
        openAIChatCompletionObject.tools = [OPENAI_TOOLS[0]];
      }

      // @ts-ignore
      openAIChatCompletionObject.messages.push({
        role: "system",
        content: GENERATE_QUESTION_PROMPT.did_not_generate_question,
      });

      return OpenAIProcessor(
        sessionUser,
        sessionId,
        completion,
        topic,
        res,
        openAIChatCompletionObject,
        depth + 1
      );
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
    return res.status(500).json({ message: error.message, stack: error.stack });
  }
}
