/**
 * Global Image Assets
 * 
 * Centralized image URLs - easy to swap for local assets later
 */

export const IMAGES = {
  // Hero/Background images
  hero: {
    automotive: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1920&q=80',
    engine: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1920&q=80',
    workshop: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1920&q=80',
  },
  
  // Placeholder images
  placeholder: {
    product: '/images/placeholder-product.png',
    avatar: '/images/placeholder-avatar.png',
    category: '/images/placeholder-category.png',
  },
} as const;
