import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
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
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import { useRecoilValue } from 'recoil';
import { cartTotalItemsSelector } from '@/state/selectors';
import { authAtom, AuthState } from '@/state/atoms';
import { Avatar } from '@/primitives';

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
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<null | HTMLElement>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  const handleAccountMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAccountMenuAnchor(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAccountMenuAnchor(null);
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
      <Box
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.05)',
          py: 0.75,
          display: { xs: 'none', md: 'block' },
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Free shipping on orders over $50
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Typography
                variant="body2"
                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
              >
                📞 1-800-AUTO-PARTS
              </Typography>
              <Typography
                variant="body2"
                component="a"
                href="/track-order"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  '&:hover': { color: 'white' },
                }}
              >
                Track Order
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

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
          <Box
            component="a"
            href="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'white',
              mr: { xs: 'auto', md: 4 },
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.main',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1.5,
                fontWeight: 700,
                fontSize: '1.25rem',
              }}
            >
              SN
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                display: { xs: 'none', sm: 'block' },
              }}
            >
              SN Auto Parts
            </Typography>
          </Box>

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
                <Box
                  key={link.href}
                  component="a"
                  href={link.href}
                  sx={{
                    px: 2,
                    py: 1,
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: 1,
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  {link.label}
                </Box>
              ))}
            </Box>
          )}

          {/* Search bar */}
          <Box
            sx={{
              flex: { xs: 0, md: 1 },
              maxWidth: 500,
              mx: { xs: 0, md: 2 },
              display: { xs: 'none', sm: 'flex' },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                px: 2,
                width: '100%',
                transition: 'background-color 0.2s',
                ...(searchFocused && {
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                }),
              }}
            >
              <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', mr: 1 }} />
              <InputBase
                placeholder="Search parts by name, SKU, or vehicle..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
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
            </Box>
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
              component="a"
              href="/wishlist"
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              <FavoriteIcon />
            </IconButton>

            {/* Cart */}
            <IconButton color="inherit" component="a" href="/cart">
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
                      component="a"
                      href={item.href}
                      onClick={handleAccountMenuClose}
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText>{item.label}</ListItemText>
                    </MenuItem>
                  ))}
                  <Divider />
                  <MenuItem>
                    <ListItemIcon>
                      <ExitToAppIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Sign Out</ListItemText>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <IconButton color="inherit" component="a" href="/login">
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
                  component="a"
                  href={link.href}
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
                      component="a"
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </>
            ) : (
              <ListItem disablePadding>
                <ListItemButton
                  component="a"
                  href="/login"
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
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              SN Auto Parts
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}
            >
              Your trusted source for quality auto parts. We offer a wide
              selection of parts for all makes and models.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {['facebook', 'twitter', 'instagram', 'youtube'].map((social) => (
                <IconButton
                  key={social}
                  size="small"
                  sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      bgcolor: 'currentColor',
                      borderRadius: '50%',
                    }}
                  />
                </IconButton>
              ))}
            </Box>
          </Box>

          {/* Quick Links */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Quick Links
            </Typography>
            {['Shop All', 'Categories', 'Deals', 'New Arrivals', 'Best Sellers'].map(
              (link) => (
                <Typography
                  key={link}
                  component="a"
                  href="#"
                  variant="body2"
                  sx={{
                    display: 'block',
                    color: 'rgba(255, 255, 255, 0.7)',
                    textDecoration: 'none',
                    mb: 1,
                    '&:hover': { color: 'white' },
                  }}
                >
                  {link}
                </Typography>
              )
            )}
          </Box>

          {/* Customer Service */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Customer Service
            </Typography>
            {[
              'Contact Us',
              'FAQs',
              'Shipping Info',
              'Returns & Refunds',
              'Track Order',
            ].map((link) => (
              <Typography
                key={link}
                component="a"
                href="#"
                variant="body2"
                sx={{
                  display: 'block',
                  color: 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  mb: 1,
                  '&:hover': { color: 'white' },
                }}
              >
                {link}
              </Typography>
            ))}
          </Box>

          {/* Contact Info */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Contact Us
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}
            >
              📞 1-800-AUTO-PARTS
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}
            >
              ✉️ support@snautoparts.com
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}
            >
              📍 123 Auto Drive, Parts City, PC 12345
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              🕒 Mon-Fri: 8am-8pm EST
            </Typography>
          </Box>
        </Box>
      </Container>

      {/* Bottom bar */}
      <Box sx={{ bgcolor: 'rgba(0, 0, 0, 0.2)', py: 2 }}>
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              © {new Date().getFullYear()} SN Auto Parts. All rights reserved.
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(
                (link) => (
                  <Typography
                    key={link}
                    component="a"
                    href="#"
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      textDecoration: 'none',
                      '&:hover': { color: 'white' },
                    }}
                  >
                    {link}
                  </Typography>
                )
              )}
            </Box>
          </Box>
        </Container>
      </Box>
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
