import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  Badge,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import CategoryIcon from '@mui/icons-material/Category';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ImageIcon from '@mui/icons-material/Image';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import BuildIcon from '@mui/icons-material/Build';
import HistoryIcon from '@mui/icons-material/History';
import StoreIcon from '@mui/icons-material/Store';
import { useRecoilValue } from 'recoil';
import { authAtom, AuthState } from '@/state/atoms';
import { Avatar } from '@/primitives';
import { useAuth } from '@/hooks';
import { useNavigate } from 'react-router-dom';

const DRAWER_WIDTH = 260;
const DRAWER_WIDTH_COLLAPSED = 72;

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: NavItem[];
  badge?: number;
  roles?: string[];
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  /** Title displayed in the app bar */
  title?: string;
}

// Navigation items for manager/admin
const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <DashboardIcon />,
  },
  {
    label: 'Orders',
    href: '/dashboard/orders',
    icon: <ShoppingCartIcon />,
    badge: 5,
    children: [
      { label: 'All Orders', href: '/dashboard/orders', icon: <ShoppingCartIcon /> },
      { label: 'Pending', href: '/dashboard/orders/pending', icon: <ShoppingCartIcon /> },
      { label: 'Processing', href: '/dashboard/orders/processing', icon: <ShoppingCartIcon /> },
      { label: 'Shipped', href: '/dashboard/orders/shipped', icon: <LocalShippingIcon /> },
    ],
  },
  {
    label: 'Inventory',
    href: '/dashboard/inventory',
    icon: <InventoryIcon />,
    children: [
      { label: 'Products', href: '/dashboard/inventory', icon: <InventoryIcon /> },
      { label: 'Adjustments', href: '/dashboard/inventory/adjustments', icon: <BuildIcon /> },
      { label: 'Import', href: '/dashboard/inventory/import', icon: <InventoryIcon /> },
    ],
  },
  {
    label: 'Categories',
    href: '/dashboard/categories',
    icon: <CategoryIcon />,
  },
  {
    label: 'Fitment',
    href: '/dashboard/fitment',
    icon: <BuildIcon />,
  },
  {
    label: 'Images',
    href: '/dashboard/images',
    icon: <ImageIcon />,
  },
  {
    label: 'Customers',
    href: '/dashboard/customers',
    icon: <PeopleIcon />,
    roles: ['admin'],
  },
  {
    label: 'Affiliates',
    href: '/dashboard/affiliates',
    icon: <StoreIcon />,
    roles: ['admin'],
  },
  {
    label: 'Reports',
    href: '/dashboard/reports',
    icon: <AssessmentIcon />,
    children: [
      { label: 'Sales', href: '/dashboard/reports/sales', icon: <AssessmentIcon /> },
      { label: 'Inventory', href: '/dashboard/reports/inventory', icon: <InventoryIcon /> },
      { label: 'Categories', href: '/dashboard/reports/categories', icon: <CategoryIcon /> },
    ],
  },
  {
    label: 'Audit Log',
    href: '/dashboard/audit',
    icon: <HistoryIcon />,
    roles: ['admin'],
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: <SettingsIcon />,
    roles: ['admin'],
    children: [
      { label: 'General', href: '/dashboard/settings/general', icon: <SettingsIcon /> },
      { label: 'Integrations', href: '/dashboard/settings/integrations', icon: <BuildIcon /> },
    ],
  },
];

/**
 * Sidebar Component
 * 
 * Collapsible navigation sidebar for dashboard.
 */
const Sidebar: React.FC<{
  open: boolean;
  collapsed: boolean;
  onToggle: () => void;
  onCollapse: () => void;
}> = ({ open, collapsed, onToggle, onCollapse }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const auth = useRecoilValue<AuthState>(authAtom);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleToggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const drawerWidth = collapsed && !isMobile ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  const drawerContent = (
    <>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
          p: 2,
          minHeight: 64,
        }}
      >
        {(!collapsed || isMobile) && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                bgcolor: 'primary.main',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                mr: 1.5,
              }}
            >
              SN
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Admin Panel
            </Typography>
          </Box>
        )}
        {!isMobile && (
          <IconButton onClick={onCollapse} size="small">
            <ChevronLeftIcon
              sx={{
                transform: collapsed ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}
            />
          </IconButton>
        )}
      </Box>

      <Divider />

      {/* Navigation */}
      <List sx={{ px: 1, py: 2 }}>
        {navItems.map((item) => {
          // Check role access
          if (item.roles && auth.user?.role && !item.roles.includes(auth.user.role)) {
            return null;
          }

          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedItems.includes(item.label);

          return (
            <React.Fragment key={item.label}>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={hasChildren ? 'div' : 'a'}
                  href={hasChildren ? undefined : item.href}
                  onClick={hasChildren ? () => handleToggleExpand(item.label) : undefined}
                  sx={{
                    borderRadius: 1,
                    minHeight: 44,
                    justifyContent: collapsed && !isMobile ? 'center' : 'initial',
                    px: collapsed && !isMobile ? 1.5 : 2,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: collapsed && !isMobile ? 0 : 40,
                      mr: collapsed && !isMobile ? 0 : 2,
                      justifyContent: 'center',
                    }}
                  >
                    {item.badge ? (
                      <Badge badgeContent={item.badge} color="error">
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </ListItemIcon>
                  {(!collapsed || isMobile) && (
                    <>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          fontWeight: 500,
                        }}
                      />
                      {hasChildren && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
                    </>
                  )}
                </ListItemButton>
              </ListItem>

              {/* Children items */}
              {hasChildren && (!collapsed || isMobile) && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children!.map((child) => (
                      <ListItem key={child.href} disablePadding>
                        <ListItemButton
                          component="a"
                          href={child.href}
                          sx={{
                            borderRadius: 1,
                            minHeight: 40,
                            pl: 6,
                          }}
                        >
                          <ListItemText
                            primary={child.label}
                            primaryTypographyProps={{
                              fontSize: '0.8125rem',
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          );
        })}
      </List>
    </>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          transition: 'width 0.2s',
          overflowX: 'hidden',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

/**
 * DashboardLayout Component
 * 
 * Layout for manager and admin dashboard pages.
 * Includes collapsible sidebar and top app bar.
 * 
 * @example
 * ```tsx
 * <DashboardLayout title="Inventory Management">
 *   <InventoryPage />
 * </DashboardLayout>
 * ```
 */
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title = 'Dashboard',
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const auth = useRecoilValue<AuthState>(authAtom);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<null | HTMLElement>(null);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const handleLogout = async () => {
    setAccountMenuAnchor(null);
    await logout();
    navigate('/', { replace: true });
  };

  const drawerWidth = isMobile ? 0 : collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        collapsed={collapsed}
        onToggle={handleSidebarToggle}
        onCollapse={handleCollapse}
      />

      {/* Main content area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          ml: `${drawerWidth}px`,
          transition: 'margin-left 0.2s',
        }}
      >
        {/* App bar */}
        <AppBar
          position="sticky"
          color="default"
          elevation={0}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Toolbar>
            {isMobile && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleSidebarToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
              {title}
            </Typography>

            {/* Notifications */}
            <IconButton color="inherit" sx={{ mr: 1 }}>
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* Account */}
            <IconButton
              color="inherit"
              onClick={(e) => setAccountMenuAnchor(e.currentTarget)}
            >
              {auth.user ? (
                <Avatar name={`${auth.user.firstName} ${auth.user.lastName}`} size="sm" />
              ) : (
                <AccountCircleIcon />
              )}
            </IconButton>

            <Menu
              anchorEl={accountMenuAnchor}
              open={Boolean(accountMenuAnchor)}
              onClose={() => setAccountMenuAnchor(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              {auth.user && (
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {auth.user.firstName} {auth.user.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {auth.user.role}
                  </Typography>
                </Box>
              )}
              <Divider />
              <MenuItem component="a" href="/dashboard/profile">
                <ListItemIcon>
                  <AccountCircleIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Profile</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <ExitToAppIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Sign Out</ListItemText>
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            p: 3,
            bgcolor: 'background.default',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

DashboardLayout.displayName = 'DashboardLayout';

export default DashboardLayout;
