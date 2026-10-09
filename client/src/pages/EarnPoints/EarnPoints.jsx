
import React, { useCallback, useEffect, useState } from "react";
import {
    Button,
    Typography,
    Box,
    Container,
    Card,
    CardContent,
    Snackbar,
    Alert,
    CircularProgress,
    useTheme,
} from "@mui/material";
import QuizCard from "../../components/Quiz/QuizCard";
import QuizRules from "../../components/Quiz/QuizRules";
import {
    convertPoints,
    fetchQuizQuestions,
    getUserDetails,
} from "../../api/quizApi";
import { motion } from "framer-motion";
import UserInfo from "../../components/Quiz/UserInfo";

const EarnPoints = () => {
    const [score, setScore] = useState(0);
    const [showScore, setShowScore] = useState(false);
    const [quizStarted, setQuizStarted] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);

    const [points, setPoints] = useState(null);
    const [pointsLoading, setPointsLoading] = useState(true);
    const [balance, setBalance] = useState(0);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    const theme = useTheme();

    const showNotification = (message, severity = "success") => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const fetchUserDetails = useCallback(async () => {
        setPointsLoading(true);

        try {
            const response = await getUserDetails();
            const userData = response?.data ?? response;

            setPoints(userData?.points ?? 0);
            setBalance(Number(userData?.balance ?? 0).toFixed(2));
        } catch (error) {
            console.error("Error retrieving points:", error);
            showNotification(
                "Unable to load your points and balance. Please refresh the page.",
                "error"
            );
        } finally {
            setPointsLoading(false);
        }
    }, []);

    const startQuiz = async () => {
        if (loading) return;

        setLoading(true);
        setSnackbarOpen(false);

        try {
            const fetchedQuestions = await fetchQuizQuestions();

            if (
                !Array.isArray(fetchedQuestions) ||
                fetchedQuestions.length === 0
            ) {
                throw new Error("The server returned no quiz questions.");
            }

            const validQuestions = fetchedQuestions.every(
                (question) =>
                    question &&
                    typeof question.question === "string" &&
                    Array.isArray(question.options) &&
                    question.options.length === 4 &&
                    Number.isInteger(question.answer) &&
                    question.answer >= 0 &&
                    question.answer < 4
            );

            if (!validQuestions) {
                throw new Error("The quiz questions were in an invalid format.");
            }

            setQuestions(fetchedQuestions);
            setQuizStarted(true);
            setShowScore(false);
            setScore(0);
        } catch (error) {
            console.error("Failed to load quiz questions:", error);

            const message =
                error.response?.data?.message ||
                error.message ||
                "Could not load the quiz. Please try again.";

            showNotification(
                `${message} If this continues, please try again shortly.`,
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleQuizEnd = async (finalScore) => {
        setScore(finalScore);
        setShowScore(true);

        try {
            await convertPoints(finalScore);
            await fetchUserDetails();

            showNotification(
                "Points converted and added to your account successfully!",
                "success"
            );
        } catch (error) {
            console.error("Error converting points to balance:", error);

            showNotification(
                error.response?.data?.message ||
                    "Your quiz ended, but points could not be updated. Please refresh and check your balance.",
                "error"
            );
        }
    };

    useEffect(() => {
        fetchUserDetails();
    }, [fetchUserDetails]);

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
    };

    const handlePlayAgain = () => {
        setQuizStarted(false);
        setScore(0);
        setShowScore(false);
        setQuestions([]);
    };

    return (
        <motion.div
            style={{
                overflowX: "auto",
                maxWidth: "100%",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Container
                sx={{
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                {!quizStarted ? (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            gap: 3,
                            width: "100%",
                        }}
                    >
                        <Typography
                            variant="h3"
                            sx={{
                                marginBottom: 2,
                                textAlign: "center",
                            }}
                        >
                            Test Your Market Knowledge!
                        </Typography>

                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: {
                                    xs: "column",
                                    md: "row",
                                },
                                justifyContent: "space-around",
                                alignItems: "center",
                                gap: 3,
                            }}
                        >
                            <Box
                                sx={{
                                    width: {
                                        xs: "100%",
                                        md: 600,
                                    },
                                }}
                            >
                                <Card
                                    sx={{
                                        borderRadius: 4,
                                        padding: 2,
                                        border: `1px solid ${theme.palette.accent.main}`,
                                    }}
                                >
                                    <CardContent>
                                        <QuizRules />

                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "center",
                                                mt: 2,
                                            }}
                                        >
                                            <Button
                                                variant="contained"
                                                onClick={startQuiz}
                                                disabled={loading}
                                                startIcon={
                                                    loading ? (
                                                        <CircularProgress
                                                            size={18}
                                                            color="inherit"
                                                        />
                                                    ) : null
                                                }
                                                sx={{
                                                    backgroundColor:
                                                        theme.palette.accent.main,
                                                    color:
                                                        theme.palette.primary
                                                            .contrastText,
                                                    fontWeight: "bold",
                                                    paddingX: 3,
                                                    paddingY: 1.5,
                                                    borderRadius: 2,
                                                    transition:
                                                        "transform 0.5s ease",
                                                    boxShadow: `0px 4px 10px 2px ${theme.palette.accent.main}`,
                                                    "&:hover": {
                                                        transform:
                                                            "translateY(-5px)",
                                                        boxShadow: `0px 7px 12px 2px ${theme.palette.accent.main}`,
                                                    },
                                                }}
                                            >
                                                {loading
                                                    ? "Generating Questions..."
                                                    : "Start Quiz"}
                                            </Button>
                                        </Box>

                                        {loading && (
                                            <Typography
                                                variant="body2"
                                                role="status"
                                                sx={{
                                                    mt: 2,
                                                    textAlign: "center",
                                                    color: "text.secondary",
                                                }}
                                            >
                                                This can take a few seconds while
                                                the quiz is prepared. Please wait.
                                            </Typography>
                                        )}
                                    </CardContent>
                                </Card>
                            </Box>

                            <Box
                                sx={{
                                    width: {
                                        xs: "100%",
                                        md: 400,
                                    },
                                }}
                            >
                                <UserInfo
                                    points={points}
                                    balance={balance}
                                    pointsLoading={pointsLoading}
                                />
                            </Box>
                        </Box>
                    </Box>
                ) : (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                            mt: 13,
                            padding: {
                                xs: 2,
                                md: 0,
                            },
                        }}
                    >
                        {showScore ? (
                            <Card
                                sx={{
                                    padding: 4,
                                    textAlign: "center",
                                }}
                            >
                                <Typography variant="h4">
                                    You scored {score} out of {questions.length}
                                </Typography>

                                <Box sx={{ margin: 4 }}>
                                    <Button
                                        variant="contained"
                                        onClick={handlePlayAgain}
                                    >
                                        Play Again
                                    </Button>
                                </Box>
                            </Card>
                        ) : (
                            <QuizCard
                                questions={questions}
                                score={score}
                                setScore={setScore}
                                setShowScore={handleQuizEnd}
                            />
                        )}
                    </Box>
                )}
            </Container>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={snackbarSeverity === "error" ? 6000 : 3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarSeverity}
                    sx={{ width: "100%" }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </motion.div>
    );
};

export default EarnPoints;
