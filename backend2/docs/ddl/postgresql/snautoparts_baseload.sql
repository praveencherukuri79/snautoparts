/*
================================================================================
  SN Auto Parts - PostgreSQL Base Data Load
================================================================================
  
  Version: 1.0.0
  Generated: 2026-01-06
  Database: PostgreSQL 14+
  
  Description:
    Initial data load for the SN Auto Parts e-commerce platform.
    Contains:
    - Roles and role feature configurations
    - Categories and subcategories
    - Brands
    - Sample products from real inventory (Honda/Acura parts)
    - Product fitments
    - Initial inventory logs
    - Features (master feature list)
    - Settings (application configuration)
  
  Prerequisites:
    - Run snautoparts_schema.sql first to create tables
  
  Notes for DBA:
    - All IDs use uuid_generate_v4() for UUID generation
    - Execute in a transaction for atomicity
    - Data can be run multiple times (uses INSERT ON CONFLICT DO NOTHING)
  
================================================================================
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

BEGIN;

-- ============================================================================
-- SECTION 1: Roles
-- ============================================================================
INSERT INTO roles (id, name, display_name, description, is_active)
VALUES 
    (uuid_generate_v4(), 'CUSTOMER', 'Customer', 'Regular shoppers and end users', TRUE),
    (uuid_generate_v4(), 'MANAGER', 'Manager', 'Operations staff, warehouse, and fulfillment', TRUE),
    (uuid_generate_v4(), 'ADMIN', 'Administrator', 'System administrators and owners', TRUE)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- SECTION 2: Role Feature Configurations
-- ============================================================================

-- CUSTOMER feature config
INSERT INTO role_feature_configs (id, role_id, config, version)
SELECT 
    uuid_generate_v4(),
    r.id,
    '{
        "role": "CUSTOMER",
        "version": 1,
        "features": {
            "catalog": { "browse": true, "search": true, "viewDetail": true, "fitmentFilter": true },
            "cart": { "view": true, "modify": true, "checkout": true },
            "orders": { "viewOwn": true, "viewAll": false, "updateStatus": false, "cancel": false, "viewStatistics": false },
            "inventory": { "view": false, "adjust": false, "import": false, "viewHistory": false, "viewAlerts": false },
            "products": { "create": false, "update": false, "delete": false, "manageFitment": false, "manageImages": false },
            "dropship": { "viewOrders": false, "retryPush": false, "manageAffiliates": false },
            "users": { "viewAll": false, "create": false, "updateRole": false, "delete": false },
            "settings": { "view": false, "update": false },
            "audit": { "view": false, "export": false },
            "reports": { "salesByDay": false, "salesByCategory": false, "inventoryValue": false, "gmv": false }
        },
        "ui": { "dashboardLayout": "customer", "showPriceHistory": false, "showCostPrice": false, "showAuditInfo": false }
    }'::jsonb,
    1
FROM roles r WHERE r.name = 'CUSTOMER'
ON CONFLICT (role_id) DO NOTHING;

-- MANAGER feature config
INSERT INTO role_feature_configs (id, role_id, config, version)
SELECT 
    uuid_generate_v4(),
    r.id,
    '{
        "role": "MANAGER",
        "version": 1,
        "features": {
            "catalog": { "browse": true, "search": true, "viewDetail": true, "fitmentFilter": true },
            "cart": { "view": false, "modify": false, "checkout": false },
            "orders": { "viewOwn": false, "viewAll": true, "updateStatus": true, "cancel": true, "viewStatistics": true },
            "inventory": { "view": true, "adjust": true, "import": true, "viewHistory": true, "viewAlerts": true },
            "products": { "create": true, "update": true, "delete": true, "manageFitment": true, "manageImages": true },
            "dropship": { "viewOrders": true, "retryPush": true, "manageAffiliates": false },
            "users": { "viewAll": false, "create": false, "updateRole": false, "delete": false },
            "settings": { "view": false, "update": false },
            "audit": { "view": false, "export": false },
            "reports": { "salesByDay": true, "salesByCategory": true, "inventoryValue": true, "gmv": false }
        },
        "ui": { "dashboardLayout": "operations", "showPriceHistory": true, "showCostPrice": true, "showAuditInfo": false }
    }'::jsonb,
    1
FROM roles r WHERE r.name = 'MANAGER'
ON CONFLICT (role_id) DO NOTHING;

-- ADMIN feature config
INSERT INTO role_feature_configs (id, role_id, config, version)
SELECT 
    uuid_generate_v4(),
    r.id,
    '{
        "role": "ADMIN",
        "version": 1,
        "features": {
            "catalog": { "browse": true, "search": true, "viewDetail": true, "fitmentFilter": true },
            "cart": { "view": false, "modify": false, "checkout": false },
            "orders": { "viewOwn": false, "viewAll": true, "updateStatus": true, "cancel": true, "viewStatistics": true },
            "inventory": { "view": true, "adjust": true, "import": true, "viewHistory": true, "viewAlerts": true },
            "products": { "create": true, "update": true, "delete": true, "manageFitment": true, "manageImages": true },
            "dropship": { "viewOrders": true, "retryPush": true, "manageAffiliates": true },
            "users": { "viewAll": true, "create": true, "updateRole": true, "delete": true },
            "settings": { "view": true, "update": true },
            "audit": { "view": true, "export": true },
            "reports": { "salesByDay": true, "salesByCategory": true, "inventoryValue": true, "gmv": true }
        },
        "ui": { "dashboardLayout": "admin", "showPriceHistory": true, "showCostPrice": true, "showAuditInfo": true }
    }'::jsonb,
    1
FROM roles r WHERE r.name = 'ADMIN'
ON CONFLICT (role_id) DO NOTHING;

-- ============================================================================
-- SECTION 3: Brands
-- ============================================================================
INSERT INTO brands (id, name, slug, description, is_active) VALUES 
    (uuid_generate_v4(), 'SN Auto Parts', 'sn-auto-parts', 'Quality OEM replacement parts', TRUE),
    (uuid_generate_v4(), 'ACDelco', 'acdelco', 'OEM parts for GM vehicles', TRUE),
    (uuid_generate_v4(), 'Bosch', 'bosch', 'Premium automotive parts', TRUE),
    (uuid_generate_v4(), 'Denso', 'denso', 'Japanese OEM manufacturer', TRUE),
    (uuid_generate_v4(), 'Dorman', 'dorman', 'Aftermarket replacement parts', TRUE),
    (uuid_generate_v4(), 'A-Premium', 'a-premium', 'Quality aftermarket parts', TRUE),
    (uuid_generate_v4(), 'TRQ', 'trq', 'Trusted quality parts', TRUE),
    (uuid_generate_v4(), 'BuyAutoParts', 'buyautoparts', 'Affordable auto parts', TRUE)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- SECTION 4: Categories (Master)
-- ============================================================================
INSERT INTO categories (id, name, slug, description, sort_order, is_active) VALUES 
    (uuid_generate_v4(), 'Lighting', 'lighting', 'Vehicle lighting components including headlights, tail lights, and fog lights', 0, TRUE),
    (uuid_generate_v4(), 'Exterior', 'exterior', 'Exterior body parts and accessories', 1, TRUE),
    (uuid_generate_v4(), 'Cooling', 'cooling', 'Engine cooling system components', 2, TRUE),
    (uuid_generate_v4(), 'Brakes', 'brakes', 'Brake system components', 3, TRUE),
    (uuid_generate_v4(), 'Suspension & Steering', 'suspension-steering', 'Suspension and steering components', 4, TRUE),
    (uuid_generate_v4(), 'Engine Parts', 'engine-parts', 'Engine components and accessories', 5, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- SECTION 5: Subcategories
-- ============================================================================

-- Lighting subcategories
INSERT INTO categories (id, name, slug, description, parent_id, sort_order)
SELECT uuid_generate_v4(), 'Tail Lights', 'tail-lights', 'Tail light assemblies and components', c.id, 10
FROM categories c WHERE c.slug = 'lighting'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (id, name, slug, description, parent_id, sort_order)
SELECT uuid_generate_v4(), 'Headlights', 'headlights', 'Headlight assemblies and components', c.id, 11
FROM categories c WHERE c.slug = 'lighting'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (id, name, slug, description, parent_id, sort_order)
SELECT uuid_generate_v4(), 'Fog Lights', 'fog-lights', 'Fog light assemblies and components', c.id, 12
FROM categories c WHERE c.slug = 'lighting'
ON CONFLICT (slug) DO NOTHING;

-- Exterior subcategories
INSERT INTO categories (id, name, slug, description, parent_id, sort_order)
SELECT uuid_generate_v4(), 'Bumpers & Components', 'bumpers-components', 'Front and rear bumpers, reinforcements, and covers', c.id, 20
FROM categories c WHERE c.slug = 'exterior'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (id, name, slug, description, parent_id, sort_order)
SELECT uuid_generate_v4(), 'Fenders & Components', 'fenders-components', 'Fenders, liners, and wheel opening moldings', c.id, 21
FROM categories c WHERE c.slug = 'exterior'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (id, name, slug, description, parent_id, sort_order)
SELECT uuid_generate_v4(), 'Grilles & Components', 'grilles-components', 'Front grilles and grille assemblies', c.id, 22
FROM categories c WHERE c.slug = 'exterior'
ON CONFLICT (slug) DO NOTHING;

-- Cooling subcategories
INSERT INTO categories (id, name, slug, description, parent_id, sort_order)
SELECT uuid_generate_v4(), 'Radiators & Components', 'radiators-components', 'Radiators, supports, and splash shields', c.id, 30
FROM categories c WHERE c.slug = 'cooling'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (id, name, slug, description, parent_id, sort_order)
SELECT uuid_generate_v4(), 'Water Pumps', 'water-pumps', 'Cooling system water pumps', c.id, 31
FROM categories c WHERE c.slug = 'cooling'
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- SECTION 6: Products (Real Inventory Data from XLSX)
-- ============================================================================

-- ============ TAIL LIGHTS ============
INSERT INTO products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, upc, length, width, height, weight, fulfillment_type, is_featured)
SELECT uuid_generate_v4(), 'SN10.1998-ITL', 'Tail Light Assembly Inner LH - (98-00)', 'tail-light-assembly-inner-lh-98-00-sn10-1998-itl', 'Tail Light Assembly Inner LH - OEM quality replacement part for Honda Accord 1998-2000', 59.99, 27.00, c.id, b.id, 4, '762530098314', 18.5, 8.5, 4, 2, 'INVENTORY', FALSE
FROM categories c, brands b WHERE c.slug = 'tail-lights' AND b.slug = 'sn-auto-parts'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, upc, length, width, height, weight, fulfillment_type, is_featured)
SELECT uuid_generate_v4(), 'SN10.1998-ITR', 'Tail Light Assembly Inner RH - (98-00)', 'tail-light-assembly-inner-rh-98-00-sn10-1998-itr', 'Tail Light Assembly Inner RH - OEM quality replacement part for Honda Accord 1998-2000', 59.99, 27.00, c.id, b.id, 4, '762530393518', 18.5, 8.5, 4, 2, 'INVENTORY', FALSE
FROM categories c, brands b WHERE c.slug = 'tail-lights' AND b.slug = 'sn-auto-parts'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, upc, length, width, height, weight, fulfillment_type, is_featured)
SELECT uuid_generate_v4(), 'SN10.1998-OTL', 'Tail Light Assembly Outer LH - (98-00)', 'tail-light-assembly-outer-lh-98-00-sn10-1998-otl', 'Tail Light Assembly Outer LH - OEM quality replacement part for Honda Accord 1998-2000', 69.99, 31.50, c.id, b.id, 4, '762530484568', 18, 10, 8, 3, 'INVENTORY', FALSE
FROM categories c, brands b WHERE c.slug = 'tail-lights' AND b.slug = 'sn-auto-parts'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, upc, length, width, height, weight, fulfillment_type, is_featured)
SELECT uuid_generate_v4(), 'SN10.1998-OTR', 'Tail Light Assembly Outer RH - (98-00)', 'tail-light-assembly-outer-rh-98-00-sn10-1998-otr', 'Tail Light Assembly Outer RH - OEM quality replacement part for Honda Accord 1998-2000', 69.99, 31.50, c.id, b.id, 4, '762530423321', 18, 10, 8, 3, 'INVENTORY', FALSE
FROM categories c, brands b WHERE c.slug = 'tail-lights' AND b.slug = 'sn-auto-parts'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, upc, length, width, height, weight, fulfillment_type, is_featured)
SELECT uuid_generate_v4(), 'SN10.1803-TLL', 'Tail Light Assembly LH - (03-05)', 'tail-light-assembly-lh-03-05-sn10-1803-tll', 'Tail Light Assembly LH - OEM quality replacement part for Honda Accord 2003-2005', 79.99, 36.00, c.id, b.id, 4, '762530294657', 16.5, 13.5, 9, 4, 'INVENTORY', FALSE
FROM categories c, brands b WHERE c.slug = 'tail-lights' AND b.slug = 'sn-auto-parts'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, upc, length, width, height, weight, fulfillment_type, is_featured)
SELECT uuid_generate_v4(), 'SN10.1803-TLR', 'Tail Light Assembly RH - (03-05)', 'tail-light-assembly-rh-03-05-sn10-1803-tlr', 'Tail Light Assembly RH - OEM quality replacement part for Honda Accord 2003-2005', 79.99, 36.00, c.id, b.id, 4, '762530294664', 16.5, 13.5, 9, 4, 'INVENTORY', FALSE
FROM categories c, brands b WHERE c.slug = 'tail-lights' AND b.slug = 'sn-auto-parts'
ON CONFLICT (sku) DO NOTHING;

-- ============ HEADLIGHTS ============
INSERT INTO products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, upc, length, width, height, weight, fulfillment_type, is_featured)
SELECT uuid_generate_v4(), 'SN10.1802-HL', 'Headlight Assembly LH - (02-04)', 'headlight-assembly-lh-02-04-sn10-1802-hl', 'Headlight Assembly LH - OEM quality replacement part for Honda CR-V 2002-2004', 119.99, 54.00, c.id, b.id, 4, '759126593186', 24.75, 13.5, 13.5, 7.4, 'INVENTORY', FALSE
FROM categories c, brands b WHERE c.slug = 'headlights' AND b.slug = 'sn-auto-parts'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, upc, length, width, height, weight, fulfillment_type, is_featured)
SELECT uuid_generate_v4(), 'SN10.1802-HR', 'Headlight Assembly RH - (02-04)', 'headlight-assembly-rh-02-04-sn10-1802-hr', 'Headlight Assembly RH - OEM quality replacement part for Honda CR-V 2002-2004', 119.99, 54.00, c.id, b.id, 4, '759126593193', 24.75, 13.5, 13.5, 7.4, 'INVENTORY', FALSE
FROM categories c, brands b WHERE c.slug = 'headlights' AND b.slug = 'sn-auto-parts'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, length, width, height, weight, fulfillment_type, is_featured)
SELECT uuid_generate_v4(), 'SN10.2006-HL', 'Civic Headlight Assembly LH - (06-11)', 'civic-headlight-assembly-lh-06-11-sn10-2006-hl', 'Civic Headlight Assembly LH - OEM quality replacement part for Honda Civic 2006-2011', 109.99, 49.50, c.id, b.id, 6, 22, 12, 12, 6.5, 'INVENTORY', TRUE
FROM categories c, brands b WHERE c.slug = 'headlights' AND b.slug = 'sn-auto-parts'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, length, width, height, weight, fulfillment_type, is_featured)
SELECT uuid_generate_v4(), 'SN10.2006-HR', 'Civic Headlight Assembly RH - (06-11)', 'civic-headlight-assembly-rh-06-11-sn10-2006-hr', 'Civic Headlight Assembly RH - OEM quality replacement part for Honda Civic 2006-2011', 109.99, 49.50, c.id, b.id, 6, 22, 12, 12, 6.5, 'INVENTORY', TRUE
FROM categories c, brands b WHERE c.slug = 'headlights' AND b.slug = 'sn-auto-parts'
ON CONFLICT (sku) DO NOTHING;

-- ============ FOG LIGHTS ============
INSERT INTO products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, length, width, height, weight, fulfillment_type, is_featured)
SELECT uuid_generate_v4(), 'SN10.1802-FL', 'Fog Light Assembly (Wo Bezel) LH - (02-06)', 'fog-light-assembly-wo-bezel-lh-02-06-sn10-1802-fl', 'Fog Light Assembly (Wo Bezel) LH - OEM quality replacement part for Honda CR-V 2002-2006', 49.99, 22.50, c.id, b.id, 6, 13, 7.25, 5, 1.8, 'INVENTORY', TRUE
FROM categories c, brands b WHERE c.slug = 'fog-lights' AND b.slug = 'sn-auto-parts'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, length, width, height, weight, fulfillment_type, is_featured)
SELECT uuid_generate_v4(), 'SN10.1802-FR', 'Fog Light Assembly (Wo Bezel) RH - (02-06)', 'fog-light-assembly-wo-bezel-rh-02-06-sn10-1802-fr', 'Fog Light Assembly (Wo Bezel) RH - OEM quality replacement part for Honda CR-V 2002-2006', 49.99, 22.50, c.id, b.id, 6, 13, 7.25, 5, 1.8, 'INVENTORY', TRUE
FROM categories c, brands b WHERE c.slug = 'fog-lights' AND b.slug = 'sn-auto-parts'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, length, width, height, weight, fulfillment_type, is_featured)
SELECT uuid_generate_v4(), 'SN10.2003-FL', 'Accord Fog Light Assembly LH - (03-07)', 'accord-fog-light-assembly-lh-03-07-sn10-2003-fl', 'Accord Fog Light Assembly LH - OEM quality replacement part for Honda Accord 2003-2007', 54.99, 24.75, c.id, b.id, 8, 14, 8, 6, 2.2, 'INVENTORY', TRUE
FROM categories c, brands b WHERE c.slug = 'fog-lights' AND b.slug = 'sn-auto-parts'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, length, width, height, weight, fulfillment_type, is_featured)
SELECT uuid_generate_v4(), 'SN10.2003-FR', 'Accord Fog Light Assembly RH - (03-07)', 'accord-fog-light-assembly-rh-03-07-sn10-2003-fr', 'Accord Fog Light Assembly RH - OEM quality replacement part for Honda Accord 2003-2007', 54.99, 24.75, c.id, b.id, 8, 14, 8, 6, 2.2, 'INVENTORY', TRUE
FROM categories c, brands b WHERE c.slug = 'fog-lights' AND b.slug = 'sn-auto-parts'
ON CONFLICT (sku) DO NOTHING;

-- ============ BUMPERS & COMPONENTS ============
INSERT INTO products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, fulfillment_type, is_featured)
SELECT uuid_generate_v4(), 'SN11.2801-FBR', 'Acura MDX Front Bumper Reinforcement', 'acura-mdx-front-bumper-reinforcement-sn11-2801-fbr', 'Acura MDX Front Bumper Reinforcement - OEM quality replacement part for Acura MDX 2001-2006', 129.99, 58.50, c.id, b.id, 5, 'INVENTORY', FALSE
FROM categories c, brands b WHERE c.slug = 'bumpers-components' AND b.slug = 'sn-auto-parts'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, length, width, height, weight, fulfillment_type, is_featured)
SELECT uuid_generate_v4(), 'SN11.1802-FBC', 'CR-V Front Bumper Cover - (02-04)', 'crv-front-bumper-cover-02-04-sn11-1802-fbc', 'CR-V Front Bumper Cover - OEM quality replacement part for Honda CR-V 2002-2004', 189.99, 85.50, c.id, b.id, 3, 60, 24, 18, 12, 'INVENTORY', FALSE
FROM categories c, brands b WHERE c.slug = 'bumpers-components' AND b.slug = 'sn-auto-parts'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, length, width, height, weight, fulfillment_type, is_featured)
SELECT uuid_generate_v4(), 'SN11.2006-FBC', 'Civic Front Bumper Cover - (06-08)', 'civic-front-bumper-cover-06-08-sn11-2006-fbc', 'Civic Front Bumper Cover - OEM quality replacement part for Honda Civic 2006-2008', 169.99, 76.50, c.id, b.id, 4, 58, 22, 16, 10, 'INVENTORY', FALSE
FROM categories c, brands b WHERE c.slug = 'bumpers-components' AND b.slug = 'sn-auto-parts'
ON CONFLICT (sku) DO NOTHING;

-- ============ FENDERS & COMPONENTS ============
INSERT INTO products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, fulfillment_type, is_featured)
SELECT uuid_generate_v4(), 'SN10.1802-FDWM', 'CR-V Front Driver Side Wheel Opening Moulding', 'crv-front-driver-side-wheel-opening-moulding-sn10-1802-fdwm', 'CR-V Front Driver Side Wheel Opening Moulding - OEM quality replacement part for Honda CR-V 2002-2004', 39.99, 18.00, c.id, b.id, 10, 'INVENTORY', TRUE
FROM categories c, brands b WHERE c.slug = 'fenders-components' AND b.slug = 'sn-auto-parts'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, fulfillment_type, is_featured)
SELECT uuid_generate_v4(), 'SN10.1802-FPWM', 'CR-V Front Passenger Side Wheel Opening Moulding', 'crv-front-passenger-side-wheel-opening-moulding-sn10-1802-fpwm', 'CR-V Front Passenger Side Wheel Opening Moulding - OEM quality replacement part for Honda CR-V 2002-2004', 39.99, 18.00, c.id, b.id, 10, 'INVENTORY', TRUE
FROM categories c, brands b WHERE c.slug = 'fenders-components' AND b.slug = 'sn-auto-parts'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, fulfillment_type, is_featured)
SELECT uuid_generate_v4(), 'SN12.2003-FDL', 'Accord Front Fender Liner LH - (03-07)', 'accord-front-fender-liner-lh-03-07-sn12-2003-fdl', 'Accord Front Fender Liner LH - OEM quality replacement part for Honda Accord 2003-2007', 44.99, 20.25, c.id, b.id, 8, 'INVENTORY', TRUE
FROM categories c, brands b WHERE c.slug = 'fenders-components' AND b.slug = 'sn-auto-parts'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, fulfillment_type, is_featured)
SELECT uuid_generate_v4(), 'SN12.2003-FDR', 'Accord Front Fender Liner RH - (03-07)', 'accord-front-fender-liner-rh-03-07-sn12-2003-fdr', 'Accord Front Fender Liner RH - OEM quality replacement part for Honda Accord 2003-2007', 44.99, 20.25, c.id, b.id, 8, 'INVENTORY', TRUE
FROM categories c, brands b WHERE c.slug = 'fenders-components' AND b.slug = 'sn-auto-parts'
ON CONFLICT (sku) DO NOTHING;

-- ============ GRILLES & COMPONENTS ============
INSERT INTO products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, fulfillment_type, is_featured)
SELECT uuid_generate_v4(), 'SN12.1805-GL', 'CR-V Inner Grille - (05-06)', 'crv-inner-grille-05-06-sn12-1805-gl', 'CR-V Inner Grille - OEM quality replacement part for Honda CR-V 2005-2006', 69.99, 31.50, c.id, b.id, 10, 'INVENTORY', TRUE
FROM categories c, brands b WHERE c.slug = 'grilles-components' AND b.slug = 'sn-auto-parts'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, fulfillment_type, is_featured)
SELECT uuid_generate_v4(), 'SN12.2003-GR', 'Accord Front Grille Assembly - (03-05)', 'accord-front-grille-assembly-03-05-sn12-2003-gr', 'Accord Front Grille Assembly - OEM quality replacement part for Honda Accord 2003-2005', 79.99, 36.00, c.id, b.id, 6, 'INVENTORY', TRUE
FROM categories c, brands b WHERE c.slug = 'grilles-components' AND b.slug = 'sn-auto-parts'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, fulfillment_type, is_featured)
SELECT uuid_generate_v4(), 'SN12.2006-GR', 'Civic Front Grille Assembly - (06-08)', 'civic-front-grille-assembly-06-08-sn12-2006-gr', 'Civic Front Grille Assembly - OEM quality replacement part for Honda Civic 2006-2008', 74.99, 33.75, c.id, b.id, 8, 'INVENTORY', TRUE
FROM categories c, brands b WHERE c.slug = 'grilles-components' AND b.slug = 'sn-auto-parts'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, fulfillment_type, is_featured)
SELECT uuid_generate_v4(), 'SN12.2801-GR', 'Acura MDX Front Grille Assembly - (01-06)', 'acura-mdx-front-grille-assembly-01-06-sn12-2801-gr', 'Acura MDX Front Grille Assembly - OEM quality replacement part for Acura MDX 2001-2006', 99.99, 45.00, c.id, b.id, 4, 'INVENTORY', FALSE
FROM categories c, brands b WHERE c.slug = 'grilles-components' AND b.slug = 'sn-auto-parts'
ON CONFLICT (sku) DO NOTHING;

-- ============ RADIATORS & COMPONENTS ============
INSERT INTO products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, fulfillment_type, is_featured)
SELECT uuid_generate_v4(), 'SN14.2801-EGS', 'Acura MDX Front Plastic Engine Splash Shield', 'acura-mdx-front-plastic-engine-splash-shield-sn14-2801-egs', 'Acura MDX Front Plastic Engine Splash Shield - OEM quality replacement part for Acura MDX 2001-2006', 59.99, 27.00, c.id, b.id, 10, 'INVENTORY', TRUE
FROM categories c, brands b WHERE c.slug = 'radiators-components' AND b.slug = 'sn-auto-parts'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, fulfillment_type, is_featured)
SELECT uuid_generate_v4(), 'SN14.1802-RS', 'CR-V Radiator Support - (02-06)', 'crv-radiator-support-02-06-sn14-1802-rs', 'CR-V Radiator Support - OEM quality replacement part for Honda CR-V 2002-2006', 139.99, 63.00, c.id, b.id, 3, 'INVENTORY', FALSE
FROM categories c, brands b WHERE c.slug = 'radiators-components' AND b.slug = 'sn-auto-parts'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, fulfillment_type, is_featured)
SELECT uuid_generate_v4(), 'SN14.2003-RS', 'Accord Radiator Support - (03-07)', 'accord-radiator-support-03-07-sn14-2003-rs', 'Accord Radiator Support - OEM quality replacement part for Honda Accord 2003-2007', 149.99, 67.50, c.id, b.id, 4, 'INVENTORY', FALSE
FROM categories c, brands b WHERE c.slug = 'radiators-components' AND b.slug = 'sn-auto-parts'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, fulfillment_type, is_featured)
SELECT uuid_generate_v4(), 'SN14.2006-RS', 'Civic Radiator Support - (06-11)', 'civic-radiator-support-06-11-sn14-2006-rs', 'Civic Radiator Support - OEM quality replacement part for Honda Civic 2006-2011', 129.99, 58.50, c.id, b.id, 5, 'INVENTORY', FALSE
FROM categories c, brands b WHERE c.slug = 'radiators-components' AND b.slug = 'sn-auto-parts'
ON CONFLICT (sku) DO NOTHING;

-- ============================================================================
-- SECTION 7: Product Fitments
-- ============================================================================

-- Honda Accord 1998-2000 Tail Lights
INSERT INTO product_fitments (id, product_id, make, model, year_start, year_end)
SELECT uuid_generate_v4(), p.id, 'Honda', 'Accord', 1998, 2000
FROM products p
WHERE p.sku IN ('SN10.1998-ITL', 'SN10.1998-ITR', 'SN10.1998-OTL', 'SN10.1998-OTR')
AND NOT EXISTS (SELECT 1 FROM product_fitments f WHERE f.product_id = p.id AND f.make = 'Honda' AND f.model = 'Accord');

-- Honda Accord 2003-2005 Tail Lights
INSERT INTO product_fitments (id, product_id, make, model, year_start, year_end)
SELECT uuid_generate_v4(), p.id, 'Honda', 'Accord', 2003, 2005
FROM products p
WHERE p.sku IN ('SN10.1803-TLL', 'SN10.1803-TLR')
AND NOT EXISTS (SELECT 1 FROM product_fitments f WHERE f.product_id = p.id AND f.make = 'Honda' AND f.model = 'Accord');

-- Honda CR-V 2002-2004 Headlights
INSERT INTO product_fitments (id, product_id, make, model, year_start, year_end)
SELECT uuid_generate_v4(), p.id, 'Honda', 'CR-V', 2002, 2004
FROM products p
WHERE p.sku IN ('SN10.1802-HL', 'SN10.1802-HR', 'SN10.1802-FDWM', 'SN10.1802-FPWM')
AND NOT EXISTS (SELECT 1 FROM product_fitments f WHERE f.product_id = p.id AND f.make = 'Honda' AND f.model = 'CR-V');

-- Honda CR-V 2002-2006 Fog Lights
INSERT INTO product_fitments (id, product_id, make, model, year_start, year_end)
SELECT uuid_generate_v4(), p.id, 'Honda', 'CR-V', 2002, 2006
FROM products p
WHERE p.sku IN ('SN10.1802-FL', 'SN10.1802-FR', 'SN14.1802-RS')
AND NOT EXISTS (SELECT 1 FROM product_fitments f WHERE f.product_id = p.id AND f.make = 'Honda' AND f.model = 'CR-V');

-- Honda CR-V 2005-2006 Grilles
INSERT INTO product_fitments (id, product_id, make, model, year_start, year_end)
SELECT uuid_generate_v4(), p.id, 'Honda', 'CR-V', 2005, 2006
FROM products p
WHERE p.sku = 'SN12.1805-GL'
AND NOT EXISTS (SELECT 1 FROM product_fitments f WHERE f.product_id = p.id AND f.make = 'Honda' AND f.model = 'CR-V');

-- Honda Civic 2006-2011 Headlights
INSERT INTO product_fitments (id, product_id, make, model, year_start, year_end)
SELECT uuid_generate_v4(), p.id, 'Honda', 'Civic', 2006, 2011
FROM products p
WHERE p.sku IN ('SN10.2006-HL', 'SN10.2006-HR', 'SN14.2006-RS')
AND NOT EXISTS (SELECT 1 FROM product_fitments f WHERE f.product_id = p.id AND f.make = 'Honda' AND f.model = 'Civic');

-- Honda Civic 2006-2008 Bumpers and Grilles
INSERT INTO product_fitments (id, product_id, make, model, year_start, year_end)
SELECT uuid_generate_v4(), p.id, 'Honda', 'Civic', 2006, 2008
FROM products p
WHERE p.sku IN ('SN11.2006-FBC', 'SN12.2006-GR')
AND NOT EXISTS (SELECT 1 FROM product_fitments f WHERE f.product_id = p.id AND f.make = 'Honda' AND f.model = 'Civic');

-- Honda Accord 2003-2007 Fog Lights and Fenders
INSERT INTO product_fitments (id, product_id, make, model, year_start, year_end)
SELECT uuid_generate_v4(), p.id, 'Honda', 'Accord', 2003, 2007
FROM products p
WHERE p.sku IN ('SN10.2003-FL', 'SN10.2003-FR', 'SN12.2003-FDL', 'SN12.2003-FDR', 'SN14.2003-RS')
AND NOT EXISTS (SELECT 1 FROM product_fitments f WHERE f.product_id = p.id AND f.make = 'Honda' AND f.model = 'Accord');

-- Honda Accord 2003-2005 Grilles
INSERT INTO product_fitments (id, product_id, make, model, year_start, year_end)
SELECT uuid_generate_v4(), p.id, 'Honda', 'Accord', 2003, 2005
FROM products p
WHERE p.sku = 'SN12.2003-GR'
AND NOT EXISTS (SELECT 1 FROM product_fitments f WHERE f.product_id = p.id AND f.make = 'Honda' AND f.model = 'Accord');

-- Acura MDX 2001-2006
INSERT INTO product_fitments (id, product_id, make, model, year_start, year_end)
SELECT uuid_generate_v4(), p.id, 'Acura', 'MDX', 2001, 2006
FROM products p
WHERE p.sku IN ('SN11.2801-FBR', 'SN14.2801-EGS', 'SN12.2801-GR')
AND NOT EXISTS (SELECT 1 FROM product_fitments f WHERE f.product_id = p.id AND f.make = 'Acura' AND f.model = 'MDX');

-- ============================================================================
-- SECTION 8: Inventory Logs (Initial Stock)
-- ============================================================================
INSERT INTO inventory_logs (id, product_id, type, quantity_change, quantity_before, quantity_after, reason, reference_id)
SELECT uuid_generate_v4(), p.id, 'IMPORT', p.stock_quantity, 0, p.stock_quantity, 'Initial inventory import from XLSX', 'XLSX-IMPORT-001'
FROM products p
WHERE p.stock_quantity > 0
AND NOT EXISTS (SELECT 1 FROM inventory_logs l WHERE l.product_id = p.id AND l.reference_id = 'XLSX-IMPORT-001');

-- ============================================================================
-- SECTION 9: Features (Master feature list)
-- ============================================================================
INSERT INTO features (id, code, name, description, category) VALUES 
    -- Catalog features
    (uuid_generate_v4(), 'catalog.browse', 'Browse Catalog', 'View product catalog and categories', 'catalog'),
    (uuid_generate_v4(), 'catalog.search', 'Search Products', 'Search products by keywords', 'catalog'),
    (uuid_generate_v4(), 'catalog.viewDetail', 'View Product Detail', 'View detailed product information', 'catalog'),
    (uuid_generate_v4(), 'catalog.fitmentFilter', 'Fitment Filter', 'Filter products by vehicle fitment', 'catalog'),
    -- Cart features
    (uuid_generate_v4(), 'cart.view', 'View Cart', 'View shopping cart contents', 'cart'),
    (uuid_generate_v4(), 'cart.modify', 'Modify Cart', 'Add, update, remove cart items', 'cart'),
    (uuid_generate_v4(), 'cart.checkout', 'Checkout', 'Complete checkout process', 'cart'),
    -- Order features
    (uuid_generate_v4(), 'orders.viewOwn', 'View Own Orders', 'View personal order history', 'orders'),
    (uuid_generate_v4(), 'orders.viewAll', 'View All Orders', 'View all customer orders', 'orders'),
    (uuid_generate_v4(), 'orders.updateStatus', 'Update Order Status', 'Change order status', 'orders'),
    (uuid_generate_v4(), 'orders.cancel', 'Cancel Orders', 'Cancel customer orders', 'orders'),
    (uuid_generate_v4(), 'orders.viewStatistics', 'View Order Statistics', 'Access order analytics', 'orders'),
    -- Inventory features
    (uuid_generate_v4(), 'inventory.view', 'View Inventory', 'View inventory levels', 'inventory'),
    (uuid_generate_v4(), 'inventory.adjust', 'Adjust Inventory', 'Make inventory adjustments', 'inventory'),
    (uuid_generate_v4(), 'inventory.import', 'Import Inventory', 'Import inventory from XLSX', 'inventory'),
    (uuid_generate_v4(), 'inventory.viewHistory', 'View Inventory History', 'View inventory change history', 'inventory'),
    (uuid_generate_v4(), 'inventory.viewAlerts', 'View Inventory Alerts', 'View low stock alerts', 'inventory'),
    -- Product features
    (uuid_generate_v4(), 'products.create', 'Create Products', 'Create new products', 'products'),
    (uuid_generate_v4(), 'products.update', 'Update Products', 'Edit existing products', 'products'),
    (uuid_generate_v4(), 'products.delete', 'Delete Products', 'Remove products', 'products'),
    (uuid_generate_v4(), 'products.manageFitment', 'Manage Fitment', 'Manage product fitment data', 'products'),
    (uuid_generate_v4(), 'products.manageImages', 'Manage Images', 'Upload and manage product images', 'products'),
    -- Dropship features
    (uuid_generate_v4(), 'dropship.viewOrders', 'View Dropship Orders', 'View affiliate/dropship orders', 'dropship'),
    (uuid_generate_v4(), 'dropship.retryPush', 'Retry Order Push', 'Retry failed affiliate order pushes', 'dropship'),
    (uuid_generate_v4(), 'dropship.manageAffiliates', 'Manage Affiliates', 'Manage affiliate configurations', 'dropship'),
    -- User features
    (uuid_generate_v4(), 'users.viewAll', 'View All Users', 'View all system users', 'users'),
    (uuid_generate_v4(), 'users.create', 'Create Users', 'Create new users', 'users'),
    (uuid_generate_v4(), 'users.updateRole', 'Update User Roles', 'Change user role assignments', 'users'),
    (uuid_generate_v4(), 'users.delete', 'Delete Users', 'Remove users from system', 'users'),
    -- Settings features
    (uuid_generate_v4(), 'settings.view', 'View Settings', 'View system settings', 'settings'),
    (uuid_generate_v4(), 'settings.update', 'Update Settings', 'Modify system settings', 'settings'),
    -- Audit features
    (uuid_generate_v4(), 'audit.view', 'View Audit Log', 'View system audit logs', 'audit'),
    (uuid_generate_v4(), 'audit.export', 'Export Audit Log', 'Export audit logs to file', 'audit'),
    -- Report features
    (uuid_generate_v4(), 'reports.salesByDay', 'Sales by Day Report', 'View daily sales reports', 'reports'),
    (uuid_generate_v4(), 'reports.salesByCategory', 'Sales by Category Report', 'View category sales reports', 'reports'),
    (uuid_generate_v4(), 'reports.inventoryValue', 'Inventory Value Report', 'View inventory valuation', 'reports'),
    (uuid_generate_v4(), 'reports.gmv', 'GMV Dashboard', 'View gross merchandise value', 'reports')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- SECTION 10: Settings (Default application settings)
-- ============================================================================
INSERT INTO settings (id, key, value, description, category) VALUES 
    -- General settings
    (uuid_generate_v4(), 'site.name', '"SN Auto Parts"', 'Website name', 'general'),
    (uuid_generate_v4(), 'site.tagline', '"Quality Parts. Guaranteed Fitment."', 'Website tagline', 'general'),
    (uuid_generate_v4(), 'site.contactEmail', '"support@snautoparts.com"', 'Contact email address', 'general'),
    (uuid_generate_v4(), 'site.contactPhone', '"(555) 123-4567"', 'Contact phone number', 'general'),
    -- Shipping settings
    (uuid_generate_v4(), 'shipping.freeShippingThreshold', '99.00', 'Minimum order for free shipping', 'shipping'),
    (uuid_generate_v4(), 'shipping.defaultCarrier', '"USPS"', 'Default shipping carrier', 'shipping'),
    (uuid_generate_v4(), 'shipping.handlingDays', '1', 'Order handling time in days', 'shipping'),
    -- Tax settings
    (uuid_generate_v4(), 'tax.enabled', 'true', 'Enable tax calculation', 'tax'),
    (uuid_generate_v4(), 'tax.defaultRate', '0.0825', 'Default tax rate (8.25%)', 'tax'),
    -- Payment settings
    (uuid_generate_v4(), 'payment.stripeEnabled', 'true', 'Enable Stripe payments', 'payment'),
    (uuid_generate_v4(), 'payment.currency', '"USD"', 'Payment currency', 'payment'),
    -- Inventory settings
    (uuid_generate_v4(), 'inventory.lowStockThreshold', '10', 'Default low stock alert threshold', 'inventory'),
    (uuid_generate_v4(), 'inventory.trackQuantity', 'true', 'Enable inventory tracking', 'inventory'),
    -- Email settings
    (uuid_generate_v4(), 'email.orderConfirmation', 'true', 'Send order confirmation emails', 'email'),
    (uuid_generate_v4(), 'email.shippingNotification', 'true', 'Send shipping notification emails', 'email'),
    (uuid_generate_v4(), 'email.lowStockAlerts', 'true', 'Send low stock alert emails', 'email')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- Commit Transaction
-- ============================================================================
COMMIT;

-- Summary counts
SELECT 'Roles' AS entity, COUNT(*) AS count FROM roles
UNION ALL SELECT 'Role Configs', COUNT(*) FROM role_feature_configs
UNION ALL SELECT 'Brands', COUNT(*) FROM brands
UNION ALL SELECT 'Categories', COUNT(*) FROM categories
UNION ALL SELECT 'Products', COUNT(*) FROM products
UNION ALL SELECT 'Fitments', COUNT(*) FROM product_fitments
UNION ALL SELECT 'Inventory Logs', COUNT(*) FROM inventory_logs
UNION ALL SELECT 'Features', COUNT(*) FROM features
UNION ALL SELECT 'Settings', COUNT(*) FROM settings;

