const assert = require('node:assert');

const OPENAI_KEY = "";

const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: OPENAI_KEY });

const TEST_METADATA = {
    current_topic: {
        description: "This is the current topic at hand. If the value is empty, that means that this is a new session and that there is no selected topic yet. However, this does not necessarily mean that this is the user's first session.",
        value: 'Coding'
    },
    registered_topics: {
        description: 'This lists all registered topics of which previous questions were asked. The topics are structured as nodes in a network, where connections represent relationships between topics. Topics have a pseudo-hierarchical relationship. A connection from Topic A to Topic B means that Topic A is a prerequisite for Topic B. All connections are directed. If the two topics go hand-in-hand, there may be both a directed connection from Topic A to Topic B and a directed connection from Topic B to Topic A.',
        value: [{
                name: 'Vue',
                description: 'A progressive JavaScript framework for building user interfaces and single-page applications.',
                relationships: []
            },
            {
                name: 'Javascript',
                description: 'A versatile programming language primarily used for web development, enabling interactive web pages.',
                relationships: []
            },
            {
                name: 'Programming',
                description: 'The process of designing and building executable computer software to accomplish a specific task.',
                relationships: []
            }
        ]
    },
    favorited_questions: {
        description: "This lists previously generated questions which the user has favorited. This can be either because they are interested in the topic, because they are struggling with it, or similar. Please consider these favorited questions in your generation of new questions. If there is a recurrent element in the questions (such as the type of knowledge they test, like theoretical vs exemplar), take that into consideration. You do not necessarily have to integrate the topics of these questions into your future generated questions, especially if the topics are significantly distinct from the one at hand.",
        value: []
    },
    historical_questions: {
        description: "This lists the most recent questions answered, from newest to oldest. Analyze the user's performance and topic comprehension based on these results, and guide your question generation accordingly.",
        value: []
    }
};

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
                            }
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
]

const RELATIONSHIPS_DEFAULT = {
    description: "All listed relationships are to child_topics of this topic.",
    value: []
};

let metadata = {
    current_topic: {
        description: "This is the current topic at hand. If the value is empty, that means that this is a new session and that there is no selected topic yet. However, this does not necessarily mean that this is the user's first session.",
        value: ""
    },
    registered_topics: {
        description: "This lists all registered topics of which previous questions were asked. The topics are structured as nodes in a network, where relationships represent relationships between topics. Topics have a pseudo-hierarchical relationship. A relationship from Topic A to Topic B means that Topic A is a prerequisite for Topic B. All relationships are directed. If the two topics go hand-in-hand, there may be both a directed relationship from Topic A to Topic B and a directed relationship from Topic B to Topic A.",
        value: {}
    },
    favorited_questions: {
        description: "This lists previously generated questions which the user has favorited. This can be either because they are interested in the topic, because they are struggling with it, or similar. Please consider these favorited questions in your generation of new questions. If there is a recurrent element in the questions (such as the type of knowledge they test, like theoretical vs exemplar), take that into consideration. You do not necessarily have to integrate the topics of these questions into your future generated questions, especially if the topics are significantly distinct from the one at hand.",
        value: []
    },
    historical_questions: {
        description: "This lists the most recent questions answered, from newest to oldest. Analyze the user's performance and topic comprehension based on these results, and guide your question generation accordingly.",
        value: []
    }
};

// metadata = deep_copy(TEST_METADATA);

let questions = [];

let current_question = {
    description: "This is the question that has just been answered. It is not currently visible to you, but the user previously sent a message that prompted you to generate this question.",
    question_data: {
        content: "",
        choice_1: "",
        choice_2: "",
        choice_3: "",
        choice_4: "",
        correct_choice: 1
    },
    user_response: {
        description: "This includes the number of the choice that the user chose, including what that choice said. For good measure, this also includes a boolean value that represents whether the got the question correct or not.",
        selected_choice: 1,
        selected_choice_content: "",
        is_correct: false
    }
};

function define_topic(name, description) {
    if (!metadata.registered_topics.value.hasOwnProperty(name))
        metadata.registered_topics.value[name] = {
            description: "",
            relationships: deep_copy(RELATIONSHIPS_DEFAULT)
        };
    metadata.registered_topics.value[name].description = description;

    // reference to entry
    return metadata.registered_topics.value[name];
}

function register_child_topic(prereq_topic_name, child_topic_name, strength) {
    define_topic(prereq_topic_name);

    metadata.registered_topics.value[prereq_topic_name].relationships.value.push({
        child_topic: child_topic_name,
        strength: strength
    });
}

function do_calls(function_calls) { // DONE
    if (function_calls == null) return;
    for (let i = 0; i < function_calls.length; i++) {
        // Just parse the JSON string into real JSON
        function_call = {
            name: function_calls[i].function.name,
            arguments: JSON.parse(function_calls[i].function.arguments)
        };

        //console.log(function_call)

        if (function_call.name == "create_multiple_choice_question") {  // Create question DONE
            let new_question = function_call.arguments;

            // create it
            questions.push(deep_copy(function_call.arguments));

            // display it
            console.log(`Question #${questions.length}`);
            console.log(`Content: ${questions[questions.length - 1].question}`);
            console.log(`   Choice 1: ${questions[questions.length - 1].choice_1}`);
            console.log(`   Choice 2: ${questions[questions.length - 1].choice_2}`);
            console.log(`   Choice 3: ${questions[questions.length - 1].choice_3}`);
            console.log(`   Choice 4: ${questions[questions.length - 1].choice_4}`);
        } else if (function_call.name == "establish_topic") {           // Register topic DONE
            //assert.strictEqual(metadata.registered_topics.value.hasOwnProperty(function_call.arguments.name), false);

            if (function_call.arguments.hasOwnProperty("prerequisite_topics")) { // add established topic as child topic of all of these
                for (let i = 0; i < function_call.arguments.prerequisite_topics.length; i++) {
                    let curr_topic = function_call.arguments.prerequisite_topics[i];
                    register_child_topic(curr_topic.name, function_call.arguments.name, curr_topic.strength);
                }
            }
            if (function_call.arguments.hasOwnProperty("child_topics")) { // add all of these as child topics of established topic
                for (let i = 0; i < function_call.arguments.child_topics.length; i++) {
                    let curr_topic = function_call.arguments.child_topics[i];
                    register_child_topic(function_call.arguments.name, curr_topic.name, curr_topic.strength);
                }
            }

            metadata.current_topic = function_call.arguments.name;
        } else if (function_call.name == "establish_relationship") {      // Register node relationship DONE
            assert.strictEqual(metadata.registered_topics.value.hasOwnProperty(function_call.arguments.prerequisite_topic ), true);
            assert.strictEqual(metadata.registered_topics.value.hasOwnProperty(function_call.arguments.child_topic        ), true);
            
            register_child_topic(function_call.arguments.prerequisite_topic, function_call.arguments.child_topic, function_call.arguments.strength);
        } else if (function_call.name == "explain_question") {
            console.log(`Explanation: ${function_call.arguments.explanation}`);
        }
    }
}

async function send(messages) { // DONE
    const MESSAGES_HEADER = [
        { role: "system", content: "Your role is to make questions for the user to answer in order to assess their understanding of the subject. The questions should be created with the additional goal of building the user's comprehension in the subject. After the user's first message, you are not allowed to say anything. You are only allowed to call the provided tools. You are discouraged from creating exceptionally lengthy questions." },
        { role: "system", content: "This education system works by generating questions to explore topics of the user's choosing. Each distict topic should be noted by you in order to visualize a network, which consists of nodes that represent each topic. This visualization will aid the user's learning and ease of use. If the topic being explored is not listed in the metadata, please register it with a command." },
        { role: "system", content: JSON.stringify({ system_metadata: metadata }) }
    ];
    
    messages = MESSAGES_HEADER.concat(messages);

    //console.log(messages);

    // Query API
    let result = (await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages,
        tools: ALL_TOOLS
    })).completion.choices[0].message;
    
    console.log(result.tool_calls);

    let sufficient = false;
    while (!sufficient) {
        do_calls(result.tool_calls);
        messages[2].content = JSON.stringify({ system_metadata: metadata });

        if (result.tool_calls.findIndex(obj => obj.function.name == "create_multiple_choice_question") != -1)
            sufficient = true;
        else {
            messages.push({
                role: "system",
                content: "Though not visible to you, you responded to the user with commands, but did not generate any questions. Please only generate questions with your next response."
            });
            //console.log(messages);

            result = (await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: messages,
                tools: ALL_TOOLS
            })).completion.choices[0].message;

            console.log(result.tool_calls);
        }
    }

    return result;
}

async function set_topic(query) {
    const messages = [
        { role: "assistant", content: "What would you like to learn?" },
        { role: "user", content: query, },
        { role: "system", content: "Your calls MUST include at least one generated question." },
    ];

    const result = await send(messages);

    // Execute AI's function calls
    do_calls(result.tool_calls);
}

function deep_copy(data) {
    return JSON.parse(JSON.stringify(data));
}

async function answer(questionID, answer) {
    // Fill current_question with question & user response
    //console.log(questions);
    //console.log(questionID);

    //
    current_question.question_data = deep_copy(questions[questionID]);
    current_question.user_response.selected_choice = answer;
    current_question.user_response.selected_choice_content = current_question.question_data["choice_" + answer];
    current_question.user_response.is_correct = (current_question.question_data.correct_choice == answer);

    // Give feedback
    if (current_question.user_response.is_correct) {
        console.log(`You were correct!`);
    } else {
        console.log(`You were wrong. The correct answer was Choice ${current_question.question_data.correct_choice}.`)
    }

    const messages = [
        { role: "system", content: JSON.stringify({ current_question: current_question }) },
        { role: "system", content: "If the user answered the question incorrectly, call a function to provide an explanation to allow the user to comprehend why their response was incorrect, and why the actual answer is correct. Regardless of whether the user answered the question correctly or not, generate new questions by taking the user's performance and weaknesses into account and, potentially, register a new topic if you feel it is the most beneficial course of action for the user to achieve their implied comprehension goals. Questions should be created with the intention to fix user intuition and comprehension as effectively as possible. Your response must include at least one new generated question." }
    ];

    metadata.historical_questions.value.unshift(current_question);

    const result = send(messages);
}

function favorite(questionID) { // TODO: Add answers to favorites metadata
    metadata.favorited_questions.value.push(deep_copy(questions[questionID]));

    // Tell openai to dynamically generate new questions
    const messages = [
        { role: "system", content: JSON.stringify({ recent_favorite: questions[questionID] }) },
        { role: "system", content: "The user has just favorited a new question. Generate new questions by taking this newly favorited question alongside the user's performance and weaknesses into account and, potentially, register a new topic if you feel it is the most beneficial course of action for the user to achieve their implied comprehension goals. Questions should be created with the intention to fix user intuition and comprehension as effectively as possible. Your response must include at least one new generated question."}
    ];

    metadata.historical_questions.value.unshift(current_question);

    const result = send(messages);
}

//foo("Node.js");

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('Enter commands (type "exit" to quit):');

let isChat = false;

rl.on('line', (input) => {
    if (isChat == false) {
        if (input.trim().toLowerCase() === 'exit') {
            console.log('Goodbye!');
            rl.close();
        } else {
            let args = input.split(' ');
            let command = args[0];

            args.shift();
            if (command == "set_topic") {
                set_topic(args.join(" "));
            } else if (command == "answer") {
                assert.strictEqual(args.length, 2);
                assert.strictEqual(isNaN(args[0]), false);
                assert.strictEqual(isNaN(args[1]), false);

                answer(parseInt(args[0])-1, parseInt(args[1]));
            } else if (command == "favorite") {
                assert.strictEqual(args.length, 1);
                assert.strictEqual(isNaN(args[0]), false);

                favorite(parseInt(args[0])-1);
            } else if (command == "chat") {

            } else {
                console.log(`Unknown command: ${input}`);
            }
        }
    } else {

    }
});

rl.on('close', () => {
    process.exit(0);
});