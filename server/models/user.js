const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        age: {
            type: Number,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            default: "",
        },
        balance: {
            type: Number,
            default: 10000,
            min: 0,
        },
        points: {
            type: Number,
            default: 0,
            min: 0,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        verificationOTP: {
            type: String,
            default: null,
        },
        verificationOTPExpires: {
            type: Date,
            default: null,
        },
        resetOTP: {
            type: String,
            default: null,
        },
        resetOTPExpires: {
            type: Date,
            default: null,
        },
        resetOTPAttempts: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

module.exports =
    mongoose.models.User ||
    mongoose.model("User", userSchema);