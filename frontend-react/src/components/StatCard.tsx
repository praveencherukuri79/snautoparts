/**
 * Stat Card Component
 * 
 * Reusable card for displaying statistics with icon
 */

import { Box, Stack, Typography } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: SvgIconComponent;
  color: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color }) => {
  return (
    <Box
      flex={1}
      bgcolor="background.paper"
      p={3}
      borderRadius={2}
      border={1}
      borderColor="border.light"
      sx={{
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: color,
          boxShadow: 2,
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="h3" fontWeight={900} color="text.primary" mb={0.5}>
            {value}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {label}
          </Typography>
        </Box>
        <Box
          sx={{
            bgcolor: `${color}15`,
            p: 1.5,
            borderRadius: 2,
            display: 'flex',
          }}
        >
          <Icon sx={{ fontSize: 28, color }} />
        </Box>
      </Stack>
    </Box>
  );
};

export default StatCard;

