import apiClient from "../services/apiClient";

const getErrorMessage = (error, fallback) => {
    if (error.response) {
        return (
            error.response.data?.message ||
            `Server error: HTTP ${error.response.status}`
        );
    }

    if (error.request) {
        return "Cannot reach the backend server. Check that your backend is running on port 8000.";
    }

    return error.message || fallback;
};

export const registerUser = async (userData) => {
    try {
        const response = await apiClient.post("/auth/register", userData);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error, "Registration failed."));
    }
};

export const loginUser = async (data) => {
    try {
        const response = await apiClient.post("/auth/login", data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error, "Login failed."));
    }
};

export const getProfile = async () => {
    try {
        const response = await apiClient.get("/auth/profile");
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error, "Profile retrieval failed."));
    }
};

export const updateProfile = async (userData) => {
    try {
        const response = await apiClient.put("/auth/profile", userData);

        if (!response.data?.user) {
            throw new Error("The server did not return the updated user.");
        }

        return response.data.user;
    } catch (error) {
        throw new Error(getErrorMessage(error, "Profile update failed."));
    }
};

export const deleteProfile = async () => {
    try {
        const response = await apiClient.delete("/auth/profile");
        return response.data.message;
    } catch (error) {
        throw new Error(getErrorMessage(error, "Profile deletion failed."));
    }
};

export const forgotPassword = async (data) => {
    try {
        const response = await apiClient.post("/auth/forgot-password", data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error, "Could not send reset OTP."));
    }
};

export const verifyResetOtp = async (data) => {
    try {
        const response = await apiClient.post("/auth/verify-reset-otp", data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error, "Could not verify the code."));
    }
};

export const resetPassword = async (data) => {
    try {
        const response = await apiClient.post("/auth/reset-password", data);
        return response.data;
    } catch (error) {
        throw new Error(getErrorMessage(error, "Password reset failed."));
    }
};