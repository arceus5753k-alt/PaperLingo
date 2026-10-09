
import React, { useEffect, useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { getTransactions } from "../../api/transactionApi";

const Transaction = () => {
    const theme = useTheme();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getTransactions();
                const transactions = response?.transactions;

                setData(
                    Array.isArray(transactions)
                        ? transactions.map((transaction) => ({
                              ...transaction,
                              id: transaction._id,
                          }))
                        : []
                );
            } catch (err) {
                console.error("Error fetching transactions:", err);
                setError(
                    err.response?.data?.message ||
                    "Failed to load transaction history."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    const columns = [
        { field: "transactionId", headerName: "Transaction ID", flex: 1, minWidth: 150 },
        { field: "stockName", headerName: "Stock Name", flex: 1, minWidth: 120 },
        {
            field: "transactionType",
            headerName: "Transaction Type",
            flex: 1,
            minWidth: 140,
            renderCell: (params) => (
                <Box
                    sx={{
                        px: 2,
                        py: 0.5,
                        borderRadius: 5,
                        fontWeight: 600,
                        color: params.value === "Buy" ? "#4caf50" : "#f44336",
                        backgroundColor:
                            params.value === "Buy"
                                ? "rgba(76,175,80,0.12)"
                                : "rgba(244,67,54,0.12)",
                    }}
                >
                    {params.value}
                </Box>
            ),
        },
        { field: "quantity", headerName: "Quantity", flex: 0.7, minWidth: 90 },
        {
            field: "pricePerShare",
            headerName: "Price per Share",
            flex: 1,
            minWidth: 130,
        },
        {
            field: "totalTransactionValue",
            headerName: "Total Transaction Value",
            flex: 1,
            minWidth: 160,
        },
        {
            field: "dateTime",
            headerName: "Date and Time",
            flex: 1.2,
            minWidth: 180,
        },
    ];

    return (
        <Box
            sx={{
                width: "100%",
                p: 3,
                color: theme.palette.text.primary,
            }}
        >
            <Typography
                variant="h4"
                textAlign="center"
                gutterBottom
                sx={{ mb: 2 }}
            >
                Transaction History
            </Typography>

            {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                    {error}
                </Typography>
            )}

            <DataGrid
                rows={data}
                columns={columns}
                loading={loading}
                getRowId={(row) => row._id || row.id}
                hideFooter
                disableRowSelectionOnClick
                autoHeight
                sx={{
                    border: `1px solid ${theme.palette.accent?.main || theme.palette.primary.main}`,
                    color: theme.palette.text.primary,
                    "& .MuiDataGrid-columnHeaders": {
                        borderBottom: `1px solid ${theme.palette.divider}`,
                    },
                    "& .MuiDataGrid-cell": {
                        borderBottom: `1px solid ${theme.palette.divider}`,
                    },
                }}
            />
        </Box>
    );
};

export default Transaction;
