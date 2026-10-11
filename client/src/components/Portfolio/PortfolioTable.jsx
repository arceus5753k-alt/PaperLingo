import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography, useTheme } from "@mui/material";

const columns = [
    {
        field: "stockName",
        headerName: "Stock Name",
        flex: 1.5,
        minWidth: 170,
    },
    {
        field: "totalQuantity",
        headerName: "Quantity",
        flex: 1,
        minWidth: 75,
    },
    {
        field: "avgPurchasePrice",
        headerName: "Avg Purchase Price",
        flex: 1,
        minWidth: 120,
    },
    {
        field: "currentStockPrice",
        headerName: "Current Stock Price",
        flex: 1,
        minWidth: 130,
    },
    {
        field: "gainLossPercentage",
        headerName: "Gain/Loss Percentage",
        flex: 1,
        minWidth: 170,
    },
    {
        field: "totalPortfolioValue",
        headerName: "Total Portfolio Value",
        flex: 1,
        minWidth: 140,
    },
];

export default function PortfolioTable({ rows = [] }) {
    const theme = useTheme();

    const tableRows = rows.map((row, index) => ({
        ...row,
        id: row.id ?? row._id ?? `${row.stockName}-${index}`,
    }));

    return (
        <Box sx={{ overflowX: "auto", maxWidth: "100%" }}>
            <Typography
                variant="h4"
                fontWeight="bold"
                gutterBottom
                sx={{
                    mb: 2,
                    textAlign: "left",
                    color: theme.palette.text.primary,
                }}
            >
                Portfolio Table
            </Typography>

            <Box sx={{ width: "100%", minWidth: 600 }}>
                <DataGrid
                    autoHeight
                    rows={tableRows}
                    columns={columns}
                    hideFooter
                    disableRowSelectionOnClick
                    disableColumnFilter
                    disableColumnSelector
                    disableColumnMenu
                    disableColumnResize
                    density="compact"
                    getRowClassName={(params) =>
                        params.indexRelativeToCurrentPage % 2 === 0
                            ? "even"
                            : "odd"
                    }
                    sx={{
                        border: `1px solid ${theme.palette.accent.main}`,
                        borderRadius: "8px",
                        backgroundColor: theme.palette.background.paper,

                        "& .MuiDataGrid-cell": {
                            color: theme.palette.text.secondary,
                            fontSize: theme.typography.body2.fontSize,
                        },

                        "& .MuiDataGrid-columnHeaders": {
                            backgroundColor: theme.palette.background.default,
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            fontWeight: theme.typography.fontWeightBold,
                            color: theme.palette.text.primary,
                        },

                        "& .MuiDataGrid-row:hover": {
                            backgroundColor: theme.palette.action.hover,
                            cursor: "pointer",
                        },

                        "& .MuiDataGrid-row.even": {
                            backgroundColor: theme.palette.background.default,
                        },

                        "& .MuiDataGrid-row.odd": {
                            backgroundColor: theme.palette.background.paper,
                        },
                    }}
                />
            </Box>
        </Box>
    );
}