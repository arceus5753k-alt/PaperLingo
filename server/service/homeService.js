
const Parser = require("rss-parser");
const axios = require("axios");
require("dotenv").config();

const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

// ======================================================
// CACHE SETTINGS
// ======================================================

const STOCK_CACHE_EXPIRY = 60 * 60 * 1000;
const dailyStockCache = new Map();

// ======================================================
// ALPHA VANTAGE REQUEST CONTROL
// ======================================================

let lastAlphaVantageRequestTime = 0;

const waitForApiLimit = async () => {
    const elapsed = Date.now() - lastAlphaVantageRequestTime;
    const minimumDelay = 1200;

    if (elapsed < minimumDelay) {
        await new Promise((resolve) =>
            setTimeout(resolve, minimumDelay - elapsed)
        );
    }

    lastAlphaVantageRequestTime = Date.now();
};

// ======================================================
// GENERIC ALPHA VANTAGE REQUEST
// ======================================================

const alphaVantageRequest = async (params) => {
    if (!apiKey) {
        throw new Error("ALPHA_VANTAGE_API_KEY is not configured");
    }

    await waitForApiLimit();

    const response = await axios.get(
        "https://www.alphavantage.co/query",
        {
            params: {
                ...params,
                apikey: apiKey,
            },
            timeout: 15000,
        }
    );

    return response.data;
};

// ======================================================
// NEWS — GOOGLE NEWS RSS
// ======================================================

const newsParser = new Parser({
    timeout: 15000,
    headers: {
        "User-Agent": "PaperLingo/1.0",
    },
});

const fetchNews = async () => {
    const feedUrl =
        "https://news.google.com/rss/search?q=stock+market+finance&hl=en-US&gl=US&ceid=US:en";

    try {
        const feed = await newsParser.parseURL(feedUrl);

        const articles = (feed.items || []).slice(0, 8).map((item) => ({
            title: item.title || "Untitled financial news",
            url: item.link || "",
            time_published: item.isoDate
                ? item.isoDate.replace(/[-:TZ.]/g, "").slice(0, 15)
                : "",
            summary: item.contentSnippet || item.content || "",
            source: item.creator || item.source || "Google News",
            banner_image: "",
            overall_sentiment_label: "Neutral",
            topics: [],
        }));

        console.log(`Google News returned ${articles.length} articles`);

        return articles;
    } catch (error) {
        console.error("Error fetching RSS news:", error.message);
        throw new Error("Failed to fetch financial news.");
    }
};

// ======================================================
// YAHOO FINANCE HELPERS
// ======================================================

const yahooRequest = async (url, params = {}) => {
    const response = await axios.get(url, {
        params,
        headers: {
            "User-Agent": "Mozilla/5.0 PaperLingo/1.0",
            Accept: "application/json",
        },
        timeout: 15000,
    });

    return response.data;
};

const getYahooDailyData = async (symbol, range = "3mo") => {
    const encodedSymbol = encodeURIComponent(symbol);

    const data = await yahooRequest(
        `https://query1.finance.yahoo.com/v8/finance/chart/${encodedSymbol}`,
        {
            range,
            interval: "1d",
        }
    );

    const result = data?.chart?.result?.[0];

    if (!result || !result.timestamp || !result.indicators?.quote?.[0]) {
        throw new Error(`No Yahoo Finance data available for ${symbol}`);
    }

    const quote = result.indicators.quote[0];
    const timeSeries = {};

    result.timestamp.forEach((timestamp, index) => {
        const open = quote.open?.[index];
        const high = quote.high?.[index];
        const low = quote.low?.[index];
        const close = quote.close?.[index];
        const date = new Date(timestamp * 1000).toISOString().slice(0, 10);

        if (
            Number.isFinite(open) &&
            Number.isFinite(high) &&
            Number.isFinite(low) &&
            Number.isFinite(close)
        ) {
            timeSeries[date] = {
                "1. open": String(open),
                "2. high": String(high),
                "3. low": String(low),
                "4. close": String(close),
                "5. volume": String(quote.volume?.[index] ?? 0),
            };
        }
    });

    if (Object.keys(timeSeries).length === 0) {
        throw new Error(`No valid daily prices returned for ${symbol}`);
    }

    return {
        "Meta Data": {
            "2. Symbol": symbol,
            "3. Last Refreshed": Object.keys(timeSeries).at(-1),
            "4. Data Source": "Yahoo Finance",
        },
        "Time Series (Daily)": timeSeries,
    };
};

// ======================================================
// TOP GAINERS / LOSERS / MOST ACTIVE
// ======================================================

const fetchGainersAndLosers = async () => {
    try {
        const data = await alphaVantageRequest({
            function: "TOP_GAINERS_LOSERS",
        });

        if (
            !data.Information &&
            !data.Note &&
            !data["Error Message"] &&
            Array.isArray(data.top_gainers) &&
            Array.isArray(data.top_losers) &&
            Array.isArray(data.most_actively_traded)
        ) {
            return {
                top_gainers: data.top_gainers,
                top_losers: data.top_losers,
                most_actively_traded: data.most_actively_traded,
            };
        }

        console.warn(
            "Alpha Vantage market data unavailable; trying Yahoo Finance."
        );
    } catch (error) {
        console.warn("Alpha Vantage market request failed:", error.message);
    }

    const symbols = [
        "NVDA", "AAPL", "MSFT", "AMZN", "GOOGL",
        "META", "TSLA", "AMD", "NFLX", "INTC",
        "JPM", "BAC", "WMT", "ORCL", "COIN",
    ];

    const responses = await Promise.all(
        symbols.map(async (symbol) => {
            try {
                const data = await yahooRequest(
                    `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
                    {
                        range: "5d",
                        interval: "1d",
                    }
                );

                const result = data?.chart?.result?.[0];
                const quote = result?.indicators?.quote?.[0];
                const closes = (quote?.close || []).filter(
                    (value) => Number.isFinite(value)
                );

                if (closes.length < 2) {
                    return null;
                }

                const current = closes[closes.length - 1];
                const previous = closes[closes.length - 2];
                const change = current - previous;
                const changePercent =
                    previous !== 0 ? (change / previous) * 100 : 0;

                const volumes = (quote.volume || []).filter(
                    (value) => Number.isFinite(value)
                );

                return {
                    ticker: symbol,
                    price: current.toFixed(4),
                    change_amount: change.toFixed(4),
                    change_percentage: `${changePercent.toFixed(2)}%`,
                    volume: String(volumes.at(-1) || 0),
                };
            } catch (error) {
                console.warn(`Yahoo Finance failed for ${symbol}:`, error.message);
                return null;
            }
        })
    );

    const stocks = responses.filter(Boolean);

    if (!stocks.length) {
        throw new Error("Both market data providers failed");
    }

    return {
        top_gainers: [...stocks]
            .sort(
                (a, b) =>
                    parseFloat(b.change_percentage) -
                    parseFloat(a.change_percentage)
            )
            .slice(0, 5),

        top_losers: [...stocks]
            .sort(
                (a, b) =>
                    parseFloat(a.change_percentage) -
                    parseFloat(b.change_percentage)
            )
            .slice(0, 5),

        most_actively_traded: [...stocks]
            .sort((a, b) => Number(b.volume) - Number(a.volume))
            .slice(0, 5),
    };
};

// ======================================================
// STOCK SEARCH — ALPHA VANTAGE + YAHOO FALLBACK
// ======================================================

const searchYahooFinance = async (keyword) => {
    const data = await yahooRequest(
        "https://query1.finance.yahoo.com/v1/finance/search",
        {
            q: keyword,
            quotesCount: 10,
            newsCount: 0,
            enableFuzzyQuery: true,
        }
    );

    return (data?.quotes || [])
        .filter(
            (item) =>
                item.symbol &&
                ["EQUITY", "ETF", "MUTUALFUND", "INDEX"].includes(
                    item.quoteType
                )
        )
        .map((item) => ({
            "1. symbol": item.symbol,
            "2. name": item.longname || item.shortname || item.symbol,
            "3. type": item.quoteType || "",
            "4. region": item.exchDisp || item.exchange || "",
            "5. marketOpen": "",
            "6. marketClose": "",
            "7. timezone": "",
            "8. currency": item.currency || "",
            "9. matchScore": "",
        }));
};

const searchTickers = async (keyword) => {
    const cleanKeyword =
        typeof keyword === "string" ? keyword.trim() : "";

    if (!cleanKeyword) {
        return [];
    }

    try {
        const data = await alphaVantageRequest({
            function: "SYMBOL_SEARCH",
            keywords: cleanKeyword,
        });

        if (
            !data.Information &&
            !data.Note &&
            !data["Error Message"] &&
            Array.isArray(data.bestMatches) &&
            data.bestMatches.length
        ) {
            return data.bestMatches;
        }

        console.warn("Alpha Vantage search unavailable; trying Yahoo Finance.");
    } catch (error) {
        console.warn("Alpha Vantage search failed:", error.message);
    }

    try {
        const results = await searchYahooFinance(cleanKeyword);
        console.log(
            `Yahoo Finance search returned ${results.length} results for "${cleanKeyword}"`
        );
        return results;
    } catch (error) {
        console.error("Yahoo Finance search failed:", error.message);
        throw new Error("Stock search providers are currently unavailable.");
    }
};

// ======================================================
// DAILY STOCK DATA WITH CACHE AND FALLBACK
// ======================================================

const fetchStockDaily = async (symbol) => {
    const normalizedSymbol =
        typeof symbol === "string" ? symbol.trim().toUpperCase() : "";

    if (!normalizedSymbol) {
        throw new Error("Stock symbol is required");
    }

    const cachedStock = dailyStockCache.get(normalizedSymbol);

    if (
        cachedStock &&
        Date.now() - cachedStock.timestamp < STOCK_CACHE_EXPIRY
    ) {
        console.log(`Using cached stock data for ${normalizedSymbol}`);
        return cachedStock.data;
    }

    // Alpha Vantage first.
    try {
        const data = await alphaVantageRequest({
            function: "TIME_SERIES_DAILY",
            symbol: normalizedSymbol,
            outputsize: "compact",
        });

        if (
            !data.Information &&
            !data.Note &&
            !data["Error Message"] &&
            data["Time Series (Daily)"]
        ) {
            dailyStockCache.set(normalizedSymbol, {
                timestamp: Date.now(),
                data,
            });

            return data;
        }

        console.warn(
            `Alpha Vantage daily data unavailable for ${normalizedSymbol}; trying Yahoo Finance.`
        );
    } catch (error) {
        console.warn(
            `Alpha Vantage daily request failed for ${normalizedSymbol}:`,
            error.message
        );
    }

    // Yahoo Finance fallback.
    try {
        const data = await getYahooDailyData(normalizedSymbol);

        dailyStockCache.set(normalizedSymbol, {
            timestamp: Date.now(),
            data,
        });

        console.log(`Stock data cached for ${normalizedSymbol}`);
        return data;
    } catch (error) {
        console.error(
            `Yahoo Finance daily data failed for ${normalizedSymbol}:`,
            error.message
        );

        if (cachedStock) {
            console.log(`Returning old cache for ${normalizedSymbol}`);
            return cachedStock.data;
        }

        throw error;
    }
};

// ======================================================
// TRADE PAGE COMPATIBILITY
// ======================================================

const fetchStockIntraday = async (symbol) => {
    return fetchStockDaily(symbol);
};

// ======================================================
// EXPORTS — KEEP ALL REQUIRED FUNCTION NAMES
// ======================================================

module.exports = {
    fetchNews,
    fetchGainersAndLosers,
    searchTickers,
    fetchStockIntraday,
    fetchStockDaily,
};
