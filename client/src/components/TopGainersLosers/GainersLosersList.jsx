import React, { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import GainerLoserCard from "./GainerLoserCard";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import BarChartIcon from "@mui/icons-material/BarChart";
import { useTheme } from "@mui/material/styles";

const GainersLosersList = ({ data }) => {
  const [value, setValue] = useState("gainers");
  const theme = useTheme();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const renderStocks = (stocks) => {
    if (!stocks) return null;

    return stocks.map((stock, index) => (
      <Box
        key={index}
        sx={{
          marginBottom: 2,
          width: "100%",
        }}
      >
        <GainerLoserCard
          stock={stock}
          delay={index * 0.1}
        />
      </Box>
    ));
  };

  return (
    <Box
      sx={{
        width: "100%",
      }}
    >
      <Tabs
        value={value}
        onChange={handleChange}
        textColor="secondary"
        indicatorColor="secondary"
        aria-label="Gainers Losers Tabs"
        sx={{
          width: "100%",

          "& .MuiTabs-indicator": {
            backgroundColor: theme.palette.neutral.main,
          },
        }}
      >
        <Tab
          icon={<TrendingUpIcon />}
          iconPosition="start"
          value="gainers"
          label="Top Gainers"
          sx={{
            "&.Mui-selected": {
              color: theme.palette.accent.main,
            },
          }}
        />

        <Tab
          icon={<TrendingDownIcon />}
          iconPosition="start"
          value="losers"
          label="Top Losers"
          sx={{
            "&.Mui-selected": {
              color: theme.palette.accent.main,
            },
          }}
        />

        <Tab
          icon={<BarChartIcon />}
          iconPosition="start"
          value="active"
          label="Most Active"
          sx={{
            "&.Mui-selected": {
              color: theme.palette.accent.main,
            },
          }}
        />
      </Tabs>

      <Box
        sx={{
          marginTop: 2,
          width: "100%",
          padding: 2,
          boxSizing: "border-box",
        }}
      >
        {value === "gainers" &&
          data?.top_gainers &&
          renderStocks(data.top_gainers)}

        {value === "losers" &&
          data?.top_losers &&
          renderStocks(data.top_losers)}

        {value === "active" &&
          data?.most_actively_traded &&
          renderStocks(data.most_actively_traded)}
      </Box>
    </Box>
  );
};

export default GainersLosersList;