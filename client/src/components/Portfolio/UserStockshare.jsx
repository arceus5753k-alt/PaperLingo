import React, { useEffect, useState } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import LinearProgress, {
    linearProgressClasses,
} from "@mui/material/LinearProgress";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useTheme } from "@mui/material";

const colors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#FFCD56",
    "#4BC0A4",
    "#36A2FF",
    "#FF6482",
    "#9966A0",
    "#FF6E54",
    "#FF5E72",
    "#00A8C0",
    "#A3E4FF",
    "#FFCCBC",
    "#FFAB91",
];

export default function UserStockshare({ portfolioData }) {
    const [data, setData] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [totalValue, setTotalValue] = useState("0.00");

    const theme = useTheme();

    useEffect(() => {
        if (!portfolioData || portfolioData.length === 0) {
            setData([]);
            setStocks([]);
            setTotalValue("0.00");
            return;
        }

        let total = 0;

        const chartData = portfolioData
            .filter(
                (stock) =>
                    Number(stock.totalQuantity) > 0 &&
                    Number(stock.avgPurchasePrice) > 0
            )
            .map((stock) => {
                const value =
                    Number(stock.totalQuantity) *
                    Number(stock.avgPurchasePrice);

                total += value;

                return {
                    label: stock.stockName,
                    value: value,
                };
            });

        if (total === 0) {
            setData([]);
            setStocks([]);
            setTotalValue("0.00");
            return;
        }

        const stockDetails = portfolioData
            .filter(
                (stock) =>
                    Number(stock.totalQuantity) > 0 &&
                    Number(stock.avgPurchasePrice) > 0
            )
            .map((stock, index) => {
                const value =
                    Number(stock.totalQuantity) *
                    Number(stock.avgPurchasePrice);

                return {
                    name: stock.stockName,
                    percentage: (value / total) * 100,
                    color: colors[index % colors.length],
                };
            });

        setData(chartData);
        setStocks(stockDetails);
        setTotalValue(total.toFixed(2));
    }, [portfolioData]);

    return (
        <Card
            variant="outlined"
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                flexGrow: 1,
                maxHeight: {
                    lg: "445px",
                },
                overflowY: "auto",
                border: `1px solid ${theme.palette.accent.main}`,
            }}
        >
            <CardContent>
                <Typography variant="h4">
                    User Stock Share
                </Typography>

                {}
                {}
                {}

                {data.length === 0 ? (
                    <Box
                        sx={{
                            height: 330,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                color: "text.secondary",
                                mb: 1,
                            }}
                        >
                            No stocks to display
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{
                                color: "text.secondary",
                            }}
                        >
                            Your portfolio is currently empty.
                        </Typography>
                    </Box>
                ) : (
                    <>
                        {}
                        {}
                        {}

                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    position: "relative",
                                }}
                            >
                                <PieChart
                                    colors={colors}
                                    margin={{
                                        left: 100,
                                        right: 100,
                                        top: 100,
                                        bottom: 100,
                                    }}
                                    series={[
                                        {
                                            data: data,
                                            innerRadius: 75,
                                            outerRadius: 100,
                                            paddingAngle: 0,
                                            highlightScope: {
                                                faded: "global",
                                                highlighted: "item",
                                            },
                                        },
                                    ]}
                                    height={360}
                                    width={260}
                                    slotProps={{
                                        legend: {
                                            hidden: true,
                                        },
                                    }}
                                />

                                <Typography
                                    component="div"
                                    variant="h6"
                                    sx={{
                                        position: "absolute",
                                        top: "50%",
                                        left: "50%",
                                        transform:
                                            "translate(-50%, -50%)",
                                        fontSize: "24px",
                                        color: "text.primary",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    ${totalValue}
                                </Typography>
                            </Box>

                            <KeyboardArrowDownIcon
                                sx={{
                                    fontSize: 35,
                                    display: {
                                        xs: "none",
                                        lg: "block",
                                    },
                                    mb: 1,
                                }}
                            />
                        </Box>

                        {}
                        {}
                        {}

                        <Box>
                            {stocks.map((stock, index) => (
                                <Stack
                                    key={index}
                                    direction="row"
                                    sx={{
                                        alignItems: "center",
                                        gap: 2,
                                        pb: 2,
                                    }}
                                >
                                    <Stack
                                        sx={{
                                            gap: 1,
                                            flexGrow: 1,
                                        }}
                                    >
                                        <Stack
                                            direction="row"
                                            sx={{
                                                justifyContent:
                                                    "space-between",
                                                alignItems:
                                                    "center",
                                                gap: 2,
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight:
                                                        "500",
                                                }}
                                            >
                                                {stock.name}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: "text.secondary",
                                                }}
                                            >
                                                {stock.percentage.toFixed(
                                                    1
                                                )}
                                                %
                                            </Typography>
                                        </Stack>

                                        <LinearProgress
                                            variant="determinate"
                                            value={stock.percentage}
                                            sx={{
                                                [`& .${linearProgressClasses.bar}`]:
                                                    {
                                                        backgroundColor:
                                                            stock.color,
                                                    },
                                            }}
                                        />
                                    </Stack>
                                </Stack>
                            ))}
                        </Box>
                    </>
                )}
            </CardContent>
        </Card>
    );
}