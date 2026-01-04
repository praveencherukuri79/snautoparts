import 'dotenv/config';
import { PrismaClient, UserRole } from '@prisma/client';
import { randomBytes, pbkdf2Sync } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

// Build DATABASE_URL from DB_* env vars
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
if (DB_HOST && DB_USER && DB_PASSWORD && DB_NAME) {
  process.env.DATABASE_URL = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}?sslmode=require&channel_binding=require`;
}

const prisma = new PrismaClient();

const hashPassword = (password: string): string => {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

// ============================================
// IMAGE URLS - Reliable auto parts images
// Using verified Unsplash URLs that are known to work
// ============================================

const CATEGORY_IMAGES = {
  brakes: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=600&fit=crop&q=80',
  batteries: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&q=80',
  oil: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=600&h=600&fit=crop&q=80',
  tires: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&h=600&fit=crop&q=80',
  suspension: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=600&fit=crop&q=80',
  tools: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&h=600&fit=crop&q=80',
  filters: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=600&fit=crop&q=80',
  lighting: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=600&h=600&fit=crop&q=80',
};

const PRODUCT_IMAGES = {
  brakeRotor: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=600&fit=crop&q=80',
  brakePads: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&q=80',
  motorOil: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=600&h=600&fit=crop&q=80',
  tire: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&h=600&fit=crop&q=80',
  airFilter: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=600&fit=crop&q=80',
  sparkPlug: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&h=600&fit=crop&q=80',
  battery: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&q=80',
  alternator: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=600&fit=crop&q=80',
  oilFilter: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=600&h=600&fit=crop&q=80',
  headlight: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=600&h=600&fit=crop&q=80',
  shockAbsorber: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=600&fit=crop&q=80',
  wiperBlade: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&q=80',
  enginePart: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=600&fit=crop&q=80',
  carCare: 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=600&h=600&fit=crop&q=80',
};

async function main() {
  console.log('🌱 Seeding database...');

  // ============================================
  // USERS
  // ============================================
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@snautoparts.com' },
    update: {},
    create: {
      email: 'admin@snautoparts.com',
      name: 'Admin User',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      accounts: {
        create: {
          accountId: uuidv4(),
          providerId: 'credentials',
          password: hashPassword('Admin123!'),
        },
      },
    },
  });
  console.log('✅ Created admin user:', adminUser.email);

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@snautoparts.com' },
    update: {},
    create: {
      email: 'manager@snautoparts.com',
      name: 'Manager User',
      firstName: 'Manager',
      lastName: 'User',
      role: UserRole.MANAGER,
      accounts: {
        create: {
          accountId: uuidv4(),
          providerId: 'credentials',
          password: hashPassword('Manager123!'),
        },
      },
    },
  });
  console.log('✅ Created manager user:', managerUser.email);

  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      name: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      phone: '555-555-5555',
      role: UserRole.CUSTOMER,
      accounts: {
        create: {
          accountId: uuidv4(),
          providerId: 'credentials',
          password: hashPassword('Customer123!'),
        },
      },
    },
  });
  console.log('✅ Created customer user:', customerUser.email);

  // Create additional test customers
  const testCustomer2 = await prisma.user.upsert({
    where: { email: 'jane.smith@example.com' },
    update: {},
    create: {
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '555-123-4567',
      role: UserRole.CUSTOMER,
      accounts: {
        create: {
          accountId: uuidv4(),
          providerId: 'credentials',
          password: hashPassword('Customer123!'),
        },
      },
    },
  });
  console.log('✅ Created test customer:', testCustomer2.email);

  // ============================================
  // CATEGORIES - with images
  // ============================================
  
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'brakes-rotors' },
      update: { imageUrl: CATEGORY_IMAGES.brakes },
      create: { 
        name: 'Brakes & Rotors', 
        slug: 'brakes-rotors', 
        sortOrder: 1,
        description: 'High-performance brake pads, rotors, calipers, and complete brake kits',
        imageUrl: CATEGORY_IMAGES.brakes,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'batteries' },
      update: { imageUrl: CATEGORY_IMAGES.batteries },
      create: { 
        name: 'Batteries', 
        slug: 'batteries', 
        sortOrder: 2,
        description: 'Reliable automotive batteries for all vehicle types',
        imageUrl: CATEGORY_IMAGES.batteries,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'oil-fluids' },
      update: { imageUrl: CATEGORY_IMAGES.oil },
      create: { 
        name: 'Oil & Fluids', 
        slug: 'oil-fluids', 
        sortOrder: 3,
        description: 'Motor oils, transmission fluids, coolants, and lubricants',
        imageUrl: CATEGORY_IMAGES.oil,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'tires-wheels' },
      update: { imageUrl: CATEGORY_IMAGES.tires },
      create: { 
        name: 'Tires & Wheels', 
        slug: 'tires-wheels', 
        sortOrder: 4,
        description: 'All-season, performance, and off-road tires plus wheels',
        imageUrl: CATEGORY_IMAGES.tires,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'suspension' },
      update: { imageUrl: CATEGORY_IMAGES.suspension },
      create: { 
        name: 'Suspension', 
        slug: 'suspension', 
        sortOrder: 5,
        description: 'Shocks, struts, springs, and suspension components',
        imageUrl: CATEGORY_IMAGES.suspension,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'tools' },
      update: { imageUrl: CATEGORY_IMAGES.tools },
      create: { 
        name: 'Tools', 
        slug: 'tools', 
        sortOrder: 6,
        description: 'Professional and DIY automotive tools and equipment',
        imageUrl: CATEGORY_IMAGES.tools,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'filters' },
      update: { imageUrl: CATEGORY_IMAGES.filters },
      create: { 
        name: 'Filters', 
        slug: 'filters', 
        sortOrder: 7,
        description: 'Air filters, oil filters, fuel filters, and cabin filters',
        imageUrl: CATEGORY_IMAGES.filters,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'lighting' },
      update: { imageUrl: CATEGORY_IMAGES.lighting },
      create: { 
        name: 'Lighting', 
        slug: 'lighting', 
        sortOrder: 8,
        description: 'Headlights, taillights, LED upgrades, and bulbs',
        imageUrl: CATEGORY_IMAGES.lighting,
      },
    }),
  ]);
  console.log('✅ Created', categories.length, 'categories');

  // ============================================
  // BRANDS - with logos
  // ============================================
  
  const brands = await Promise.all([
    prisma.brand.upsert({
      where: { slug: 'bosch' },
      update: {},
      create: { 
        name: 'Bosch', 
        slug: 'bosch',
        description: 'German engineering excellence since 1886. Leading supplier of automotive parts worldwide.',
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'brembo' },
      update: {},
      create: { 
        name: 'Brembo', 
        slug: 'brembo',
        description: 'World leader in the design and production of high-performance braking systems.',
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'mobil1' },
      update: {},
      create: { 
        name: 'Mobil 1', 
        slug: 'mobil1',
        description: 'Advanced full synthetic motor oil trusted by NASCAR and Formula 1 teams.',
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'michelin' },
      update: {},
      create: { 
        name: 'Michelin', 
        slug: 'michelin',
        description: 'Premium tire manufacturer known for innovation and quality since 1889.',
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'castrol' },
      update: {},
      create: { 
        name: 'Castrol', 
        slug: 'castrol',
        description: 'Cutting-edge lubricant technology for maximum engine protection.',
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'kn' },
      update: {},
      create: { 
        name: 'K&N', 
        slug: 'kn',
        description: 'High-flow air filters and performance intakes for improved horsepower.',
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'acdelco' },
      update: {},
      create: { 
        name: 'ACDelco', 
        slug: 'acdelco',
        description: 'GM genuine parts and maintenance components for all vehicle makes.',
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'denso' },
      update: {},
      create: { 
        name: 'Denso', 
        slug: 'denso',
        description: 'Japanese OEM supplier specializing in thermal and powertrain systems.',
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'goodyear' },
      update: {},
      create: { 
        name: 'Goodyear', 
        slug: 'goodyear',
        description: 'American tire company with over 120 years of innovation.',
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'bilstein' },
      update: {},
      create: { 
        name: 'Bilstein', 
        slug: 'bilstein',
        description: 'German manufacturer of premium shock absorbers and suspension systems.',
      },
    }),
  ]);
  console.log('✅ Created', brands.length, 'brands');

  // ============================================
  // PRODUCTS - with images and more variety
  // ============================================
  
  const products = [
    // Brakes & Rotors
    {
      sku: 'BR-BREMBO-01',
      name: 'Brembo Premium UV Coated Front Disc Brake Rotor',
      slug: 'brembo-premium-front-brake-rotor',
      description: 'Precision balanced brake rotor with UV coating for superior corrosion resistance. Direct OE replacement with no modifications required. Features pillar venting for improved heat dissipation.',
      shortDescription: 'Premium front brake rotor with UV coating',
      price: 89.99,
      compareAtPrice: 110.00,
      categoryId: categories[0].id,
      brandId: brands[1].id,
      stockQuantity: 50,
      lowStockThreshold: 10,
      isFeatured: true,
      imageUrl: PRODUCT_IMAGES.brakeRotor,
    },
    {
      sku: 'BR-BOSCH-QC01',
      name: 'Bosch QuietCast Premium Disc Brake Rotor',
      slug: 'bosch-quietcast-brake-rotor',
      description: 'QuietCast premium rotors feature OE style vane configuration for efficient heat dissipation. Black e-coating provides corrosion protection. Ready to install right out of the box.',
      shortDescription: 'Premium disc brake rotor for quiet operation',
      price: 72.50,
      categoryId: categories[0].id,
      brandId: brands[0].id,
      stockQuantity: 35,
      lowStockThreshold: 8,
      isFeatured: true,
      imageUrl: PRODUCT_IMAGES.brakeRotor,
    },
    {
      sku: 'BR-PADS-CER',
      name: 'Bosch Ceramic Brake Pad Set - Front',
      slug: 'bosch-ceramic-brake-pads-front',
      description: 'Ceramic formula delivers quiet, low-dust performance. Advanced friction technology for smooth, consistent braking. Includes hardware and wear sensors.',
      shortDescription: 'Ceramic front brake pads',
      price: 48.99,
      categoryId: categories[0].id,
      brandId: brands[0].id,
      stockQuantity: 60,
      lowStockThreshold: 12,
      imageUrl: PRODUCT_IMAGES.brakePads,
    },
    {
      sku: 'BR-BREMBO-KIT',
      name: 'Brembo Front Brake Kit - Rotors & Pads',
      slug: 'brembo-front-brake-kit',
      description: 'Complete front brake upgrade kit includes two UV-coated rotors and premium ceramic pads. Perfect for the serious DIY mechanic.',
      shortDescription: 'Complete front brake rotor and pad kit',
      price: 189.99,
      compareAtPrice: 219.99,
      categoryId: categories[0].id,
      brandId: brands[1].id,
      stockQuantity: 25,
      lowStockThreshold: 5,
      isFeatured: true,
      imageUrl: PRODUCT_IMAGES.brakePads,
    },

    // Oil & Fluids
    {
      sku: 'OIL-MOB1-5W30',
      name: 'Mobil 1 Advanced Full Synthetic Motor Oil 5W-30, 5 Quart',
      slug: 'mobil1-5w30-5qt',
      description: 'Advanced full synthetic formula provides exceptional wear protection, cleaning power, and overall performance. Meets or exceeds requirements of ILSAC GF-6, API SP, and dexos1 Gen 2.',
      shortDescription: 'Full synthetic 5W-30 motor oil',
      price: 29.99,
      compareAtPrice: 37.99,
      categoryId: categories[2].id,
      brandId: brands[2].id,
      stockQuantity: 100,
      lowStockThreshold: 20,
      isFeatured: true,
      imageUrl: PRODUCT_IMAGES.motorOil,
    },
    {
      sku: 'OIL-CAST-EDGE',
      name: 'Castrol EDGE 5W-30 Full Synthetic Motor Oil, 5 Quart',
      slug: 'castrol-edge-5w30',
      description: 'Fluid TITANIUM Technology transforms to be stronger under pressure, keeping metal apart and reducing friction. 3X stronger against viscosity breakdown.',
      shortDescription: 'Titanium-strength synthetic oil',
      price: 32.99,
      categoryId: categories[2].id,
      brandId: brands[4].id,
      stockQuantity: 80,
      lowStockThreshold: 15,
      imageUrl: PRODUCT_IMAGES.motorOil,
    },
    {
      sku: 'OIL-MOB1-0W20',
      name: 'Mobil 1 Extended Performance 0W-20 Full Synthetic, 5 Quart',
      slug: 'mobil1-0w20-extended',
      description: 'Engineered for engines that demand the very best. Provides protection for up to 20,000 miles between oil changes.',
      shortDescription: 'Extended performance 0W-20 synthetic',
      price: 34.99,
      compareAtPrice: 42.99,
      categoryId: categories[2].id,
      brandId: brands[2].id,
      stockQuantity: 75,
      lowStockThreshold: 15,
      imageUrl: PRODUCT_IMAGES.motorOil,
    },

    // Filters
    {
      sku: 'AIR-KN-01',
      name: 'K&N High-Flow Air Filter Replacement',
      slug: 'kn-high-flow-air-filter',
      description: 'Washable and reusable high-flow air filter engineered to increase horsepower and acceleration. Lasts up to 50,000 miles before cleaning is required.',
      shortDescription: 'Washable high-flow air filter',
      price: 45.99,
      compareAtPrice: 65.99,
      categoryId: categories[6].id,
      brandId: brands[5].id,
      stockQuantity: 75,
      lowStockThreshold: 15,
      isFeatured: true,
      imageUrl: PRODUCT_IMAGES.airFilter,
    },
    {
      sku: 'OIL-FILT-SYN',
      name: 'Bosch Synthetic Oil Filter',
      slug: 'bosch-synthetic-oil-filter',
      description: 'High-capacity synthetic blend filter media captures 99% of dirt particles. Designed for extended oil change intervals up to 10,000 miles.',
      shortDescription: 'Synthetic oil filter',
      price: 12.50,
      categoryId: categories[6].id,
      brandId: brands[0].id,
      stockQuantity: 200,
      lowStockThreshold: 40,
      imageUrl: PRODUCT_IMAGES.oilFilter,
    },
    {
      sku: 'AIR-DENSO-CAB',
      name: 'Denso Cabin Air Filter with Charcoal',
      slug: 'denso-cabin-air-filter',
      description: 'Premium cabin air filter with activated charcoal removes odors and allergens. Direct OE replacement for easy installation.',
      shortDescription: 'Charcoal cabin air filter',
      price: 18.99,
      compareAtPrice: 24.99,
      categoryId: categories[6].id,
      brandId: brands[7].id,
      stockQuantity: 120,
      lowStockThreshold: 25,
      imageUrl: PRODUCT_IMAGES.airFilter,
    },

    // Tires
    {
      sku: 'TIRE-MICH-DEF',
      name: 'Michelin Defender T+H All-Season Tire 215/60R16',
      slug: 'michelin-defender-th',
      description: 'Up to 80,000 mile limited warranty. IntelliSipe technology provides confident grip in wet, dry, and light snow conditions. Low rolling resistance for improved fuel economy.',
      shortDescription: 'Premium all-season tire',
      price: 158.99,
      compareAtPrice: 179.99,
      categoryId: categories[3].id,
      brandId: brands[3].id,
      stockQuantity: 24,
      lowStockThreshold: 6,
      isFeatured: true,
      imageUrl: PRODUCT_IMAGES.tire,
    },
    {
      sku: 'TIRE-GY-AS3',
      name: 'Goodyear Assurance All-Season Tire 225/65R17',
      slug: 'goodyear-assurance-all-season',
      description: 'Reliable all-season performance with confident wet traction. Tread life warranty of 65,000 miles. Fuel-efficient design.',
      shortDescription: 'Dependable all-season tire',
      price: 129.99,
      categoryId: categories[3].id,
      brandId: brands[8].id,
      stockQuantity: 32,
      lowStockThreshold: 8,
      imageUrl: PRODUCT_IMAGES.tire,
    },

    // Suspension
    {
      sku: 'SUSP-BIL-SHOCK',
      name: 'Bilstein B6 Performance Shock Absorber - Front',
      slug: 'bilstein-b6-front-shock',
      description: 'Monotube gas pressure design for consistent fade-free performance. Instant response to changing road conditions. German engineering for superior durability.',
      shortDescription: 'Performance monotube shock',
      price: 149.99,
      compareAtPrice: 179.99,
      categoryId: categories[4].id,
      brandId: brands[9].id,
      stockQuantity: 20,
      lowStockThreshold: 5,
      isFeatured: true,
      imageUrl: PRODUCT_IMAGES.shockAbsorber,
    },
    {
      sku: 'SUSP-STRUT-ASM',
      name: 'Monroe Quick-Strut Complete Strut Assembly',
      slug: 'monroe-quick-strut-assembly',
      description: 'Complete strut assembly includes strut, coil spring, mount, and boot. Ready to install - no spring compressor needed.',
      shortDescription: 'Complete strut assembly',
      price: 189.99,
      categoryId: categories[4].id,
      brandId: brands[6].id,
      stockQuantity: 18,
      lowStockThreshold: 4,
      imageUrl: PRODUCT_IMAGES.shockAbsorber,
    },

    // Tools & Accessories
    {
      sku: 'SP-PLUG-IR',
      name: 'Bosch Iridium Spark Plug 9603 Double Platinum',
      slug: 'bosch-iridium-spark-plug',
      description: 'Fine wire iridium center electrode for excellent ignitability. Laser-welded for durability. Up to 4X longer life than copper plugs.',
      shortDescription: 'Iridium spark plug',
      price: 8.49,
      compareAtPrice: 9.99,
      categoryId: categories[5].id,
      brandId: brands[0].id,
      stockQuantity: 150,
      lowStockThreshold: 30,
      imageUrl: PRODUCT_IMAGES.sparkPlug,
    },
    {
      sku: 'SP-PLUG-DENSO',
      name: 'Denso Iridium TT Spark Plug',
      slug: 'denso-iridium-tt-spark-plug',
      description: 'Twin-Tip design with 0.4mm iridium center electrode and 0.7mm platinum ground electrode. Provides faster starts and better acceleration.',
      shortDescription: 'Twin-Tip iridium spark plug',
      price: 9.99,
      categoryId: categories[5].id,
      brandId: brands[7].id,
      stockQuantity: 120,
      lowStockThreshold: 25,
      imageUrl: PRODUCT_IMAGES.sparkPlug,
    },

    // Batteries
    {
      sku: 'BAT-ACD-PRO',
      name: 'ACDelco Professional AGM Battery - Group 48',
      slug: 'acdelco-agm-battery-48',
      description: 'Absorbed Glass Mat (AGM) technology for maintenance-free operation. High cycling capability and longer life. Perfect for vehicles with high electrical demands.',
      shortDescription: 'Professional AGM battery',
      price: 189.99,
      compareAtPrice: 219.99,
      categoryId: categories[1].id,
      brandId: brands[6].id,
      stockQuantity: 30,
      lowStockThreshold: 8,
      isFeatured: true,
      imageUrl: PRODUCT_IMAGES.battery,
    },
    {
      sku: 'BAT-BSCH-S6',
      name: 'Bosch S6 High Performance AGM Battery',
      slug: 'bosch-s6-agm-battery',
      description: 'Start-stop compatible AGM battery. Up to 2X longer cycle life than conventional batteries. Sealed and spill-proof design.',
      shortDescription: 'Start-stop AGM battery',
      price: 209.99,
      categoryId: categories[1].id,
      brandId: brands[0].id,
      stockQuantity: 22,
      lowStockThreshold: 5,
      imageUrl: PRODUCT_IMAGES.battery,
    },

    // Lighting
    {
      sku: 'LIGHT-LED-H11',
      name: 'LED Headlight Bulbs H11 - 6000K Cool White',
      slug: 'led-headlight-h11',
      description: '300% brighter than halogen bulbs. Plug and play installation. Built-in fan for heat dissipation. 50,000 hour lifespan.',
      shortDescription: 'LED headlight conversion kit',
      price: 49.99,
      compareAtPrice: 69.99,
      categoryId: categories[7].id,
      brandId: brands[7].id,
      stockQuantity: 60,
      lowStockThreshold: 12,
      imageUrl: PRODUCT_IMAGES.headlight,
    },
    {
      sku: 'LIGHT-BOSCH-H7',
      name: 'Bosch Gigalight Plus 120 H7 Halogen Bulbs',
      slug: 'bosch-gigalight-h7',
      description: '120% more light on the road compared to standard bulbs. ECE approved for street use. Premium quality German engineering.',
      shortDescription: 'High-performance halogen bulbs',
      price: 29.99,
      categoryId: categories[7].id,
      brandId: brands[0].id,
      stockQuantity: 85,
      lowStockThreshold: 20,
      imageUrl: PRODUCT_IMAGES.headlight,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: { imageUrl: product.imageUrl },
      create: product,
    });
  }
  console.log('✅ Created', products.length, 'products');

  // Note: ShippingMethod is handled by the checkout service configuration
  // Shipping rates are stored in settings below

  // ============================================
  // ADDRESSES for test customer
  // ============================================
  
  await prisma.address.upsert({
    where: { id: 'addr-seed-1' },
    update: {},
    create: {
      id: 'addr-seed-1',
      userId: customerUser.id,
      firstName: 'John',
      lastName: 'Doe',
      street: '123 Main Street',
      apartment: 'Apt 4B',
      city: 'Detroit',
      state: 'MI',
      zipCode: '48201',
      country: 'USA',
      phone: '555-555-5555',
      isDefault: true,
    },
  });

  await prisma.address.upsert({
    where: { id: 'addr-seed-2' },
    update: {},
    create: {
      id: 'addr-seed-2',
      userId: customerUser.id,
      firstName: 'John',
      lastName: 'Doe',
      street: '456 Oak Avenue',
      city: 'Ann Arbor',
      state: 'MI',
      zipCode: '48104',
      country: 'USA',
      phone: '555-555-5556',
      isDefault: false,
    },
  });
  console.log('✅ Created customer addresses');

  // ============================================
  // SETTINGS - comprehensive configuration
  // ============================================
  
  const settings = [
    // General
    { key: 'store_name', value: 'SN Auto Parts', category: 'general' },
    { key: 'store_tagline', value: 'Quality Auto Parts You Can Trust', category: 'general' },
    { key: 'store_email', value: 'support@snautoparts.com', category: 'general' },
    { key: 'store_phone', value: '(555) 123-4567', category: 'general' },
    { key: 'store_address', value: '1234 Motor City Drive, Detroit, MI 48201', category: 'general' },
    
    // Business Hours
    { key: 'business_hours_weekday', value: '8:00 AM - 8:00 PM', category: 'general' },
    { key: 'business_hours_saturday', value: '9:00 AM - 6:00 PM', category: 'general' },
    { key: 'business_hours_sunday', value: '10:00 AM - 4:00 PM', category: 'general' },
    
    // Tax
    { key: 'tax_rate', value: 0.06, category: 'tax' },
    { key: 'tax_enabled', value: true, category: 'tax' },
    { key: 'tax_included_in_price', value: false, category: 'tax' },
    
    // Shipping
    { key: 'free_shipping_threshold', value: 75, category: 'shipping' },
    { key: 'standard_shipping_rate', value: 9.99, category: 'shipping' },
    { key: 'express_shipping_rate', value: 14.99, category: 'shipping' },
    { key: 'next_day_shipping_rate', value: 24.99, category: 'shipping' },
    { key: 'shipping_origin_zip', value: '48201', category: 'shipping' },
    
    // Inventory
    { key: 'low_stock_threshold', value: 10, category: 'inventory' },
    { key: 'out_of_stock_visibility', value: true, category: 'inventory' },
    { key: 'track_inventory', value: true, category: 'inventory' },
    
    // Orders
    { key: 'order_confirmation_email', value: true, category: 'orders' },
    { key: 'order_shipped_email', value: true, category: 'orders' },
    { key: 'order_delivered_email', value: true, category: 'orders' },
    { key: 'allow_guest_checkout', value: false, category: 'orders' },
    { key: 'minimum_order_amount', value: 0, category: 'orders' },
    
    // Returns
    { key: 'return_window_days', value: 30, category: 'returns' },
    { key: 'restocking_fee_percent', value: 0, category: 'returns' },
    
    // Currency & Display
    { key: 'currency', value: 'USD', category: 'display' },
    { key: 'currency_symbol', value: '$', category: 'display' },
    { key: 'products_per_page', value: 12, category: 'display' },
    { key: 'show_out_of_stock', value: true, category: 'display' },
    
    // SEO
    { key: 'meta_title', value: 'SN Auto Parts - Quality Auto Parts & Accessories', category: 'seo' },
    { key: 'meta_description', value: 'Shop quality auto parts and accessories at SN Auto Parts. Free shipping on orders over $75. Expert support available.', category: 'seo' },
    
    // Social Media
    { key: 'facebook_url', value: 'https://facebook.com/snautoparts', category: 'social' },
    { key: 'instagram_url', value: 'https://instagram.com/snautoparts', category: 'social' },
    { key: 'twitter_url', value: 'https://twitter.com/snautoparts', category: 'social' },
    { key: 'youtube_url', value: 'https://youtube.com/snautoparts', category: 'social' },
    
    // Features
    { key: 'enable_reviews', value: true, category: 'features' },
    { key: 'enable_wishlist', value: true, category: 'features' },
    { key: 'enable_compare', value: true, category: 'features' },
    { key: 'enable_live_chat', value: true, category: 'features' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, category: setting.category },
      create: setting,
    });
  }
  console.log('✅ Created', settings.length, 'settings');

  console.log('');
  console.log('🎉 Database seeding completed!');
  console.log('');
  console.log('📋 Test Accounts:');
  console.log('   Admin:    admin@snautoparts.com / Admin123!');
  console.log('   Manager:  manager@snautoparts.com / Manager123!');
  console.log('   Customer: customer@example.com / Customer123!');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
