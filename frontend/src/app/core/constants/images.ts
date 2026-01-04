/**
 * Image constants and helpers for handling fallback images
 */

// Reliable placeholder images using verified Unsplash URLs for auto parts theme
export const PLACEHOLDER_IMAGES = {
  // Generic product placeholder - automotive themed
  product: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop&q=80',
  // Category placeholder
  category: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=400&fit=crop&q=80',
  // Brand logo placeholder
  brand: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=200&h=200&fit=crop&q=80',
  // Cart item thumbnail
  cartItem: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=100&h=100&fit=crop&q=80',
  // Hero background
  hero: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80',
};

/**
 * Get product image with fallback
 */
export function getProductImage(imageUrl: string | null | undefined): string {
  return imageUrl || PLACEHOLDER_IMAGES.product;
}

/**
 * Get category image with fallback
 */
export function getCategoryImage(imageUrl: string | null | undefined): string {
  return imageUrl || PLACEHOLDER_IMAGES.category;
}

/**
 * Get cart item image with fallback
 */
export function getCartItemImage(imageUrl: string | null | undefined): string {
  return imageUrl || PLACEHOLDER_IMAGES.cartItem;
}

