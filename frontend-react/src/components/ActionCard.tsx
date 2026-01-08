/**
 * Action Card Component
 * 
 * Reusable card for quick action items with icon
 */

import { Stack, Typography, Box, styled } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';
import { Link } from '@/primitives';
import { ChevronRightIcon } from '@/icons';

export interface ActionCardProps {
  label: string;
  description: string;
  icon: SvgIconComponent;
  color: string;
  to: string;
}

const StyledLink = styled(Link)(({ theme }) => ({
  display: 'block',
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2.5),
  borderRadius: theme.spacing(2),
  border: `1px solid ${theme.palette.border.light}`,
  transition: 'all 0.2s',
}));

const IconContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== '$iconColor',
})<{ $iconColor: string }>(({ $iconColor, theme }) => ({
  backgroundColor: `${$iconColor}15`,
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

export const ActionCard: React.FC<ActionCardProps> = ({ label, description, icon: Icon, color, to }) => {
  return (
    <StyledLink
      to={to}
      variant="unstyled"
      sx={{
        '&:hover': {
          borderColor: color,
          boxShadow: 1,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Stack direction="row" alignItems="center" gap={2}>
        <IconContainer $iconColor={color}>
          <Icon sx={{ fontSize: 24, color }} />
        </IconContainer>
        <Box flex={1}>
          <Typography fontWeight={600} color="text.primary" mb={0.25}>
            {label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
        <ChevronRightIcon sx={{ color: 'text.disabled' }} />
      </Stack>
    </StyledLink>
  );
};

export default ActionCard;

