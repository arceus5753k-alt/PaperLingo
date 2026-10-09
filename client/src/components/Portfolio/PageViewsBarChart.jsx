
import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme } from '@mui/material/styles';

export default function PageViewsBarChart({ rows = [] }) {
  const theme = useTheme();

  // Give each stock its own colour.
  const stockColors = [
    '#60A5FA', // Blue
    '#A78BFA', // Purple
    '#34D399', // Green
    '#FBBF24', // Amber
    '#F87171', // Red
    '#22D3EE', // Cyan
    '#FB923C', // Orange
    '#E879F9', // Pink
  ];

  const stockNames = rows.map((row) => row.stockName);

  const portfolioValues = rows.map((row) =>
    Number(row.totalPortfolioValue) || 0
  );

  // MUI X Charts supports per-item colors through colorMap.
  const stockColorMap = {
    type: 'ordinal',
    values: stockNames,
    colors: stockNames.map(
      (_, index) => stockColors[index % stockColors.length]
    ),
  };

  return (
    <Card
      variant="outlined"
      sx={{
        width: '100%',
        border: `1px solid ${theme.palette.accent.main}`,
      }}
    >
      <CardContent>
        <Typography variant="h4" gutterBottom>
          Individual Stock Graph
        </Typography>

        <Stack sx={{ justifyContent: 'space-between' }}>
          <Stack
            direction="row"
            sx={{
              alignContent: {
                xs: 'center',
                sm: 'flex-start',
              },
              alignItems: 'center',
              gap: 1,
            }}
          />

          <Typography
            variant="caption"
            sx={{ color: 'text.secondary' }}
          >
            Growth/Loss of each individual stock
          </Typography>
        </Stack>

        <BarChart
          borderRadius={8}
          xAxis={[
            {
              scaleType: 'band',
              categoryGapRatio: 0.5,
              data: stockNames,
              colorMap: stockColorMap,
            },
          ]}
          series={[
            {
              id: 'totalPortfolioValue',
              label: 'Total Portfolio Value',
              data: portfolioValues,
              stack: 'A',
            },
          ]}
          height={250}
          margin={{
            left: 50,
            right: 0,
            top: 20,
            bottom: 20,
          }}
          grid={{ horizontal: true }}
          slotProps={{
            legend: {
              hidden: true,
            },
          }}
        />
      </CardContent>
    </Card>
  );
}
