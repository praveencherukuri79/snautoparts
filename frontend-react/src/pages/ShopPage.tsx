/**
 * ShopPage Component
 * 
 * Product listing page with filters, sorting, and pagination
 * Uses real ProductSummary model and catalogService API
 */

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  TextField,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { Button, Card, Checkbox } from '@/primitives';
import { FilterListIcon, CloseIcon, GridViewIcon, ViewListIcon, SearchIcon } from '@/icons';
import { catalogService } from '@/services/catalogService';
import type { ProductSummary, Category, Brand } from '@/models';
import { ProductCard, ProductImage, FilterSidebarPaper, StrikePrice } from './ShopPage.styles';

const ShopPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes, brandsRes] = await Promise.all([
          catalogService.getProducts({ limit: '50' }),
          catalogService.getCategories(),
          catalogService.getBrands(),
        ]);
        setProducts(productsRes.data);
        setCategories(categoriesRes);
        setBrands(brandsRes);
      } catch (error) {
        console.error('Failed to fetch shop data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
  };

  const renderFilterList = (items: string[], selectedItems: string[], onToggle: (item: string) => void) => (
    <List dense>
      {items.map((item) => (
        <ListItem key={item} disablePadding>
          <ListItemButton onClick={() => onToggle(item)}>
            <Checkbox checked={selectedItems.includes(item)} sx={{ mr: 1 }} />
            <ListItemText primary={item} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );

  const FilterSidebar = () => (
    <Box>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Categories
      </Typography>
      {renderFilterList(categories.map(c => c.name), selectedCategories, toggleCategory)}

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Brands
      </Typography>
      {renderFilterList(brands.map(b => b.name), selectedBrands, toggleBrand)}

      {/* Clear Filters */}
      {(selectedCategories.length > 0 || selectedBrands.length > 0) && (
        <>
          <Divider sx={{ my: 2 }} />
          <Button variant="outlined" fullWidth onClick={clearFilters}>
            Clear All Filters
          </Button>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Stack spacing={3} sx={{ mb: 4 }}>
          <Typography variant="h3" fontWeight={900}>
            Shop All Products
          </Typography>
          
          {/* Search Bar */}
          <TextField
            fullWidth
            placeholder="Search products..."
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          {/* Toolbar */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            {/* Filter Button (Mobile) */}
            {isMobile && (
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setFilterDrawerOpen(true)}
              >
                Filters
              </Button>
            )}

            {/* Active Filters */}
            {(selectedCategories.length > 0 || selectedBrands.length > 0) && (
              <Stack direction="row" gap={1} flexWrap="wrap">
                {selectedCategories.map((cat) => (
                  <Chip
                    key={cat}
                    label={cat}
                    onDelete={() => toggleCategory(cat)}
                    size="small"
                  />
                ))}
                {selectedBrands.map((brand) => (
                  <Chip
                    key={brand}
                    label={brand}
                    onDelete={() => toggleBrand(brand)}
                    size="small"
                  />
                ))}
              </Stack>
            )}

            {/* Sort & View Controls */}
            <Stack direction="row" gap={2} alignItems="center" ml="auto">
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Sort By</InputLabel>
                <Select value={sortBy} label="Sort By" onChange={(e) => setSortBy(e.target.value)}>
                  <MenuItem value="featured">Featured</MenuItem>
                  <MenuItem value="price-low">Price: Low to High</MenuItem>
                  <MenuItem value="price-high">Price: High to Low</MenuItem>
                  <MenuItem value="rating">Highest Rated</MenuItem>
                  <MenuItem value="newest">Newest</MenuItem>
                </Select>
              </FormControl>

              {!isMobile && (
                <Stack direction="row" gap={0.5}>
                  <IconButton
                    onClick={() => setViewMode('grid')}
                    color={viewMode === 'grid' ? 'primary' : 'default'}
                  >
                    <GridViewIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => setViewMode('list')}
                    color={viewMode === 'list' ? 'primary' : 'default'}
                  >
                    <ViewListIcon />
                  </IconButton>
                </Stack>
              )}
            </Stack>
          </Stack>
        </Stack>

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Sidebar Filters (Desktop) */}
          {!isMobile && (
            <Grid item md={3}>
              <FilterSidebarPaper elevation={0}>
                <FilterSidebar />
              </FilterSidebarPaper>
            </Grid>
          )}

          {/* Products Grid */}
          <Grid item xs={12} md={isMobile ? 12 : 9}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress size={48} />
              </Box>
            ) : products.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  No products found. Try adjusting your filters.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {products.map((product) => (
                <Grid item xs={12} sm={6} lg={viewMode === 'grid' ? 4 : 12} key={product.id}>
                  <Card>
                    <ProductCard sx={{ flexDirection: viewMode === 'list' ? 'row' : 'column' }}>
                      {/* Product Image */}
                      <ProductImage
                        src={product.imageUrl || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300&h=200&fit=crop'}
                        alt={product.name}
                        style={{
                          width: viewMode === 'list' ? 200 : '100%',
                          height: viewMode === 'list' ? 150 : 200,
                        }}
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
                        <Typography variant="h5" fontWeight={700} color={product.compareAtPrice ? 'error.main' : 'text.primary'}>
                          ${parseFloat(product.price).toFixed(2)}
                        </Typography>
                        {product.compareAtPrice && (
                          <Typography variant="body2" component="span">
                            <StrikePrice>${parseFloat(product.compareAtPrice).toFixed(2)}</StrikePrice>
                          </Typography>
                        )}
                      </Stack>

                      {/* Stock Status */}
                      <Typography
                        variant="body2"
                        color={product.stockQuantity > 0 ? 'success.main' : 'error.main'}
                        fontWeight={600}
                        sx={{ mb: 2 }}
                      >
                        {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of Stock'}
                      </Typography>

                      {/* Actions */}
                      <Button fullWidth variant="primary" disabled={product.stockQuantity === 0}>
                        {product.stockQuantity > 0 ? 'Add to Cart' : 'Notify Me'}
                      </Button>
                    </Box>
                    </ProductCard>
                  </Card>
                </Grid>
              ))}
              </Grid>
            )}

            {/* Load More */}
            {!loading && products.length > 0 && (
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Button variant="outlined" size="large">
                  Load More Products
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Mobile Filter Drawer */}
      <Drawer
        anchor="left"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
      >
        <Box sx={{ width: 300, p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>
              Filters
            </Typography>
            <IconButton onClick={() => setFilterDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <FilterSidebar />
        </Box>
      </Drawer>
    </Box>
  );
};

export default ShopPage;
