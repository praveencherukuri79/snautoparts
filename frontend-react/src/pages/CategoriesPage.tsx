/**
 * CategoriesPage Component
 * 
 * Browse all product categories
 * Uses real Category model and catalogService API
 */

import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Stack } from '@mui/material';
import { Card } from '@/primitives';
import { PageLoader, EmptyState } from '@/components';
import { catalogService } from '@/services/catalogService';
import type { Category } from '@/models';
import { Link } from 'react-router-dom';
import { CategoryCard, CategoryImage, CategoryOverlay } from './CategoriesPage.styles';

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await catalogService.getCategories();
        setCategories(data.filter(cat => cat.isActive));
      } catch (err: any) {
        console.error('Failed to fetch categories:', err);
        setError(err.message || 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return <PageLoader />;

  if (error) {
    return (
      <Box bgcolor="background.default" minHeight="100vh">
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Typography variant="h6" color="error" textAlign="center">
            {error}
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box bgcolor="background.default" minHeight="100vh">
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Stack spacing={2} sx={{ mb: 4 }}>
          <Typography variant="h3" fontWeight={900}>
            Shop by Category
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Browse our extensive collection of auto parts organized by category
          </Typography>
        </Stack>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <EmptyState message="No categories available at the moment." />
        ) : (
          <Grid container spacing={3}>
            {categories.map((category) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={category.id}>
                <Link to={`/categories/${category.slug}`} style={{ textDecoration: 'none' }}>
                  <Card>
                    <CategoryCard>
                      <CategoryImage
                        src={category.imageUrl || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop'}
                        alt={category.name}
                      />
                      <CategoryOverlay className="category-overlay">
                        <Typography variant="h6" fontWeight={700} color="common.white" textAlign="center">
                          {category.name}
                        </Typography>
                        {category.description && (
                          <Typography variant="body2" color="common.white" textAlign="center" sx={{ opacity: 0.9, mt: 0.5 }}>
                            {category.description}
                          </Typography>
                        )}
                      </CategoryOverlay>
                    </CategoryCard>
                  </Card>
                </Link>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default CategoriesPage;

