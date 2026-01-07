import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Category, Brand } from '../entities/index.js';
import { slugify } from '../utils/slug.js';

// Import entity classes for instantiation

const CATEGORIES = [
  {
    name: 'Lighting',
    description: 'Vehicle lighting components including headlights, tail lights, and fog lights',
    children: [
      { name: 'Tail Lights', description: 'Tail light assemblies and components' },
      { name: 'Headlights', description: 'Headlight assemblies and components' },
      { name: 'Fog Lights', description: 'Fog light assemblies and components' },
      { name: 'Turn Signals', description: 'Turn signal lights and assemblies' },
      { name: 'Marker Lights', description: 'Side marker and corner lights' },
    ],
  },
  {
    name: 'Exterior',
    description: 'Exterior body parts and accessories',
    children: [
      { name: 'Bumpers & Components', description: 'Front and rear bumpers, reinforcements, and covers' },
      { name: 'Fenders & Components', description: 'Fenders, liners, and wheel opening moldings' },
      { name: 'Grilles & Components', description: 'Front grilles and grille assemblies' },
      { name: 'Mirrors', description: 'Side mirrors and mirror components' },
      { name: 'Hoods', description: 'Engine hoods and hood components' },
      { name: 'Doors & Components', description: 'Door panels, handles, and components' },
    ],
  },
  {
    name: 'Cooling',
    description: 'Engine cooling system components',
    children: [
      { name: 'Radiators & Components', description: 'Radiators, supports, and splash shields' },
      { name: 'Water Pumps', description: 'Cooling system water pumps' },
      { name: 'Thermostats', description: 'Cooling system thermostats' },
      { name: 'Cooling Fans', description: 'Radiator cooling fans and assemblies' },
      { name: 'Hoses & Clamps', description: 'Radiator hoses and clamps' },
    ],
  },
  {
    name: 'Brakes',
    description: 'Brake system components',
    children: [
      { name: 'Brake Pads', description: 'Disc brake pads' },
      { name: 'Brake Rotors', description: 'Disc brake rotors' },
      { name: 'Brake Calipers', description: 'Disc brake calipers' },
      { name: 'Brake Lines', description: 'Brake fluid lines and hoses' },
      { name: 'Brake Hardware', description: 'Brake installation hardware' },
    ],
  },
  {
    name: 'Suspension & Steering',
    description: 'Suspension and steering components',
    children: [
      { name: 'Shocks & Struts', description: 'Shock absorbers and struts' },
      { name: 'Control Arms', description: 'Suspension control arms' },
      { name: 'Ball Joints', description: 'Suspension ball joints' },
      { name: 'Tie Rods', description: 'Steering tie rods' },
      { name: 'Wheel Bearings', description: 'Wheel hub bearings' },
    ],
  },
  {
    name: 'Engine Parts',
    description: 'Engine components and accessories',
    children: [
      { name: 'Air Filters', description: 'Engine air filters' },
      { name: 'Oil Filters', description: 'Engine oil filters' },
      { name: 'Fuel Filters', description: 'Fuel system filters' },
      { name: 'Spark Plugs', description: 'Ignition spark plugs' },
      { name: 'Belts & Hoses', description: 'Engine belts and hoses' },
      { name: 'Gaskets & Seals', description: 'Engine gaskets and seals' },
    ],
  },
  {
    name: 'Electrical',
    description: 'Electrical system components',
    children: [
      { name: 'Batteries', description: 'Automotive batteries' },
      { name: 'Alternators', description: 'Charging system alternators' },
      { name: 'Starters', description: 'Engine starters' },
      { name: 'Sensors', description: 'Vehicle sensors' },
    ],
  },
  {
    name: 'Interior',
    description: 'Interior parts and accessories',
    children: [
      { name: 'Floor Mats', description: 'Car floor mats' },
      { name: 'Seat Covers', description: 'Vehicle seat covers' },
      { name: 'Dash Covers', description: 'Dashboard covers' },
      { name: 'Sun Shades', description: 'Windshield sun shades' },
    ],
  },
  {
    name: 'Exhaust',
    description: 'Exhaust system components',
    children: [
      { name: 'Mufflers', description: 'Exhaust mufflers' },
      { name: 'Catalytic Converters', description: 'Emissions catalytic converters' },
      { name: 'Exhaust Pipes', description: 'Exhaust system pipes' },
      { name: 'Headers', description: 'Performance exhaust headers' },
    ],
  },
];

const BRANDS = [
  { name: 'SN Auto Parts', description: 'Quality OEM replacement parts' },
  { name: 'ACDelco', description: 'OEM parts for GM vehicles' },
  { name: 'Bosch', description: 'Premium automotive parts' },
  { name: 'Denso', description: 'Japanese OEM manufacturer' },
  { name: 'Dorman', description: 'Aftermarket replacement parts' },
  { name: 'Moog', description: 'Steering and suspension specialist' },
  { name: 'Monroe', description: 'Shocks and struts specialist' },
  { name: 'NGK', description: 'Spark plugs and sensors' },
  { name: 'Wagner', description: 'Brake system specialist' },
  { name: 'Raybestos', description: 'Brake components' },
  { name: 'Gates', description: 'Belts and hoses' },
  { name: 'A-Premium', description: 'Quality aftermarket parts' },
  { name: 'TRQ', description: 'Trusted quality parts' },
  { name: 'BuyAutoParts', description: 'Affordable auto parts' },
];

export class CategorySeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    console.log('Seeding categories and brands...');

    let sortOrder = 0;

    for (const categoryData of CATEGORIES) {
      // Check if category exists
      let category = await em.findOne(Category, { name: categoryData.name });

      if (!category) {
        category = new Category();
        category.name = categoryData.name;
        category.slug = slugify(categoryData.name);
        category.description = categoryData.description;
        category.sortOrder = sortOrder++;
        category.isActive = true;
        em.persist(category);
        console.log(`  Created category: ${categoryData.name}`);
      }

      // Create child categories
      if (categoryData.children) {
        for (const childData of categoryData.children) {
          const existingChild = await em.findOne(Category, { name: childData.name });

          if (!existingChild) {
            const child = new Category();
            child.name = childData.name;
            child.slug = slugify(childData.name);
            child.description = childData.description;
            child.parent = category;
            child.sortOrder = sortOrder++;
            child.isActive = true;
            em.persist(child);
            console.log(`    Created subcategory: ${childData.name}`);
          }
        }
      }
    }

    await em.flush();

    // Seed brands
    for (const brandData of BRANDS) {
      const existing = await em.findOne(Brand, { name: brandData.name });

      if (!existing) {
        const brand = new Brand();
        brand.name = brandData.name;
        brand.slug = slugify(brandData.name);
        brand.description = brandData.description;
        brand.isActive = true;
        em.persist(brand);
        console.log(`  Created brand: ${brandData.name}`);
      }
    }

    await em.flush();
    console.log('Categories and brands seeded successfully!');
  }
}

