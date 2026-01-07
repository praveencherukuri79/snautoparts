/**
 * Mock data generators for Catalog (Products, Categories, Brands)
 */

export interface MockCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  parentId: string | null;
  productCount: number;
  isActive: boolean;
}

export interface MockBrand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  productCount: number;
}

export interface MockProduct {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice: number | null;
  costPrice: number;
  categoryId: string;
  categoryName: string;
  brandId: string;
  brandName: string;
  imageUrl: string;
  images: string[];
  stockQuantity: number;
  lowStockThreshold: number;
  fulfillmentType: 'INVENTORY' | 'DROPSHIP' | 'MIXED';
  isActive: boolean;
  isFeatured: boolean;
  weight: number;
  weightUnit: string;
  createdAt: string;
  updatedAt: string;
}

const CATEGORY_DATA: Omit<MockCategory, 'id'>[] = [
  { name: 'Engine Parts', slug: 'engine-parts', description: 'Complete engine components and parts', imageUrl: '/assets/images/categories/engine.jpg', parentId: null, productCount: 245, isActive: true },
  { name: 'Brakes', slug: 'brakes', description: 'Brake pads, rotors, and components', imageUrl: '/assets/images/categories/brakes.jpg', parentId: null, productCount: 189, isActive: true },
  { name: 'Suspension', slug: 'suspension', description: 'Shocks, struts, and suspension parts', imageUrl: '/assets/images/categories/suspension.jpg', parentId: null, productCount: 156, isActive: true },
  { name: 'Transmission', slug: 'transmission', description: 'Transmission parts and fluids', imageUrl: '/assets/images/categories/transmission.jpg', parentId: null, productCount: 98, isActive: true },
  { name: 'Electrical', slug: 'electrical', description: 'Batteries, alternators, and electrical components', imageUrl: '/assets/images/categories/electrical.jpg', parentId: null, productCount: 312, isActive: true },
  { name: 'Filters', slug: 'filters', description: 'Oil, air, and fuel filters', imageUrl: '/assets/images/categories/filters.jpg', parentId: null, productCount: 178, isActive: true },
  { name: 'Cooling System', slug: 'cooling-system', description: 'Radiators, water pumps, and cooling parts', imageUrl: '/assets/images/categories/cooling.jpg', parentId: null, productCount: 134, isActive: true },
  { name: 'Exhaust', slug: 'exhaust', description: 'Mufflers, catalytic converters, and exhaust parts', imageUrl: '/assets/images/categories/exhaust.jpg', parentId: null, productCount: 87, isActive: true },
];

const BRAND_DATA: Omit<MockBrand, 'id'>[] = [
  { name: 'Bosch', slug: 'bosch', logoUrl: '/assets/images/brands/bosch.png', productCount: 156 },
  { name: 'Brembo', slug: 'brembo', logoUrl: '/assets/images/brands/brembo.png', productCount: 89 },
  { name: 'Denso', slug: 'denso', logoUrl: '/assets/images/brands/denso.png', productCount: 124 },
  { name: 'NGK', slug: 'ngk', logoUrl: '/assets/images/brands/ngk.png', productCount: 67 },
  { name: 'Bilstein', slug: 'bilstein', logoUrl: '/assets/images/brands/bilstein.png', productCount: 45 },
  { name: 'ACDelco', slug: 'acdelco', logoUrl: '/assets/images/brands/acdelco.png', productCount: 198 },
  { name: 'Moog', slug: 'moog', logoUrl: '/assets/images/brands/moog.png', productCount: 112 },
  { name: 'Monroe', slug: 'monroe', logoUrl: '/assets/images/brands/monroe.png', productCount: 78 },
];

const PRODUCT_NAMES = [
  'Performance Brake Pads',
  'Premium Oil Filter',
  'Spark Plug Set',
  'Air Filter',
  'Transmission Fluid',
  'Alternator 12V 120A',
  'Coil Spring Kit',
  'Shock Absorber',
  'Water Pump Assembly',
  'Radiator Hose',
  'Oxygen Sensor',
  'Ignition Coil',
  'Fuel Pump',
  'Starter Motor',
  'Timing Belt Kit',
];

export function generateCategories(): MockCategory[] {
  return CATEGORY_DATA.map((cat, i) => ({
    ...cat,
    id: `cat-${i + 1}`,
  }));
}

export function generateBrands(): MockBrand[] {
  return BRAND_DATA.map((brand, i) => ({
    ...brand,
    id: `brand-${i + 1}`,
  }));
}

// Unsplash product images (auto parts themed)
const PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop', // car engine
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', // brake disc
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=400&fit=crop', // car parts
  'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&h=400&fit=crop', // car wheel
  'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=400&h=400&fit=crop', // engine bay
  'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=400&h=400&fit=crop', // car detail
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=400&fit=crop', // sports car
  'https://images.unsplash.com/photo-1541348263662-e068662d82af?w=400&h=400&fit=crop', // car interior
  'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&h=400&fit=crop', // car front
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=400&fit=crop', // classic car
];

export function generateProducts(count: number = 20): MockProduct[] {
  const categories = generateCategories();
  const brands = generateBrands();

  return Array.from({ length: count }, (_, i) => {
    const category = categories[i % categories.length];
    const brand = brands[i % brands.length];
    const basePrice = 20 + Math.random() * 200;
    const hasDiscount = Math.random() > 0.7;
    const imageIndex = i % PRODUCT_IMAGES.length;

    return {
      id: `prod-${i + 1}`,
      sku: `SKU-${(1000 + i).toString()}`,
      name: `${brand.name} ${PRODUCT_NAMES[i % PRODUCT_NAMES.length]}`,
      slug: `${brand.slug}-${PRODUCT_NAMES[i % PRODUCT_NAMES.length].toLowerCase().replace(/\s+/g, '-')}-${i}`,
      description: `High-quality ${PRODUCT_NAMES[i % PRODUCT_NAMES.length].toLowerCase()} from ${brand.name}. Designed for optimal performance and durability.`,
      shortDescription: `Premium ${PRODUCT_NAMES[i % PRODUCT_NAMES.length].toLowerCase()} for your vehicle.`,
      price: Math.round(basePrice * 100) / 100,
      compareAtPrice: hasDiscount ? Math.round(basePrice * 1.2 * 100) / 100 : null,
      costPrice: Math.round(basePrice * 0.6 * 100) / 100,
      categoryId: category.id,
      categoryName: category.name,
      brandId: brand.id,
      brandName: brand.name,
      imageUrl: PRODUCT_IMAGES[imageIndex],
      images: [
        PRODUCT_IMAGES[imageIndex],
        PRODUCT_IMAGES[(imageIndex + 1) % PRODUCT_IMAGES.length],
      ],
      stockQuantity: Math.floor(Math.random() * 100),
      lowStockThreshold: 10,
      fulfillmentType: ['INVENTORY', 'DROPSHIP', 'MIXED'][i % 3] as 'INVENTORY' | 'DROPSHIP' | 'MIXED',
      isActive: true,
      isFeatured: i < 5,
      weight: Math.round((0.5 + Math.random() * 5) * 100) / 100,
      weightUnit: 'lb',
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
}

export function generateFeaturedProducts(): MockProduct[] {
  return generateProducts(20).filter(p => p.isFeatured);
}

export function generateFitmentMakes(): string[] {
  return ['Chevrolet', 'Ford', 'Toyota', 'Honda', 'Dodge', 'BMW', 'Mercedes-Benz', 'Audi', 'Nissan', 'Hyundai'];
}

export function generateFitmentModels(make: string): string[] {
  const models: Record<string, string[]> = {
    'Chevrolet': ['Silverado', 'Tahoe', 'Suburban', 'Camaro', 'Corvette', 'Malibu'],
    'Ford': ['F-150', 'Mustang', 'Explorer', 'Escape', 'Edge', 'Bronco'],
    'Toyota': ['Camry', 'Corolla', 'RAV4', 'Tacoma', 'Tundra', 'Highlander'],
    'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot', 'Odyssey', 'HR-V'],
    'Dodge': ['Ram 1500', 'Challenger', 'Charger', 'Durango', 'Journey'],
    'BMW': ['3 Series', '5 Series', 'X3', 'X5', 'M3', 'M5'],
    'Mercedes-Benz': ['C-Class', 'E-Class', 'GLE', 'GLC', 'S-Class'],
    'Audi': ['A4', 'A6', 'Q5', 'Q7', 'A3', 'Q3'],
    'Nissan': ['Altima', 'Sentra', 'Rogue', 'Pathfinder', 'Frontier'],
    'Hyundai': ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Palisade'],
  };
  return models[make] || ['Model A', 'Model B', 'Model C'];
}

export function generateFitmentYears(): number[] {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 35 }, (_, i) => currentYear - i);
}

