
import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme } from '@mui/material/styles';

export default function PageViewsBarChart({ rows = [] }) {
  const theme = useTheme();

  

  const stockColors = [
    '#60A5FA', 

    '#A78BFA', 

    '#34D399', 

    '#FBBF24', 

    '#F87171', 

    '#22D3EE', 

    '#FB923C', 

    '#E879F9', 

  ];

  const stockNames = rows.map((row) => row.stockName);

  const portfolioValues = rows.map((row) =>
    Number(row.totalPortfolioValue) || 0
  );

  

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
