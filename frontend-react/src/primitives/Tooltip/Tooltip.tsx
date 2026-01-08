import React from 'react';
import { Tooltip as MuiTooltip, TooltipProps as MuiTooltipProps } from '@mui/material';

export interface TooltipProps extends Omit<MuiTooltipProps, 'title' | 'content'> {
  /** Tooltip content */
  content: React.ReactNode;
  /** Tooltip placement */
  placement?: MuiTooltipProps['placement'];
  /** Delay before showing (ms) */
  delay?: number;
  /** Whether tooltip is disabled */
  disabled?: boolean;
}

/**
 * Tooltip Component
 * 
 * Hover tooltip for additional information.
 * 
 * @example
 * ```tsx
 * <Tooltip content="Add item to your cart">
 *   <Button>Add to Cart</Button>
 * </Tooltip>
 * ```
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  placement = 'top',
  delay = 200,
  disabled = false,
  children,
  ...props
}) => {
  if (disabled || !content) {
    return <>{children}</>;
  }

  return (
    <MuiTooltip
      title={content}
      placement={placement}
      enterDelay={delay}
      arrow
      {...props}
    >
      {children}
    </MuiTooltip>
  );
};

Tooltip.displayName = 'Tooltip';

export default Tooltip;
