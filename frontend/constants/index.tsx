// @/constants

// OpenAI Prompts

const GENERATE_QUESTION_PROMPT = {
  output:
    "This is the question that has just been answered. It is not currently visible to you, but the user previously sent a message that prompted you to generate this question.",
  input:
    "This includes the number of the choice that the user chose, including what that choice said. For good measure, this also includes a boolean value that represents whether the got the question correct or not.",
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
    "This lists all registered topics of which previous questions were asked. The topics are structured as nodes in a network, where connections represent relationships between topics. Topics have a pseudo-hierarchical relationship. A connection from Topic A to Topic B means that Topic A is a prerequisite for Topic B. All connections are directed. If the two topics go hand-in-hand, there may be both a directed connection from Topic A to Topic B and a directed connection from Topic B to Topic A.",
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
        "Call this when you want to register the topic as one of the topics for the network node visualization. Do not forget to create the connections between this topic and the other pre-existing topics, when applicable. This function call will automatically set the listed topic as the current_topic.",
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
        },
        required: ["name", "description"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "establish_connection",
      description:
        "Call this when you want to create a directed connection to represent a hierarchical relationship between two topics. If you want to establish the two topics as equals in relationship, be sure to call this function again with the arguments flipped.",
      parameters: {
        type: "object",
        properties: {
          prerequisite_topic: {
            type: "string",
            description:
              "The topic to be considered a prerequisite of the child_topic. The inputted value should match the registered topic name exactly, and the topic should already have been registered through establish_topic.",
          },
          child_topic: {
            type: "string",
            description:
              "The topic that requires the prerequisite_topic's knowledge in order to completely comprehend. This is also applicable whenever the topic would benefit significantly from the prerequisite_topic's knowledge. The inputted value should match the registered topic name exactly, and the topic should already have been registered through establish_topic.",
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
};
