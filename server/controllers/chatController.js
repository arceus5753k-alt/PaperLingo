const { GoogleGenAI } = require("@google/genai");

const generateChatResponse = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                message: "Message is required.",
            });
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                message: "Gemini API key is not configured.",
            });
        }

        const ai = new GoogleGenAI({
            apiKey,
        });

        const prompt = `
You are PaperLingo AI, a helpful assistant for a paper-trading
and stock-market learning application.

Answer the user's question clearly and concisely.

You can help with:
- Stock market concepts
- Trading concepts
- Technical analysis
- Risk management
- Portfolio concepts
- Paper trading
- Investing terminology

Do not claim to provide guaranteed financial returns.
For financial questions, provide educational information rather
than personalized financial advice.

User message:
${message}
`;

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt,
        });

        const generatedContent = response.text;

        if (!generatedContent) {
            return res.status(500).json({
                message: "Gemini returned an empty response.",
            });
        }

        return res.status(200).json({
            response: generatedContent,
        });
    } catch (error) {
        console.error(
            "Error generating chatbot response:",
            error
        );

        return res.status(500).json({
            message: "Failed to generate chatbot response.",
        });
    }
};

module.exports = {
    generateChatResponse,
};