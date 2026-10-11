import React, { useMemo } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard";
import SignIn from "./pages/Authentication/SignIn";
import SignUp from "./pages/Authentication/SignUp";
import ForgotPassword from "./pages/Authentication/ForgotPassword";
import VerifyOTP from "./pages/Authentication/VerifyOTP";
import Home from "./pages/Home/Home";
import Portfolio from "./pages/Portfolio/Portfolio";
import TransactionHistory from "./pages/Transaction/Transaction";
import EarnPoints from "./pages/EarnPoints/EarnPoints";
import LandingPage from "./pages/LandingPage/LandingPage";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { themeSettings } from "./Theme";
import { useSelector } from "react-redux";
import BuySellNew from "./pages/Trade/BuySellNew";
import Profile from "./pages/Profile/Profile";
import ConfirmPassword from "./components/Authentication/ConfirmPassword";

function ProtectedRoute({ children }) {
    const token = localStorage.getItem("token");
    return token ? children : <Navigate to="/signin" replace />;
}

function App() {
    const mode = useSelector((state) => state.global.mode);
    const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

    return (
        <Router>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Routes>
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/verify-otp" element={<VerifyOTP />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/confirmpassword/:id/:token" element={<ConfirmPassword />} />

                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
                        <Route path="home" element={<Home />} />
                        <Route path="portfolio" element={<Portfolio />} />
                        <Route path="transaction-history" element={<TransactionHistory />} />
                        <Route path="earn-points" element={<EarnPoints />} />
                        <Route path="trade" element={<BuySellNew />} />
                    </Route>

                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                    <Route path="/" element={<LandingPage />} />
                </Routes>
            </ThemeProvider>
        </Router>
    );
}

export default App;