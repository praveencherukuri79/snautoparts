/**
 * Stat Card Component
 * 
 * Reusable card for displaying statistics with icon
 */

import { Box, Stack, Typography, styled } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';
import { Card } from '@/primitives';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: SvgIconComponent;
  color: string;
}

const IconContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== '$iconColor',
})<{ $iconColor: string }>(({ $iconColor }) => ({
  backgroundColor: `${$iconColor}15`,
  padding: '12px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color }) => {
  return (
    <Card
      sx={{
        flex: 1,
        p: 3,
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
        <IconContainer $iconColor={color}>
          <Icon sx={{ fontSize: 28, color }} />
        </IconContainer>
      </Stack>
    </Card>
  );
};

export default StatCard;

