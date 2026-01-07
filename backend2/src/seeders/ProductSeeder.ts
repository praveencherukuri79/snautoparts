import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Product, Category, Brand, ProductFitment, FulfillmentType } from '../entities/index.js';
import { slugify } from '../utils/slug.js';

// Sample products for each category
const SAMPLE_PRODUCTS = [
  {
    sku: 'SNP-AF001',
    name: 'Premium Engine Air Filter',
    description: 'High-performance engine air filter with advanced filtration technology. Improves airflow and engine efficiency.',
    price: '24.99',
    compareAtPrice: '34.99',
    costPrice: '12.50',
    category: 'Air Filters',
    brand: 'Bosch',
    stockQuantity: 150,
    isFeatured: true,
    fitments: [
      { make: 'Toyota', model: 'Camry', yearStart: 2018, yearEnd: 2024 },
      { make: 'Toyota', model: 'RAV4', yearStart: 2019, yearEnd: 2024 },
    ],
  },
  {
    sku: 'SNP-OF002',
    name: 'Synthetic Oil Filter',
    description: 'Full synthetic oil filter designed for extended drain intervals. Advanced media for superior protection.',
    price: '12.99',
    costPrice: '6.00',
    category: 'Oil Filters',
    brand: 'ACDelco',
    stockQuantity: 200,
    fitments: [
      { make: 'Chevrolet', model: 'Silverado', yearStart: 2014, yearEnd: 2024 },
      { make: 'GMC', model: 'Sierra', yearStart: 2014, yearEnd: 2024 },
    ],
  },
  {
    sku: 'SNP-BP003',
    name: 'Ceramic Brake Pads Front',
    description: 'Premium ceramic brake pads for quiet, dust-free braking. OE replacement quality.',
    price: '49.99',
    compareAtPrice: '69.99',
    costPrice: '25.00',
    category: 'Brake Pads',
    brand: 'Wagner',
    stockQuantity: 80,
    isFeatured: true,
    fitments: [
      { make: 'Honda', model: 'Accord', yearStart: 2018, yearEnd: 2024 },
      { make: 'Honda', model: 'Civic', yearStart: 2016, yearEnd: 2024 },
    ],
  },
  {
    sku: 'SNP-BR004',
    name: 'Drilled & Slotted Brake Rotors',
    description: 'Performance brake rotors with drilled and slotted design for improved cooling and stopping power.',
    price: '89.99',
    costPrice: '45.00',
    category: 'Brake Rotors',
    brand: 'Raybestos',
    stockQuantity: 45,
    fitments: [
      { make: 'Ford', model: 'F-150', yearStart: 2015, yearEnd: 2024 },
      { make: 'Ford', model: 'Expedition', yearStart: 2018, yearEnd: 2024 },
    ],
  },
  {
    sku: 'SNP-SS005',
    name: 'Premium Gas Shock Absorber',
    description: 'Gas-charged shock absorber for improved ride quality and handling. Direct OE replacement.',
    price: '69.99',
    costPrice: '35.00',
    category: 'Shocks & Struts',
    brand: 'Monroe',
    stockQuantity: 60,
    isFeatured: true,
    fitments: [
      { make: 'Toyota', model: 'Tacoma', yearStart: 2016, yearEnd: 2024 },
      { make: 'Toyota', model: '4Runner', yearStart: 2015, yearEnd: 2024 },
    ],
  },
  {
    sku: 'SNP-SP006',
    name: 'Iridium Spark Plugs (Set of 4)',
    description: 'Long-life iridium spark plugs for improved fuel efficiency and performance.',
    price: '39.99',
    costPrice: '20.00',
    category: 'Spark Plugs',
    brand: 'NGK',
    stockQuantity: 100,
    fitments: [
      { make: 'Nissan', model: 'Altima', yearStart: 2013, yearEnd: 2024 },
      { make: 'Nissan', model: 'Rogue', yearStart: 2014, yearEnd: 2024 },
    ],
  },
  {
    sku: 'SNP-WP007',
    name: 'OEM Water Pump',
    description: 'Direct replacement water pump with premium bearings and impeller design.',
    price: '79.99',
    costPrice: '40.00',
    category: 'Water Pumps',
    brand: 'Denso',
    stockQuantity: 35,
    fitments: [
      { make: 'Lexus', model: 'RX350', yearStart: 2016, yearEnd: 2024 },
      { make: 'Toyota', model: 'Highlander', yearStart: 2014, yearEnd: 2024 },
    ],
  },
  {
    sku: 'SNP-TR008',
    name: 'Steering Tie Rod End',
    description: 'Heavy-duty tie rod end with precision ball stud for reliable steering performance.',
    price: '34.99',
    costPrice: '17.00',
    category: 'Tie Rods',
    brand: 'Moog',
    stockQuantity: 90,
    fitments: [
      { make: 'Chevrolet', model: 'Tahoe', yearStart: 2015, yearEnd: 2024 },
      { make: 'GMC', model: 'Yukon', yearStart: 2015, yearEnd: 2024 },
    ],
  },
  {
    sku: 'SNP-SB009',
    name: 'Serpentine Belt',
    description: 'Premium EPDM serpentine belt for quiet operation and long service life.',
    price: '29.99',
    costPrice: '15.00',
    category: 'Belts & Hoses',
    brand: 'Gates',
    stockQuantity: 120,
    fitments: [
      { make: 'BMW', model: '3 Series', yearStart: 2012, yearEnd: 2024 },
      { make: 'BMW', model: '5 Series', yearStart: 2011, yearEnd: 2024 },
    ],
  },
  {
    sku: 'SNP-AL010',
    name: 'Remanufactured Alternator',
    description: '100% tested remanufactured alternator with premium components and lifetime warranty.',
    price: '149.99',
    compareAtPrice: '199.99',
    costPrice: '75.00',
    category: 'Alternators',
    brand: 'ACDelco',
    stockQuantity: 25,
    fitments: [
      { make: 'Jeep', model: 'Grand Cherokee', yearStart: 2014, yearEnd: 2024 },
      { make: 'Dodge', model: 'Durango', yearStart: 2014, yearEnd: 2024 },
    ],
  },
];

export class ProductSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    console.log('Seeding sample products...');

    for (const productData of SAMPLE_PRODUCTS) {
      // Check if product exists
      const existing = await em.findOne(Product, { sku: productData.sku });
      if (existing) {
        console.log(`  Product already exists: ${productData.sku}`);
        continue;
      }

      // Find category
      const category = await em.findOne(Category, { name: productData.category });
      if (!category) {
        console.log(`  Category not found: ${productData.category}, skipping ${productData.sku}`);
        continue;
      }

      // Find brand
      const brand = productData.brand ? await em.findOne(Brand, { name: productData.brand }) : undefined;

      // Create product
      const product = new Product();
      product.sku = productData.sku;
      product.name = productData.name;
      product.slug = slugify(productData.name);
      product.description = productData.description;
      product.price = productData.price;
      product.compareAtPrice = productData.compareAtPrice;
      product.costPrice = productData.costPrice;
      product.category = category;
      product.brand = brand ?? undefined;
      product.stockQuantity = productData.stockQuantity;
      product.isFeatured = productData.isFeatured ?? false;
      product.fulfillmentType = FulfillmentType.INVENTORY;
      product.isActive = true;
      em.persist(product);

      // Create fitments
      if (productData.fitments) {
        for (const fitmentData of productData.fitments) {
          const fitment = em.create(ProductFitment, {
            product,
            make: fitmentData.make,
            model: fitmentData.model,
            yearStart: fitmentData.yearStart,
            yearEnd: fitmentData.yearEnd,
          });
          em.persist(fitment);
        }
      }

      console.log(`  Created product: ${productData.sku} - ${productData.name}`);
    }

    await em.flush();
    console.log('Sample products seeded successfully!');
  }
}

