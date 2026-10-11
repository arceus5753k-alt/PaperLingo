import React, { useState } from "react";
import {
  Button,
  TextField,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Box,
  Typography,
  useTheme,
} from "@mui/material";
import axios from "axios";
import SearchIcon from "@mui/icons-material/Search";

const API =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const TickerSearch = ({ onSelectStock }) => {
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);

  const theme = useTheme();

  const fetchTickers = async () => {
    if (!inputValue.trim() || loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(`${API}/home/search`, {
        params: {
          keyword: inputValue.trim(),
        },
      });

      setOptions(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      console.error("Error fetching ticker data:", error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      fetchTickers();
    }
  };

  const handleSelect = (option) => {
    onSelectStock(option);
    setOptions([]);
    setInputValue("");
  };

  return (
    <Stack
      sx={{
        backgroundColor: theme.palette.background.default,
        minHeight: "50vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 2,
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
          padding: "40px",
          borderRadius: "10px",
          border: `2px solid ${theme.palette.accent.main}`,
          maxWidth: "600px",
          width: "100%",
          boxSizing: "border-box",
          textAlign: "center",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            color: theme.palette.text.primary,
            fontWeight: "bold",
          }}
        >
          Stock Ticker Search
        </Typography>

        <Typography
          variant="body1"
          gutterBottom
          sx={{
            color: theme.palette.text.secondary,
            opacity: 0.7,
            marginBottom: "20px",
          }}
        >
          Search for stock symbols and get market data.
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            mb: 3,
            alignItems: "center",
            borderRadius: "8px",
            padding: "10px 0",
            width: "100%",
          }}
        >
          <TextField
            label="Enter Stock Symbol or Name"
            placeholder="e.g. AAPL, Tesla"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            fullWidth
            sx={{
              backgroundColor: theme.palette.background.default,
              borderRadius: "8px",
            }}
          />

          <Button
            variant="contained"
            onClick={fetchTickers}
            disabled={loading || !inputValue.trim()}
            sx={{
              backgroundColor: theme.palette.success.main,
              color: "#fff",
              textTransform: "none",
              padding: "10px 20px",
              "&:hover": {
                backgroundColor: theme.palette.success.dark,
              },
              minWidth: { xs: "100%", sm: "120px" },
            }}
            startIcon={<SearchIcon />}
          >
            {loading ? (
              <CircularProgress color="inherit" size={24} />
            ) : (
              "Search"
            )}
          </Button>
        </Stack>

        {options.length > 0 && (
          <List>
            {options.map((option) => (
              <ListItem
                key={option.symbol}
                disablePadding
                sx={{ mb: 2 }}
              >
                <ListItemButton
                  onClick={() => handleSelect(option)}
                  sx={{
                    backgroundColor:
                      theme.palette.background.default,
                    borderRadius: "8px",
                    padding: "10px 20px",
                    transition: "background-color 0.3s ease",
                    "&:hover": {
                      backgroundColor: theme.palette.action.hover,
                    },
                    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <ListItemText
                    primary={option.symbol}
                    secondary={option.name}
                    primaryTypographyProps={{
                      variant: "h6",
                      sx: {
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                      },
                    }}
                    secondaryTypographyProps={{
                      variant: "body2",
                      sx: {
                        color: theme.palette.text.secondary,
                        opacity: 0.7,
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Stack>
  );
};

export default TickerSearch;