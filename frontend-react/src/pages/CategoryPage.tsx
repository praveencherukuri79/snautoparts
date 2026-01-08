/**
 * CategoryPage Component
 * 
 * Display products for a specific category
 * Uses real ProductSummary and Category models with catalogService API
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Breadcrumbs,
} from '@mui/material';
import { Button, Link } from '@/primitives';
import { HomeIcon, ChevronRightIcon } from '@/icons';
import { PageLoader, EmptyState, ErrorState, ProductCard } from '@/components';
import { catalogService } from '@/services/catalogService';
import type { ProductSummary, Category } from '@/models';

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [sortBy, setSortBy] = useState('featured');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);
        
        // Fetch category details and products in parallel
        const [categoryData, productsData] = await Promise.all([
          catalogService.getCategoryBySlug(slug),
          catalogService.getProducts({ category: slug, limit: '50' }),
        ]);

        setCategory(categoryData);
        setProducts(productsData.data);
      } catch (err: any) {
        console.error('Failed to fetch category data:', err);
        setError(err.message || 'Failed to load category');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) return <PageLoader />;

  if (error || !category) {
    return (
      <ErrorState
        message={error || 'Category not found'}
        actionLabel="Browse All Categories"
        onAction={() => navigate('/categories')}
      />
    );
  }

  return (
    <Box bgcolor="background.default" minHeight="100vh">
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }} separator={<ChevronRightIcon fontSize="small" />}>
          <Link to="/" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
            <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
            Home
          </Link>
          <Link to="/categories" sx={{ color: 'text.secondary' }}>
            Categories
          </Link>
          <Typography color="text.primary" fontWeight={600}>
            {category.name}
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Stack spacing={2} sx={{ mb: 4 }}>
          <Typography variant="h3" fontWeight={900}>
            {category.name}
          </Typography>
          {category.description && (
            <Typography variant="h6" color="text.secondary">
              {category.description}
            </Typography>
          )}
        </Stack>

        {/* Toolbar */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography color="text.secondary">
            {products.length} {products.length === 1 ? 'product' : 'products'} found
          </Typography>

          {/* Sort Controls */}
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
        </Stack>

        {/* Products Grid */}
        {products.length === 0 ? (
          <EmptyState
            message="No products available in this category yet."
            actionLabel="Browse All Products"
            onAction={() => navigate('/shop')}
          />
        ) : (
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Load More */}
        {products.length > 0 && products.length >= 50 && (
          <Box textAlign="center" mt={4}>
            <Button variant="outlined" size="large">
              Load More Products
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default CategoryPage;
