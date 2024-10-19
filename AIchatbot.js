const { default: ollama } = require('ollama');

const AIchatbot = async (userMessage) => {
    try {
        const prompt = `You are a helpful AI chatbot. Respond to the following message:\n\n"${userMessage}"`;

        const response = await ollama.chat({
            model: 'dolphin-llama3', 
            messages: [{ role: 'user', content: prompt }],
        });

        const botResponse = response.message.content.trim();

        console.log('Bot Response:', botResponse);

        return botResponse;
    } catch (error) {
        console.error('Error interacting with AI:', error);
        throw new Error('Error interacting with AI');
    }
};

module.exports = AIchatbot;