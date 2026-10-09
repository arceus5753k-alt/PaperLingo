
const {
    fetchNews,
    fetchGainersAndLosers,
    searchTickers,
    fetchStockIntraday,
} = require("../service/homeService");

const CACHE_EXPIRY_ONE_HOUR = 60 * 60 * 1000;
const CACHE_EXPIRY_ONE_DAY = 24 * 60 * 60 * 1000;

let newsCache = {
    lastFetchTime: null,
    articles: [],
};

let marketCache = {
    lastFetchTime: null,
    data: null,
};

const isCacheExpired = (lastFetchTime, expiryTime) => {
    if (!lastFetchTime) {
        return true;
    }

    return Date.now() - lastFetchTime > expiryTime;
};

// ======================================================
// NEWS
// ======================================================

const getNews = async (req, res) => {
    if (
        !newsCache.articles.length ||
        isCacheExpired(newsCache.lastFetchTime, CACHE_EXPIRY_ONE_HOUR)
    ) {
        try {
            const articles = await fetchNews();

            newsCache = {
                lastFetchTime: Date.now(),
                articles: articles.slice(0, 6),
            };
        } catch (error) {
            console.error("Error fetching news:", error.message);

            if (newsCache.articles.length) {
                return res.json(newsCache.articles);
            }

            return res.status(500).json({
                error: "Failed to fetch news articles.",
            });
        }
    }

    return res.json(newsCache.articles);
};

// ======================================================
// TOP GAINERS / LOSERS
// ======================================================

const getTopGainersLosers = async (req, res) => {
    if (
        !marketCache.data ||
        isCacheExpired(marketCache.lastFetchTime, CACHE_EXPIRY_ONE_DAY)
    ) {
        try {
            const data = await fetchGainersAndLosers();

            if (
                !data ||
                !Array.isArray(data.top_gainers) ||
                !Array.isArray(data.top_losers) ||
                !Array.isArray(data.most_actively_traded)
            ) {
                throw new Error("Incomplete market data from provider");
            }

            marketCache = {
                lastFetchTime: Date.now(),
                data,
            };
        } catch (error) {
            console.error(
                "Error fetching gainers and losers data:",
                error.message
            );

            if (!marketCache.data) {
                return res.status(500).json({
                    error: "Failed to fetch market data.",
                });
            }
        }
    }

    return res.json({
        top_gainers: marketCache.data.top_gainers.slice(0, 5),
        top_losers: marketCache.data.top_losers.slice(0, 5),
        most_actively_traded:
            marketCache.data.most_actively_traded.slice(0, 5),
    });
};

// ======================================================
// STOCK SEARCH
// ======================================================

const searchStocks = async (req, res) => {
    try {
        const keyword =
            typeof req.query.keyword === "string"
                ? req.query.keyword.trim()
                : "";

        if (!keyword) {
            return res.status(400).json({
                error: "Search keyword is required",
            });
        }

        const results = await searchTickers(keyword);

        const tickers = results
            .filter((item) => item["1. symbol"])
            .map((item) => ({
                symbol: item["1. symbol"],
                name: item["2. name"] || item["1. symbol"],
            }));

        return res.json(tickers);
    } catch (error) {
        console.error("Error searching stocks:", error.message);

        return res.status(503).json({
            error:
                "Stock search is temporarily unavailable. Please try again later.",
        });
    }
};

// ======================================================
// STOCK DATA
// ======================================================

const getStockIntraday = async (req, res) => {
    try {
        const symbol =
            typeof req.query.symbol === "string"
                ? req.query.symbol.trim()
                : "";

        if (!symbol) {
            return res.status(400).json({
                error: "Stock symbol is required",
            });
        }

        const data = await fetchStockIntraday(symbol);

        return res.status(200).json(data);
    } catch (error) {
        console.error(
            "Error fetching stock data:",
            error.message
        );

        return res.status(503).json({
            error:
                "Stock data is temporarily unavailable. Please try again later.",
        });
    }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
    getNews,
    getTopGainersLosers,
    searchStocks,
    getStockIntraday,
};
