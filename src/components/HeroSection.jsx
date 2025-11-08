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
        py: 8,
        minHeight: 360,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Typography
        variant="h3"
        gutterBottom
        sx={{ fontWeight: 700, textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
      >
        衣想世界｜從日常到幻想的造型自由場
      </Typography>
      <Typography variant="h6" sx={{ textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>
        NullaShop 網站大量使用 AI 素材，僅供展示使用
      </Typography>
    </Box>
  );
}