"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSendMetadataFromDatabases = exports.setOnExplanationReceiveData = exports.setOnRegisterRelationshipReceiveData = exports.setOnRegisterTopicReceiveData = exports.setOnQuestionCreateReceiveData = exports.setOnFavoriteReceiveProcessedData = exports.setOnAnswerReceiveProcessedData = exports.functions = void 0;
exports.INPUT_start_session = INPUT_start_session;
exports.INPUT_answer = INPUT_answer;
exports.INPUT_favorite = INPUT_favorite;
const openai_1 = __importDefault(require("openai"));
const OPENAI_KEY = "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";
const openai = new openai_1.default({ apiKey: OPENAI_KEY });
// Create an object to hold the functions
const functions = {
    onAnswerReceiveProcessedData: (() => { }),
    onFavoriteReceiveProcessedData: (() => { }),
    onQuestionCreateReceiveData: (() => { }),
    onRegisterTopicReceiveData: (() => { }),
    onRegisterRelationshipReceiveData: (() => { }),
    onExplanationReceiveData: (() => { }),
    sendMetadataFromDatabases: (() => ({}))
};
exports.functions = functions;
// Export the setter functions
const setOnAnswerReceiveProcessedData = (fn) => { functions.onAnswerReceiveProcessedData = fn; };
exports.setOnAnswerReceiveProcessedData = setOnAnswerReceiveProcessedData;
const setOnFavoriteReceiveProcessedData = (fn) => { functions.onFavoriteReceiveProcessedData = fn; };
exports.setOnFavoriteReceiveProcessedData = setOnFavoriteReceiveProcessedData;
const setOnQuestionCreateReceiveData = (fn) => { functions.onQuestionCreateReceiveData = fn; };
exports.setOnQuestionCreateReceiveData = setOnQuestionCreateReceiveData;
const setOnRegisterTopicReceiveData = (fn) => { functions.onRegisterTopicReceiveData = fn; };
exports.setOnRegisterTopicReceiveData = setOnRegisterTopicReceiveData;
const setOnRegisterRelationshipReceiveData = (fn) => { functions.onRegisterRelationshipReceiveData = fn; };
exports.setOnRegisterRelationshipReceiveData = setOnRegisterRelationshipReceiveData;
const setOnExplanationReceiveData = (fn) => { functions.onExplanationReceiveData = fn; };
exports.setOnExplanationReceiveData = setOnExplanationReceiveData;
const setSendMetadataFromDatabases = (fn) => { functions.sendMetadataFromDatabases = fn; };
exports.setSendMetadataFromDatabases = setSendMetadataFromDatabases;
function INPUT_start_session(uid, query) {
    return __awaiter(this, void 0, void 0, function* () {
        const messages = [
            { role: "assistant", content: "What would you like to learn?" },
            { role: "user", content: query, },
            { role: "system", content: "Your calls MUST include at least one generated question." },
        ];
        yield _send(uid, messages);
    });
}
function INPUT_answer(uid, question, answer) {
    return __awaiter(this, void 0, void 0, function* () {
        // Fill current_question with question & user response
        //console.log(questions);
        //console.log(questionID);
        //
        let current_response = {
            question_data: _deep_copy(question),
            user_response: {
                selected_choice: answer.selected_choice,
                // @ts-expect-error
                selected_choice_content: question["choice_" + answer],
                is_correct: (question.correct_choice == answer.selected_choice)
            }
        };
        // Give feedback
        /*if (current_response.user_response.is_correct) {
            console.log(`You were correct!`);
        } else {
            console.log(`You were wrong. The correct answer was Choice ${current_response.question_data.correct_choice}.`)
        }*/
        const messages = [
            { role: "system", content: JSON.stringify({ current_question: _transform_question_response(current_response) }) },
            { role: "system", content: "If the user answered the question incorrectly, call a function to provide an explanation to allow the user to comprehend why their response was incorrect, and why the actual answer is correct. Regardless of whether the user answered the question correctly or not, generate new questions by taking the user's performance and weaknesses into account and, potentially, register a new topic if you feel it is the most beneficial course of action for the user to achieve their implied comprehension goals. If you analyze that the user is performing worse than expected, you consider either lower the difficulty of newer generated questions or switch the topic to a prerequisite in order to help build their fundamentals. If the user appears to be performing better than expected, consider either raise the difficulty of newer generated questions or even switch the topic to a more advanced one that the current topic is foundational to. Questions should be created with the intention to fix user intuition and comprehension as effectively as possible. It is Your response must include at least one new generated question." }
        ];
        functions.onAnswerReceiveProcessedData(uid, current_response);
        _send(uid, messages);
    });
}
function INPUT_favorite(uid, question_response) {
    return __awaiter(this, void 0, void 0, function* () {
        _generate_metadata().favorited_questions.value.push(_deep_copy(question_response));
        // Tell openai to dynamically generate new questions
        const messages = [
            { role: "system", content: JSON.stringify({ recent_favorite: _transform_question_response(question_response) }) },
            { role: "system", content: "The user has just favorited a new question. Generate new questions by taking this newly favorited question alongside the user's performance and weaknesses into account and, potentially, register a new topic if you feel it is the most beneficial course of action for the user to achieve their implied comprehension goals. If you analyze that the user is performing worse than expected, you consider either lower the difficulty of newer generated questions or switch the topic to a prerequisite in order to help build their fundamentals. If the user appears to be performing better than expected, consider either raise the difficulty of newer generated questions or even switch the topic to a more advanced one that the current topic is foundational to. Questions should be created with the intention to fix user intuition and comprehension as effectively as possible. Your response must include at least one new generated question." }
        ];
        functions.onFavoriteReceiveProcessedData(uid, question_response);
        _send(uid, messages);
    });
}
;
;
;
;
;
;
;
;
;
function _send(uid, messages) {
    return __awaiter(this, void 0, void 0, function* () {
        const MESSAGES_HEADER = [
            { role: "system", content: "Your role is to make questions for the user to answer in order to assess their understanding of the subject. The questions should be created with the additional goal of building the user's comprehension in the subject. After the user's first message, you are not allowed to say anything. You are only allowed to call the provided tools. You are discouraged from creating exceptionally lengthy questions." },
            { role: "system", content: "This education system works by generating questions to explore topics of the user's choosing. Each distinct topic should be noted by you in order to visualize a network, which consists of nodes that represent each topic. This visualization will aid the user's learning and ease of use. If the topic being explored is not listed in the metadata, please register it with a command." },
            { role: "system", content: JSON.stringify({ system_metadata: _generate_metadata() }) }
        ];
        messages = MESSAGES_HEADER.concat(messages);
        let sufficient = false;
        let used_functions = [];
        let result;
        while (!sufficient && (result == undefined || result == null)) {
            let completion = yield openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: messages,
                tools: ALL_TOOLS.filter(func => !used_functions.includes(func.function.name))
            });
            let result = completion === null || completion === void 0 ? void 0 : completion.choices[0].message.tool_calls;
            console.log(result);
            if (result) {
                _do_calls(uid, result);
                // Add used function names to the used_functions array
                result.forEach(call => {
                    if (!used_functions.includes(call.function.name)) {
                        used_functions.push(call.function.name);
                    }
                });
                if (result.findIndex(obj => obj.function.name == "create_multiple_choice_question") != -1) {
                    sufficient = true;
                }
            }
            if (!sufficient) {
                messages.push({
                    role: "system",
                    content: "Though not visible to you, you responded to the user with commands, but did not generate any questions. Please only generate questions with your next response."
                });
                messages[2].content = JSON.stringify({ system_metadata: _generate_metadata() });
            }
        }
        return result;
    });
}
function _do_calls(uid, function_calls) {
    if (function_calls == null)
        return;
    for (let i = 0; i < function_calls.length; i++) {
        // Just parse the JSON string into real JSON
        let function_call = {
            name: function_calls[i].function.name,
            arguments: JSON.parse(function_calls[i].function.arguments)
        };
        //console.log(function_call)
        if (function_call.name == "create_multiple_choice_question") { // Create question DONE
            let new_question = function_call.arguments;
            functions.onQuestionCreateReceiveData(uid, _deep_copy(new_question));
        }
        else if (function_call.name == "establish_topic") { // Register topic DONE
            //assert.strictEqual(metadata.registered_topics.value.hasOwnProperty(function_call.arguments.name), false);
            _generate_metadata();
            if (function_call.arguments.hasOwnProperty("prerequisite_topics")) { // add established topic as child topic of all of these
                for (let i = 0; i < function_call.arguments.prerequisite_topics.length; i++) {
                    let curr_topic = function_call.arguments.prerequisite_topics[i];
                    functions.onRegisterTopicReceiveData(uid, curr_topic.name, curr_topic.description);
                    functions.onRegisterRelationshipReceiveData(uid, curr_topic.name, function_call.arguments.name, curr_topic.strength);
                }
            }
            if (function_call.arguments.hasOwnProperty("child_topics")) { // add all of these as child topics of established topic
                for (let i = 0; i < function_call.arguments.child_topics.length; i++) {
                    let curr_topic = function_call.arguments.child_topics[i];
                    functions.onRegisterTopicReceiveData(uid, function_call.arguments.name, function_call.arguments.description);
                    functions.onRegisterRelationshipReceiveData(uid, function_call.arguments.name, curr_topic.name, curr_topic.strength);
                }
            }
            _generate_metadata().current_topic = function_call.arguments.name;
        }
        else if (function_call.name == "establish_relationship") { // Register node relationship DONE
            //assert.strictEqual(metadata.registered_topics.value.hasOwnProperty(function_call.arguments.prerequisite_topic ), true);
            //assert.strictEqual(metadata.registered_topics.value.hasOwnProperty(function_call.arguments.child_topic        ), true);
            functions.onRegisterTopicReceiveData(uid, function_call.arguments.prerequisite_topic, null);
            functions.onRegisterRelationshipReceiveData(uid, function_call.arguments.prerequisite_topic, function_call.arguments.child_topic, function_call.arguments.strength);
        }
        else if (function_call.name == "explain_question") {
            functions.onExplanationReceiveData(uid, function_call.arguments.explanation);
        }
    }
}
function _deep_copy(data) {
    return JSON.parse(JSON.stringify(data));
}
function _transform_question_response(question_response) {
    return {
        description: "This is the question that has just been answered. It is not currently visible to you, but the user previously sent a message that prompted you to generate this question.",
        question_data: question_response.question_data,
        user_response: {
            description: "This includes the number of the choice that the user chose, including what that choice said. For good measure, this also includes a boolean value that represents whether the user got the question correct or not.",
            selected_choice: question_response.user_response.selected_choice,
            selected_choice_content: question_response.user_response.selected_choice_content,
            is_correct: question_response.user_response.is_correct
        }
    };
}
function _transform_question_response_array(question_response_array) {
    let result = [];
    for (let i = 0; i < question_response_array.length; i++)
        result.push(_transform_question_response(question_response_array[i]));
    return result;
}
function _generate_metadata() {
    let metadata = functions.sendMetadataFromDatabases();
    return {
        current_topic: {
            description: "This is the current topic at hand. If the value is empty, that means that this is a new session and that there is no selected topic yet. However, this does not necessarily mean that this is the user's first session.",
            value: metadata.current_topic
        },
        registered_topics: {
            description: "This lists all registered topics of which previous questions were asked. The topics are structured as nodes in a network, where relationships represent relationships between topics. Topics have a pseudo-hierarchical relationship. A relationship from Topic A to Topic B means that Topic A is a prerequisite for Topic B. All relationships are directed. If the two topics go hand-in-hand, there may be both a directed relationship from Topic A to Topic B and a directed relationship from Topic B to Topic A.",
            value: metadata.registered_topics
        },
        favorited_questions: {
            description: "This lists previously generated questions which the user has favorited. This can be either because they are interested in the topic, because they are struggling with it, or similar. Please consider these favorited questions in your generation of new questions. If there is a recurrent element in the questions (such as the type of knowledge they test, like theoretical vs exemplar), take that into consideration. You do not necessarily have to integrate the topics of these questions into your future generated questions, especially if the topics are significantly distinct from the one at hand.",
            value: _transform_question_response_array(metadata.favorited_questions)
        },
        historical_questions: {
            description: "This lists the most recent questions answered, from newest to oldest. Analyze the user's performance and topic comprehension based on these results, and guide your question generation accordingly.",
            value: _transform_question_response_array(metadata.historical_questions)
        }
    };
}
const ALL_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "create_multiple_choice_question",
            "description": "Creates a multiple choice question. Call this whenever you need to create a test question for the user.",
            "parameters": {
                "type": "object",
                "properties": {
                    "question": {
                        "type": "string",
                        "description": "The text that will be displayed as the current question."
                    },
                    "choice_1": {
                        "type": "string",
                        "description": "The first possible choice.",
                    },
                    "choice_2": {
                        "type": "string",
                        "description": "The second possible choice.",
                    },
                    "choice_3": {
                        "type": "string",
                        "description": "The third possible choice.",
                    },
                    "choice_4": {
                        "type": "string",
                        "description": "The fourth possible choice.",
                    },
                    "correct_choice": {
                        "type": "number",
                        "description": "The number of the choice that is the correct answer to the question."
                    }
                },
                "required": ["choice_1", "choice_2", "correct_choice"],
                "additionalProperties": false,
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "establish_topic",
            "description": "Call this when you want to register the topic as one of the topics for the network node visualization. Do not forget to create the relationships between this topic and the other pre-existing topics, when applicable. This function call will automatically set the listed topic as the current_topic.",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "The name of the topic to be displayed."
                    },
                    "description": {
                        "type": "string",
                        "description": "Flavor text that describes the topic. Should be somewhat short, but still useful for a user to refer to."
                    },
                    "prerequisite_topics": {
                        "type": "array",
                        "description": "The topics to be considered prerequisites of the selected topic, or at the very least, precursors to it. Any topic that could help in the comprehension of this topic should be considered. The inputted value should match the registered topic name exactly, and the topic does not necessarily have to already been registered in the metadata.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "name": {
                                    "type": "string",
                                    "description": "The name of prerequisite_topic in question."
                                },
                                "description": {
                                    "type": "string",
                                    "description": "Flavor text that describes the topic. Should be somewhat short, but still useful for a user to refer to."
                                },
                                "strength": {
                                    "type": "number",
                                    "description": "The strength of the relationship, as a floating point number between 0 and 1."
                                }
                            },
                            "required": ["prerequisite_topic", "child_topic", "strength"]
                        }
                    },
                    "child_topics": {
                        "type": "array",
                        "description": "The topics that requires the the selected topic's knowledge in order to completely comprehend. This is also applicable whenever the topic would benefit significantly from the selected topic's knowledge. The inputted value should match the registered topic name exactly, and the topic does not necessarily have to already been registered in the metadata.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "name": {
                                    "type": "string",
                                    "description": "The name of the child_topic in question."
                                },
                                "description": {
                                    "type": "string",
                                    "description": "Flavor text that describes the topic. Should be somewhat short, but still useful for a user to refer to."
                                },
                                "strength": {
                                    "type": "number",
                                    "description": "The strength of the relationship, as a floating point number between 0 and 1."
                                }
                            }
                        }
                    },
                },
                "required": ["name", "description"],
                "additionalProperties": false,
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "establish_relationship",
            "description": "Call this when you want to create a directed relationship to represent a hierarchical relationship between two topics. If you want to establish the two topics as equals in relationship, be sure to call this function again with the arguments flipped. Ensure that all topics registered in the metadata have at least one relationship (either as a child_topic or as a prerequisite_topic), even if it is extremely distinct. If you use establish_topic to register a new topic, you MUST call this function as well at least once.",
            "parameters": {
                "type": "object",
                "properties": {
                    "prerequisite_topic": {
                        "type": "string",
                        "description": "The topic to be considered a prerequisite of the child_topic, or at the very least, a precursor to it. Any topic that could help in the comprehension of child_topic should be considered. The inputted value should match the registered topic name exactly, and the topic should already have been registered in the metadata."
                    },
                    "child_topic": {
                        "type": "string",
                        "description": "The topic that requires the prerequisite_topic's knowledge in order to completely comprehend. This is also applicable whenever the topic would benefit significantly from the prerequisite_topic's knowledge. The inputted value should match the registered topic name exactly, and the topic should already have been registered in the metadata."
                    },
                    "strength": {
                        "type": "number",
                        "description": "The strength of the relationship, as a floating point number between 0 and 1."
                    }
                },
                "required": ["prerequisite_topic", "child_topic", "strength"],
                "additionalProperties": false,
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "explain_question",
            "description": "Call this when the user answers a question wrong, and you must give an explanation that encompasses both why their answer is wrong and why the correct answer is correct.",
            "parameters": {
                "type": "object",
                "properties": {
                    "explanation": {
                        "type": "string",
                        "description": "The explanation for the incorrect question. Try not to be verbose, but at the same time, attempt to maximize user comprehension of topic."
                    }
                },
                "required": ["explanation"],
                "additionalProperties": false,
            }
        }
    }
];
