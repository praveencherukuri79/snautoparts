import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

export interface QuantitySelectorProps {
  /** Current value */
  value: number;
  /** Change handler */
  onChange: (value: number) => void;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Size variant */
  size?: 'small' | 'medium';
  /** Disabled state */
  disabled?: boolean;
  /** Label */
  label?: string;
}

/**
 * QuantitySelector Component
 * 
 * Input for selecting quantity with increment/decrement buttons.
 * 
 * @example
 * ```tsx
 * <QuantitySelector
 *   value={quantity}
 *   onChange={setQuantity}
 *   min={1}
 *   max={10}
 * />
 * ```
 */
export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'medium',
  disabled = false,
  label,
}) => {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const buttonSize = size === 'small' ? 28 : 36;
  const iconSize = size === 'small' ? 'small' : 'medium';

  return (
    <Box>
      {label && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {label}
        </Typography>
      )}
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <IconButton
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          size={iconSize}
          sx={{
            borderRadius: 0,
            width: buttonSize,
            height: buttonSize,
          }}
        >
          <RemoveIcon fontSize={iconSize} />
        </IconButton>

        <Box
          sx={{
            width: size === 'small' ? 36 : 48,
            textAlign: 'center',
            borderLeft: 1,
            borderRight: 1,
            borderColor: 'divider',
            py: size === 'small' ? 0.25 : 0.5,
          }}
        >
          <Typography
            variant={size === 'small' ? 'body2' : 'body1'}
            sx={{ fontWeight: 500 }}
          >
            {value}
          </Typography>
        </Box>

        <IconButton
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          size={iconSize}
          sx={{
            borderRadius: 0,
            width: buttonSize,
            height: buttonSize,
          }}
        >
          <AddIcon fontSize={iconSize} />
        </IconButton>
      </Box>
    </Box>
  );
};

QuantitySelector.displayName = 'QuantitySelector';

export default QuantitySelector;
