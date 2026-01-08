/**
 * AboutPage Styled Components
 */

import { Box, styled } from '@mui/material';
import { IMAGES } from '@/config/images';

export const HeroSection = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.common.white,
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(8),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `url(${IMAGES.hero.workshop})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.1,
  },
}));

export const StoryImage = styled('img')(({ theme }) => ({
  width: '100%',
  height: 'auto',
  borderRadius: theme.shape.borderRadius * 3,
  boxShadow: theme.shadows[3],
}));

export const ValueCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  textAlign: 'center',
  transition: 'all 0.3s',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[4],
  },
}));

export const TeamCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  transition: 'all 0.3s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[3],
  },
}));

export const CTASection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(6),
  textAlign: 'center',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  borderRadius: theme.shape.borderRadius * 3,
}));
