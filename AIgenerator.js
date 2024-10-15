const { default: ollama } = require('ollama');

//from npm ollama documentation
const AIgenerator = async (query, questionType) => {
    try {
        const prompt = constructPrompt(query, questionType); 
        const response = await ollama.chat({
            model: 'dolphin-llama3', 
            messages: [{ role: 'user', content: prompt }],
        });

        const rawQuestions = response.message.content; 
        const formattedQuestions = formatQuestions(rawQuestions); 

        return formattedQuestions;
    } catch (error) {
        console.error('Error interacting :', error);
        throw new Error('Error interacting ');
    }
};

const constructPrompt = (query, questionType) => {
    console.log('Received question type:', questionType); 
    switch (questionType) {
        case 'multiple_choice':
            return Generate` a list of multiple choice questions with the format: {"questions": [{"question": "Question text", "options": ["Option 1", "Option 2"], "answer": "Correct answer"}]} based on the following text:\n${query}`;
        case 'fill_in_the_blank':
            return `Generate a list of fill-in-the-blank questions with the format: [{"question": "Question text", "answer": "Correct answer"}] based on the following text:\n${query}`;
        case 'true_or_false':
            return `Generate a list of true or false questions with the format: [{"question": "Question text", "answer": "True/False"}] based on the following text:\n${query}`;
        default:
            throw new Error('Invalid question type');
    }
};

const formatQuestions = (rawQuestions) => {
    try {
        const parsedQuestions = JSON.parse(rawQuestions); 
        return parsedQuestions.questions.map((item, index) => ({
            id: index + 1,
            question: item.question,
            options: item.options,
            answer: item.answer
        }));
    } catch (error) {
        console.error('Error questions:', error);
        throw new Error('Error questions');
    }
};

module.exports = AIgenerator;