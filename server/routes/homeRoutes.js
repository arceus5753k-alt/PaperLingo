const express = require("express");

const {
    getNews,
    getTopGainersLosers,
    searchStocks,
    getStockIntraday
} = require("../controllers/homeController");

const router = express.Router();

router.get("/news", getNews);

router.get("/top-gainers-losers", getTopGainersLosers);

router.get("/search", searchStocks);

router.get("/intraday", getStockIntraday);

module.exports = router;