import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Stack,
  Container,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  useTheme,
  useMediaQuery,
  Typography,
  Divider,
  InputBase,
} from '@mui/material';
import {
  MenuIcon,
  SearchIcon,
  ShoppingCartIcon,
  PersonIcon,
  FavoriteIcon,
  ExitToAppIcon,
  AccountCircleIcon,
  DirectionsCarIcon,
  LocationOnIcon,
  HistoryIcon,
  SettingsIcon,
  DashboardIcon,
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  YouTubeIcon,
  PhoneIcon,
  EmailIcon,
  LocationOnOutlinedIcon,
  AccessTimeIcon,
} from '@/icons';
import { useRecoilValue } from 'recoil';
import { cartTotalItemsSelector } from '@/state/selectors';
import { authAtom, AuthState } from '@/state/atoms';
import { Avatar, Link } from '@/primitives';
import { useAuth } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import {
  HeaderTopBar,
  HeaderText,
  LogoBadge,
  SearchContainer,
  FooterSection,
  FooterText,
  FooterBottomBar,
  FooterIcon,
  SocialIconButton,
} from './MainLayout.styles';

interface NavLink {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface MainLayoutProps {
  children: React.ReactNode;
}

// Main navigation links
const navLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Categories', href: '/categories' },
  { label: 'Deals', href: '/deals' },
  { label: 'About', href: '/about' },
];

// Account menu items
const accountMenuItems: NavLink[] = [
  { label: 'Dashboard', href: '/account', icon: <DashboardIcon fontSize="small" /> },
  { label: 'My Profile', href: '/account/profile', icon: <AccountCircleIcon fontSize="small" /> },
  { label: 'My Vehicles', href: '/account/vehicles', icon: <DirectionsCarIcon fontSize="small" /> },
  { label: 'My Addresses', href: '/account/addresses', icon: <LocationOnIcon fontSize="small" /> },
  { label: 'Order History', href: '/account/orders', icon: <HistoryIcon fontSize="small" /> },
  { label: 'Settings', href: '/account/settings', icon: <SettingsIcon fontSize="small" /> },
];

/**
 * Header Component
 * 
 * Main site header with logo, navigation, search, and user actions.
 * Based on stitch_home_page_customer_view design.
 */
const Header: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const cartItemCount = useRecoilValue(cartTotalItemsSelector);
  const auth = useRecoilValue<AuthState>(authAtom);
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<null | HTMLElement>(null);

  const handleAccountMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAccountMenuAnchor(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAccountMenuAnchor(null);
  };

  const handleLogout = async () => {
    handleAccountMenuClose();
    setMobileMenuOpen(false);
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        bgcolor: 'secondary.main',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Top bar with contact/account info */}
      <HeaderTopBar>
        <Container maxWidth="xl">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <HeaderText variant="body2">
              Free shipping on orders over $50
            </HeaderText>
            <Stack direction="row" spacing={3} alignItems="center">
              <Stack direction="row" spacing={0.5} alignItems="center">
                <PhoneIcon fontSize="small" className="header-text" sx={{ fontSize: '0.875rem' }} />
                <HeaderText variant="body2">1-800-AUTO-PARTS</HeaderText>
              </Stack>
              <Link to="/track-order" variant="unstyled" className="header-text header-text-hover">
                Track Order
              </Link>
            </Stack>
          </Stack>
        </Container>
      </HeaderTopBar>

      {/* Main header */}
      <Container maxWidth="xl">
        <Toolbar
          sx={{
            minHeight: { xs: 64, md: 72 },
            px: { xs: 0 },
          }}
        >
          {/* Mobile menu button */}
          {isMobile && (
            <IconButton
              color="inherit"
              onClick={() => setMobileMenuOpen(true)}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo */}
          <Link
            to="/"
            variant="unstyled"
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'white',
              mr: { xs: 'auto', md: 4 },
            }}
          >
            <LogoBadge>SN</LogoBadge>
            <Typography variant="h6" sx={{ fontWeight: 700, display: { xs: 'none', sm: 'block' } }}>
              SN Auto Parts
            </Typography>
          </Link>

          {/* Desktop navigation */}
          {!isMobile && (
            <Box
              component="nav"
              sx={{
                display: 'flex',
                gap: 1,
                mr: 3,
              }}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  variant="unstyled"
                  sx={{ px: 2, py: 1, color: 'white', borderRadius: 1, fontSize: '0.9rem', fontWeight: 500 }}
                  className="header-link-transition"
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          )}

          {/* Search bar */}
          <Box sx={{ flex: { xs: 0, md: 1 }, maxWidth: 500, mx: { xs: 0, md: 2 }, display: { xs: 'none', sm: 'flex' } }}>
            <SearchContainer>
              <SearchIcon className="header-text" sx={{ mr: 1 }} />
              <InputBase
                placeholder="Search parts by name, SKU, or vehicle..."
                sx={{
                  flex: 1,
                  color: 'white',
                  py: 1,
                  '& input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.6)',
                    opacity: 1,
                  },
                }}
              />
            </SearchContainer>
          </Box>

          {/* Action buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
            {/* Mobile search */}
            {isMobile && (
              <IconButton color="inherit">
                <SearchIcon />
              </IconButton>
            )}

            {/* Wishlist */}
            <IconButton
              color="inherit"
              component={RouterLink}
              to="/wishlist"
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              <FavoriteIcon />
            </IconButton>

            {/* Cart */}
            <IconButton color="inherit" component={RouterLink} to="/cart">
              <Badge badgeContent={cartItemCount} color="primary">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>

            {/* Account */}
            {auth.isAuthenticated && auth.user ? (
              <>
                <IconButton color="inherit" onClick={handleAccountMenuOpen}>
                  <Avatar name={`${auth.user.firstName} ${auth.user.lastName}`} size="sm" />
                </IconButton>
                <Menu
                  anchorEl={accountMenuAnchor}
                  open={Boolean(accountMenuAnchor)}
                  onClose={handleAccountMenuClose}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {auth.user.firstName} {auth.user.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {auth.user.email}
                    </Typography>
                  </Box>
                  <Divider />
                  {accountMenuItems.map((item) => (
                    <MenuItem
                      key={item.href}
                      component={RouterLink}
                      to={item.href}
                      onClick={handleAccountMenuClose}
                      sx={{ color: 'inherit', textDecoration: 'none' }}
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText>{item.label}</ListItemText>
                    </MenuItem>
                  ))}
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <ExitToAppIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Sign Out</ListItemText>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <IconButton color="inherit" component={RouterLink} to="/login">
                <PersonIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile navigation drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box sx={{ width: 280 }}>
          <Box sx={{ p: 2, bgcolor: 'secondary.main' }}>
            <Typography variant="h6" sx={{ color: 'secondary.contrastText', fontWeight: 700 }}>
              SN Auto Parts
            </Typography>
          </Box>
          <List>
            {navLinks.map((link) => (
              <ListItem key={link.href} disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ListItemText primary={link.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            {auth.isAuthenticated ? (
              <>
                {accountMenuItems.map((item) => (
                  <ListItem key={item.href} disablePadding>
                    <ListItemButton
                      component={RouterLink}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} />
                    </ListItemButton>
                  </ListItem>
                ))}
                <Divider />
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    <ListItemIcon>
                      <ExitToAppIcon />
                    </ListItemIcon>
                    <ListItemText primary="Sign Out" />
                  </ListItemButton>
                </ListItem>
              </>
            ) : (
              <ListItem disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary="Sign In" />
                </ListItemButton>
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
};

/**
 * Footer Component
 * 
 * Main site footer with links, contact info, and newsletter signup.
 */
const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'secondary.main',
        color: 'secondary.contrastText',
        mt: 'auto',
      }}
    >
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 4,
          }}
        >
          {/* Company Info */}
          <FooterSection>
            <Typography variant="h6" className="footer-title">
              SN Auto Parts
            </Typography>
            <FooterText variant="body2" sx={{ mb: 2 }}>
              Your trusted source for quality auto parts. We offer a wide
              selection of parts for all makes and models.
            </FooterText>
            <Stack direction="row" spacing={1}>
              <SocialIconButton size="small" aria-label="Facebook">
                <FacebookIcon fontSize="small" />
              </SocialIconButton>
              <SocialIconButton size="small" aria-label="Twitter">
                <TwitterIcon fontSize="small" />
              </SocialIconButton>
              <SocialIconButton size="small" aria-label="Instagram">
                <InstagramIcon fontSize="small" />
              </SocialIconButton>
              <SocialIconButton size="small" aria-label="YouTube">
                <YouTubeIcon fontSize="small" />
              </SocialIconButton>
            </Stack>
          </FooterSection>

          {/* Quick Links */}
          <FooterSection>
            <Typography variant="subtitle1" className="footer-title">
              Quick Links
            </Typography>
            <Stack spacing={1}>
              {['Shop All', 'Categories', 'Deals', 'New Arrivals', 'Best Sellers'].map((link) => (
                <Link key={link} to="#" variant="unstyled" className="footer-link">
                  {link}
                </Link>
              ))}
            </Stack>
          </FooterSection>

          {/* Customer Service */}
          <FooterSection>
            <Typography variant="subtitle1" className="footer-title">
              Customer Service
            </Typography>
            <Stack spacing={1}>
              {['Contact Us', 'FAQs', 'Shipping Info', 'Returns & Refunds', 'Track Order'].map((link) => (
                <Link key={link} to="#" variant="unstyled" className="footer-link">
                  {link}
                </Link>
              ))}
            </Stack>
          </FooterSection>

          {/* Contact Info */}
          <FooterSection>
            <Typography variant="subtitle1" className="footer-title">
              Contact Us
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <FooterIcon><PhoneIcon fontSize="small" /></FooterIcon>
              <FooterText variant="body2" sx={{ mb: 0 }}>1-800-AUTO-PARTS</FooterText>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <FooterIcon><EmailIcon fontSize="small" /></FooterIcon>
              <FooterText variant="body2" sx={{ mb: 0 }}>support@snautoparts.com</FooterText>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <FooterIcon><LocationOnOutlinedIcon fontSize="small" /></FooterIcon>
              <FooterText variant="body2" sx={{ mb: 0 }}>123 Auto Drive, Parts City, PC 12345</FooterText>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <FooterIcon><AccessTimeIcon fontSize="small" /></FooterIcon>
              <FooterText variant="body2" sx={{ mb: 0 }}>Mon-Fri: 8am-8pm EST</FooterText>
            </Stack>
          </FooterSection>
        </Box>
      </Container>

      {/* Bottom bar */}
      <FooterBottomBar>
        <Container maxWidth="xl">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Typography variant="body2" className="footer-text-muted">
              © {new Date().getFullYear()} SN Auto Parts. All rights reserved.
            </Typography>
            <Stack direction="row" spacing={3}>
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((link) => (
                <Link key={link} to="#" variant="unstyled" className="footer-text-muted header-text-hover">
                  {link}
                </Link>
              ))}
            </Stack>
          </Stack>
        </Container>
      </FooterBottomBar>
    </Box>
  );
};

/**
 * MainLayout Component
 * 
 * Primary layout for customer-facing pages.
 * Includes header with navigation and footer.
 * 
 * @example
 * ```tsx
 * <MainLayout>
 *   <HomePage />
 * </MainLayout>
 * ```
 */
export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Header />
      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

MainLayout.displayName = 'MainLayout';

export default MainLayout;
