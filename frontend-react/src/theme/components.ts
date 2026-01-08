import { Components, Theme } from '@mui/material/styles';
import { palette } from './palette';

/**
 * MUI Component Overrides
 * Customizes default MUI component styles to match design system
 */
export const components: Components<Omit<Theme, 'components'>> = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        backgroundColor: palette.background.default,
        color: palette.text.primary,
      },
    },
  },

  // Button
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: {
        borderRadius: '0.5rem',
        padding: '0.625rem 1.25rem',
        fontWeight: 700,
        textTransform: 'none',
        transition: 'all 150ms ease',
      },
      sizeSmall: {
        padding: '0.375rem 0.875rem',
        fontSize: '0.8125rem',
      },
      sizeLarge: {
        padding: '0.75rem 1.5rem',
        fontSize: '1rem',
      },
      containedPrimary: {
        backgroundColor: palette.primary.main,
        '&:hover': {
          backgroundColor: palette.primary.dark,
        },
      },
      outlinedPrimary: {
        borderColor: palette.primary.main,
        color: palette.primary.main,
        '&:hover': {
          backgroundColor: `${palette.primary.main}10`,
          borderColor: palette.primary.dark,
        },
      },
      textPrimary: {
        color: palette.primary.main,
        '&:hover': {
          backgroundColor: `${palette.primary.main}10`,
        },
      },
    },
  },

  // IconButton
  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: '0.5rem',
        transition: 'all 150ms ease',
      },
    },
  },

  // TextField / Input
  MuiTextField: {
    defaultProps: {
      variant: 'outlined',
      size: 'medium',
    },
  },

  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: '0.5rem',
        backgroundColor: palette.background.paper,
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: palette.primary.main,
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: palette.primary.main,
          borderWidth: 2,
        },
      },
      notchedOutline: {
        borderColor: palette.border.light,
      },
      input: {
        padding: '0.875rem 1rem',
      },
    },
  },

  MuiInputLabel: {
    styleOverrides: {
      root: {
        color: palette.text.secondary,
        '&.Mui-focused': {
          color: palette.primary.main,
        },
      },
    },
  },

  // Select
  MuiSelect: {
    styleOverrides: {
      root: {
        borderRadius: '0.5rem',
      },
    },
  },

  // Card
  MuiCard: {
    defaultProps: {
      elevation: 0,
    },
    styleOverrides: {
      root: {
        borderRadius: '0.75rem',
        border: `1px solid ${palette.border.light}`,
        transition: 'all 200ms ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },

  MuiCardContent: {
    styleOverrides: {
      root: {
        padding: '1.5rem',
        '&:last-child': {
          paddingBottom: '1.5rem',
        },
      },
    },
  },

  // Paper
  MuiPaper: {
    defaultProps: {
      elevation: 0,
    },
    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },
      rounded: {
        borderRadius: '0.75rem',
      },
      outlined: {
        borderColor: palette.border.light,
      },
    },
  },

  // Chip
  MuiChip: {
    styleOverrides: {
      root: {
        fontWeight: 600,
        borderRadius: '0.375rem',
      },
      sizeSmall: {
        height: '1.5rem',
        fontSize: '0.75rem',
      },
      colorPrimary: {
        backgroundColor: `${palette.primary.main}15`,
        color: palette.primary.main,
      },
      colorSuccess: {
        backgroundColor: palette.success.light,
        color: palette.success.dark,
      },
      colorWarning: {
        backgroundColor: palette.warning.light,
        color: palette.warning.dark,
      },
      colorError: {
        backgroundColor: palette.error.light,
        color: palette.error.dark,
      },
    },
  },

  // Badge
  MuiBadge: {
    styleOverrides: {
      badge: {
        fontWeight: 700,
        fontSize: '0.625rem',
      },
      colorPrimary: {
        backgroundColor: palette.primary.main,
      },
    },
  },

  // Avatar
  MuiAvatar: {
    styleOverrides: {
      root: {
        backgroundColor: palette.primary.main,
        color: palette.primary.contrastText,
        fontWeight: 600,
      },
    },
  },

  // Dialog
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: '1rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
    },
  },

  MuiDialogTitle: {
    styleOverrides: {
      root: {
        fontSize: '1.25rem',
        fontWeight: 700,
        padding: '1.5rem 1.5rem 1rem',
      },
    },
  },

  MuiDialogContent: {
    styleOverrides: {
      root: {
        padding: '1rem 1.5rem',
      },
    },
  },

  MuiDialogActions: {
    styleOverrides: {
      root: {
        padding: '1rem 1.5rem 1.5rem',
        gap: '0.75rem',
      },
    },
  },

  // Drawer
  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRight: 'none',
      },
    },
  },

  // Menu
  MuiMenu: {
    styleOverrides: {
      paper: {
        borderRadius: '0.5rem',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${palette.border.light}`,
      },
    },
  },

  MuiMenuItem: {
    styleOverrides: {
      root: {
        padding: '0.625rem 1rem',
        fontSize: '0.875rem',
        borderRadius: '0.25rem',
        margin: '0.25rem 0.5rem',
        '&:hover': {
          backgroundColor: `${palette.primary.main}10`,
        },
        '&.Mui-selected': {
          backgroundColor: `${palette.primary.main}15`,
          '&:hover': {
            backgroundColor: `${palette.primary.main}20`,
          },
        },
      },
    },
  },

  // Tooltip
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: palette.text.primary,
        fontSize: '0.75rem',
        fontWeight: 500,
        borderRadius: '0.375rem',
        padding: '0.5rem 0.75rem',
      },
      arrow: {
        color: palette.text.primary,
      },
    },
  },

  // Snackbar
  MuiSnackbar: {
    styleOverrides: {
      root: {
        '& .MuiSnackbarContent-root': {
          borderRadius: '0.5rem',
        },
      },
    },
  },

  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: '0.5rem',
        fontWeight: 500,
      },
      standardSuccess: {
        backgroundColor: palette.success.light,
        color: palette.success.dark,
      },
      standardWarning: {
        backgroundColor: palette.warning.light,
        color: palette.warning.dark,
      },
      standardError: {
        backgroundColor: palette.error.light,
        color: palette.error.dark,
      },
      standardInfo: {
        backgroundColor: palette.info.light,
        color: palette.info.dark,
      },
    },
  },

  // Tabs
  MuiTabs: {
    styleOverrides: {
      indicator: {
        backgroundColor: palette.primary.main,
        height: 3,
        borderRadius: '3px 3px 0 0',
      },
    },
  },

  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.875rem',
        '&.Mui-selected': {
          color: palette.primary.main,
        },
      },
    },
  },

  // Table
  MuiTableHead: {
    styleOverrides: {
      root: {
        '& .MuiTableCell-head': {
          backgroundColor: palette.grey[50],
          color: palette.text.secondary,
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        },
      },
    },
  },

  MuiTableCell: {
    styleOverrides: {
      root: {
        borderColor: palette.border.light,
        padding: '1rem',
      },
    },
  },

  MuiTableRow: {
    styleOverrides: {
      root: {
        '&:hover': {
          backgroundColor: `${palette.primary.main}05`,
        },
      },
    },
  },

  // Pagination
  MuiPagination: {
    styleOverrides: {
      root: {
        '& .MuiPaginationItem-root': {
          fontWeight: 600,
          borderRadius: '0.375rem',
        },
        '& .Mui-selected': {
          backgroundColor: palette.primary.main,
          color: palette.primary.contrastText,
          '&:hover': {
            backgroundColor: palette.primary.dark,
          },
        },
      },
    },
  },

  // Breadcrumbs
  MuiBreadcrumbs: {
    styleOverrides: {
      root: {
        fontSize: '0.875rem',
      },
      separator: {
        color: palette.text.secondary,
      },
      li: {
        '& a': {
          color: palette.text.secondary,
          fontWeight: 500,
          textDecoration: 'none',
          '&:hover': {
            color: palette.primary.main,
          },
        },
      },
    },
  },

  // Skeleton
  MuiSkeleton: {
    styleOverrides: {
      root: {
        backgroundColor: palette.grey[200],
      },
      rounded: {
        borderRadius: '0.5rem',
      },
    },
  },

  // Divider
  MuiDivider: {
    styleOverrides: {
      root: {
        borderColor: palette.border.light,
      },
    },
  },

  // Link
  MuiLink: {
    styleOverrides: {
      root: {
        color: palette.primary.main,
        textDecoration: 'none',
        fontWeight: 500,
        '&:hover': {
          textDecoration: 'underline',
        },
      },
    },
  },

  // List
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: '0.5rem',
        '&.Mui-selected': {
          backgroundColor: `${palette.primary.main}15`,
          '&:hover': {
            backgroundColor: `${palette.primary.main}20`,
          },
        },
      },
    },
  },

  // Switch
  MuiSwitch: {
    styleOverrides: {
      switchBase: {
        '&.Mui-checked': {
          color: palette.primary.main,
          '& + .MuiSwitch-track': {
            backgroundColor: palette.primary.main,
          },
        },
      },
    },
  },

  // Checkbox & Radio
  MuiCheckbox: {
    styleOverrides: {
      root: {
        color: palette.border.light,
        '&.Mui-checked': {
          color: palette.primary.main,
        },
      },
    },
  },

  MuiRadio: {
    styleOverrides: {
      root: {
        color: palette.border.light,
        '&.Mui-checked': {
          color: palette.primary.main,
        },
      },
    },
  },
};
