/**
 * MainLayout Styled Components
 * 
 * Extracted styled components to reduce sx prop usage in MainLayout
 */

import { styled } from '@mui/material/styles';
import { Box, Typography, IconButton } from '@mui/material';

export const HeaderTopBar = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  paddingTop: theme.spacing(0.75),
  paddingBottom: theme.spacing(0.75),
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

export const HeaderText = styled(Typography)({
  color: 'rgba(255, 255, 255, 0.7)',
  fontSize: '0.875rem',
});

export const LogoBadge = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  backgroundColor: theme.palette.primary.main,
  borderRadius: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(1.5),
  fontWeight: 700,
  fontSize: '1.25rem',
}));

export const SearchContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: theme.spacing(2),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  width: '100%',
  transition: 'background-color 0.2s',
  '&:focus-within': {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
}));

export const FooterSection = styled(Box)(({ theme }) => ({
  '& .footer-title': {
    fontWeight: 600,
    marginBottom: theme.spacing(2),
  },
}));

export const FooterText = styled(Typography)({
  color: 'rgba(255, 255, 255, 0.7)',
  fontSize: '0.875rem',
  marginBottom: '0.5rem',
});

export const FooterBottomBar = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
}));

export const FooterIcon = styled(Box)({
  color: 'rgba(255, 255, 255, 0.7)',
  display: 'flex',
  alignItems: 'center',
});

export const SocialIconButton = styled(IconButton)({
  color: 'rgba(255, 255, 255, 0.7)',
  '&:hover': {
    color: 'rgba(255, 255, 255, 1)',
  },
});

