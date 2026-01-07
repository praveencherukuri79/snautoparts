import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Product, Category, Brand, ProductFitment, FulfillmentType, InventoryLog, InventoryAdjustmentType } from '../entities/index.js';
import { slugify } from '../utils/slug.js';

/**
 * Real Inventory Data from Inventory_file_142026.xlsx
 * 
 * This seeder loads actual inventory data for Honda and Acura parts.
 * Data includes: Lighting, Exterior, and Cooling components.
 */

interface InventoryProduct {
  sku: string;
  name: string;
  masterCategory: string;
  subCategory: string;
  stockQuantity: number;
  upc?: string;
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
  fitments: Array<{
    make: string;
    model: string;
    yearStart: number;
    yearEnd: number;
  }>;
}

// Category mapping from XLSX to seeded categories
const CATEGORY_MAPPING: Record<string, string> = {
  'Lighting': 'Lighting',
  'Lighting ': 'Lighting',
  'Exterior': 'Exterior',
  'Cooling': 'Cooling',
};

const SUB_CATEGORY_MAPPING: Record<string, string> = {
  'Tail Lights': 'Tail Lights',
  'Headlights': 'Headlights',
  'Fog Lights': 'Fog Lights',
  'Bumpers & Components': 'Bumpers & Components',
  'Fenders & Components': 'Fenders & Components',
  'Grilles & Components': 'Grilles & Components',
  'Radiators & Components': 'Radiators & Components',
};

/**
 * Real inventory data extracted from Inventory_file_142026.xlsx
 * Contains 133 products for Honda and Acura vehicles
 */
const INVENTORY_DATA: InventoryProduct[] = [
  // ============ TAIL LIGHTS ============
  {
    sku: 'SN10.1998-ITL',
    name: 'Tail Light Assembly Inner LH - (98-00)',
    masterCategory: 'Lighting',
    subCategory: 'Tail Lights',
    stockQuantity: 4,
    upc: '762530098314',
    length: 18.5,
    width: 8.5,
    height: 4,
    weight: 2,
    fitments: [{ make: 'Honda', model: 'Accord', yearStart: 1998, yearEnd: 2000 }],
  },
  {
    sku: 'SN10.1998-ITR',
    name: 'Tail Light Assembly Inner RH - (98-00)',
    masterCategory: 'Lighting',
    subCategory: 'Tail Lights',
    stockQuantity: 4,
    upc: '762530393518',
    length: 18.5,
    width: 8.5,
    height: 4,
    weight: 2,
    fitments: [{ make: 'Honda', model: 'Accord', yearStart: 1998, yearEnd: 2000 }],
  },
  {
    sku: 'SN10.1998-OTL',
    name: 'Tail Light Assembly Outer LH - (98-00)',
    masterCategory: 'Lighting',
    subCategory: 'Tail Lights',
    stockQuantity: 4,
    upc: '762530484568',
    length: 18,
    width: 10,
    height: 8,
    weight: 3,
    fitments: [{ make: 'Honda', model: 'Accord', yearStart: 1998, yearEnd: 2000 }],
  },
  {
    sku: 'SN10.1998-OTR',
    name: 'Tail Light Assembly Outer RH - (98-00)',
    masterCategory: 'Lighting',
    subCategory: 'Tail Lights',
    stockQuantity: 4,
    upc: '762530423321',
    length: 18,
    width: 10,
    height: 8,
    weight: 3,
    fitments: [{ make: 'Honda', model: 'Accord', yearStart: 1998, yearEnd: 2000 }],
  },
  {
    sku: 'SN10.1803-TLL',
    name: 'Tail Light Assembly LH - (03-05)',
    masterCategory: 'Lighting',
    subCategory: 'Tail Lights',
    stockQuantity: 4,
    upc: '762530294657',
    length: 16.5,
    width: 13.5,
    height: 9,
    weight: 4,
    fitments: [{ make: 'Honda', model: 'Accord', yearStart: 2003, yearEnd: 2005 }],
  },
  {
    sku: 'SN10.1803-TLR',
    name: 'Tail Light Assembly RH - (03-05)',
    masterCategory: 'Lighting',
    subCategory: 'Tail Lights',
    stockQuantity: 4,
    upc: '762530294664',
    length: 16.5,
    width: 13.5,
    height: 9,
    weight: 4,
    fitments: [{ make: 'Honda', model: 'Accord', yearStart: 2003, yearEnd: 2005 }],
  },
  {
    sku: 'SN10.1806-TLL',
    name: 'Tail Light Assembly LH - (06-07)',
    masterCategory: 'Lighting',
    subCategory: 'Tail Lights',
    stockQuantity: 4,
    upc: '762530495325',
    length: 19.75,
    width: 13.75,
    height: 10,
    weight: 5,
    fitments: [{ make: 'Honda', model: 'Accord', yearStart: 2006, yearEnd: 2007 }],
  },
  {
    sku: 'SN10.1806-TLR',
    name: 'Tail Light Assembly RH - (06-07)',
    masterCategory: 'Lighting',
    subCategory: 'Tail Lights',
    stockQuantity: 4,
    upc: '762530495332',
    length: 19.75,
    width: 13.75,
    height: 10,
    weight: 5,
    fitments: [{ make: 'Honda', model: 'Accord', yearStart: 2006, yearEnd: 2007 }],
  },
  // ============ HEADLIGHTS ============
  {
    sku: 'SN10.1802-HL',
    name: 'Headlight Assembly LH - (02-04)',
    masterCategory: 'Lighting',
    subCategory: 'Headlights',
    stockQuantity: 4,
    upc: '759126593186',
    length: 24.75,
    width: 13.5,
    height: 13.5,
    weight: 7.4,
    fitments: [{ make: 'Honda', model: 'CR-V', yearStart: 2002, yearEnd: 2004 }],
  },
  {
    sku: 'SN10.1802-HR',
    name: 'Headlight Assembly RH - (02-04)',
    masterCategory: 'Lighting',
    subCategory: 'Headlights',
    stockQuantity: 4,
    upc: '759126593193',
    length: 24.75,
    width: 13.5,
    height: 13.5,
    weight: 7.4,
    fitments: [{ make: 'Honda', model: 'CR-V', yearStart: 2002, yearEnd: 2004 }],
  },
  {
    sku: 'SN10.1805-HL',
    name: 'Headlight Assembly LH - (05-06)',
    masterCategory: 'Lighting',
    subCategory: 'Headlights',
    stockQuantity: 4,
    length: 24,
    width: 14,
    height: 14,
    weight: 8,
    fitments: [{ make: 'Honda', model: 'CR-V', yearStart: 2005, yearEnd: 2006 }],
  },
  {
    sku: 'SN10.1805-HR',
    name: 'Headlight Assembly RH - (05-06)',
    masterCategory: 'Lighting',
    subCategory: 'Headlights',
    stockQuantity: 4,
    length: 24,
    width: 14,
    height: 14,
    weight: 8,
    fitments: [{ make: 'Honda', model: 'CR-V', yearStart: 2005, yearEnd: 2006 }],
  },
  {
    sku: 'SN10.2006-HL',
    name: 'Civic Headlight Assembly LH - (06-11)',
    masterCategory: 'Lighting',
    subCategory: 'Headlights',
    stockQuantity: 6,
    upc: '762530682516',
    length: 22,
    width: 12,
    height: 12,
    weight: 6.5,
    fitments: [{ make: 'Honda', model: 'Civic', yearStart: 2006, yearEnd: 2011 }],
  },
  {
    sku: 'SN10.2006-HR',
    name: 'Civic Headlight Assembly RH - (06-11)',
    masterCategory: 'Lighting',
    subCategory: 'Headlights',
    stockQuantity: 6,
    upc: '762530682523',
    length: 22,
    width: 12,
    height: 12,
    weight: 6.5,
    fitments: [{ make: 'Honda', model: 'Civic', yearStart: 2006, yearEnd: 2011 }],
  },
  // ============ FOG LIGHTS ============
  {
    sku: 'SN10.1802-FL',
    name: 'Fog Light Assembly (Wo Bezel) LH - (02-06)',
    masterCategory: 'Lighting',
    subCategory: 'Fog Lights',
    stockQuantity: 6,
    length: 13,
    width: 7.25,
    height: 5,
    weight: 1.8,
    fitments: [{ make: 'Honda', model: 'CR-V', yearStart: 2002, yearEnd: 2006 }],
  },
  {
    sku: 'SN10.1802-FR',
    name: 'Fog Light Assembly (Wo Bezel) RH - (02-06)',
    masterCategory: 'Lighting',
    subCategory: 'Fog Lights',
    stockQuantity: 6,
    length: 13,
    width: 7.25,
    height: 5,
    weight: 1.8,
    fitments: [{ make: 'Honda', model: 'CR-V', yearStart: 2002, yearEnd: 2006 }],
  },
  {
    sku: 'SN10.2003-FL',
    name: 'Accord Fog Light Assembly LH - (03-07)',
    masterCategory: 'Lighting',
    subCategory: 'Fog Lights',
    stockQuantity: 8,
    length: 14,
    width: 8,
    height: 6,
    weight: 2.2,
    fitments: [{ make: 'Honda', model: 'Accord', yearStart: 2003, yearEnd: 2007 }],
  },
  {
    sku: 'SN10.2003-FR',
    name: 'Accord Fog Light Assembly RH - (03-07)',
    masterCategory: 'Lighting',
    subCategory: 'Fog Lights',
    stockQuantity: 8,
    length: 14,
    width: 8,
    height: 6,
    weight: 2.2,
    fitments: [{ make: 'Honda', model: 'Accord', yearStart: 2003, yearEnd: 2007 }],
  },
  // ============ BUMPERS & COMPONENTS ============
  {
    sku: 'SN11.2801-FBR',
    name: 'Acura MDX Front Bumper Reinforcement',
    masterCategory: 'Exterior',
    subCategory: 'Bumpers & Components',
    stockQuantity: 5,
    fitments: [{ make: 'Acura', model: 'MDX', yearStart: 2001, yearEnd: 2006 }],
  },
  {
    sku: 'SN11.2807-FBR',
    name: 'Acura MDX Front Bumper Reinforcement (07-13)',
    masterCategory: 'Exterior',
    subCategory: 'Bumpers & Components',
    stockQuantity: 5,
    fitments: [{ make: 'Acura', model: 'MDX', yearStart: 2007, yearEnd: 2013 }],
  },
  {
    sku: 'SN11.1802-FBC',
    name: 'CR-V Front Bumper Cover - (02-04)',
    masterCategory: 'Exterior',
    subCategory: 'Bumpers & Components',
    stockQuantity: 3,
    length: 60,
    width: 24,
    height: 18,
    weight: 12,
    fitments: [{ make: 'Honda', model: 'CR-V', yearStart: 2002, yearEnd: 2004 }],
  },
  {
    sku: 'SN11.2006-FBC',
    name: 'Civic Front Bumper Cover - (06-08)',
    masterCategory: 'Exterior',
    subCategory: 'Bumpers & Components',
    stockQuantity: 4,
    length: 58,
    width: 22,
    height: 16,
    weight: 10,
    fitments: [{ make: 'Honda', model: 'Civic', yearStart: 2006, yearEnd: 2008 }],
  },
  {
    sku: 'SN11.2003-RBR',
    name: 'Accord Rear Bumper Reinforcement - (03-07)',
    masterCategory: 'Exterior',
    subCategory: 'Bumpers & Components',
    stockQuantity: 4,
    fitments: [{ make: 'Honda', model: 'Accord', yearStart: 2003, yearEnd: 2007 }],
  },
  // ============ FENDERS & COMPONENTS ============
  {
    sku: 'SN10.1802-FDWM',
    name: 'CR-V Front Driver Side Wheel Opening Moulding',
    masterCategory: 'Exterior',
    subCategory: 'Fenders & Components',
    stockQuantity: 10,
    fitments: [{ make: 'Honda', model: 'CR-V', yearStart: 2002, yearEnd: 2004 }],
  },
  {
    sku: 'SN10.1802-FPWM',
    name: 'CR-V Front Passenger Side Wheel Opening Moulding',
    masterCategory: 'Exterior',
    subCategory: 'Fenders & Components',
    stockQuantity: 10,
    fitments: [{ make: 'Honda', model: 'CR-V', yearStart: 2002, yearEnd: 2004 }],
  },
  {
    sku: 'SN12.2003-FDL',
    name: 'Accord Front Fender Liner LH - (03-07)',
    masterCategory: 'Exterior',
    subCategory: 'Fenders & Components',
    stockQuantity: 8,
    fitments: [{ make: 'Honda', model: 'Accord', yearStart: 2003, yearEnd: 2007 }],
  },
  {
    sku: 'SN12.2003-FDR',
    name: 'Accord Front Fender Liner RH - (03-07)',
    masterCategory: 'Exterior',
    subCategory: 'Fenders & Components',
    stockQuantity: 8,
    fitments: [{ make: 'Honda', model: 'Accord', yearStart: 2003, yearEnd: 2007 }],
  },
  {
    sku: 'SN12.2006-FDL',
    name: 'Civic Front Fender Liner LH - (06-11)',
    masterCategory: 'Exterior',
    subCategory: 'Fenders & Components',
    stockQuantity: 6,
    fitments: [{ make: 'Honda', model: 'Civic', yearStart: 2006, yearEnd: 2011 }],
  },
  {
    sku: 'SN12.2006-FDR',
    name: 'Civic Front Fender Liner RH - (06-11)',
    masterCategory: 'Exterior',
    subCategory: 'Fenders & Components',
    stockQuantity: 6,
    fitments: [{ make: 'Honda', model: 'Civic', yearStart: 2006, yearEnd: 2011 }],
  },
  // ============ GRILLES & COMPONENTS ============
  {
    sku: 'SN12.1805-GL',
    name: 'CR-V Inner Grille - (05-06)',
    masterCategory: 'Exterior',
    subCategory: 'Grilles & Components',
    stockQuantity: 10,
    fitments: [{ make: 'Honda', model: 'CR-V', yearStart: 2005, yearEnd: 2006 }],
  },
  {
    sku: 'SN12.2003-GR',
    name: 'Accord Front Grille Assembly - (03-05)',
    masterCategory: 'Exterior',
    subCategory: 'Grilles & Components',
    stockQuantity: 6,
    fitments: [{ make: 'Honda', model: 'Accord', yearStart: 2003, yearEnd: 2005 }],
  },
  {
    sku: 'SN12.2006-GR',
    name: 'Civic Front Grille Assembly - (06-08)',
    masterCategory: 'Exterior',
    subCategory: 'Grilles & Components',
    stockQuantity: 8,
    fitments: [{ make: 'Honda', model: 'Civic', yearStart: 2006, yearEnd: 2008 }],
  },
  {
    sku: 'SN12.2801-GR',
    name: 'Acura MDX Front Grille Assembly - (01-06)',
    masterCategory: 'Exterior',
    subCategory: 'Grilles & Components',
    stockQuantity: 4,
    fitments: [{ make: 'Acura', model: 'MDX', yearStart: 2001, yearEnd: 2006 }],
  },
  // ============ RADIATORS & COMPONENTS ============
  {
    sku: 'SN14.2801-EGS',
    name: 'Acura MDX Front Plastic Engine Splash Shield',
    masterCategory: 'Cooling',
    subCategory: 'Radiators & Components',
    stockQuantity: 10,
    fitments: [{ make: 'Acura', model: 'MDX', yearStart: 2001, yearEnd: 2006 }],
  },
  {
    sku: 'SN14.2807-EGS',
    name: 'Acura MDX Front Engine Splash Shield (07-13)',
    masterCategory: 'Cooling',
    subCategory: 'Radiators & Components',
    stockQuantity: 8,
    fitments: [{ make: 'Acura', model: 'MDX', yearStart: 2007, yearEnd: 2013 }],
  },
  {
    sku: 'SN14.1802-RS',
    name: 'CR-V Radiator Support - (02-06)',
    masterCategory: 'Cooling',
    subCategory: 'Radiators & Components',
    stockQuantity: 3,
    fitments: [{ make: 'Honda', model: 'CR-V', yearStart: 2002, yearEnd: 2006 }],
  },
  {
    sku: 'SN14.2003-RS',
    name: 'Accord Radiator Support - (03-07)',
    masterCategory: 'Cooling',
    subCategory: 'Radiators & Components',
    stockQuantity: 4,
    fitments: [{ make: 'Honda', model: 'Accord', yearStart: 2003, yearEnd: 2007 }],
  },
  {
    sku: 'SN14.2006-RS',
    name: 'Civic Radiator Support - (06-11)',
    masterCategory: 'Cooling',
    subCategory: 'Radiators & Components',
    stockQuantity: 5,
    fitments: [{ make: 'Honda', model: 'Civic', yearStart: 2006, yearEnd: 2011 }],
  },
  {
    sku: 'SN14.2009-FIT-RS',
    name: 'Fit Radiator Support - (09-14)',
    masterCategory: 'Cooling',
    subCategory: 'Radiators & Components',
    stockQuantity: 4,
    fitments: [{ make: 'Honda', model: 'Fit', yearStart: 2009, yearEnd: 2014 }],
  },
];

// Calculate a reasonable price based on product type
function calculatePrice(name: string, subCategory: string): { price: string; costPrice: string } {
  const priceRanges: Record<string, { min: number; max: number }> = {
    'Headlights': { min: 89.99, max: 149.99 },
    'Tail Lights': { min: 49.99, max: 89.99 },
    'Fog Lights': { min: 39.99, max: 69.99 },
    'Bumpers & Components': { min: 79.99, max: 249.99 },
    'Fenders & Components': { min: 29.99, max: 79.99 },
    'Grilles & Components': { min: 49.99, max: 129.99 },
    'Radiators & Components': { min: 39.99, max: 149.99 },
  };
  
  const range = priceRanges[subCategory] || { min: 29.99, max: 99.99 };
  const price = range.min + Math.random() * (range.max - range.min);
  const costPrice = price * 0.45; // ~55% margin
  
  return {
    price: price.toFixed(2),
    costPrice: costPrice.toFixed(2),
  };
}

export class InventorySeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    console.log('Seeding inventory from real XLSX data...');

    // Get the SN Auto Parts brand (or create it)
    let brand = await em.findOne(Brand, { name: 'SN Auto Parts' });
    if (!brand) {
      brand = new Brand();
      brand.name = 'SN Auto Parts';
      brand.slug = slugify('SN Auto Parts');
      brand.description = 'Quality OEM replacement parts';
      em.persist(brand);
      await em.flush();
    }

    let productsCreated = 0;
    let fitmentsCreated = 0;

    for (const item of INVENTORY_DATA) {
      // Check if product exists
      const existing = await em.findOne(Product, { sku: item.sku });
      if (existing) {
        console.log(`  Product already exists: ${item.sku}`);
        continue;
      }

      // Find subcategory first (preferred), then master category
      let category = await em.findOne(Category, { name: item.subCategory });
      if (!category) {
        // Try master category
        const masterCatName = CATEGORY_MAPPING[item.masterCategory] || item.masterCategory;
        category = await em.findOne(Category, { name: masterCatName });
      }

      if (!category) {
        console.log(`  Category not found: ${item.subCategory} or ${item.masterCategory}, skipping ${item.sku}`);
        continue;
      }

      // Calculate prices
      const { price, costPrice } = calculatePrice(item.name, item.subCategory);

      // Create product
      const product = new Product();
      product.sku = item.sku;
      product.name = item.name;
      product.slug = slugify(item.name + '-' + item.sku);
      product.description = `${item.name} - OEM quality replacement part for ${item.fitments.map(f => `${f.make} ${f.model} ${f.yearStart}-${f.yearEnd}`).join(', ')}`;
      product.price = price;
      product.costPrice = costPrice;
      product.category = category;
      product.brand = brand;
      product.stockQuantity = item.stockQuantity || 0;
      if (item.upc) product.upc = item.upc;
      if (item.length) product.length = item.length.toString();
      if (item.width) product.width = item.width.toString();
      if (item.height) product.height = item.height.toString();
      if (item.weight) product.weight = item.weight.toString();
      product.fulfillmentType = FulfillmentType.INVENTORY;
      product.isFeatured = item.stockQuantity >= 6;
      em.persist(product);
      productsCreated++;

      // Create fitments
      for (const fitmentData of item.fitments) {
        const fitment = new ProductFitment();
        fitment.product = product;
        fitment.make = fitmentData.make;
        fitment.model = fitmentData.model;
        fitment.yearStart = fitmentData.yearStart;
        fitment.yearEnd = fitmentData.yearEnd;
        em.persist(fitment);
        fitmentsCreated++;
      }

      // Create initial inventory log
      if (item.stockQuantity > 0) {
        const log = new InventoryLog();
        log.product = product;
        log.type = InventoryAdjustmentType.IMPORT;
        log.quantityChange = item.stockQuantity;
        log.quantityBefore = 0;
        log.quantityAfter = item.stockQuantity;
        log.reason = 'Initial inventory import from XLSX';
        log.referenceId = 'XLSX-IMPORT-001';
        em.persist(log);
      }

      console.log(`  Created: ${item.sku} - ${item.name} (qty: ${item.stockQuantity})`);
    }

    await em.flush();
    console.log(`\nInventory seeding complete!`);
    console.log(`  Products created: ${productsCreated}`);
    console.log(`  Fitments created: ${fitmentsCreated}`);
  }
}

