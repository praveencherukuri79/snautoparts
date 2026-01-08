/**
 * DealsPage Component
 * 
 * Special deals, discounts, and promotions page
 * Uses real ProductSummary model and catalogService API
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Tabs,
  Tab,
  Chip,
  Stack,
  Paper,
  CircularProgress,
} from '@mui/material';
import { Card, Button } from '@/primitives';
import {
  LocalOfferIcon,
  TrendingUpIcon,
  NewReleasesIcon,
  StarIcon,
  AccessTimeIcon,
} from '@/icons';
import { catalogService } from '@/services/catalogService';
import type { ProductSummary } from '@/models';
import { StatCard } from '@/components';
import {
  HeroSection,
  DiscountBadge,
  DealCard,
  ProductImage,
  StrikePrice,
} from './DealsPage.styles';

const DealsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        // Fetch all products and filter for those with compareAtPrice (on sale)
        const response = await catalogService.getProducts({ limit: '50' });
        const dealsOnly = response.data.filter(p => p.compareAtPrice && parseFloat(p.compareAtPrice) > parseFloat(p.price));
        setProducts(dealsOnly);
      } catch (error) {
        console.error('Failed to fetch deals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  const calculateDiscount = (price: string, compareAt: string) => {
    const p = parseFloat(price);
    const c = parseFloat(compareAt);
    return Math.round(((c - p) / c) * 100);
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="xl">
          <Stack spacing={2} alignItems="center" textAlign="center">
            <LocalOfferIcon sx={{ fontSize: 48 }} />
            <Typography variant="h2" fontWeight={900}>
              Today's Best Deals
            </Typography>
            <Typography variant="h6" sx={{ maxWidth: 600, opacity: 0.95 }}>
              Save big on quality auto parts. Limited-time offers and exclusive discounts updated daily.
            </Typography>
          </Stack>
        </Container>
      </HeroSection>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Deal Categories */}
        <Paper elevation={0} sx={{ mb: 4, borderRadius: 2 }}>
          <Tabs
            value={selectedTab}
            onChange={(_, newValue) => setSelectedTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="All Deals" icon={<LocalOfferIcon />} iconPosition="start" />
            <Tab label="Hot Deals" icon={<TrendingUpIcon />} iconPosition="start" />
            <Tab label="New Arrivals" icon={<NewReleasesIcon />} iconPosition="start" />
            <Tab label="Clearance" icon={<StarIcon />} iconPosition="start" />
          </Tabs>
        </Paper>

        {/* Stats Bar */}
        <Stack direction="row" spacing={2} sx={{ mb: 4, flexWrap: 'wrap' }}>
          <StatCard
            label="Active Deals"
            value="50+"
            icon={LocalOfferIcon}
            color="error.main"
          />
          <StatCard
            label="Max Savings"
            value="Up to 60%"
            icon={TrendingUpIcon}
            color="success.main"
          />
          <StatCard
            label="Ending Soon"
            value="12"
            icon={AccessTimeIcon}
            color="warning.main"
          />
          <StatCard
            label="Fresh Deals"
            value="New Daily"
            icon={NewReleasesIcon}
            color="info.main"
          />
        </Stack>

        {/* Deals Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={48} />
          </Box>
        ) : products.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No deals available at the moment. Check back soon!
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {products.map((product) => {
              const discount = product.compareAtPrice ? calculateDiscount(product.price, product.compareAtPrice) : 0;
              const isHotDeal = discount >= 40;
              const isFeatured = product.isFeatured;
              
              return (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <Card>
                    <DealCard>
                      {/* Tag Badge */}
                      {(isHotDeal || isFeatured) && (
                        <Chip
                          label={isHotDeal ? 'Hot Deal' : 'Featured'}
                          color={isHotDeal ? 'error' : 'success'}
                          size="small"
                          sx={{ position: 'absolute', top: 12, left: 12, zIndex: 1, fontWeight: 600 }}
                        />
                      )}

                      {/* Discount Badge */}
                      {discount > 0 && <DiscountBadge>-{discount}%</DiscountBadge>}

                      {/* Product Image */}
                      <ProductImage 
                        src={product.imageUrl || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300&h=200&fit=crop'} 
                        alt={product.name} 
                      />

                      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* SKU */}
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                          {product.sku}
                        </Typography>

                        {/* Product Name */}
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 1, flex: 1 }}>
                          {product.name}
                        </Typography>

                        {/* Pricing */}
                        <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 2 }}>
                          <Typography variant="h5" fontWeight={700} color="primary.main">
                            ${parseFloat(product.price).toFixed(2)}
                          </Typography>
                          {product.compareAtPrice && (
                            <Typography variant="body2" component="span">
                              <StrikePrice>${parseFloat(product.compareAtPrice).toFixed(2)}</StrikePrice>
                            </Typography>
                          )}
                        </Stack>

                        {/* Stock Status */}
                        <Stack direction="row" alignItems="center" gap={0.5} sx={{ mb: 2 }}>
                          {product.stockQuantity > 0 ? (
                            <>
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                              <Typography variant="caption" color="success.main" fontWeight={600}>
                                {product.stockQuantity} in stock
                              </Typography>
                            </>
                          ) : (
                            <>
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} />
                              <Typography variant="caption" color="error.main" fontWeight={600}>
                                Out of stock
                              </Typography>
                            </>
                          )}
                        </Stack>

                        {/* Actions */}
                        <Button 
                          fullWidth 
                          variant="primary"
                          disabled={product.stockQuantity === 0}
                        >
                          {product.stockQuantity > 0 ? 'Add to Cart' : 'Notify Me'}
                        </Button>
                      </Box>
                    </DealCard>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Load More */}
        {!loading && products.length > 0 && (
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button variant="outlined" size="large">
              Load More Deals
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default DealsPage;
