/**
 * Action Card Component
 * 
 * Reusable card for quick action items with icon
 */

import { Stack, Typography, Box } from '@mui/material';
import { ChevronRight, SvgIconComponent } from '@mui/icons-material';
import { ClickableCard } from './ClickableCard';

export interface ActionCardProps {
  label: string;
  description: string;
  icon: SvgIconComponent;
  color: string;
  to: string;
}

export const ActionCard: React.FC<ActionCardProps> = ({ label, description, icon: Icon, color, to }) => {
  return (
    <ClickableCard
      to={to}
      bgcolor="background.paper"
      p={2.5}
      borderRadius={2}
      border={1}
      borderColor="border.light"
      className="transition-all"
      sx={{
        '&:hover': {
          borderColor: color,
          boxShadow: 1,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Stack direction="row" alignItems="center" gap={2}>
        <Box
          sx={{
            bgcolor: `${color}15`,
            p: 1.5,
            borderRadius: 1.5,
            display: 'flex',
          }}
        >
          <Icon sx={{ fontSize: 24, color }} />
        </Box>
        <Box flex={1}>
          <Typography fontWeight={600} color="text.primary" mb={0.25}>
            {label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
        <ChevronRight sx={{ color: 'text.disabled' }} />
      </Stack>
    </ClickableCard>
  );
};

export default ActionCard;

