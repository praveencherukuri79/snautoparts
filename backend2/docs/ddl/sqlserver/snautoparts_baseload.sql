/*
================================================================================
  SN Auto Parts - SQL Server Base Data Load
================================================================================
  
  Version: 1.0.0
  Generated: 2026-01-06
  Database: SQL Server 2019+
  
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
    - All IDs use NEWID() for UNIQUEIDENTIFIER generation
    - Execute in a transaction for atomicity
    - Data can be run multiple times (uses INSERT with NOT EXISTS)
  
================================================================================
*/

SET NOCOUNT ON;
BEGIN TRANSACTION;

PRINT 'Starting SN Auto Parts base data load...';

-- ============================================================================
-- SECTION 1: Roles
-- ============================================================================
PRINT 'Loading roles...';

-- CUSTOMER role
IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE name = 'CUSTOMER')
BEGIN
    INSERT INTO dbo.roles (id, name, display_name, description, is_active)
    VALUES (NEWID(), 'CUSTOMER', 'Customer', 'Regular shoppers and end users', 1);
END

-- MANAGER role
IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE name = 'MANAGER')
BEGIN
    INSERT INTO dbo.roles (id, name, display_name, description, is_active)
    VALUES (NEWID(), 'MANAGER', 'Manager', 'Operations staff, warehouse, and fulfillment', 1);
END

-- ADMIN role
IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE name = 'ADMIN')
BEGIN
    INSERT INTO dbo.roles (id, name, display_name, description, is_active)
    VALUES (NEWID(), 'ADMIN', 'Administrator', 'System administrators and owners', 1);
END

-- ============================================================================
-- SECTION 2: Role Feature Configurations
-- ============================================================================
PRINT 'Loading role feature configurations...';

-- CUSTOMER feature config
DECLARE @customerRoleId UNIQUEIDENTIFIER = (SELECT id FROM dbo.roles WHERE name = 'CUSTOMER');
IF @customerRoleId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.role_feature_configs WHERE role_id = @customerRoleId)
BEGIN
    INSERT INTO dbo.role_feature_configs (id, role_id, config, version)
    VALUES (
        NEWID(),
        @customerRoleId,
        N'{
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
        }',
        1
    );
END

-- MANAGER feature config
DECLARE @managerRoleId UNIQUEIDENTIFIER = (SELECT id FROM dbo.roles WHERE name = 'MANAGER');
IF @managerRoleId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.role_feature_configs WHERE role_id = @managerRoleId)
BEGIN
    INSERT INTO dbo.role_feature_configs (id, role_id, config, version)
    VALUES (
        NEWID(),
        @managerRoleId,
        N'{
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
        }',
        1
    );
END

-- ADMIN feature config
DECLARE @adminRoleId UNIQUEIDENTIFIER = (SELECT id FROM dbo.roles WHERE name = 'ADMIN');
IF @adminRoleId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.role_feature_configs WHERE role_id = @adminRoleId)
BEGIN
    INSERT INTO dbo.role_feature_configs (id, role_id, config, version)
    VALUES (
        NEWID(),
        @adminRoleId,
        N'{
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
        }',
        1
    );
END

-- ============================================================================
-- SECTION 3: Brands
-- ============================================================================
PRINT 'Loading brands...';

IF NOT EXISTS (SELECT 1 FROM dbo.brands WHERE slug = 'sn-auto-parts')
    INSERT INTO dbo.brands (id, name, slug, description, is_active) VALUES (NEWID(), 'SN Auto Parts', 'sn-auto-parts', 'Quality OEM replacement parts', 1);

IF NOT EXISTS (SELECT 1 FROM dbo.brands WHERE slug = 'acdelco')
    INSERT INTO dbo.brands (id, name, slug, description, is_active) VALUES (NEWID(), 'ACDelco', 'acdelco', 'OEM parts for GM vehicles', 1);

IF NOT EXISTS (SELECT 1 FROM dbo.brands WHERE slug = 'bosch')
    INSERT INTO dbo.brands (id, name, slug, description, is_active) VALUES (NEWID(), 'Bosch', 'bosch', 'Premium automotive parts', 1);

IF NOT EXISTS (SELECT 1 FROM dbo.brands WHERE slug = 'denso')
    INSERT INTO dbo.brands (id, name, slug, description, is_active) VALUES (NEWID(), 'Denso', 'denso', 'Japanese OEM manufacturer', 1);

IF NOT EXISTS (SELECT 1 FROM dbo.brands WHERE slug = 'dorman')
    INSERT INTO dbo.brands (id, name, slug, description, is_active) VALUES (NEWID(), 'Dorman', 'dorman', 'Aftermarket replacement parts', 1);

IF NOT EXISTS (SELECT 1 FROM dbo.brands WHERE slug = 'a-premium')
    INSERT INTO dbo.brands (id, name, slug, description, is_active) VALUES (NEWID(), 'A-Premium', 'a-premium', 'Quality aftermarket parts', 1);

IF NOT EXISTS (SELECT 1 FROM dbo.brands WHERE slug = 'trq')
    INSERT INTO dbo.brands (id, name, slug, description, is_active) VALUES (NEWID(), 'TRQ', 'trq', 'Trusted quality parts', 1);

IF NOT EXISTS (SELECT 1 FROM dbo.brands WHERE slug = 'buyautoparts')
    INSERT INTO dbo.brands (id, name, slug, description, is_active) VALUES (NEWID(), 'BuyAutoParts', 'buyautoparts', 'Affordable auto parts', 1);

-- ============================================================================
-- SECTION 4: Categories (Master)
-- ============================================================================
PRINT 'Loading master categories...';

-- Lighting
IF NOT EXISTS (SELECT 1 FROM dbo.categories WHERE slug = 'lighting')
    INSERT INTO dbo.categories (id, name, slug, description, sort_order, is_active) VALUES (NEWID(), 'Lighting', 'lighting', 'Vehicle lighting components including headlights, tail lights, and fog lights', 0, 1);

-- Exterior
IF NOT EXISTS (SELECT 1 FROM dbo.categories WHERE slug = 'exterior')
    INSERT INTO dbo.categories (id, name, slug, description, sort_order, is_active) VALUES (NEWID(), 'Exterior', 'exterior', 'Exterior body parts and accessories', 1, 1);

-- Cooling
IF NOT EXISTS (SELECT 1 FROM dbo.categories WHERE slug = 'cooling')
    INSERT INTO dbo.categories (id, name, slug, description, sort_order, is_active) VALUES (NEWID(), 'Cooling', 'cooling', 'Engine cooling system components', 2, 1);

-- Brakes
IF NOT EXISTS (SELECT 1 FROM dbo.categories WHERE slug = 'brakes')
    INSERT INTO dbo.categories (id, name, slug, description, sort_order, is_active) VALUES (NEWID(), 'Brakes', 'brakes', 'Brake system components', 3, 1);

-- Suspension & Steering
IF NOT EXISTS (SELECT 1 FROM dbo.categories WHERE slug = 'suspension-steering')
    INSERT INTO dbo.categories (id, name, slug, description, sort_order, is_active) VALUES (NEWID(), 'Suspension & Steering', 'suspension-steering', 'Suspension and steering components', 4, 1);

-- Engine Parts
IF NOT EXISTS (SELECT 1 FROM dbo.categories WHERE slug = 'engine-parts')
    INSERT INTO dbo.categories (id, name, slug, description, sort_order, is_active) VALUES (NEWID(), 'Engine Parts', 'engine-parts', 'Engine components and accessories', 5, 1);

-- ============================================================================
-- SECTION 5: Subcategories
-- ============================================================================
PRINT 'Loading subcategories...';

-- Lighting subcategories
DECLARE @lightingId UNIQUEIDENTIFIER = (SELECT id FROM dbo.categories WHERE slug = 'lighting');
IF @lightingId IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM dbo.categories WHERE slug = 'tail-lights')
        INSERT INTO dbo.categories (id, name, slug, description, parent_id, sort_order, is_active) VALUES (NEWID(), 'Tail Lights', 'tail-lights', 'Tail light assemblies and components', @lightingId, 10, 1);
    IF NOT EXISTS (SELECT 1 FROM dbo.categories WHERE slug = 'headlights')
        INSERT INTO dbo.categories (id, name, slug, description, parent_id, sort_order, is_active) VALUES (NEWID(), 'Headlights', 'headlights', 'Headlight assemblies and components', @lightingId, 11, 1);
    IF NOT EXISTS (SELECT 1 FROM dbo.categories WHERE slug = 'fog-lights')
        INSERT INTO dbo.categories (id, name, slug, description, parent_id, sort_order, is_active) VALUES (NEWID(), 'Fog Lights', 'fog-lights', 'Fog light assemblies and components', @lightingId, 12, 1);
END

-- Exterior subcategories
DECLARE @exteriorId UNIQUEIDENTIFIER = (SELECT id FROM dbo.categories WHERE slug = 'exterior');
IF @exteriorId IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM dbo.categories WHERE slug = 'bumpers-components')
        INSERT INTO dbo.categories (id, name, slug, description, parent_id, sort_order, is_active) VALUES (NEWID(), 'Bumpers & Components', 'bumpers-components', 'Front and rear bumpers, reinforcements, and covers', @exteriorId, 20, 1);
    IF NOT EXISTS (SELECT 1 FROM dbo.categories WHERE slug = 'fenders-components')
        INSERT INTO dbo.categories (id, name, slug, description, parent_id, sort_order, is_active) VALUES (NEWID(), 'Fenders & Components', 'fenders-components', 'Fenders, liners, and wheel opening moldings', @exteriorId, 21, 1);
    IF NOT EXISTS (SELECT 1 FROM dbo.categories WHERE slug = 'grilles-components')
        INSERT INTO dbo.categories (id, name, slug, description, parent_id, sort_order, is_active) VALUES (NEWID(), 'Grilles & Components', 'grilles-components', 'Front grilles and grille assemblies', @exteriorId, 22, 1);
END

-- Cooling subcategories
DECLARE @coolingId UNIQUEIDENTIFIER = (SELECT id FROM dbo.categories WHERE slug = 'cooling');
IF @coolingId IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM dbo.categories WHERE slug = 'radiators-components')
        INSERT INTO dbo.categories (id, name, slug, description, parent_id, sort_order, is_active) VALUES (NEWID(), 'Radiators & Components', 'radiators-components', 'Radiators, supports, and splash shields', @coolingId, 30, 1);
    IF NOT EXISTS (SELECT 1 FROM dbo.categories WHERE slug = 'water-pumps')
        INSERT INTO dbo.categories (id, name, slug, description, parent_id, sort_order, is_active) VALUES (NEWID(), 'Water Pumps', 'water-pumps', 'Cooling system water pumps', @coolingId, 31, 1);
END

-- ============================================================================
-- SECTION 6: Products (Real Inventory Data from XLSX)
-- ============================================================================
PRINT 'Loading products from inventory data...';

-- Get reference IDs
DECLARE @snBrandId UNIQUEIDENTIFIER = (SELECT id FROM dbo.brands WHERE slug = 'sn-auto-parts');
DECLARE @tailLightsId UNIQUEIDENTIFIER = (SELECT id FROM dbo.categories WHERE slug = 'tail-lights');
DECLARE @headlightsId UNIQUEIDENTIFIER = (SELECT id FROM dbo.categories WHERE slug = 'headlights');
DECLARE @fogLightsId UNIQUEIDENTIFIER = (SELECT id FROM dbo.categories WHERE slug = 'fog-lights');
DECLARE @bumpersId UNIQUEIDENTIFIER = (SELECT id FROM dbo.categories WHERE slug = 'bumpers-components');
DECLARE @fendersId UNIQUEIDENTIFIER = (SELECT id FROM dbo.categories WHERE slug = 'fenders-components');
DECLARE @grillesId UNIQUEIDENTIFIER = (SELECT id FROM dbo.categories WHERE slug = 'grilles-components');
DECLARE @radiatorsId UNIQUEIDENTIFIER = (SELECT id FROM dbo.categories WHERE slug = 'radiators-components');

-- ============ TAIL LIGHTS ============
IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE sku = 'SN10.1998-ITL')
    INSERT INTO dbo.products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, upc, length, width, height, weight, fulfillment_type, is_featured)
    VALUES (NEWID(), 'SN10.1998-ITL', 'Tail Light Assembly Inner LH - (98-00)', 'tail-light-assembly-inner-lh-98-00-sn10-1998-itl', 'Tail Light Assembly Inner LH - OEM quality replacement part for Honda Accord 1998-2000', 59.99, 27.00, @tailLightsId, @snBrandId, 4, '762530098314', 18.5, 8.5, 4, 2, 'INVENTORY', 0);

IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE sku = 'SN10.1998-ITR')
    INSERT INTO dbo.products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, upc, length, width, height, weight, fulfillment_type, is_featured)
    VALUES (NEWID(), 'SN10.1998-ITR', 'Tail Light Assembly Inner RH - (98-00)', 'tail-light-assembly-inner-rh-98-00-sn10-1998-itr', 'Tail Light Assembly Inner RH - OEM quality replacement part for Honda Accord 1998-2000', 59.99, 27.00, @tailLightsId, @snBrandId, 4, '762530393518', 18.5, 8.5, 4, 2, 'INVENTORY', 0);

IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE sku = 'SN10.1998-OTL')
    INSERT INTO dbo.products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, upc, length, width, height, weight, fulfillment_type, is_featured)
    VALUES (NEWID(), 'SN10.1998-OTL', 'Tail Light Assembly Outer LH - (98-00)', 'tail-light-assembly-outer-lh-98-00-sn10-1998-otl', 'Tail Light Assembly Outer LH - OEM quality replacement part for Honda Accord 1998-2000', 69.99, 31.50, @tailLightsId, @snBrandId, 4, '762530484568', 18, 10, 8, 3, 'INVENTORY', 0);

IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE sku = 'SN10.1998-OTR')
    INSERT INTO dbo.products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, upc, length, width, height, weight, fulfillment_type, is_featured)
    VALUES (NEWID(), 'SN10.1998-OTR', 'Tail Light Assembly Outer RH - (98-00)', 'tail-light-assembly-outer-rh-98-00-sn10-1998-otr', 'Tail Light Assembly Outer RH - OEM quality replacement part for Honda Accord 1998-2000', 69.99, 31.50, @tailLightsId, @snBrandId, 4, '762530423321', 18, 10, 8, 3, 'INVENTORY', 0);

IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE sku = 'SN10.1803-TLL')
    INSERT INTO dbo.products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, upc, length, width, height, weight, fulfillment_type, is_featured)
    VALUES (NEWID(), 'SN10.1803-TLL', 'Tail Light Assembly LH - (03-05)', 'tail-light-assembly-lh-03-05-sn10-1803-tll', 'Tail Light Assembly LH - OEM quality replacement part for Honda Accord 2003-2005', 79.99, 36.00, @tailLightsId, @snBrandId, 4, '762530294657', 16.5, 13.5, 9, 4, 'INVENTORY', 0);

IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE sku = 'SN10.1803-TLR')
    INSERT INTO dbo.products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, upc, length, width, height, weight, fulfillment_type, is_featured)
    VALUES (NEWID(), 'SN10.1803-TLR', 'Tail Light Assembly RH - (03-05)', 'tail-light-assembly-rh-03-05-sn10-1803-tlr', 'Tail Light Assembly RH - OEM quality replacement part for Honda Accord 2003-2005', 79.99, 36.00, @tailLightsId, @snBrandId, 4, '762530294664', 16.5, 13.5, 9, 4, 'INVENTORY', 0);

-- ============ HEADLIGHTS ============
IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE sku = 'SN10.1802-HL')
    INSERT INTO dbo.products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, upc, length, width, height, weight, fulfillment_type, is_featured)
    VALUES (NEWID(), 'SN10.1802-HL', 'Headlight Assembly LH - (02-04)', 'headlight-assembly-lh-02-04-sn10-1802-hl', 'Headlight Assembly LH - OEM quality replacement part for Honda CR-V 2002-2004', 119.99, 54.00, @headlightsId, @snBrandId, 4, '759126593186', 24.75, 13.5, 13.5, 7.4, 'INVENTORY', 0);

IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE sku = 'SN10.1802-HR')
    INSERT INTO dbo.products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, upc, length, width, height, weight, fulfillment_type, is_featured)
    VALUES (NEWID(), 'SN10.1802-HR', 'Headlight Assembly RH - (02-04)', 'headlight-assembly-rh-02-04-sn10-1802-hr', 'Headlight Assembly RH - OEM quality replacement part for Honda CR-V 2002-2004', 119.99, 54.00, @headlightsId, @snBrandId, 4, '759126593193', 24.75, 13.5, 13.5, 7.4, 'INVENTORY', 0);

IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE sku = 'SN10.2006-HL')
    INSERT INTO dbo.products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, length, width, height, weight, fulfillment_type, is_featured)
    VALUES (NEWID(), 'SN10.2006-HL', 'Civic Headlight Assembly LH - (06-11)', 'civic-headlight-assembly-lh-06-11-sn10-2006-hl', 'Civic Headlight Assembly LH - OEM quality replacement part for Honda Civic 2006-2011', 109.99, 49.50, @headlightsId, @snBrandId, 6, 22, 12, 12, 6.5, 'INVENTORY', 1);

IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE sku = 'SN10.2006-HR')
    INSERT INTO dbo.products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, length, width, height, weight, fulfillment_type, is_featured)
    VALUES (NEWID(), 'SN10.2006-HR', 'Civic Headlight Assembly RH - (06-11)', 'civic-headlight-assembly-rh-06-11-sn10-2006-hr', 'Civic Headlight Assembly RH - OEM quality replacement part for Honda Civic 2006-2011', 109.99, 49.50, @headlightsId, @snBrandId, 6, 22, 12, 12, 6.5, 'INVENTORY', 1);

-- ============ FOG LIGHTS ============
IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE sku = 'SN10.1802-FL')
    INSERT INTO dbo.products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, length, width, height, weight, fulfillment_type, is_featured)
    VALUES (NEWID(), 'SN10.1802-FL', 'Fog Light Assembly (Wo Bezel) LH - (02-06)', 'fog-light-assembly-wo-bezel-lh-02-06-sn10-1802-fl', 'Fog Light Assembly (Wo Bezel) LH - OEM quality replacement part for Honda CR-V 2002-2006', 49.99, 22.50, @fogLightsId, @snBrandId, 6, 13, 7.25, 5, 1.8, 'INVENTORY', 1);

IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE sku = 'SN10.1802-FR')
    INSERT INTO dbo.products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, length, width, height, weight, fulfillment_type, is_featured)
    VALUES (NEWID(), 'SN10.1802-FR', 'Fog Light Assembly (Wo Bezel) RH - (02-06)', 'fog-light-assembly-wo-bezel-rh-02-06-sn10-1802-fr', 'Fog Light Assembly (Wo Bezel) RH - OEM quality replacement part for Honda CR-V 2002-2006', 49.99, 22.50, @fogLightsId, @snBrandId, 6, 13, 7.25, 5, 1.8, 'INVENTORY', 1);

IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE sku = 'SN10.2003-FL')
    INSERT INTO dbo.products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, length, width, height, weight, fulfillment_type, is_featured)
    VALUES (NEWID(), 'SN10.2003-FL', 'Accord Fog Light Assembly LH - (03-07)', 'accord-fog-light-assembly-lh-03-07-sn10-2003-fl', 'Accord Fog Light Assembly LH - OEM quality replacement part for Honda Accord 2003-2007', 54.99, 24.75, @fogLightsId, @snBrandId, 8, 14, 8, 6, 2.2, 'INVENTORY', 1);

IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE sku = 'SN10.2003-FR')
    INSERT INTO dbo.products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, length, width, height, weight, fulfillment_type, is_featured)
    VALUES (NEWID(), 'SN10.2003-FR', 'Accord Fog Light Assembly RH - (03-07)', 'accord-fog-light-assembly-rh-03-07-sn10-2003-fr', 'Accord Fog Light Assembly RH - OEM quality replacement part for Honda Accord 2003-2007', 54.99, 24.75, @fogLightsId, @snBrandId, 8, 14, 8, 6, 2.2, 'INVENTORY', 1);

-- ============ BUMPERS & COMPONENTS ============
IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE sku = 'SN11.2801-FBR')
    INSERT INTO dbo.products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, fulfillment_type, is_featured)
    VALUES (NEWID(), 'SN11.2801-FBR', 'Acura MDX Front Bumper Reinforcement', 'acura-mdx-front-bumper-reinforcement-sn11-2801-fbr', 'Acura MDX Front Bumper Reinforcement - OEM quality replacement part for Acura MDX 2001-2006', 129.99, 58.50, @bumpersId, @snBrandId, 5, 'INVENTORY', 0);

IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE sku = 'SN11.1802-FBC')
    INSERT INTO dbo.products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, length, width, height, weight, fulfillment_type, is_featured)
    VALUES (NEWID(), 'SN11.1802-FBC', 'CR-V Front Bumper Cover - (02-04)', 'crv-front-bumper-cover-02-04-sn11-1802-fbc', 'CR-V Front Bumper Cover - OEM quality replacement part for Honda CR-V 2002-2004', 189.99, 85.50, @bumpersId, @snBrandId, 3, 60, 24, 18, 12, 'INVENTORY', 0);

IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE sku = 'SN11.2006-FBC')
    INSERT INTO dbo.products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, length, width, height, weight, fulfillment_type, is_featured)
    VALUES (NEWID(), 'SN11.2006-FBC', 'Civic Front Bumper Cover - (06-08)', 'civic-front-bumper-cover-06-08-sn11-2006-fbc', 'Civic Front Bumper Cover - OEM quality replacement part for Honda Civic 2006-2008', 169.99, 76.50, @bumpersId, @snBrandId, 4, 58, 22, 16, 10, 'INVENTORY', 0);

-- ============ FENDERS & COMPONENTS ============
IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE sku = 'SN10.1802-FDWM')
    INSERT INTO dbo.products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, fulfillment_type, is_featured)
    VALUES (NEWID(), 'SN10.1802-FDWM', 'CR-V Front Driver Side Wheel Opening Moulding', 'crv-front-driver-side-wheel-opening-moulding-sn10-1802-fdwm', 'CR-V Front Driver Side Wheel Opening Moulding - OEM quality replacement part for Honda CR-V 2002-2004', 39.99, 18.00, @fendersId, @snBrandId, 10, 'INVENTORY', 1);

IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE sku = 'SN10.1802-FPWM')
    INSERT INTO dbo.products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, fulfillment_type, is_featured)
    VALUES (NEWID(), 'SN10.1802-FPWM', 'CR-V Front Passenger Side Wheel Opening Moulding', 'crv-front-passenger-side-wheel-opening-moulding-sn10-1802-fpwm', 'CR-V Front Passenger Side Wheel Opening Moulding - OEM quality replacement part for Honda CR-V 2002-2004', 39.99, 18.00, @fendersId, @snBrandId, 10, 'INVENTORY', 1);

IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE sku = 'SN12.2003-FDL')
    INSERT INTO dbo.products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, fulfillment_type, is_featured)
    VALUES (NEWID(), 'SN12.2003-FDL', 'Accord Front Fender Liner LH - (03-07)', 'accord-front-fender-liner-lh-03-07-sn12-2003-fdl', 'Accord Front Fender Liner LH - OEM quality replacement part for Honda Accord 2003-2007', 44.99, 20.25, @fendersId, @snBrandId, 8, 'INVENTORY', 1);

IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE sku = 'SN12.2003-FDR')
    INSERT INTO dbo.products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, fulfillment_type, is_featured)
    VALUES (NEWID(), 'SN12.2003-FDR', 'Accord Front Fender Liner RH - (03-07)', 'accord-front-fender-liner-rh-03-07-sn12-2003-fdr', 'Accord Front Fender Liner RH - OEM quality replacement part for Honda Accord 2003-2007', 44.99, 20.25, @fendersId, @snBrandId, 8, 'INVENTORY', 1);

-- ============ GRILLES & COMPONENTS ============
IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE sku = 'SN12.1805-GL')
    INSERT INTO dbo.products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, fulfillment_type, is_featured)
    VALUES (NEWID(), 'SN12.1805-GL', 'CR-V Inner Grille - (05-06)', 'crv-inner-grille-05-06-sn12-1805-gl', 'CR-V Inner Grille - OEM quality replacement part for Honda CR-V 2005-2006', 69.99, 31.50, @grillesId, @snBrandId, 10, 'INVENTORY', 1);

IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE sku = 'SN12.2003-GR')
    INSERT INTO dbo.products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, fulfillment_type, is_featured)
    VALUES (NEWID(), 'SN12.2003-GR', 'Accord Front Grille Assembly - (03-05)', 'accord-front-grille-assembly-03-05-sn12-2003-gr', 'Accord Front Grille Assembly - OEM quality replacement part for Honda Accord 2003-2005', 79.99, 36.00, @grillesId, @snBrandId, 6, 'INVENTORY', 1);

IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE sku = 'SN12.2006-GR')
    INSERT INTO dbo.products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, fulfillment_type, is_featured)
    VALUES (NEWID(), 'SN12.2006-GR', 'Civic Front Grille Assembly - (06-08)', 'civic-front-grille-assembly-06-08-sn12-2006-gr', 'Civic Front Grille Assembly - OEM quality replacement part for Honda Civic 2006-2008', 74.99, 33.75, @grillesId, @snBrandId, 8, 'INVENTORY', 1);

IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE sku = 'SN12.2801-GR')
    INSERT INTO dbo.products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, fulfillment_type, is_featured)
    VALUES (NEWID(), 'SN12.2801-GR', 'Acura MDX Front Grille Assembly - (01-06)', 'acura-mdx-front-grille-assembly-01-06-sn12-2801-gr', 'Acura MDX Front Grille Assembly - OEM quality replacement part for Acura MDX 2001-2006', 99.99, 45.00, @grillesId, @snBrandId, 4, 'INVENTORY', 0);

-- ============ RADIATORS & COMPONENTS ============
IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE sku = 'SN14.2801-EGS')
    INSERT INTO dbo.products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, fulfillment_type, is_featured)
    VALUES (NEWID(), 'SN14.2801-EGS', 'Acura MDX Front Plastic Engine Splash Shield', 'acura-mdx-front-plastic-engine-splash-shield-sn14-2801-egs', 'Acura MDX Front Plastic Engine Splash Shield - OEM quality replacement part for Acura MDX 2001-2006', 59.99, 27.00, @radiatorsId, @snBrandId, 10, 'INVENTORY', 1);

IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE sku = 'SN14.1802-RS')
    INSERT INTO dbo.products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, fulfillment_type, is_featured)
    VALUES (NEWID(), 'SN14.1802-RS', 'CR-V Radiator Support - (02-06)', 'crv-radiator-support-02-06-sn14-1802-rs', 'CR-V Radiator Support - OEM quality replacement part for Honda CR-V 2002-2006', 139.99, 63.00, @radiatorsId, @snBrandId, 3, 'INVENTORY', 0);

IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE sku = 'SN14.2003-RS')
    INSERT INTO dbo.products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, fulfillment_type, is_featured)
    VALUES (NEWID(), 'SN14.2003-RS', 'Accord Radiator Support - (03-07)', 'accord-radiator-support-03-07-sn14-2003-rs', 'Accord Radiator Support - OEM quality replacement part for Honda Accord 2003-2007', 149.99, 67.50, @radiatorsId, @snBrandId, 4, 'INVENTORY', 0);

IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE sku = 'SN14.2006-RS')
    INSERT INTO dbo.products (id, sku, name, slug, description, price, cost_price, category_id, brand_id, stock_quantity, fulfillment_type, is_featured)
    VALUES (NEWID(), 'SN14.2006-RS', 'Civic Radiator Support - (06-11)', 'civic-radiator-support-06-11-sn14-2006-rs', 'Civic Radiator Support - OEM quality replacement part for Honda Civic 2006-2011', 129.99, 58.50, @radiatorsId, @snBrandId, 5, 'INVENTORY', 0);

-- ============================================================================
-- SECTION 7: Product Fitments
-- ============================================================================
PRINT 'Loading product fitments...';

-- Honda Accord 1998-2000 Tail Lights
INSERT INTO dbo.product_fitments (id, product_id, make, model, year_start, year_end)
SELECT NEWID(), p.id, 'Honda', 'Accord', 1998, 2000
FROM dbo.products p
WHERE p.sku IN ('SN10.1998-ITL', 'SN10.1998-ITR', 'SN10.1998-OTL', 'SN10.1998-OTR')
AND NOT EXISTS (SELECT 1 FROM dbo.product_fitments f WHERE f.product_id = p.id AND f.make = 'Honda' AND f.model = 'Accord');

-- Honda Accord 2003-2005 Tail Lights
INSERT INTO dbo.product_fitments (id, product_id, make, model, year_start, year_end)
SELECT NEWID(), p.id, 'Honda', 'Accord', 2003, 2005
FROM dbo.products p
WHERE p.sku IN ('SN10.1803-TLL', 'SN10.1803-TLR')
AND NOT EXISTS (SELECT 1 FROM dbo.product_fitments f WHERE f.product_id = p.id AND f.make = 'Honda' AND f.model = 'Accord');

-- Honda CR-V 2002-2004 Headlights
INSERT INTO dbo.product_fitments (id, product_id, make, model, year_start, year_end)
SELECT NEWID(), p.id, 'Honda', 'CR-V', 2002, 2004
FROM dbo.products p
WHERE p.sku IN ('SN10.1802-HL', 'SN10.1802-HR', 'SN10.1802-FDWM', 'SN10.1802-FPWM')
AND NOT EXISTS (SELECT 1 FROM dbo.product_fitments f WHERE f.product_id = p.id AND f.make = 'Honda' AND f.model = 'CR-V');

-- Honda CR-V 2002-2006 Fog Lights
INSERT INTO dbo.product_fitments (id, product_id, make, model, year_start, year_end)
SELECT NEWID(), p.id, 'Honda', 'CR-V', 2002, 2006
FROM dbo.products p
WHERE p.sku IN ('SN10.1802-FL', 'SN10.1802-FR', 'SN14.1802-RS')
AND NOT EXISTS (SELECT 1 FROM dbo.product_fitments f WHERE f.product_id = p.id AND f.make = 'Honda' AND f.model = 'CR-V');

-- Honda CR-V 2005-2006 Grilles
INSERT INTO dbo.product_fitments (id, product_id, make, model, year_start, year_end)
SELECT NEWID(), p.id, 'Honda', 'CR-V', 2005, 2006
FROM dbo.products p
WHERE p.sku = 'SN12.1805-GL'
AND NOT EXISTS (SELECT 1 FROM dbo.product_fitments f WHERE f.product_id = p.id AND f.make = 'Honda' AND f.model = 'CR-V');

-- Honda Civic 2006-2011 Headlights and Fenders
INSERT INTO dbo.product_fitments (id, product_id, make, model, year_start, year_end)
SELECT NEWID(), p.id, 'Honda', 'Civic', 2006, 2011
FROM dbo.products p
WHERE p.sku IN ('SN10.2006-HL', 'SN10.2006-HR', 'SN14.2006-RS')
AND NOT EXISTS (SELECT 1 FROM dbo.product_fitments f WHERE f.product_id = p.id AND f.make = 'Honda' AND f.model = 'Civic');

-- Honda Civic 2006-2008 Bumpers and Grilles
INSERT INTO dbo.product_fitments (id, product_id, make, model, year_start, year_end)
SELECT NEWID(), p.id, 'Honda', 'Civic', 2006, 2008
FROM dbo.products p
WHERE p.sku IN ('SN11.2006-FBC', 'SN12.2006-GR')
AND NOT EXISTS (SELECT 1 FROM dbo.product_fitments f WHERE f.product_id = p.id AND f.make = 'Honda' AND f.model = 'Civic');

-- Honda Accord 2003-2007 Fog Lights and Fenders
INSERT INTO dbo.product_fitments (id, product_id, make, model, year_start, year_end)
SELECT NEWID(), p.id, 'Honda', 'Accord', 2003, 2007
FROM dbo.products p
WHERE p.sku IN ('SN10.2003-FL', 'SN10.2003-FR', 'SN12.2003-FDL', 'SN12.2003-FDR', 'SN14.2003-RS')
AND NOT EXISTS (SELECT 1 FROM dbo.product_fitments f WHERE f.product_id = p.id AND f.make = 'Honda' AND f.model = 'Accord');

-- Honda Accord 2003-2005 Grilles
INSERT INTO dbo.product_fitments (id, product_id, make, model, year_start, year_end)
SELECT NEWID(), p.id, 'Honda', 'Accord', 2003, 2005
FROM dbo.products p
WHERE p.sku = 'SN12.2003-GR'
AND NOT EXISTS (SELECT 1 FROM dbo.product_fitments f WHERE f.product_id = p.id AND f.make = 'Honda' AND f.model = 'Accord');

-- Acura MDX 2001-2006
INSERT INTO dbo.product_fitments (id, product_id, make, model, year_start, year_end)
SELECT NEWID(), p.id, 'Acura', 'MDX', 2001, 2006
FROM dbo.products p
WHERE p.sku IN ('SN11.2801-FBR', 'SN14.2801-EGS', 'SN12.2801-GR')
AND NOT EXISTS (SELECT 1 FROM dbo.product_fitments f WHERE f.product_id = p.id AND f.make = 'Acura' AND f.model = 'MDX');

-- ============================================================================
-- SECTION 8: Inventory Logs (Initial Stock)
-- ============================================================================
PRINT 'Loading initial inventory logs...';

INSERT INTO dbo.inventory_logs (id, product_id, type, quantity_change, quantity_before, quantity_after, reason, reference_id)
SELECT NEWID(), p.id, 'IMPORT', p.stock_quantity, 0, p.stock_quantity, 'Initial inventory import from XLSX', 'XLSX-IMPORT-001'
FROM dbo.products p
WHERE p.stock_quantity > 0
AND NOT EXISTS (SELECT 1 FROM dbo.inventory_logs l WHERE l.product_id = p.id AND l.reference_id = 'XLSX-IMPORT-001');

-- ============================================================================
-- SECTION 9: Features (Master feature list)
-- ============================================================================
PRINT 'Loading features...';

-- Catalog features
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'catalog.browse')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'catalog.browse', 'Browse Catalog', 'View product catalog and categories', 'catalog');
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'catalog.search')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'catalog.search', 'Search Products', 'Search products by keywords', 'catalog');
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'catalog.viewDetail')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'catalog.viewDetail', 'View Product Detail', 'View detailed product information', 'catalog');
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'catalog.fitmentFilter')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'catalog.fitmentFilter', 'Fitment Filter', 'Filter products by vehicle fitment', 'catalog');

-- Cart features
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'cart.view')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'cart.view', 'View Cart', 'View shopping cart contents', 'cart');
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'cart.modify')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'cart.modify', 'Modify Cart', 'Add, update, remove cart items', 'cart');
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'cart.checkout')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'cart.checkout', 'Checkout', 'Complete checkout process', 'cart');

-- Order features
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'orders.viewOwn')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'orders.viewOwn', 'View Own Orders', 'View personal order history', 'orders');
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'orders.viewAll')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'orders.viewAll', 'View All Orders', 'View all customer orders', 'orders');
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'orders.updateStatus')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'orders.updateStatus', 'Update Order Status', 'Change order status', 'orders');
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'orders.cancel')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'orders.cancel', 'Cancel Orders', 'Cancel customer orders', 'orders');
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'orders.viewStatistics')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'orders.viewStatistics', 'View Order Statistics', 'Access order analytics', 'orders');

-- Inventory features
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'inventory.view')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'inventory.view', 'View Inventory', 'View inventory levels', 'inventory');
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'inventory.adjust')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'inventory.adjust', 'Adjust Inventory', 'Make inventory adjustments', 'inventory');
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'inventory.import')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'inventory.import', 'Import Inventory', 'Import inventory from XLSX', 'inventory');
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'inventory.viewHistory')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'inventory.viewHistory', 'View Inventory History', 'View inventory change history', 'inventory');
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'inventory.viewAlerts')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'inventory.viewAlerts', 'View Inventory Alerts', 'View low stock alerts', 'inventory');

-- Product features
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'products.create')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'products.create', 'Create Products', 'Create new products', 'products');
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'products.update')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'products.update', 'Update Products', 'Edit existing products', 'products');
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'products.delete')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'products.delete', 'Delete Products', 'Remove products', 'products');
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'products.manageFitment')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'products.manageFitment', 'Manage Fitment', 'Manage product fitment data', 'products');
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'products.manageImages')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'products.manageImages', 'Manage Images', 'Upload and manage product images', 'products');

-- Dropship features
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'dropship.viewOrders')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'dropship.viewOrders', 'View Dropship Orders', 'View affiliate/dropship orders', 'dropship');
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'dropship.retryPush')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'dropship.retryPush', 'Retry Order Push', 'Retry failed affiliate order pushes', 'dropship');
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'dropship.manageAffiliates')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'dropship.manageAffiliates', 'Manage Affiliates', 'Manage affiliate configurations', 'dropship');

-- User features
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'users.viewAll')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'users.viewAll', 'View All Users', 'View all system users', 'users');
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'users.create')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'users.create', 'Create Users', 'Create new users', 'users');
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'users.updateRole')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'users.updateRole', 'Update User Roles', 'Change user role assignments', 'users');
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'users.delete')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'users.delete', 'Delete Users', 'Remove users from system', 'users');

-- Settings features
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'settings.view')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'settings.view', 'View Settings', 'View system settings', 'settings');
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'settings.update')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'settings.update', 'Update Settings', 'Modify system settings', 'settings');

-- Audit features
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'audit.view')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'audit.view', 'View Audit Log', 'View system audit logs', 'audit');
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'audit.export')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'audit.export', 'Export Audit Log', 'Export audit logs to file', 'audit');

-- Report features
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'reports.salesByDay')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'reports.salesByDay', 'Sales by Day Report', 'View daily sales reports', 'reports');
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'reports.salesByCategory')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'reports.salesByCategory', 'Sales by Category Report', 'View category sales reports', 'reports');
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'reports.inventoryValue')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'reports.inventoryValue', 'Inventory Value Report', 'View inventory valuation', 'reports');
IF NOT EXISTS (SELECT 1 FROM dbo.features WHERE code = 'reports.gmv')
    INSERT INTO dbo.features (id, code, name, description, category) VALUES (NEWID(), 'reports.gmv', 'GMV Dashboard', 'View gross merchandise value', 'reports');

-- ============================================================================
-- SECTION 10: Settings (Default application settings)
-- ============================================================================
PRINT 'Loading settings...';

-- General settings
IF NOT EXISTS (SELECT 1 FROM dbo.settings WHERE [key] = 'site.name')
    INSERT INTO dbo.settings (id, [key], value, description, category) VALUES (NEWID(), 'site.name', '"SN Auto Parts"', 'Website name', 'general');
IF NOT EXISTS (SELECT 1 FROM dbo.settings WHERE [key] = 'site.tagline')
    INSERT INTO dbo.settings (id, [key], value, description, category) VALUES (NEWID(), 'site.tagline', '"Quality Parts. Guaranteed Fitment."', 'Website tagline', 'general');
IF NOT EXISTS (SELECT 1 FROM dbo.settings WHERE [key] = 'site.contactEmail')
    INSERT INTO dbo.settings (id, [key], value, description, category) VALUES (NEWID(), 'site.contactEmail', '"support@snautoparts.com"', 'Contact email address', 'general');
IF NOT EXISTS (SELECT 1 FROM dbo.settings WHERE [key] = 'site.contactPhone')
    INSERT INTO dbo.settings (id, [key], value, description, category) VALUES (NEWID(), 'site.contactPhone', '"(555) 123-4567"', 'Contact phone number', 'general');

-- Shipping settings
IF NOT EXISTS (SELECT 1 FROM dbo.settings WHERE [key] = 'shipping.freeShippingThreshold')
    INSERT INTO dbo.settings (id, [key], value, description, category) VALUES (NEWID(), 'shipping.freeShippingThreshold', '99.00', 'Minimum order for free shipping', 'shipping');
IF NOT EXISTS (SELECT 1 FROM dbo.settings WHERE [key] = 'shipping.defaultCarrier')
    INSERT INTO dbo.settings (id, [key], value, description, category) VALUES (NEWID(), 'shipping.defaultCarrier', '"USPS"', 'Default shipping carrier', 'shipping');
IF NOT EXISTS (SELECT 1 FROM dbo.settings WHERE [key] = 'shipping.handlingDays')
    INSERT INTO dbo.settings (id, [key], value, description, category) VALUES (NEWID(), 'shipping.handlingDays', '1', 'Order handling time in days', 'shipping');

-- Tax settings
IF NOT EXISTS (SELECT 1 FROM dbo.settings WHERE [key] = 'tax.enabled')
    INSERT INTO dbo.settings (id, [key], value, description, category) VALUES (NEWID(), 'tax.enabled', 'true', 'Enable tax calculation', 'tax');
IF NOT EXISTS (SELECT 1 FROM dbo.settings WHERE [key] = 'tax.defaultRate')
    INSERT INTO dbo.settings (id, [key], value, description, category) VALUES (NEWID(), 'tax.defaultRate', '0.0825', 'Default tax rate (8.25%)', 'tax');

-- Payment settings
IF NOT EXISTS (SELECT 1 FROM dbo.settings WHERE [key] = 'payment.stripeEnabled')
    INSERT INTO dbo.settings (id, [key], value, description, category) VALUES (NEWID(), 'payment.stripeEnabled', 'true', 'Enable Stripe payments', 'payment');
IF NOT EXISTS (SELECT 1 FROM dbo.settings WHERE [key] = 'payment.currency')
    INSERT INTO dbo.settings (id, [key], value, description, category) VALUES (NEWID(), 'payment.currency', '"USD"', 'Payment currency', 'payment');

-- Inventory settings
IF NOT EXISTS (SELECT 1 FROM dbo.settings WHERE [key] = 'inventory.lowStockThreshold')
    INSERT INTO dbo.settings (id, [key], value, description, category) VALUES (NEWID(), 'inventory.lowStockThreshold', '10', 'Default low stock alert threshold', 'inventory');
IF NOT EXISTS (SELECT 1 FROM dbo.settings WHERE [key] = 'inventory.trackQuantity')
    INSERT INTO dbo.settings (id, [key], value, description, category) VALUES (NEWID(), 'inventory.trackQuantity', 'true', 'Enable inventory tracking', 'inventory');

-- Email settings
IF NOT EXISTS (SELECT 1 FROM dbo.settings WHERE [key] = 'email.orderConfirmation')
    INSERT INTO dbo.settings (id, [key], value, description, category) VALUES (NEWID(), 'email.orderConfirmation', 'true', 'Send order confirmation emails', 'email');
IF NOT EXISTS (SELECT 1 FROM dbo.settings WHERE [key] = 'email.shippingNotification')
    INSERT INTO dbo.settings (id, [key], value, description, category) VALUES (NEWID(), 'email.shippingNotification', 'true', 'Send shipping notification emails', 'email');
IF NOT EXISTS (SELECT 1 FROM dbo.settings WHERE [key] = 'email.lowStockAlerts')
    INSERT INTO dbo.settings (id, [key], value, description, category) VALUES (NEWID(), 'email.lowStockAlerts', 'true', 'Send low stock alert emails', 'email');

-- ============================================================================
-- Commit Transaction
-- ============================================================================
COMMIT TRANSACTION;

PRINT '';
PRINT 'Base data load completed successfully!';
PRINT '';

-- Summary counts
SELECT 'Roles' AS Entity, COUNT(*) AS [Count] FROM dbo.roles
UNION ALL SELECT 'Role Configs', COUNT(*) FROM dbo.role_feature_configs
UNION ALL SELECT 'Brands', COUNT(*) FROM dbo.brands
UNION ALL SELECT 'Categories', COUNT(*) FROM dbo.categories
UNION ALL SELECT 'Products', COUNT(*) FROM dbo.products
UNION ALL SELECT 'Fitments', COUNT(*) FROM dbo.product_fitments
UNION ALL SELECT 'Inventory Logs', COUNT(*) FROM dbo.inventory_logs
UNION ALL SELECT 'Features', COUNT(*) FROM dbo.features
UNION ALL SELECT 'Settings', COUNT(*) FROM dbo.settings;

GO

