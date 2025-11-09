import { Box, Typography } from '@mui/material';

export default function HeroSection() {
  const bgUrl = '/hero01.jpeg';

  return (
    <Box
      sx={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(${bgUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: '#fff',
        py: { xs: 6, sm: 8 },
        px: { xs: 2, sm: 4 },
        minHeight: { xs: 300, sm: 360 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        gap: 2,
      }}
    >
      <Typography
        variant="h3"
        gutterBottom
        sx={{
          fontWeight: 700,
          fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
          textShadow: '0 2px 8px rgba(0,0,0,0.6)',
          maxWidth: 600,
        }}
      >
        衣想世界｜從日常到幻想的造型自由場
      </Typography>

      <Typography
        variant="body1"
        sx={{
          textShadow: '0 1px 6px rgba(0,0,0,0.6)',
          fontSize: { xs: '0.95rem', sm: '1.1rem' },
          maxWidth: 480,
        }}
      >
        NullaShop 網站使用 AI 素材，僅供展示使用
      </Typography>
    </Box>
  );
}