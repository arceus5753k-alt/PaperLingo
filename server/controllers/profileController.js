
const User = require("../models/user.js");

const getProfile = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;

        if (!userId) {
            return res.status(401).json({
                message: "User authentication required.",
            });
        }

        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
            });
        }

        return res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            age: user.age,
            avatar: user.avatar,
            balance: user.balance,
            points: user.points,
        });
    } catch (error) {
        console.error("Get profile error:", error.message);

        return res.status(500).json({
            message: "Failed to load profile.",
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;

        if (!userId) {
            return res.status(401).json({
                message: "User authentication required.",
            });
        }

        const { name, username, email, age, avatar } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
            });
        }

        if (name !== undefined) {
            if (typeof name !== "string" || !name.trim()) {
                return res.status(400).json({
                    message: "Name cannot be empty.",
                });
            }

            user.name = name.trim();
        }

        if (username !== undefined) {
            if (typeof username !== "string" || !username.trim()) {
                return res.status(400).json({
                    message: "Username cannot be empty.",
                });
            }

            const normalizedUsername = username.trim();

            const existingUsername = await User.findOne({
                username: normalizedUsername,
                _id: { $ne: user._id },
            });

            if (existingUsername) {
                return res.status(409).json({
                    message: "That username is already taken.",
                });
            }

            user.username = normalizedUsername;
        }

        if (email !== undefined) {
            if (
                typeof email !== "string" ||
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
            ) {
                return res.status(400).json({
                    message: "Please enter a valid email address.",
                });
            }

            const normalizedEmail = email.trim().toLowerCase();

            const existingEmail = await User.findOne({
                email: normalizedEmail,
                _id: { $ne: user._id },
            });

            if (existingEmail) {
                return res.status(409).json({
                    message: "That email is already registered.",
                });
            }

            user.email = normalizedEmail;
        }

        if (age !== undefined) {
            const parsedAge = Number(age);

            if (
                age === "" ||
                !Number.isInteger(parsedAge) ||
                parsedAge < 1 ||
                parsedAge > 120
            ) {
                return res.status(400).json({
                    message: "Age must be a whole number between 1 and 120.",
                });
            }

            user.age = parsedAge;
        }

        if (avatar !== undefined) {
            if (typeof avatar !== "string") {
                return res.status(400).json({
                    message: "Invalid profile image.",
                });
            }

            user.avatar = avatar;
        }

        await user.save();

        return res.status(200).json({
            message: "Profile updated successfully.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                age: user.age,
                avatar: user.avatar,
                balance: user.balance,
                points: user.points,
            },
        });
    } catch (error) {
        console.error("Update profile error:", error.message);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "That email or username is already in use.",
            });
        }

        if (error.status === 413) {
            return res.status(413).json({
                message: "Profile image is too large. Choose a smaller image.",
            });
        }

        return res.status(500).json({
            message: "Failed to update profile.",
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
};
