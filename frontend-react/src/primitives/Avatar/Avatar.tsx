import React from 'react';
import {
  Avatar as MuiAvatar,
  AvatarProps as MuiAvatarProps,
} from '@mui/material';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps extends MuiAvatarProps {
  /** Avatar size preset */
  size?: AvatarSize;
  /** Full name for initials generation */
  name?: string;
}

const sizeMap: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

/**
 * Get initials from a full name
 */
const getInitials = (name: string): string => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Generate a consistent color based on a string
 */
const stringToColor = (string: string): string => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    '#f97415', // primary
    '#1a1a2e', // dark
    '#3b82f6', // blue
    '#10b981', // green
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#f59e0b', // amber
  ];
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Avatar Component
 * 
 * User avatar with image, initials, or icon support.
 * 
 * @example
 * ```tsx
 * <Avatar src="/user.jpg" alt="John Doe" />
 * <Avatar name="John Doe" />
 * <Avatar size="lg" name="Jane Smith" />
 * ```
 */
export const Avatar: React.FC<AvatarProps> = ({
  size = 'md',
  name,
  children,
  src,
  sx,
  ...props
}) => {
  const dimension = sizeMap[size];
  const initials = name ? getInitials(name) : undefined;
  const bgColor = name ? stringToColor(name) : undefined;

  return (
    <MuiAvatar
      src={src}
      sx={{
        width: dimension,
        height: dimension,
        fontSize: dimension * 0.4,
        bgcolor: !src && bgColor ? bgColor : undefined,
        ...sx,
      }}
      {...props}
    >
      {!src && (children || initials)}
    </MuiAvatar>
  );
};

Avatar.displayName = 'Avatar';

export default Avatar;
