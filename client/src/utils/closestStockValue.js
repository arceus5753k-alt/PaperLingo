import apiClient from "../services/apiClient";

export const closestStockValue = async (symbol) => {
    try {
        const response = await apiClient.get(
            "/home/intraday",
            {
                params: {
                    symbol: symbol,
                },
            }
        );

        const data = response.data;

        console.log("STOCK DATA FROM BACKEND:", data);

        if (!data || !data["Time Series (Daily)"]) {
            return {
                message: "Stock market data is currently unavailable.",
            };
        }

        const timeSeries = data["Time Series (Daily)"];

        // Get the most recent trading day
        const latestDate = Object.keys(timeSeries)[0];

        const latestData = timeSeries[latestDate];

        return {
            timestamp: latestDate,

            data: {
                "1. open": latestData["1. open"],
                "2. high": latestData["2. high"],
                "3. low": latestData["3. low"],
                "4. close": latestData["4. close"],
            },

            dataR: data,
        };
    } catch (error) {
        console.error(
            "Error fetching stock data:",
            error
        );

        return {
            message: "Error fetching stock data.",
            error: error.message,
        };
    }
};