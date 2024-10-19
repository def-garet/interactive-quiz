const { default: ollama } = require('ollama');  // muni ang way para maimport si ollama

//from npm ollama documentation
const AIgenerator = async (query, questionType) => {
    try {
        const prompt = constructPrompt(query, questionType); 
        const response = await ollama.chat({
            model: 'dolphin-llama3', 
            messages: [{ role: 'user', content: prompt }],
        });

        const rawQuestions = response.message.content; 
        console.log('Response not in json:', rawQuestions);

        if (typeof rawQuestions !== 'string' || !rawQuestions.trim()) {
            throw new Error('Received invalid response from AI');
        };

        return formatQuestions(rawQuestions); 
    } catch (error) {
        console.error('Error interacting with AI:', error);
        throw new Error('Error interacting with AI: ' + error.message);
    };
};

const constructPrompt = (query, questionType) => {
    //muni ang prompt nga ginagamit para kung makapili si user muni ihaboy ya kay ollama (not working ang fill in the blank and true or false)
    switch (questionType) {
        case 'multiple_choice':
            return `Generate a JSON array of multiple choice ten questions with the format: {"questions": [{"question": "Question text", "options": ["Option 1", "Option 2"], "answer": "Correct answer"}]} based on the following text:\n${query}`;
        case 'fill_in_the_blank':
            return `Generate a JSON array of fill-in-the-blank questions with the format: [{"question": "Question text", "answer": "Correct answer"}] based on the following text:\n${query}`;
        case 'true_or_false':
            return `Generate a JSON array of true or false questions with the format: [{"question": "Question text", "answer": "True or False"}] based on the following text:\n${query}`;
        default:
            throw new Error('Invalid question type: ' + questionType);
    };
};

const formatQuestions = (rawQuestions) => {
    try {
        const parsedQuestions = JSON.parse(rawQuestions); 
        // format ni ka question para maging json ang questions nga ihaboy ni ollama
        if (!Array.isArray(parsedQuestions.questions)) {
            throw new Error('Parsed questions is not an array');
        };

        return parsedQuestions.questions.map((item, index) => ({
            id: index + 1,
            question: item.question,
            options: item.options || [],
            answer: item.answer === "True/False" ? null : item.answer
        }));
    } catch (error) {
        console.error('Error formatting questions:', error);
        throw new Error('Error formatting questions: ' + error.message);
    };
};

module.exports = AIgenerator;