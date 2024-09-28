// @/constants

// OpenAI Prompts

const GENERATE_QUESTION_PROMPT = {
  output:
    "This is the question that has just been answered. It is not currently visible to you, but the user previously sent a message that prompted you to generate this question.",
  input:
    "This includes the number of the choice that the user chose, including what that choice said. For good measure, this also includes a boolean value that represents whether the got the question correct or not.",
  did_not_generate_question:
    "Though not visible to you, you responded to the user with commands, but did not generate any questions. Please only generate questions with your next response.",
};

const SET_TOPIC_PROMPTS = {
  agent_role: {
    role: "system",
    content:
      "Your role is to make questions for the user to answer in order to assess their understanding of the subject. The questions should be created with the additional goal of building the user's comprehension in the subject. After the user's first message, you are not allowed to say anything. You are only allowed to call the provided tools. You are discouraged from creating exceptionally lengthy questions.",
  },
  system_description: {
    role: "system",
    content:
      "This education system works by generating questions to explore topics of the user's choosing. Each distict topic should be noted by you in order to visualize a network, which consists of nodes that represent each topic. This visualization will aid the user's learning and ease of use. If the topic being explored is not listed in the metadata, please register it with a command.",
  },
  prompt_helper: {
    role: "assistant",
    content: "What would youu like to learn?",
  },
  output_conditions: {
    role: "system",
    content: "Your calls MUST include at least one generated question.",
  },
};

const SYSTEM_METADATA_PROMPTS = {
  current_topic:
    "This is the current topic at hand. If the value is empty, that means that this is a new session and that there is no selected topic yet. However, this does not necessarily mean that this is the user's first session.",
  registered_topics:
    "This lists all registered topics of which previous questions were asked. The topics are structured as nodes in a network, where relationships represent relationships between topics. Topics have a pseudo-hierarchical relationship. A relationship from Topic A to Topic B means that Topic A is a prerequisite for Topic B. All relationships are directed. If the two topics go hand-in-hand, there may be both a directed relationship from Topic A to Topic B and a directed relationship from Topic B to Topic A.",
  favorited_questions:
    "This lists previously generated questions which the user has favorited. This can be either because they are interested in the topic, because they are struggling with it, or similar. Please consider these favorited questions in your generation of new questions. If there is a recurrent element in the questions (such as the type of knowledge they test, like theoretical vs exemplar), take that into consideration. You do not necessarily have to integrate the topics of these questions into your future generated questions, especially if the topics are significantly distinct from the one at hand.",
  historical_questions:
    "This lists the most recent questions answered, from newest to oldest. Analyze the user's performance and topic comprehension based on these results, and guide your question generation accordingly.",
};

const QUESTION_ANSWERED_PROMPTS = {
  agent_role: {
    role: "system",
    content:
      "Your role is to make questions for the user to answer in order to assess their understanding of the subject. The questions should be created with the additional goal of building the user's comprehension in the subject. After the user's first message, you are not allowed to say anything. You are only allowed to call the provided tools. You are discouraged from creating exceptionally lengthy questions.",
  },
  system_description: {
    role: "system",
    content:
      "This education system works by generating questions to explore topics of the user's choosing. Each distict topic should be noted by you in order to visualize a network, which consists of nodes that represent each topic. This visualization will aid the user's learning and ease of use. If the topic being explored is not listed in the metadata, please register it with a command.",
  },
  prompt_directions: {
    role: "system",
    content:
      "If the user answered the question incorrectly, call a function to provide an explanation to allow the user to comprehend why their response was incorrect, and why the actual answer is correct. Regardless of whether the user answered the question correctly or not, generate new questions by taking the user's performance and weaknesses into account and, potentially, register a new topic if you feel it is the most beneficial course of action for the user to achieve their implied comprehension goals. Questions should be created with the intention to fix user intuition and comprehension as effectively as possible. Your response must include at least one new generated question.",
  },
};

const OPENAI_TOOLS = [
  {
    type: "function",
    function: {
      name: "create_multiple_choice_question",
      description:
        "Creates a multiple choice question. Call this whenever you need to create a test question for the user.",
      parameters: {
        type: "object",
        properties: {
          question: {
            type: "string",
            description:
              "The text that will be displayed as the current question.",
          },
          choice_1: {
            type: "string",
            description: "The first possible choice.",
          },
          choice_2: {
            type: "string",
            description: "The second possible choice.",
          },
          choice_3: {
            type: "string",
            description: "The third possible choice.",
          },
          choice_4: {
            type: "string",
            description: "The fourth possible choice.",
          },
          correct_choice: {
            type: "number",
            description:
              "The number of the choice that is the correct answer to the question.",
          },
        },
        required: ["choice_1", "choice_2", "correct_choice"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "establish_topic",
      description:
        "Call this when you want to register the topic as one of the topics for the network node visualization. Do not forget to create the relationships between this topic and the other pre-existing topics, when applicable. This function call will automatically set the listed topic as the current_topic.",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "The name of the topic to be displayed.",
          },
          description: {
            type: "string",
            description:
              "Flavor text that describes the topic. Should be somewhat short, but still useful for a user to refer to.",
          },
          prerequisite_topics: {
            type: "array",
            description:
              "The topics to be considered prerequisites of the selected topic, or at the very least, precursors to it. Any topic that could help in the comprehension of this topic should be considered. The inputted value should match the registered topic name exactly, and the topic does not necessarily have to already been registered in the metadata.",
            items: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "The name of prerequisite_topic in question.",
                },
                description: {
                  type: "string",
                  description:
                    "Flavor text that describes the topic. Should be somewhat short, but still useful for a user to refer to.",
                },
                strength: {
                  type: "number",
                  description:
                    "The strength of the relationship, as a floating point number between 0 and 1.",
                },
              },
            },
          },
          child_topics: {
            type: "array",
            description:
              "The topics that requires the the selected topic's knowledge in order to completely comprehend. This is also applicable whenever the topic would benefit significantly from the selected topic's knowledge. The inputted value should match the registered topic name exactly, and the topic does not necessarily have to already been registered in the metadata.",
            items: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "The name of the child_topic in question.",
                },
                description: {
                  type: "string",
                  description:
                    "Flavor text that describes the topic. Should be somewhat short, but still useful for a user to refer to.",
                },
                strength: {
                  type: "number",
                  description:
                    "The strength of the relationship, as a floating point number between 0 and 1.",
                },
              },
            },
          },
        },
        required: ["name", "description"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "establish_relationship",
      description:
        "Call this when you want to create a directed relationship to represent a hierarchical relationship between two topics. If you want to establish the two topics as equals in relationship, be sure to call this function again with the arguments flipped. Ensure that all topics registered in the metadata have at least one relationship (either as a child_topic or as a prerequisite_topic), even if it is extremely distinct. If you use establish_topic to register a new topic, you MUST call this function as well at least once.",
      parameters: {
        type: "object",
        properties: {
          prerequisite_topic: {
            type: "string",
            description:
              "The topic to be considered a prerequisite of the child_topic, or at the very least, a precursor to it. Any topic that could help in the comprehension of child_topic should be considered. The inputted value should match the registered topic name exactly, and the topic should already have been registered in the metadata.",
          },
          child_topic: {
            type: "string",
            description:
              "The topic that requires the prerequisite_topic's knowledge in order to completely comprehend. This is also applicable whenever the topic would benefit significantly from the prerequisite_topic's knowledge. The inputted value should match the registered topic name exactly, and the topic should already have been registered in the metadata.",
          },
          strength: {
            type: "number",
            description:
              "The strength of the relationship, as a floating point number between 0 and 1.",
          },
        },
        required: ["prerequisite_topic", "child_topic", "strength"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "explain_question",
      description:
        "Call this when the user answers a question wrong, and you must give an explanation that encompasses both why their answer is wrong and why the correct answer is correct.",
      parameters: {
        type: "object",
        properties: {
          explanation: {
            type: "string",
            description:
              "The explanation for the incorrect question. Try not to be verbose, but at the same time, attempt to maximize user comprehension of topic.",
          },
        },
        required: ["explanation"],
        additionalProperties: false,
      },
    },
  },
];

export {
  GENERATE_QUESTION_PROMPT,
  SET_TOPIC_PROMPTS,
  SYSTEM_METADATA_PROMPTS,
  OPENAI_TOOLS,
  QUESTION_ANSWERED_PROMPTS,
};
