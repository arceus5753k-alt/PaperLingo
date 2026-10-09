
const Transaction = require("../models/transaction");
const { fetchStockDaily } = require("../service/homeService");

const getPortfolioData = async (req, res) => {
    try {
        const userId = req.user._id;
        const transactions = await Transaction.find({ userId });

        const portfolio = {};

        // Calculate holdings using existing transaction records.
        for (const transaction of transactions) {
            const {
                stockName,
                quantity,
                pricePerShare,
                transactionType,
            } = transaction;

            if (!portfolio[stockName]) {
                portfolio[stockName] = {
                    stockName,
                    totalQuantity: 0,
                    totalInvested: 0,
                    avgPurchasePrice: 0,
                    gainLossPercentage: 0,
                    currentStockPrice: 0,
                    totalPortfolioValue: 0,
                };
            }

            const item = portfolio[stockName];

            if (transactionType === "Buy") {
                item.totalInvested += pricePerShare * quantity;
                item.totalQuantity += quantity;

                item.avgPurchasePrice =
                    item.totalQuantity > 0
                        ? Number(
                              (
                                  item.totalInvested /
                                  item.totalQuantity
                              ).toFixed(2)
                          )
                        : 0;
            } else if (transactionType === "Sell") {
                if (item.totalQuantity >= quantity) {
                    item.totalInvested -=
                        item.avgPurchasePrice * quantity;

                    item.totalQuantity -= quantity;

                    if (item.totalQuantity === 0) {
                        item.totalInvested = 0;
                        item.avgPurchasePrice = 0;
                    }
                }
            }
        }

        // Fetch the latest available daily close for each stock.
        for (const stockName of Object.keys(portfolio)) {
            const item = portfolio[stockName];

            if (item.totalQuantity <= 0) {
                continue;
            }

            try {
                if (typeof fetchStockDaily !== "function") {
                    throw new Error(
                        "fetchStockDaily export is missing from homeService.js"
                    );
                }

                const data = await fetchStockDaily(stockName);
                const timeSeries = data?.["Time Series (Daily)"];

                if (!timeSeries) {
                    throw new Error(
                        `No daily stock data available for ${stockName}`
                    );
                }

                const latestDate = Object.keys(timeSeries).sort().at(-1);
                const close = Number(
                    timeSeries[latestDate]?.["4. close"]
                );

                if (!Number.isFinite(close) || close <= 0) {
                    throw new Error(
                        `Invalid closing price for ${stockName}`
                    );
                }

                item.currentStockPrice = Number(close.toFixed(2));
                item.totalPortfolioValue = Number(
                    (item.totalQuantity * close).toFixed(2)
                );

                if (item.avgPurchasePrice > 0) {
                    item.gainLossPercentage = Number(
                        (
                            ((close - item.avgPurchasePrice) /
                                item.avgPurchasePrice) *
                            100
                        ).toFixed(2)
                    );
                }
            } catch (error) {
                console.error(
                    `Error fetching price for ${stockName}:`,
                    error.message
                );
            }
        }

        return res.status(200).json(Object.values(portfolio));
    } catch (error) {
        console.error(
            "Error fetching portfolio data:",
            error.message
        );

        return res.status(500).json({
            error: "Failed to fetch portfolio data",
        });
    }
};

module.exports = {
    getPortfolioData,
};
