import React from 'react';
import { Typography, Breadcrumbs as MuiBreadcrumbs, Link } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbsProps {
  /** Array of breadcrumb items */
  items: BreadcrumbItem[];
  /** Whether to show home icon */
  showHome?: boolean;
  /** Home link href */
  homeHref?: string;
  /** Separator between items */
  separator?: React.ReactNode;
}

/**
 * Breadcrumbs Component
 * 
 * Navigation breadcrumbs showing page hierarchy.
 * 
 * @example
 * ```tsx
 * <Breadcrumbs
 *   items={[
 *     { label: 'Categories', href: '/categories' },
 *     { label: 'Engine Parts', href: '/categories/engine' },
 *     { label: 'Oil Filters' },
 *   ]}
 * />
 * ```
 */
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  showHome = true,
  homeHref = '/',
  separator = <NavigateNextIcon fontSize="small" />,
}) => {
  return (
    <MuiBreadcrumbs
      separator={separator}
      aria-label="breadcrumb"
      sx={{
        '& .MuiBreadcrumbs-separator': {
          mx: 1,
          color: 'text.secondary',
        },
      }}
    >
      {showHome && (
        <Link
          href={homeHref}
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: 'text.secondary',
            textDecoration: 'none',
            '&:hover': {
              color: 'primary.main',
            },
          }}
        >
          <HomeIcon fontSize="small" />
        </Link>
      )}
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        if (isLast) {
          return (
            <Typography
              key={index}
              variant="body2"
              color="text.primary"
              sx={{ fontWeight: 500 }}
            >
              {item.label}
            </Typography>
          );
        }

        return (
          <Link
            key={index}
            href={item.href}
            onClick={item.onClick}
            sx={{
              color: 'text.secondary',
              textDecoration: 'none',
              fontSize: '0.875rem',
              '&:hover': {
                color: 'primary.main',
                textDecoration: 'underline',
              },
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </MuiBreadcrumbs>
  );
};

Breadcrumbs.displayName = 'Breadcrumbs';

export default Breadcrumbs;
