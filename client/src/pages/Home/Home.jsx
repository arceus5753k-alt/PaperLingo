import React from "react";
import News from "../../components/News/News";
import MarketOverview from "../../components/TopGainersLosers/MarketOverview";
import { motion } from "framer-motion";
import Box from "@mui/material/Box";

const Home = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          width: "100%",
          minWidth: 0,
          "& > *": {
            maxWidth: "100%",
          },
        }}
      >
        <MarketOverview />
      </Box>

      <Box
        sx={{
          width: "100%",
          minWidth: 0,
          mt: 4,
        }}
      >
        <News />
      </Box>
    </motion.div>
  );
};

export default Home;