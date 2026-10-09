import apiClient from "../services/apiClient";

export const fetchQuizQuestions = async () => {
    try {
        const response = await apiClient.get("/quiz/questions");

        return response.data.questions;
    } catch (error) {
        console.error("Error fetching quiz questions:", error);

        throw new Error(
            error.response?.data?.message ||
            "Failed to fetch quiz questions"
        );
    }
};

export const convertPoints = async (points) => {
    const conversionData = {
        pointsToConvert: points,
    };

    try {
        const response = await apiClient.put(
            "/quiz/convert-points",
            conversionData
        );

        console.log("Conversion successful!");

        return response;
    } catch (error) {
        console.error("Error while converting points:", error);

        throw error;
    }
};

export const getUserDetails = async () => {
    try {
        const response = await apiClient.get("/quiz/get-points");

        return response;
    } catch (error) {
        console.error(
            "Error while retrieving user quiz info:",
            error
        );

        throw error;
    }
};