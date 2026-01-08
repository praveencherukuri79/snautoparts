import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Button, Card } from '@/primitives';
import BuildIcon from '@mui/icons-material/Build';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SpeedIcon from '@mui/icons-material/Speed';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import ConstructionIcon from '@mui/icons-material/Construction';
import WeekendIcon from '@mui/icons-material/Weekend';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VerifiedIcon from '@mui/icons-material/Verified';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';

const categories = [
  { name: 'Engine Parts', icon: BuildIcon },
  { name: 'Brake Systems', icon: SpeedIcon },
  { name: 'Suspension', icon: DirectionsCarIcon },
  { name: 'Electrical', icon: ElectricalServicesIcon },
  { name: 'Body Parts', icon: ConstructionIcon },
  { name: 'Interior', icon: WeekendIcon },
];

const featuredProducts = [
  { id: 1, name: 'Premium Brake Pads', brand: 'Wagner', price: 49.99, salePrice: 39.99, image: '/images/brake-pads.jpg' },
  { id: 2, name: 'Oil Filter Pack (3)', brand: 'Fram', price: 24.99, image: '/images/oil-filter.jpg' },
  { id: 3, name: 'LED Headlight Kit', brand: 'Philips', price: 89.99, salePrice: 74.99, image: '/images/headlights.jpg' },
  { id: 4, name: 'Spark Plugs (Set of 4)', brand: 'NGK', price: 32.99, image: '/images/spark-plugs.jpg' },
];

/**
 * HomePage Component
 * 
 * Landing page with hero section, featured categories, and products.
 */
const HomePage: React.FC = () => {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: '#1a1a2e',
          color: 'white',
          py: { xs: 6, md: 8 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.2,
                  color: '#ffffff',
                }}
              >
                Quality Auto Parts for Every Vehicle
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  mb: 4,
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontWeight: 400,
                  fontSize: { xs: '1rem', md: '1.15rem' },
                  maxWidth: 550,
                }}
              >
                Shop from thousands of parts with guaranteed fitment for your car,
                truck, or SUV. Fast shipping and expert support.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button variant="primary" size="large">
                  Shop Now
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.5)',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Find Parts by Vehicle
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper
                elevation={4}
                sx={{
                  bgcolor: '#ffffff',
                  borderRadius: 2,
                  p: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ mb: 3, fontWeight: 600, color: '#1a1a2e' }}
                >
                  Select Your Vehicle
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Year</InputLabel>
                    <Select label="Year" defaultValue="">
                      <MenuItem value="">Select Year</MenuItem>
                      {Array.from({ length: 30 }, (_, i) => 2025 - i).map((year) => (
                        <MenuItem key={year} value={year}>{year}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small">
                    <InputLabel>Make</InputLabel>
                    <Select label="Make" defaultValue="">
                      <MenuItem value="">Select Make</MenuItem>
                      <MenuItem value="toyota">Toyota</MenuItem>
                      <MenuItem value="honda">Honda</MenuItem>
                      <MenuItem value="ford">Ford</MenuItem>
                      <MenuItem value="chevrolet">Chevrolet</MenuItem>
                      <MenuItem value="bmw">BMW</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small">
                    <InputLabel>Model</InputLabel>
                    <Select label="Model" defaultValue="">
                      <MenuItem value="">Select Model</MenuItem>
                    </Select>
                  </FormControl>
                  <Button variant="primary" fullWidth sx={{ mt: 1 }}>
                    Find Parts
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Featured Categories */}
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 4, color: '#1a1a2e' }}>
          Shop by Category
        </Typography>
        <Grid container spacing={3}>
          {categories.map(({ name, icon: Icon }) => (
            <Grid item xs={6} sm={4} md={2} key={name}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    borderColor: 'primary.main',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: 'primary.main',
                    borderRadius: '50%',
                    mx: 'auto',
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon sx={{ fontSize: 28, color: 'white' }} />
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                  {name}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Products */}
      <Box sx={{ bgcolor: '#f8f7f5', py: 6 }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
              Featured Products
            </Typography>
            <Button variant="text">View All →</Button>
          </Box>
          <Grid container spacing={3}>
            {featuredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={3} key={product.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    },
                  }}
                  clickable
                >
                  <Box
                    sx={{
                      height: 180,
                      bgcolor: '#e8e8e8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '8px 8px 0 0',
                    }}
                  >
                    <BuildIcon sx={{ fontSize: 64, color: '#bbb' }} />
                  </Box>
                  <Box sx={{ p: 2, flexGrow: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {product.brand}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, color: '#1a1a2e' }}>
                      {product.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {product.salePrice ? (
                        <>
                          <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                            ${product.salePrice.toFixed(2)}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                          >
                            ${product.price.toFixed(2)}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                          ${product.price.toFixed(2)}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button variant="primary" fullWidth>
                      Add to Cart
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Why Choose Us */}
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 5, textAlign: 'center', color: '#1a1a2e' }}>
          Why Choose SN Auto Parts?
        </Typography>
        <Grid container spacing={4}>
          {[
            { icon: VerifiedIcon, title: 'Guaranteed Fitment', desc: 'All parts matched to your exact vehicle specifications' },
            { icon: LocalShippingIcon, title: 'Fast Free Shipping', desc: 'Free shipping on all orders over $50' },
            { icon: SupportAgentIcon, title: 'Expert Support', desc: 'Our knowledgeable team is here to help 7 days a week' },
            { icon: AssignmentReturnIcon, title: 'Easy Returns', desc: '30-day hassle-free return policy on all items' },
          ].map(({ icon: Icon, title, desc }) => (
            <Grid item xs={12} sm={6} md={3} key={title}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    bgcolor: 'rgba(249, 116, 21, 0.1)',
                    borderRadius: '50%',
                    mx: 'auto',
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon sx={{ fontSize: 32, color: 'primary.main' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#1a1a2e' }}>
                  {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {desc}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage;
