
const User = require("../models/user.js");
const { GoogleGenAI } = require("@google/genai");

const GEMINI_TIMEOUT = 20000;

const fallbackQuestions = [
    {
        question: "What does IPO stand for?",
        options: [
            "Initial Public Offering",
            "Internal Price Order",
            "Investment Portfolio Option",
            "Initial Purchase Order",
        ],
        answer: 0,
    },
    {
        question: "What does a shareholder own?",
        options: [
            "A company's debt only",
            "A portion of a company",
            "A bank account",
            "A government bond only",
        ],
        answer: 1,
    },
    {
        question: "What generally happens when you buy a stock?",
        options: [
            "You lend money to the government",
            "You become a company employee",
            "You purchase a share of ownership",
            "You guarantee a profit",
        ],
        answer: 2,
    },
    {
        question: "What is diversification?",
        options: [
            "Investing all money in one stock",
            "Avoiding every investment",
            "Buying and selling every minute",
            "Spreading investments across different assets",
        ],
        answer: 3,
    },
    {
        question: "What does a limit order do?",
        options: [
            "Sets the maximum buy price or minimum sell price",
            "Guarantees a profit",
            "Removes all investment risk",
            "Automatically doubles your money",
        ],
        answer: 0,
    },
    {
        question: "What is a bull market?",
        options: [
            "A market with generally rising prices",
            "A market where trading is prohibited",
            "A market with only falling prices",
            "A market with guaranteed returns",
        ],
        answer: 0,
    },
    {
        question: "What is a bear market?",
        options: [
            "A market with guaranteed profits",
            "A market with generally declining prices",
            "A market that trades only bonds",
            "A market with no investors",
        ],
        answer: 1,
    },
    {
        question: "What does a dividend represent?",
        options: [
            "A brokerage account password",
            "A guaranteed stock price increase",
            "A distribution of company earnings to shareholders",
            "A fee charged on every trade",
        ],
        answer: 2,
    },
    {
        question: "What is a portfolio?",
        options: [
            "A single stock exchange",
            "A collection of investments",
            "A type of market order",
            "A company's annual tax",
        ],
        answer: 1,
    },
    {
        question: "What is a stop-loss order generally intended to do?",
        options: [
            "Guarantee a profit on every trade",
            "Increase a stock's dividend",
            "Remove all market risk",
            "Help limit losses by triggering an order at a specified price",
        ],
        answer: 3,
    },
    {
        question: "What does liquidity mean in financial markets?",
        options: [
            "How easily an asset can be bought or sold without greatly affecting its price",
            "How much tax an investor pays",
            "How many employees a company has",
            "How often a company pays dividends",
        ],
        answer: 0,
    },
    {
        question: "What is a stock exchange?",
        options: [
            "A personal savings account",
            "A place or system where securities are traded",
            "A loan agreement between friends",
            "A government-issued credit card",
        ],
        answer: 1,
    },
    {
        question: "What is diversification mainly intended to reduce?",
        options: [
            "The number of assets in a portfolio",
            "All possibility of loss",
            "Concentration risk in a portfolio",
            "The need to monitor investments",
        ],
        answer: 2,
    },
    {
        question: "What does market capitalization measure?",
        options: [
            "A company's total number of employees",
            "Its annual dividend per share only",
            "Its total daily trading volume",
            "The market value of its outstanding shares",
        ],
        answer: 3,
    },
    {
        question: "What is a brokerage?",
        options: [
            "A service that facilitates buying and selling investments",
            "A guarantee that investments will profit",
            "A type of company dividend",
            "A method for eliminating market risk",
        ],
        answer: 0,
    },
];

const shuffleArray = (items) => {
    const shuffled = [...items];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
};

const validateQuestions = (questions) => {
    return (
        Array.isArray(questions) &&
        questions.length === 5 &&
        questions.every(
            (question) =>
                question &&
                typeof question.question === "string" &&
                question.question.trim().length > 0 &&
                Array.isArray(question.options) &&
                question.options.length === 4 &&
                question.options.every(
                    (option) =>
                        typeof option === "string" &&
                        option.trim().length > 0
                ) &&
                Number.isInteger(question.answer) &&
                question.answer >= 0 &&
                question.answer < 4
        )
    );
};

const generateQuestionsFromGemini = async () => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing from the server .env file.");
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
Create a NEW quiz containing exactly 5 multiple-choice questions about
stock markets, investing, trading, orders, risk, and financial concepts.

Try to use different concepts and questions from previous quiz attempts.
Do not repeat the same questions within this quiz.

Return only valid JSON:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "answer": 0
    }
  ]
}

Rules:
- Exactly 5 questions and 4 options per question.
- Exactly one correct answer per question.
- "answer" must be the zero-based index of the correct option.
- Keep all questions educational and factually accurate.
- Do not ask about current stock prices.
`;

    let timeoutId;

    try {
        const response = await Promise.race([
            ai.models.generateContent({
                model: "gemini-3.6-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                },
            }),
            new Promise((_, reject) => {
                timeoutId = setTimeout(
                    () => reject(new Error("Gemini request timed out.")),
                    GEMINI_TIMEOUT
                );
            }),
        ]);

        if (!response.text) {
            throw new Error("Gemini returned an empty response.");
        }

        let quizData;

        try {
            quizData = JSON.parse(response.text);
        } catch {
            throw new Error("Gemini returned invalid JSON.");
        }

        if (!validateQuestions(quizData.questions)) {
            throw new Error("Gemini returned invalid question data.");
        }

        return quizData.questions;
    } finally {
        clearTimeout(timeoutId);
    }
};

const generateQuizQuestions = async (req, res) => {
    try {
        let questions;

        try {
            questions = await generateQuestionsFromGemini();
            console.log("Generated a fresh quiz using Gemini.");
        } catch (error) {
            console.warn(
                "Gemini unavailable; selecting random fallback questions:",
                error.message
            );

            questions = shuffleArray(fallbackQuestions).slice(0, 5);
        }

        return res.status(200).json({ questions });
    } catch (error) {
        console.error("Quiz generation failed:", error.message);

        return res.status(500).json({
            message: "Unable to load quiz questions. Please try again.",
        });
    }
};

const convertPoints = async (req, res) => {
    try {
        const userId = req.user.id;
        const { pointsToConvert } = req.body;

        if (
            !Number.isInteger(pointsToConvert) ||
            pointsToConvert <= 0
        ) {
            return res.status(400).json({
                message: "Invalid points value.",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
            });
        }

        user.points = (user.points || 0) + pointsToConvert;
        user.balance = (user.balance || 0) + pointsToConvert * 100;

        await user.save();

        return res.status(200).json({
            message: "Quiz points added successfully.",
            points: user.points,
            balance: user.balance,
        });
    } catch (error) {
        console.error("Error adding quiz points:", error);

        return res.status(500).json({
            message: "Failed to add quiz points.",
        });
    }
};

const getUserQuizInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.id, "points balance");

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
            });
        }

        return res.status(200).json({
            points: user.points || 0,
            balance: user.balance || 0,
        });
    } catch (error) {
        console.error("Error fetching quiz information:", error);

        return res.status(500).json({
            message: "Failed to fetch quiz information.",
        });
    }
};

module.exports = {
    generateQuizQuestions,
    convertPoints,
    getUserQuizInfo,
};
