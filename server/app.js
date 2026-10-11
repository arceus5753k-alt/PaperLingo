require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const homeRoutes = require("./routes/homeRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const quizRoutes = require("./routes/quizRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

// CORS configuration
const allowedOrigins = [
    "http://localhost:5173",
    "https://paper-lingo-iota.vercel.app",
];

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests without an Origin header.
            if (!origin) {
                return callback(null, true);
            }

            // Allow the known production domain and matching Vercel previews.
            const isAllowed =
                allowedOrigins.includes(origin) ||
                /^https:\/\/paper-lingo-[a-z0-9-]+-arceus5753k-alts-projects\.vercel\.app$/.test(
                    origin
                );

            if (isAllowed) {
                return callback(null, true);
            }

            console.error("CORS blocked origin:", origin);

            return callback(new Error("Origin not allowed by CORS"));
        },
        credentials: true,
        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS",
        ],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
        ],
    })
);

// Request body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/chat", chatRoutes);

// Health check
app.get("/", (req, res) => {
    res.json({
        message: "PaperLingo server is running",
    });
});

// Error handling
app.use((err, req, res, next) => {
    if (err.type === "entity.too.large" || err.status === 413) {
        return res.status(413).json({
            message:
                "Profile-picture upload is too large. Please choose a smaller image.",
        });
    }

    console.error("Server error:", err);

    return res.status(err.status || 500).json({
        message: "An unexpected server error occurred.",
    });
});

// Start server after connecting to MongoDB
const PORT = process.env.PORT || 8000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("DB Connected");

        app.listen(PORT, () => {
            console.log(`Server started on port: ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });