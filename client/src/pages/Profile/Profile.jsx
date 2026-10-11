import React, { useEffect, useState } from "react";

import {

    Alert,

    Box,

    Button,

    CssBaseline,

    Modal,

    Snackbar,

    TextField,

    Typography,

} from "@mui/material";

import SideMenu from "../../components/Dashboard/SideMenu.jsx";

import SideMenuMobile from "../../components/Dashboard/SideMenuMobile.jsx";

import Header from "../../components/Dashboard/Header.jsx";

import ProfileButton from "../../components/Profile/ProfileButton.jsx";

import { useSelector, useDispatch } from "react-redux";

import { setUser, selectUserInfo } from "../../redux/UserSlice.js";

import { getProfile, loginUser, updateProfile } from "../../api/auth.js";

import "./profile.scss";

const Profile = () => {

    const dispatch = useDispatch();

    const userInfo = useSelector(selectUserInfo) || {};

    const [isEditable, setIsEditable] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [password, setPassword] = useState("");

    const [name, setName] = useState("");

    const [email, setEmail] = useState("");

    const [username, setUsername] = useState("");

    const [age, setAge] = useState("");

    const [avatar, setAvatar] = useState("");

    const [saving, setSaving] = useState(false);

    const [verifying, setVerifying] = useState(false);

    const [notice, setNotice] = useState({

        open: false,

        message: "",

        severity: "success",

    });

    const showNotice = (message, severity = "success") => {

        setNotice({ open: true, message, severity });

    };

    const applyProfile = (profile) => {

        setName(profile.name || "");

        setEmail(profile.email || "");

        setUsername(profile.username || "");

        setAge(profile.age ?? "");

        setAvatar(profile.avatar || "");

    };

    useEffect(() => {

        let active = true;

        const loadProfile = async () => {

            try {

                const profile = await getProfile();

                if (!active) return;

                dispatch(setUser(profile));

                applyProfile(profile);

            } catch (error) {

                if (active) {

                    showNotice(

                        error.message || "Could not load profile.",

                        "error"

                    );

                }

            }

        };

        loadProfile();

        return () => {

            active = false;

        };

    }, [dispatch]);

    const handleVerify = async () => {

        if (!password) {

            showNotice("Enter your password first.", "error");

            return;

        }

        setVerifying(true);

        try {

            const result = await loginUser({

                email: userInfo.email || email,

                password,

            });

            if (!result.token) {

                throw new Error("Password verification failed.");

            }

            setIsEditable(true);

            setIsModalOpen(false);

            setPassword("");

            showNotice("Verification successful. Edit your profile.");

        } catch (error) {

            showNotice(

                error.message || "Password verification failed.",

                "error"

            );

        } finally {

            setVerifying(false);

        }

    };

    const handleSave = async (event) => {

        event?.preventDefault?.();

        if (saving) return;

        const parsedAge = Number(age);

        if (

            age === "" ||

            !Number.isInteger(parsedAge) ||

            parsedAge < 1 ||

            parsedAge > 120

        ) {

            showNotice("Age must be between 1 and 120.", "error");

            return;

        }

        if (!name.trim() || !username.trim()) {

            showNotice(

                "Name and username cannot be empty.",

                "error"

            );

            return;

        }

        // Email is deliberately excluded from the update request.

        const updatedFields = {

            name: name.trim(),

            username: username.trim(),

            age: parsedAge,

            avatar,

        };

        setSaving(true);

        try {

            const updatedUser = await updateProfile(updatedFields);

            if (!updatedUser || !updatedUser.id) {

                throw new Error(

                    "The server did not return the saved profile."

                );

            }

            dispatch(setUser(updatedUser));

            applyProfile(updatedUser);

            setIsEditable(false);

            showNotice("Profile saved successfully.", "success");

        } catch (error) {

            console.error("Profile save failed:", error);

            showNotice(

                error.message || "Profile could not be saved.",

                "error"

            );

        } finally {

            setSaving(false);

        }

    };

    const handleFileChange = async (event) => {

        const file = event.target.files?.[0];

        if (!file) return;

        if (!["image/jpeg", "image/png"].includes(file.type)) {

            showNotice("Choose a JPG or PNG image.", "error");

            event.target.value = "";

            return;

        }

        if (file.size > 2 * 1024 * 1024) {

            showNotice("Choose an image smaller than 2 MB.", "error");

            event.target.value = "";

            return;

        }

        try {

            const base64 = await convertToBase64(file);

            setAvatar(base64);

        } catch {

            showNotice("Could not read the selected image.", "error");

        }

    };

    const fieldProps = {

        fullWidth: true,

        disabled: !isEditable || saving,

        size: "small",

        sx: {

            "& .MuiInputBase-input.Mui-disabled": {

                WebkitTextFillColor: "#ffffff",

                opacity: 0.85,

            },

        },

    };

    return (

        <>

            <CssBaseline enableColorScheme />

            <Box sx={{ display: "flex" }}>

                <Box sx={{ display: { xs: "none", md: "block" } }}>

                    <SideMenu />

                </Box>

                <Box sx={{ display: { xs: "block", md: "none" } }}>

                    <SideMenuMobile />

                </Box>

                <Box

                    component="main"

                    sx={(theme) => ({

                        flexGrow: 1,

                        mt: { md: 9 },

                        marginInline: "auto",

                        minWidth: 0,

                        backgroundColor: theme.vars

                            ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`

                            : theme.palette.background.default,

                        overflow: "auto",

                    })}

                >

                    <div className="profile-container">

                        <div className="top-container">

                            <div className="top-bottom">

                                <h1>Hello {name || "User"}!</h1>

                                <p>

                                    This is your profile page. You can manage

                                    your profile details here.

                                </p>

                                <div className="buttons">

                                    <ProfileButton

                                        disabled={isEditable || saving}

                                        onClick={() => {

                                            setPassword("");

                                            setIsModalOpen(true);

                                        }}

                                        label="Edit"

                                        svgPath="M19.045 7.401c.378-.378.586-.88.586-1.414s-.208-1.036-.586-1.414l-1.586-1.586c-.378-.378-.88-.586-1.414-.586s-1.036.208-1.413.585L4 13.585V18h4.413L19.045 7.401z"

                                    />

                                    {isEditable && (

                                        <Button

                                            variant="contained"

                                            disabled={saving}

                                            onClick={handleSave}

                                            startIcon={null}

                                            sx={{

                                                minWidth: 112,

                                                minHeight: 44,

                                                backgroundColor: "#fff",

                                                color: "#673ab7",

                                                "&:hover": {

                                                    backgroundColor: "#eee",

                                                },

                                            }}

                                        >

                                            {saving ? "Saving..." : "Save"}

                                        </Button>

                                    )}

                                </div>

                            </div>

                        </div>

                        <div className="bottom-container">

                            <div className="profile-left">

                                <div className="profile-field">

                                    <label>Name</label>

                                    <TextField

                                        {...fieldProps}

                                        value={name}

                                        onChange={(e) =>

                                            setName(e.target.value)

                                        }

                                    />

                                </div>

                                <div className="profile-field">

                                    <label>Username</label>

                                    <TextField

                                        {...fieldProps}

                                        value={username}

                                        onChange={(e) =>

                                            setUsername(e.target.value)

                                        }

                                    />

                                </div>

                                <div className="profile-field">

                                    <label>Age</label>

                                    <TextField

                                        {...fieldProps}

                                        type="number"

                                        value={age}

                                        inputProps={{ min: 1, max: 120 }}

                                        onChange={(e) =>

                                            setAge(e.target.value)

                                        }

                                    />

                                </div>

                            </div>

                            <div className="profile-right">

                                <div className="avatar-container">

                                    <img

                                        src={

                                            avatar ||

                                            "/defaultProfile2.jpg"

                                        }

                                        alt="Profile"

                                    />

                                    {isEditable && (

                                        <label htmlFor="file-upload">

                                            <img

                                                src="/editProfile.png"

                                                className="editProfile"

                                                alt="Choose profile image"

                                            />

                                        </label>

                                    )}

                                    <input

                                        type="file"

                                        id="file-upload"

                                        accept="image/jpeg,image/png"

                                        hidden

                                        disabled={!isEditable || saving}

                                        onChange={handleFileChange}

                                    />

                                </div>

                            </div>

                        </div>

                    </div>

                    <Header />

                </Box>

            </Box>

            <Modal

                open={isModalOpen}

                onClose={() => {

                    if (!verifying) {

                        setIsModalOpen(false);

                    }

                }}

            >

                <Box

                    sx={{

                        position: "absolute",

                        top: "50%",

                        left: "50%",

                        transform: "translate(-50%, -50%)",

                        width: 320,

                        maxWidth: "90vw",

                        bgcolor: "background.paper",

                        color: "text.primary",

                        boxShadow: 24,

                        borderRadius: 2,

                        p: 4,

                        display: "flex",

                        flexDirection: "column",

                        gap: 2,

                    }}

                >

                    <Typography variant="h6">

                        Verify Password

                    </Typography>

                    <TextField

                        label="Current password"

                        type="password"

                        value={password}

                        fullWidth

                        onChange={(e) => setPassword(e.target.value)}

                        onKeyDown={(e) => {

                            if (e.key === "Enter") handleVerify();

                        }}

                    />

                    <Button

                        variant="contained"

                        onClick={handleVerify}

                        disabled={verifying}

                    >

                        {verifying ? "Verifying..." : "Confirm"}

                    </Button>

                </Box>

            </Modal>

            <Snackbar

                open={notice.open}

                autoHideDuration={5000}

                onClose={() =>

                    setNotice((previous) => ({

                        ...previous,

                        open: false,

                    }))

                }

                anchorOrigin={{

                    vertical: "bottom",

                    horizontal: "center",

                }}

            >

                <Alert

                    severity={notice.severity}

                    variant="filled"

                    onClose={() =>

                        setNotice((previous) => ({

                            ...previous,

                            open: false,

                        }))

                    }

                >

                    {notice.message}

                </Alert>

            </Snackbar>

        </>

    );

};

export default Profile;

function convertToBase64(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onload = () => resolve(reader.result);

        reader.onerror = () => reject(reader.error);

    });

}