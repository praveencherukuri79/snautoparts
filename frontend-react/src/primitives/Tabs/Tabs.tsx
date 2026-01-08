import React from 'react';
import {
  Tabs as MuiTabs,
  Tab as MuiTab,
  TabsProps as MuiTabsProps,
  Box,
} from '@mui/material';

export interface TabItem {
  value: string;
  label: string;
  icon?: React.ReactElement;
  disabled?: boolean;
}

export interface TabsProps {
  /** Array of tab items */
  tabs: TabItem[];
  /** Currently active tab value */
  value: string;
  /** Tab change handler */
  onChange: (value: string) => void;
  /** Tab orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Tab variant */
  variant?: 'standard' | 'scrollable' | 'fullWidth';
  /** Whether tabs are centered */
  centered?: boolean;
  /** Additional MUI tabs props */
  tabsProps?: Partial<MuiTabsProps>;
}

/**
 * Tabs Component
 * 
 * Tab navigation for switching between views.
 * 
 * @example
 * ```tsx
 * <Tabs
 *   tabs={[
 *     { value: 'details', label: 'Details' },
 *     { value: 'specs', label: 'Specifications' },
 *     { value: 'reviews', label: 'Reviews' },
 *   ]}
 *   value={activeTab}
 *   onChange={setActiveTab}
 * />
 * ```
 */
export const Tabs: React.FC<TabsProps> = ({
  tabs,
  value,
  onChange,
  orientation = 'horizontal',
  variant = 'standard',
  centered = false,
  tabsProps,
}) => {
  return (
    <Box
      sx={{
        borderBottom: orientation === 'horizontal' ? 1 : 0,
        borderRight: orientation === 'vertical' ? 1 : 0,
        borderColor: 'divider',
      }}
    >
      <MuiTabs
        value={value}
        onChange={(_, newValue) => onChange(newValue)}
        orientation={orientation}
        variant={variant}
        centered={centered}
        {...tabsProps}
      >
        {tabs.map((tab) => (
          <MuiTab
            key={tab.value}
            value={tab.value}
            label={tab.label}
            icon={tab.icon}
            disabled={tab.disabled}
            iconPosition="start"
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              minHeight: 48,
            }}
          />
        ))}
      </MuiTabs>
    </Box>
  );
};

Tabs.displayName = 'Tabs';

export default Tabs;
