import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
} from '@mui/material';

const NewsArticle = ({ article, delay = 0 }) => {
  const [imageError, setImageError] = useState(false);

  const title = article?.title || 'Untitled article';
  const imageUrl =
    article?.banner_image ||
    article?.image ||
    article?.thumbnail ||
    '';

  const publishedAt = article?.time_published;

  const formattedDate = publishedAt
    ? (() => {
        const value = String(publishedAt);
        const match = value.match(
          /^(\d{4})(\d{2})(\d{2})T?(\d{2})?(\d{2})?(\d{2})?/
        );

        if (!match) return value;

        const [, year, month, day, hour, minute] = match;

        const date = new Date(
          Number(year),
          Number(month) - 1,
          Number(day),
          Number(hour || 0),
          Number(minute || 0)
        );

        return date.toLocaleString();
      })()
    : '';

  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        minHeight: 125,
        height: '100%',
        bgcolor: 'background.paper',
        color: 'text.primary',
        border: '1px solid #512da8',
        borderRadius: 1,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        animation: 'fadeIn 0.4s ease both',
        animationDelay: `${delay}s`,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 18px rgba(103, 58, 183, 0.3)',
        },
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <CardContent
        sx={{
          flex: 1,
          minWidth: 0,
          p: 2,
          '&:last-child': { pb: 2 },
        }}
      >
        <Typography
          component={article?.url ? 'a' : 'div'}
          href={article?.url || undefined}
          target={article?.url ? '_blank' : undefined}
          rel={article?.url ? 'noopener noreferrer' : undefined}
          variant="body1"
          sx={{
            color: 'text.primary',
            textDecoration: 'none',
            fontWeight: 500,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            '&:hover': article?.url
              ? { color: '#9575cd' }
              : undefined,
          }}
        >
          {title}
        </Typography>

        {formattedDate && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 0.5 }}
          >
            {formattedDate}
          </Typography>
        )}

        {article?.summary && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            {article.summary}
          </Typography>
        )}
      </CardContent>

      {imageUrl && !imageError && (
        <Box
          sx={{
            width: 125,
            minWidth: 125,
            p: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <CardMedia
            component="img"
            image={imageUrl}
            alt={title}
            onError={() => setImageError(true)}
            sx={{
              width: '100%',
              height: 100,
              objectFit: 'cover',
              borderRadius: 1,
            }}
          />
        </Box>
      )}
    </Card>
  );
};

export default NewsArticle;