import { Box, Typography, Stack, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'grey.100',
        borderTop: '1px solid #ddd',
        py: { xs: 3, sm: 4 },
        px: { xs: 2, sm: 6 },
        mt: { xs: 6, sm: 8 },
        textAlign: 'center',
      }}
    >
      {/* 社群連結區塊 */}
      <Stack
        direction="row"
        spacing={2}
        justifyContent="center"
        sx={{ mb: 1 }}
      >
        <IconButton size="small" aria-label="Facebook" color="primary">
          <FacebookIcon />
        </IconButton>
        <IconButton size="small" aria-label="Instagram" color="primary">
          <InstagramIcon />
        </IconButton>
        <IconButton size="small" aria-label="Twitter" color="primary">
          <TwitterIcon />
        </IconButton>
      </Stack>

      {/* 版權與說明文字 */}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          fontSize: { xs: '0.8rem', sm: '0.9rem' },
          maxWidth: 600,
          mx: 'auto',
        }}
      >
        © {new Date().getFullYear()} NullaShop ｜本網站使用 AI 素材，僅供展示用途，不涉及實際交易
      </Typography>
    </Box>
  );
}