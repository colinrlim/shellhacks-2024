"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const readline_1 = __importDefault(require("readline"));
const openai_endpoint_1 = require("./openai_endpoint");
let questions = [];
let metadata = {
  current_topic: "",
  registered_topics: [],
  favorited_questions: [],
  historical_questions: [],
};
// Set the functions
(0, openai_endpoint_1.setOnAnswerReceiveProcessedData)(
  (uid, session_id, question_response) => {
    metadata.historical_questions.push(question_response);
    console.log(
      `\nAnswer processed (uid: ${uid}, session_id: ${session_id}). Historical questions updated.`
    );
  }
);
(0, openai_endpoint_1.setOnFavoriteReceiveProcessedData)(
  (uid, session_id, question_response) => {
    metadata.favorited_questions.push(question_response);
    console.log(`Question favorited (uid: ${uid}, session_id: ${session_id}).`);
  }
);
(0, openai_endpoint_1.setOnQuestionCreateReceiveData)(
  (uid, session_id, question) => {
    questions.push(question);
    console.log(
      `\nNew question (uid: ${uid}, session_id: ${session_id}, index ${
        questions.length - 1
      }):`
    );
    console.log(question.question);
    console.log("1:", question.choice_1);
    console.log("2:", question.choice_2);
    console.log("3:", question.choice_3);
    console.log("4:", question.choice_4);
  }
);
(0, openai_endpoint_1.setOnRegisterTopicReceiveData)(
  (uid, session_id, topic_name, topic_description) => {
    const existingTopic = metadata.registered_topics.find(
      (topic) => topic.name === topic_name
    );
    if (existingTopic) {
      if (topic_description) {
        existingTopic.description = topic_description;
      }
    } else {
      metadata.registered_topics.push({
        name: topic_name,
        description: topic_description || "",
        relationships: [],
      });
    }
    console.log(
      `Topic "${topic_name}" registered or updated (uid: ${uid}, session_id: ${session_id}).`
    );
  }
);
(0, openai_endpoint_1.setOnRegisterRelationshipReceiveData)(
  (uid, session_id, prereq_topic_name, child_topic_name, strength) => {
    const prereqTopic = metadata.registered_topics.find(
      (topic) => topic.name === prereq_topic_name
    );
    if (prereqTopic) {
      prereqTopic.relationships.push({
        child_topic: child_topic_name,
        strength,
      });
      console.log(
        `Relationship registered: ${prereq_topic_name} -> ${child_topic_name} (strength: ${strength}, uid: ${uid}, session_id: ${session_id})`
      );
    } else {
      console.log(
        `Error: Prerequisite topic "${prereq_topic_name}" not found (uid: ${uid}, session_id: ${session_id}).`
      );
    }
  }
);
(0, openai_endpoint_1.setOnExplanationReceiveData)(
  (uid, session_id, explanation) => {
    console.log(`\nExplanation (uid: ${uid}, session_id: ${session_id}):`);
    console.log(explanation);
  }
);
(0, openai_endpoint_1.setSendMetadataFromDatabases)((uid, session_id) => {
  return metadata;
});
const rl = readline_1.default.createInterface({
  input: process.stdin,
  output: process.stdout,
});
function listQuestions() {
  console.log("\nAvailable questions:");
  questions.forEach((question, index) => {
    console.log(`[${index}] ${question.question}`);
  });
}
const uid = "colin";
const session_id = "m93kn-1359";
rl.on("line", (input) =>
  __awaiter(void 0, void 0, void 0, function* () {
    if (input.trim().toLowerCase() === "exit") {
      console.log("Goodbye!");
      rl.close();
    } else {
      let args = input.split(" ");
      let command = args[0];
      args.shift();
      if (command == "start") {
        const topic = args.join(" ");
        console.log(`Setting topic: ${topic}`);
        questions = []; // Clear previous questions when setting a new topic
        yield (0, openai_endpoint_1.INPUT_start_session)(
          uid,
          session_id,
          topic
        );
      } else if (command == "answer") {
        if (questions.length > 0) {
          listQuestions();
          rl.question(
            "\nEnter the question index you want to answer: ",
            (indexStr) => {
              const index = parseInt(indexStr);
              if (index >= 0 && index < questions.length) {
                const selectedQuestion = questions[index];
                rl.question("\nEnter your answer (1-4): ", (answer) =>
                  __awaiter(void 0, void 0, void 0, function* () {
                    const selectedChoice = parseInt(answer);
                    if (selectedChoice >= 1 && selectedChoice <= 4) {
                      const response = {
                        selected_choice: selectedChoice,
                        selected_choice_content:
                          selectedQuestion[`choice_${selectedChoice}`],
                        is_correct:
                          selectedChoice === selectedQuestion.correct_choice,
                      };
                      // Add feedback on whether the answer is correct or not
                      if (response.is_correct) {
                        console.log("\nCorrect! Great job!");
                      } else {
                        console.log(
                          "\nIncorrect. The correct answer was choice " +
                            selectedQuestion.correct_choice +
                            "."
                        );
                      }
                      yield (0, openai_endpoint_1.INPUT_answer)(
                        uid,
                        session_id,
                        selectedQuestion,
                        response
                      );
                    } else {
                      console.log(
                        "Invalid answer. Please enter a number between 1 and 4."
                      );
                    }
                  })
                );
              } else {
                console.log("Invalid question index. Please try again.");
              }
            }
          );
        } else {
          console.log(
            "No questions available. Use 'start' to begin a new session."
          );
        }
      } else if (command == "favorite") {
        if (questions.length > 0) {
          listQuestions();
          rl.question(
            "Enter the question index you want to favorite: ",
            (indexStr) =>
              __awaiter(void 0, void 0, void 0, function* () {
                const index = parseInt(indexStr);
                if (index >= 0 && index < questions.length) {
                  const selectedQuestion = questions[index];
                  const questionResponse = {
                    question_data: selectedQuestion,
                    user_response: {
                      selected_choice: 0,
                      selected_choice_content: "",
                      is_correct: false,
                    },
                  };
                  yield (0, openai_endpoint_1.INPUT_favorite)(
                    uid,
                    session_id,
                    questionResponse
                  );
                } else {
                  console.log("Invalid question index. Please try again.");
                }
              })
          );
        } else {
          console.log(
            "No questions available to favorite. Use 'set_topic' to start a new session."
          );
        }
      } else if (command == "list") {
        listQuestions();
      } else {
        console.log(`Unknown command: ${input}`);
      }
    }
  })
);
rl.on("close", () => {
  process.exit(0);
});
