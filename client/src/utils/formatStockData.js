
export const formatStockData = (stockData) => {
    if (!stockData || typeof stockData !== "object") {
        console.warn("Candlestick: stockData is missing or invalid.");
        return [];
    }

    const timeSeries = stockData["Time Series (Daily)"];

    if (!timeSeries || typeof timeSeries !== "object") {
        console.warn(
            "Candlestick: Daily time series not found.",
            stockData
        );
        return [];
    }

    const formattedData = Object.entries(timeSeries)
        .map(([date, values]) => {
            const open = Number(values["1. open"]);
            const high = Number(values["2. high"]);
            const low = Number(values["3. low"]);
            const close = Number(values["4. close"]);

            if (
                !Number.isFinite(open) ||
                !Number.isFinite(high) ||
                !Number.isFinite(low) ||
                !Number.isFinite(close)
            ) {
                return null;
            }

            return {
                x: new Date(`${date}T00:00:00`).getTime(),
                y: [open, high, low, close],
            };
        })
        .filter(
            (item) =>
                item !== null &&
                Number.isFinite(item.x) &&
                item.y.every(Number.isFinite)
        )
        .sort((a, b) => a.x - b.x);

    console.log(
        `Candlestick: formatted ${formattedData.length} data points.`
    );

    return formattedData;
};
