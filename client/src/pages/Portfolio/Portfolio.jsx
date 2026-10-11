import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

import UserStockshare from "../../components/Portfolio/UserStockshare";
import PageViewsBarChart from "../../components/Portfolio/PageViewsBarChart";
import StatCard from "../../components/Portfolio/StatCard";
import PortfolioTable from "../../components/Portfolio/PortfolioTable";

import apiClient from "../../services/apiClient";
import { getUserDetails } from "../../api/quizApi";

const INITIAL_BALANCE = 10000;

const getValidNumber = (value) => {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    const number = Number(value);
    return Number.isFinite(number) ? number : null;
};

const Portfolio = () => {
    const [balance, setBalance] = useState(null);
    const [portfolioData, setPortfolioData] = useState([]);
    const [balanceLoaded, setBalanceLoaded] = useState(false);
    const [portfolioLoaded, setPortfolioLoaded] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function fetchUserData() {
            try {
                const response = await getUserDetails();
                const data = response?.data;

                const possibleBalances = [
                    data?.balance,
                    data?.user?.balance,
                    data?.userData?.balance,
                    data?.data?.balance,
                    response?.balance,
                ];

                const rawBalance = possibleBalances.find(
                    (value) =>
                        value !== undefined &&
                        value !== null &&
                        value !== ""
                );

                const parsedBalance = getValidNumber(rawBalance);

                if (!cancelled) {
                    setBalance(parsedBalance);
                    setBalanceLoaded(true);
                }
            } catch (error) {
                console.error("Error fetching user details:", error);

                if (!cancelled) {
                    setBalance(null);
                    setBalanceLoaded(true);
                }
            }
        }

        async function fetchPortfolioData() {
            try {
                const response = await apiClient.get("/portfolio/portfolio");

                const items = Array.isArray(response.data)
                    ? response.data
                    : response.data?.portfolio;

                if (!Array.isArray(items)) {
                    throw new Error(
                        "Portfolio API did not return an array."
                    );
                }

                const normalizedData = items.map((item, index) => ({
                    id: item._id || item.id || index + 1,
                    stockName:
                        item.stockName ||
                        item.symbol ||
                        item.ticker ||
                        "Unknown stock",
                    totalQuantity:
                        getValidNumber(item.totalQuantity) ?? 0,
                    avgPurchasePrice:
                        getValidNumber(item.avgPurchasePrice) ?? 0,
                    currentStockPrice:
                        getValidNumber(item.currentStockPrice) ?? 0,
                    gainLossPercentage:
                        getValidNumber(item.gainLossPercentage) ?? 0,
                    totalPortfolioValue:
                        getValidNumber(item.totalPortfolioValue) ?? 0,
                }));

                if (!cancelled) {
                    setPortfolioData(normalizedData);
                }
            } catch (error) {
                console.error(
                    "Error fetching portfolio data:",
                    error.response?.data || error.message
                );

                if (!cancelled) {
                    setPortfolioData([]);
                }
            } finally {
                if (!cancelled) {
                    setPortfolioLoaded(true);
                }
            }
        }

        fetchUserData();
        fetchPortfolioData();

        return () => {
            cancelled = true;
        };
    }, []);

    const overallPortfolioValue = portfolioData.reduce(
        (total, item) => total + item.totalPortfolioValue,
        0
    );

    const dataLoaded = balanceLoaded && portfolioLoaded;

    const gainLoss =
        dataLoaded && balance !== null
            ? balance + overallPortfolioValue - INITIAL_BALANCE
            : 0;

    const formatMoney = (value) =>
        value !== null && Number.isFinite(value)
            ? `$${value.toFixed(2)}`
            : "$0.00";

    return (
        <Box
            sx={{
                width: "100%",
                maxWidth: "100%",
                minWidth: 0,
                p: 2,
                boxSizing: "border-box",
                bgcolor: "background.default",
                color: "text.primary",
            }}
        >
            <Typography variant="h3" sx={{ mb: 2 }}>
                Overview
            </Typography>

            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", lg: "row" },
                    gap: 2,
                    minWidth: 0,
                }}
            >
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12} sm={6} md={4}>
                            <StatCard
                                title="Overall Portfolio Value"
                                value={
                                    portfolioLoaded
                                        ? formatMoney(overallPortfolioValue)
                                        : "$0.00"
                                }
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <StatCard
                                title="User Gain/Loss"
                                value={formatMoney(gainLoss)}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <StatCard
                                title="User Balance"
                                value={
                                    balanceLoaded
                                        ? formatMoney(balance)
                                        : "$0.00"
                                }
                            />
                        </Grid>
                    </Grid>

                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", lg: "row" },
                            gap: 2,
                            minWidth: 0,
                        }}
                    >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <PageViewsBarChart rows={portfolioData} />
                        </Box>
                    </Box>
                </Box>

                <Box
                    sx={{
                        width: { xs: "100%", lg: 205 },
                        flexShrink: 0,
                        minWidth: 0,
                    }}
                >
                    <Stack direction="column" spacing={2}>
                        <UserStockshare portfolioData={portfolioData} />
                    </Stack>
                </Box>
            </Box>

            <Box sx={{ mt: 2, minWidth: 0, width: "100%" }}>
                <PortfolioTable rows={portfolioData} />
            </Box>
        </Box>
    );
};

export default Portfolio;