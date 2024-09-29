import readline from 'readline';

import {
    functions,
    setOnAnswerReceiveProcessedData,
    setOnFavoriteReceiveProcessedData,
    setOnQuestionCreateReceiveData,
    setOnRegisterTopicReceiveData,
    setOnRegisterRelationshipReceiveData,
    setOnExplanationReceiveData,
    setSendMetadataFromDatabases,
    INPUT_start_session,
    INPUT_answer,
    INPUT_favorite,
    Topic_T,
    Metadata_T,
    Question_T,
    Response_T,
    QuestionResponse_T
} from './openai_endpoint'

let questions: Question_T[] = [];
let metadata: Metadata_T = {
    current_topic: "",
    registered_topics: [],
    favorited_questions: [],
    historical_questions: []
};

// Set the functions
setOnAnswerReceiveProcessedData((question_response: QuestionResponse_T): void => {
    metadata.historical_questions.push(question_response);
    console.log("\nAnswer processed. Historical questions updated.");
});

setOnFavoriteReceiveProcessedData((question_response: QuestionResponse_T): void => {
    metadata.favorited_questions.push(question_response);
    console.log("Question favorited.");
});

setOnQuestionCreateReceiveData((question: Question_T): void => {
    questions.push(question);
    console.log(`\nNew question (index ${questions.length - 1}):`);
    console.log(question.question);
    console.log("1:", question.choice_1);
    console.log("2:", question.choice_2);
    console.log("3:", question.choice_3);
    console.log("4:", question.choice_4);
});

setOnRegisterTopicReceiveData((topic_name: string, topic_description: string | null): void => {
    const existingTopic = metadata.registered_topics.find(topic => topic.name === topic_name);
    if (existingTopic) {
        if (topic_description) {
            existingTopic.description = topic_description;
        }
    } else {
        metadata.registered_topics.push({
            name: topic_name,
            description: topic_description || "",
            relationships: []
        });
    }
    console.log(`Topic "${topic_name}" registered or updated.`);
});

setOnRegisterRelationshipReceiveData((prereq_topic_name: string, child_topic_name: string, strength: number): void => {
    const prereqTopic = metadata.registered_topics.find(topic => topic.name === prereq_topic_name);
    if (prereqTopic) {
        prereqTopic.relationships.push({ child_topic: child_topic_name, strength });
        console.log(`Relationship registered: ${prereq_topic_name} -> ${child_topic_name} (strength: ${strength})`);
    } else {
        console.log(`Error: Prerequisite topic "${prereq_topic_name}" not found.`);
    }
});

setOnExplanationReceiveData((explanation: string): void => {
    console.log("\nExplanation:");
    console.log(explanation);
});

setSendMetadataFromDatabases((): Metadata_T => {
    return metadata;
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function listQuestions() {
    console.log("\nAvailable questions:");
    questions.forEach((question, index) => {
        console.log(`[${index}] ${question.question}`);
    });
}

rl.on("line", async (input) => {
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
            await INPUT_start_session(topic);
        } else if (command == "answer") {
            if (questions.length > 0) {
                listQuestions();
                rl.question("\nEnter the question index you want to answer: ", (indexStr) => {
                    const index = parseInt(indexStr);
                    if (index >= 0 && index < questions.length) {
                        const selectedQuestion = questions[index];
                        rl.question("\nEnter your answer (1-4): ", async (answer) => {
                            const selectedChoice = parseInt(answer);
                            if (selectedChoice >= 1 && selectedChoice <= 4) {
                                const response: Response_T = {
                                    selected_choice: selectedChoice,
                                    selected_choice_content: selectedQuestion[`choice_${selectedChoice}` as keyof Question_T] as string,
                                    is_correct: selectedChoice === selectedQuestion.correct_choice
                                };

                                // Add feedback on whether the answer is correct or not
                                if (response.is_correct) {
                                    console.log("\nCorrect! Great job!");
                                } else {
                                    console.log("\nIncorrect. The correct answer was choice " + selectedQuestion.correct_choice + ".");
                                }

                                await INPUT_answer(selectedQuestion, response);
                            } else {
                                console.log("Invalid answer. Please enter a number between 1 and 4.");
                            }
                        });
                    } else {
                        console.log("Invalid question index. Please try again.");
                    }
                });
            } else {
                console.log("No questions available. Use 'start' to begin a new session.");
            }
        } else if (command == "favorite") {
            if (questions.length > 0) {
                listQuestions();
                rl.question("Enter the question index you want to favorite: ", async (indexStr) => {
                    const index = parseInt(indexStr);
                    if (index >= 0 && index < questions.length) {
                        const selectedQuestion = questions[index];
                        const questionResponse: QuestionResponse_T = {
                            question_data: selectedQuestion,
                            user_response: {
                                selected_choice: 0,
                                selected_choice_content: "",
                                is_correct: false
                            }
                        };
                        await INPUT_favorite(questionResponse);
                    } else {
                        console.log("Invalid question index. Please try again.");
                    }
                });
            } else {
                console.log("No questions available to favorite. Use 'set_topic' to start a new session.");
            }
        } else if (command == "list") {
            listQuestions();
        } else {
            console.log(`Unknown command: ${input}`);
        }
    }
});

rl.on("close", () => {
	process.exit(0);
});