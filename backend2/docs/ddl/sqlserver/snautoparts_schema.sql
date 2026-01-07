/*
================================================================================
  SN Auto Parts - SQL Server Database Schema
================================================================================
  
  Version: 1.0.0
  Generated: 2026-01-06
  Database: SQL Server 2019+
  
  Description:
    Complete DDL for the SN Auto Parts e-commerce platform.
    This schema supports:
    - User authentication and authorization with role-based feature configs
    - Product catalog with vehicle fitment data
    - Shopping cart and order management
    - Inventory tracking and drop-shipping integrations
    - Audit logging and webhook management
  
  Notes for DBA:
    - All primary keys use UNIQUEIDENTIFIER (UUID v4)
    - Timestamps use DATETIME2(7) for maximum precision
    - JSON columns use NVARCHAR(MAX) with CHECK constraints
    - Decimal columns use appropriate precision for currency (10,2) and percentages (5,4)
    - Foreign keys use ON DELETE CASCADE where appropriate
    - Indexes are created for common query patterns
  
================================================================================
*/

-- ============================================================================
-- Drop existing tables (in reverse dependency order)
-- ============================================================================
IF OBJECT_ID('dbo.payment_events', 'U') IS NOT NULL DROP TABLE dbo.payment_events;
IF OBJECT_ID('dbo.shipments', 'U') IS NOT NULL DROP TABLE dbo.shipments;
IF OBJECT_ID('dbo.order_timeline', 'U') IS NOT NULL DROP TABLE dbo.order_timeline;
IF OBJECT_ID('dbo.order_items', 'U') IS NOT NULL DROP TABLE dbo.order_items;
IF OBJECT_ID('dbo.affiliate_orders', 'U') IS NOT NULL DROP TABLE dbo.affiliate_orders;
IF OBJECT_ID('dbo.orders', 'U') IS NOT NULL DROP TABLE dbo.orders;
IF OBJECT_ID('dbo.cart_items', 'U') IS NOT NULL DROP TABLE dbo.cart_items;
IF OBJECT_ID('dbo.carts', 'U') IS NOT NULL DROP TABLE dbo.carts;
IF OBJECT_ID('dbo.affiliate_product_mappings', 'U') IS NOT NULL DROP TABLE dbo.affiliate_product_mappings;
IF OBJECT_ID('dbo.affiliates', 'U') IS NOT NULL DROP TABLE dbo.affiliates;
IF OBJECT_ID('dbo.inventory_logs', 'U') IS NOT NULL DROP TABLE dbo.inventory_logs;
IF OBJECT_ID('dbo.product_fitments', 'U') IS NOT NULL DROP TABLE dbo.product_fitments;
IF OBJECT_ID('dbo.products', 'U') IS NOT NULL DROP TABLE dbo.products;
IF OBJECT_ID('dbo.brands', 'U') IS NOT NULL DROP TABLE dbo.brands;
IF OBJECT_ID('dbo.categories', 'U') IS NOT NULL DROP TABLE dbo.categories;
IF OBJECT_ID('dbo.saved_vehicles', 'U') IS NOT NULL DROP TABLE dbo.saved_vehicles;
IF OBJECT_ID('dbo.addresses', 'U') IS NOT NULL DROP TABLE dbo.addresses;
IF OBJECT_ID('dbo.audit_logs', 'U') IS NOT NULL DROP TABLE dbo.audit_logs;
IF OBJECT_ID('dbo.verifications', 'U') IS NOT NULL DROP TABLE dbo.verifications;
IF OBJECT_ID('dbo.sessions', 'U') IS NOT NULL DROP TABLE dbo.sessions;
IF OBJECT_ID('dbo.accounts', 'U') IS NOT NULL DROP TABLE dbo.accounts;
IF OBJECT_ID('dbo.role_feature_configs', 'U') IS NOT NULL DROP TABLE dbo.role_feature_configs;
IF OBJECT_ID('dbo.users', 'U') IS NOT NULL DROP TABLE dbo.users;
IF OBJECT_ID('dbo.roles', 'U') IS NOT NULL DROP TABLE dbo.roles;
IF OBJECT_ID('dbo.features', 'U') IS NOT NULL DROP TABLE dbo.features;
IF OBJECT_ID('dbo.settings', 'U') IS NOT NULL DROP TABLE dbo.settings;
IF OBJECT_ID('dbo.webhooks', 'U') IS NOT NULL DROP TABLE dbo.webhooks;
GO

-- ============================================================================
-- SECTION 1: Authentication & Authorization
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: roles
-- Description: User roles (CUSTOMER, MANAGER, ADMIN)
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.roles (
    id                  UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWID(),
    name                NVARCHAR(50)        NOT NULL,
    display_name        NVARCHAR(100)       NOT NULL,
    description         NVARCHAR(MAX)       NULL,
    is_active           BIT                 NOT NULL    DEFAULT 1,
    created_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    updated_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    
    CONSTRAINT PK_roles PRIMARY KEY (id),
    CONSTRAINT UQ_roles_name UNIQUE (name)
);
GO

-- ----------------------------------------------------------------------------
-- Table: role_feature_configs
-- Description: JSON feature configuration per role
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.role_feature_configs (
    id                  UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWID(),
    role_id             UNIQUEIDENTIFIER    NOT NULL,
    config              NVARCHAR(MAX)       NOT NULL,   -- JSON
    version             INT                 NOT NULL    DEFAULT 1,
    created_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    updated_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    
    CONSTRAINT PK_role_feature_configs PRIMARY KEY (id),
    CONSTRAINT FK_role_feature_configs_role FOREIGN KEY (role_id) 
        REFERENCES dbo.roles(id) ON DELETE CASCADE,
    CONSTRAINT UQ_role_feature_configs_role UNIQUE (role_id),
    CONSTRAINT CK_role_feature_configs_config_json CHECK (ISJSON(config) = 1)
);
GO

-- ----------------------------------------------------------------------------
-- Table: users
-- Description: User accounts
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.users (
    id                  UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWID(),
    email               NVARCHAR(255)       NOT NULL,
    password_hash       NVARCHAR(255)       NOT NULL,
    first_name          NVARCHAR(100)       NOT NULL,
    last_name           NVARCHAR(100)       NOT NULL,
    phone               NVARCHAR(30)        NULL,
    avatar_url          NVARCHAR(500)       NULL,
    role_id             UNIQUEIDENTIFIER    NULL,
    is_active           BIT                 NOT NULL    DEFAULT 1,
    email_verified      BIT                 NOT NULL    DEFAULT 0,
    last_login_at       DATETIME2(7)        NULL,
    created_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    updated_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    
    CONSTRAINT PK_users PRIMARY KEY (id),
    CONSTRAINT UQ_users_email UNIQUE (email),
    CONSTRAINT FK_users_role FOREIGN KEY (role_id) 
        REFERENCES dbo.roles(id) ON DELETE SET NULL
);
GO

CREATE INDEX IX_users_email ON dbo.users(email);
CREATE INDEX IX_users_role ON dbo.users(role_id);
GO

-- ----------------------------------------------------------------------------
-- Table: sessions
-- Description: User sessions (managed by Better Auth)
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.sessions (
    id                  UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWID(),
    token               NVARCHAR(500)       NOT NULL,
    user_id             UNIQUEIDENTIFIER    NOT NULL,
    user_agent          NVARCHAR(500)       NULL,
    ip_address          NVARCHAR(50)        NULL,
    expires_at          DATETIME2(7)        NOT NULL,
    created_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    
    CONSTRAINT PK_sessions PRIMARY KEY (id),
    CONSTRAINT UQ_sessions_token UNIQUE (token),
    CONSTRAINT FK_sessions_user FOREIGN KEY (user_id) 
        REFERENCES dbo.users(id) ON DELETE CASCADE
);
GO

CREATE INDEX IX_sessions_token ON dbo.sessions(token);
CREATE INDEX IX_sessions_expires_at ON dbo.sessions(expires_at);
CREATE INDEX IX_sessions_user ON dbo.sessions(user_id);
GO

-- ----------------------------------------------------------------------------
-- Table: accounts
-- Description: OAuth provider accounts (managed by Better Auth)
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.accounts (
    id                      UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWID(),
    user_id                 UNIQUEIDENTIFIER    NOT NULL,
    provider                NVARCHAR(50)        NOT NULL,
    provider_account_id     NVARCHAR(255)       NOT NULL,
    access_token            NVARCHAR(MAX)       NULL,
    refresh_token           NVARCHAR(MAX)       NULL,
    access_token_expires_at DATETIME2(7)        NULL,
    refresh_token_expires_at DATETIME2(7)       NULL,
    scope                   NVARCHAR(500)       NULL,
    id_token                NVARCHAR(MAX)       NULL,
    metadata                NVARCHAR(MAX)       NULL,       -- JSON
    created_at              DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    updated_at              DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    
    CONSTRAINT PK_accounts PRIMARY KEY (id),
    CONSTRAINT FK_accounts_user FOREIGN KEY (user_id) 
        REFERENCES dbo.users(id) ON DELETE CASCADE,
    CONSTRAINT UQ_accounts_provider UNIQUE (provider, provider_account_id)
);
GO

CREATE INDEX IX_accounts_user ON dbo.accounts(user_id);
GO

-- ----------------------------------------------------------------------------
-- Table: verifications
-- Description: Email verification and password reset tokens
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.verifications (
    id                  UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWID(),
    identifier          NVARCHAR(255)       NOT NULL,   -- Email address
    token               NVARCHAR(500)       NOT NULL,
    type                NVARCHAR(50)        NOT NULL    DEFAULT 'EMAIL',
    expires_at          DATETIME2(7)        NOT NULL,
    used                BIT                 NOT NULL    DEFAULT 0,
    created_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    updated_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    
    CONSTRAINT PK_verifications PRIMARY KEY (id),
    CONSTRAINT UQ_verifications_token UNIQUE (token),
    CONSTRAINT CK_verifications_type CHECK (type IN ('EMAIL', 'PASSWORD_RESET', 'TWO_FACTOR'))
);
GO

CREATE INDEX IX_verifications_token ON dbo.verifications(token);
CREATE INDEX IX_verifications_identifier ON dbo.verifications(identifier);
GO

-- ----------------------------------------------------------------------------
-- Table: addresses
-- Description: User shipping/billing addresses
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.addresses (
    id                  UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWID(),
    user_id             UNIQUEIDENTIFIER    NOT NULL,
    first_name          NVARCHAR(100)       NOT NULL,
    last_name           NVARCHAR(100)       NOT NULL,
    company             NVARCHAR(200)       NULL,
    address1            NVARCHAR(255)       NOT NULL,
    address2            NVARCHAR(255)       NULL,
    city                NVARCHAR(100)       NOT NULL,
    state               NVARCHAR(50)        NOT NULL,
    zip_code            NVARCHAR(20)        NOT NULL,
    country             NVARCHAR(2)         NOT NULL    DEFAULT 'US',
    phone               NVARCHAR(30)        NULL,
    is_default          BIT                 NOT NULL    DEFAULT 0,
    is_billing          BIT                 NOT NULL    DEFAULT 0,
    created_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    updated_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    
    CONSTRAINT PK_addresses PRIMARY KEY (id),
    CONSTRAINT FK_addresses_user FOREIGN KEY (user_id) 
        REFERENCES dbo.users(id) ON DELETE CASCADE
);
GO

CREATE INDEX IX_addresses_user ON dbo.addresses(user_id);
GO

-- ----------------------------------------------------------------------------
-- Table: saved_vehicles
-- Description: Customer's saved vehicles for quick fitment lookup
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.saved_vehicles (
    id                  UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWID(),
    user_id             UNIQUEIDENTIFIER    NOT NULL,
    nickname            NVARCHAR(100)       NULL,
    year                INT                 NOT NULL,
    make                NVARCHAR(50)        NOT NULL,
    model               NVARCHAR(50)        NOT NULL,
    submodel            NVARCHAR(50)        NULL,
    engine              NVARCHAR(100)       NULL,
    is_default          BIT                 NOT NULL    DEFAULT 0,
    created_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    
    CONSTRAINT PK_saved_vehicles PRIMARY KEY (id),
    CONSTRAINT FK_saved_vehicles_user FOREIGN KEY (user_id) 
        REFERENCES dbo.users(id) ON DELETE CASCADE,
    CONSTRAINT CK_saved_vehicles_year CHECK (year >= 1900 AND year <= 2100)
);
GO

CREATE INDEX IX_saved_vehicles_user ON dbo.saved_vehicles(user_id);
GO

-- ============================================================================
-- SECTION 2: Product Catalog
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: categories
-- Description: Product categories (hierarchical)
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.categories (
    id                  UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWID(),
    name                NVARCHAR(200)       NOT NULL,
    slug                NVARCHAR(200)       NOT NULL,
    description         NVARCHAR(MAX)       NULL,
    image_url           NVARCHAR(500)       NULL,
    icon                NVARCHAR(50)        NULL,       -- Material icon name
    parent_id           UNIQUEIDENTIFIER    NULL,
    sort_order          INT                 NOT NULL    DEFAULT 0,
    is_active           BIT                 NOT NULL    DEFAULT 1,
    created_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    updated_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    
    CONSTRAINT PK_categories PRIMARY KEY (id),
    CONSTRAINT UQ_categories_slug UNIQUE (slug),
    CONSTRAINT FK_categories_parent FOREIGN KEY (parent_id) 
        REFERENCES dbo.categories(id) ON DELETE NO ACTION
);
GO

CREATE INDEX IX_categories_slug ON dbo.categories(slug);
CREATE INDEX IX_categories_parent ON dbo.categories(parent_id);
GO

-- ----------------------------------------------------------------------------
-- Table: brands
-- Description: Product brands/manufacturers
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.brands (
    id                  UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWID(),
    name                NVARCHAR(200)       NOT NULL,
    slug                NVARCHAR(200)       NOT NULL,
    description         NVARCHAR(MAX)       NULL,
    logo_url            NVARCHAR(500)       NULL,
    website_url         NVARCHAR(500)       NULL,
    is_active           BIT                 NOT NULL    DEFAULT 1,
    created_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    updated_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    
    CONSTRAINT PK_brands PRIMARY KEY (id),
    CONSTRAINT UQ_brands_slug UNIQUE (slug)
);
GO

CREATE INDEX IX_brands_slug ON dbo.brands(slug);
GO

-- ----------------------------------------------------------------------------
-- Table: products
-- Description: Product catalog
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.products (
    id                  UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWID(),
    sku                 NVARCHAR(100)       NOT NULL,
    name                NVARCHAR(500)       NOT NULL,
    slug                NVARCHAR(500)       NOT NULL,
    description         NVARCHAR(MAX)       NULL,
    short_description   NVARCHAR(500)       NULL,
    price               DECIMAL(10,2)       NOT NULL,
    compare_at_price    DECIMAL(10,2)       NULL,
    cost_price          DECIMAL(10,2)       NULL,
    category_id         UNIQUEIDENTIFIER    NOT NULL,
    brand_id            UNIQUEIDENTIFIER    NULL,
    image_url           NVARCHAR(500)       NULL,
    images              NVARCHAR(MAX)       NOT NULL    DEFAULT '[]',  -- JSON array
    
    -- Dimensions
    weight              DECIMAL(8,2)        NULL,
    weight_unit         NVARCHAR(10)        NOT NULL    DEFAULT 'lb',
    length              DECIMAL(8,2)        NULL,
    width               DECIMAL(8,2)        NULL,
    height              DECIMAL(8,2)        NULL,
    dimension_unit      NVARCHAR(10)        NOT NULL    DEFAULT 'in',
    
    -- Inventory
    stock_quantity      INT                 NOT NULL    DEFAULT 0,
    low_stock_threshold INT                 NOT NULL    DEFAULT 10,
    upc                 NVARCHAR(50)        NULL,
    
    -- Fulfillment
    fulfillment_type    NVARCHAR(20)        NOT NULL    DEFAULT 'INVENTORY',
    
    -- Status
    is_active           BIT                 NOT NULL    DEFAULT 1,
    is_featured         BIT                 NOT NULL    DEFAULT 0,
    
    -- SEO
    meta_title          NVARCHAR(255)       NULL,
    meta_description    NVARCHAR(MAX)       NULL,
    
    created_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    updated_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    
    CONSTRAINT PK_products PRIMARY KEY (id),
    CONSTRAINT UQ_products_sku UNIQUE (sku),
    CONSTRAINT UQ_products_slug UNIQUE (slug),
    CONSTRAINT FK_products_category FOREIGN KEY (category_id) 
        REFERENCES dbo.categories(id) ON DELETE NO ACTION,
    CONSTRAINT FK_products_brand FOREIGN KEY (brand_id) 
        REFERENCES dbo.brands(id) ON DELETE SET NULL,
    CONSTRAINT CK_products_fulfillment_type CHECK (fulfillment_type IN ('INVENTORY', 'DROPSHIP', 'MIXED')),
    CONSTRAINT CK_products_images_json CHECK (ISJSON(images) = 1),
    CONSTRAINT CK_products_price CHECK (price >= 0),
    CONSTRAINT CK_products_stock CHECK (stock_quantity >= 0)
);
GO

CREATE INDEX IX_products_category ON dbo.products(category_id);
CREATE INDEX IX_products_brand ON dbo.products(brand_id);
CREATE INDEX IX_products_sku ON dbo.products(sku);
CREATE INDEX IX_products_slug ON dbo.products(slug);
CREATE INDEX IX_products_fulfillment_type ON dbo.products(fulfillment_type);
CREATE INDEX IX_products_is_active ON dbo.products(is_active) WHERE is_active = 1;
CREATE INDEX IX_products_is_featured ON dbo.products(is_featured) WHERE is_featured = 1;
GO

-- ----------------------------------------------------------------------------
-- Table: product_fitments
-- Description: Vehicle fitment data for products
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.product_fitments (
    id                  UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWID(),
    product_id          UNIQUEIDENTIFIER    NOT NULL,
    make                NVARCHAR(50)        NOT NULL,
    model               NVARCHAR(50)        NOT NULL,
    year_start          INT                 NOT NULL,
    year_end            INT                 NOT NULL,
    submodel            NVARCHAR(50)        NULL,
    engine              NVARCHAR(100)       NULL,
    notes               NVARCHAR(500)       NULL,
    created_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    
    CONSTRAINT PK_product_fitments PRIMARY KEY (id),
    CONSTRAINT FK_product_fitments_product FOREIGN KEY (product_id) 
        REFERENCES dbo.products(id) ON DELETE CASCADE,
    CONSTRAINT CK_product_fitments_years CHECK (year_start <= year_end AND year_start >= 1900 AND year_end <= 2100)
);
GO

CREATE INDEX IX_product_fitments_product ON dbo.product_fitments(product_id);
CREATE INDEX IX_product_fitments_ymm ON dbo.product_fitments(make, model, year_start, year_end);
GO

-- ============================================================================
-- SECTION 3: Inventory Management
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: inventory_logs
-- Description: Inventory adjustment history
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.inventory_logs (
    id                  UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWID(),
    product_id          UNIQUEIDENTIFIER    NOT NULL,
    type                NVARCHAR(20)        NOT NULL,
    quantity_change     INT                 NOT NULL,
    quantity_before     INT                 NOT NULL,
    quantity_after      INT                 NOT NULL,
    reason              NVARCHAR(255)       NULL,
    notes               NVARCHAR(MAX)       NULL,
    reference_id        NVARCHAR(100)       NULL,   -- Order ID, Import batch ID, etc.
    created_by_id       UNIQUEIDENTIFIER    NULL,
    created_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    
    CONSTRAINT PK_inventory_logs PRIMARY KEY (id),
    CONSTRAINT FK_inventory_logs_product FOREIGN KEY (product_id) 
        REFERENCES dbo.products(id) ON DELETE CASCADE,
    CONSTRAINT FK_inventory_logs_user FOREIGN KEY (created_by_id) 
        REFERENCES dbo.users(id) ON DELETE SET NULL,
    CONSTRAINT CK_inventory_logs_type CHECK (type IN ('IMPORT', 'SALE', 'RETURN', 'ADJUSTMENT', 'RECOUNT', 'DAMAGED', 'RECEIVED'))
);
GO

CREATE INDEX IX_inventory_logs_product ON dbo.inventory_logs(product_id);
CREATE INDEX IX_inventory_logs_created_at ON dbo.inventory_logs(created_at);
GO

-- ============================================================================
-- SECTION 4: Shopping Cart
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: carts
-- Description: Shopping carts (registered users and guests)
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.carts (
    id                  UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWID(),
    user_id             UNIQUEIDENTIFIER    NULL,
    session_id          NVARCHAR(255)       NULL,       -- For guest carts
    created_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    updated_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    
    CONSTRAINT PK_carts PRIMARY KEY (id),
    CONSTRAINT FK_carts_user FOREIGN KEY (user_id) 
        REFERENCES dbo.users(id) ON DELETE CASCADE
);
GO

CREATE INDEX IX_carts_user ON dbo.carts(user_id);
CREATE INDEX IX_carts_session ON dbo.carts(session_id);
GO

-- ----------------------------------------------------------------------------
-- Table: cart_items
-- Description: Items in shopping carts
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.cart_items (
    id                  UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWID(),
    cart_id             UNIQUEIDENTIFIER    NOT NULL,
    product_id          UNIQUEIDENTIFIER    NOT NULL,
    quantity            INT                 NOT NULL    DEFAULT 1,
    created_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    updated_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    
    CONSTRAINT PK_cart_items PRIMARY KEY (id),
    CONSTRAINT FK_cart_items_cart FOREIGN KEY (cart_id) 
        REFERENCES dbo.carts(id) ON DELETE CASCADE,
    CONSTRAINT FK_cart_items_product FOREIGN KEY (product_id) 
        REFERENCES dbo.products(id) ON DELETE CASCADE,
    CONSTRAINT UQ_cart_items_cart_product UNIQUE (cart_id, product_id),
    CONSTRAINT CK_cart_items_quantity CHECK (quantity > 0)
);
GO

CREATE INDEX IX_cart_items_cart ON dbo.cart_items(cart_id);
GO

-- ============================================================================
-- SECTION 5: Orders
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: orders
-- Description: Customer orders
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.orders (
    id                  UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWID(),
    order_number        NVARCHAR(50)        NOT NULL,
    user_id             UNIQUEIDENTIFIER    NOT NULL,
    status              NVARCHAR(20)        NOT NULL    DEFAULT 'PENDING',
    
    -- Pricing
    subtotal            DECIMAL(10,2)       NOT NULL,
    shipping_cost       DECIMAL(10,2)       NOT NULL    DEFAULT 0,
    tax_amount          DECIMAL(10,2)       NOT NULL    DEFAULT 0,
    discount_amount     DECIMAL(10,2)       NOT NULL    DEFAULT 0,
    total               DECIMAL(10,2)       NOT NULL,
    
    -- Addresses (JSON snapshots)
    shipping_address    NVARCHAR(MAX)       NOT NULL,   -- JSON
    billing_address     NVARCHAR(MAX)       NULL,       -- JSON
    
    -- Shipping
    shipping_method     NVARCHAR(100)       NULL,
    shipping_carrier    NVARCHAR(100)       NULL,
    
    -- Payment
    payment_method      NVARCHAR(50)        NULL,
    payment_intent_id   NVARCHAR(255)       NULL,       -- Stripe Payment Intent ID
    is_paid             BIT                 NOT NULL    DEFAULT 0,
    paid_at             DATETIME2(7)        NULL,
    
    -- Notes
    customer_notes      NVARCHAR(MAX)       NULL,
    internal_notes      NVARCHAR(MAX)       NULL,
    
    -- Idempotency
    idempotency_key     NVARCHAR(255)       NULL,
    
    created_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    updated_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    
    CONSTRAINT PK_orders PRIMARY KEY (id),
    CONSTRAINT UQ_orders_order_number UNIQUE (order_number),
    CONSTRAINT UQ_orders_idempotency_key UNIQUE (idempotency_key),
    CONSTRAINT FK_orders_user FOREIGN KEY (user_id) 
        REFERENCES dbo.users(id) ON DELETE CASCADE,
    CONSTRAINT CK_orders_status CHECK (status IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED')),
    CONSTRAINT CK_orders_shipping_address_json CHECK (ISJSON(shipping_address) = 1),
    CONSTRAINT CK_orders_billing_address_json CHECK (billing_address IS NULL OR ISJSON(billing_address) = 1)
);
GO

CREATE INDEX IX_orders_user ON dbo.orders(user_id);
CREATE INDEX IX_orders_order_number ON dbo.orders(order_number);
CREATE INDEX IX_orders_status ON dbo.orders(status);
CREATE INDEX IX_orders_created_at ON dbo.orders(created_at);
GO

-- ----------------------------------------------------------------------------
-- Table: order_items
-- Description: Line items in orders
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.order_items (
    id                  UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWID(),
    order_id            UNIQUEIDENTIFIER    NOT NULL,
    product_id          UNIQUEIDENTIFIER    NOT NULL,
    
    -- Product snapshot at time of order
    product_name        NVARCHAR(500)       NOT NULL,
    product_sku         NVARCHAR(100)       NOT NULL,
    product_image_url   NVARCHAR(500)       NULL,
    
    quantity            INT                 NOT NULL,
    unit_price          DECIMAL(10,2)       NOT NULL,
    total_price         DECIMAL(10,2)       NOT NULL,
    
    -- Drop-ship tracking
    supplier_id         NVARCHAR(50)        NULL,
    supplier_sku        NVARCHAR(100)       NULL,
    
    created_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    
    CONSTRAINT PK_order_items PRIMARY KEY (id),
    CONSTRAINT FK_order_items_order FOREIGN KEY (order_id) 
        REFERENCES dbo.orders(id) ON DELETE CASCADE,
    CONSTRAINT FK_order_items_product FOREIGN KEY (product_id) 
        REFERENCES dbo.products(id) ON DELETE NO ACTION,
    CONSTRAINT CK_order_items_quantity CHECK (quantity > 0)
);
GO

CREATE INDEX IX_order_items_order ON dbo.order_items(order_id);
GO

-- ----------------------------------------------------------------------------
-- Table: order_timeline
-- Description: Order status history/timeline
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.order_timeline (
    id                  UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWID(),
    order_id            UNIQUEIDENTIFIER    NOT NULL,
    status              NVARCHAR(50)        NOT NULL,
    title               NVARCHAR(200)       NOT NULL,
    description         NVARCHAR(MAX)       NULL,
    metadata            NVARCHAR(MAX)       NULL,       -- JSON
    changed_by_id       UNIQUEIDENTIFIER    NULL,
    created_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    
    CONSTRAINT PK_order_timeline PRIMARY KEY (id),
    CONSTRAINT FK_order_timeline_order FOREIGN KEY (order_id) 
        REFERENCES dbo.orders(id) ON DELETE CASCADE,
    CONSTRAINT FK_order_timeline_user FOREIGN KEY (changed_by_id) 
        REFERENCES dbo.users(id) ON DELETE SET NULL
);
GO

CREATE INDEX IX_order_timeline_order ON dbo.order_timeline(order_id);
GO

-- ----------------------------------------------------------------------------
-- Table: shipments
-- Description: Shipment tracking information
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.shipments (
    id                      UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWID(),
    order_id                UNIQUEIDENTIFIER    NOT NULL,
    carrier                 NVARCHAR(50)        NOT NULL,
    tracking_number         NVARCHAR(100)       NOT NULL,
    tracking_url            NVARCHAR(500)       NULL,
    shipped_at              DATETIME2(7)        NULL,
    estimated_delivery_at   DATETIME2(7)        NULL,
    delivered_at            DATETIME2(7)        NULL,
    status                  NVARCHAR(30)        NOT NULL    DEFAULT 'PENDING',
    created_at              DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    updated_at              DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    
    CONSTRAINT PK_shipments PRIMARY KEY (id),
    CONSTRAINT FK_shipments_order FOREIGN KEY (order_id) 
        REFERENCES dbo.orders(id) ON DELETE CASCADE,
    CONSTRAINT CK_shipments_status CHECK (status IN ('PENDING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'EXCEPTION'))
);
GO

CREATE INDEX IX_shipments_order ON dbo.shipments(order_id);
CREATE INDEX IX_shipments_tracking_number ON dbo.shipments(tracking_number);
GO

-- ----------------------------------------------------------------------------
-- Table: payment_events
-- Description: Stripe payment events log
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.payment_events (
    id                      UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWID(),
    order_id                UNIQUEIDENTIFIER    NOT NULL,
    type                    NVARCHAR(50)        NOT NULL,
    status                  NVARCHAR(30)        NOT NULL,
    stripe_payment_intent_id NVARCHAR(255)      NULL,
    stripe_charge_id        NVARCHAR(255)       NULL,
    stripe_refund_id        NVARCHAR(255)       NULL,
    amount                  DECIMAL(10,2)       NOT NULL,
    currency                NVARCHAR(3)         NOT NULL    DEFAULT 'USD',
    error_code              NVARCHAR(50)        NULL,
    error_message           NVARCHAR(500)       NULL,
    metadata                NVARCHAR(MAX)       NULL,       -- JSON
    stripe_event_payload    NVARCHAR(MAX)       NULL,       -- JSON
    created_at              DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    
    CONSTRAINT PK_payment_events PRIMARY KEY (id),
    CONSTRAINT FK_payment_events_order FOREIGN KEY (order_id) 
        REFERENCES dbo.orders(id) ON DELETE CASCADE,
    CONSTRAINT CK_payment_events_type CHECK (type IN ('PAYMENT_INTENT_CREATED', 'PAYMENT_SUCCEEDED', 'PAYMENT_FAILED', 'REFUND_INITIATED', 'REFUND_COMPLETED', 'DISPUTE_CREATED', 'DISPUTE_RESOLVED')),
    CONSTRAINT CK_payment_events_status CHECK (status IN ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED', 'DISPUTED', 'CANCELLED'))
);
GO

CREATE INDEX IX_payment_events_order ON dbo.payment_events(order_id);
CREATE INDEX IX_payment_events_stripe_pi ON dbo.payment_events(stripe_payment_intent_id);
GO

-- ============================================================================
-- SECTION 6: Drop-Shipping / Affiliates
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: affiliates
-- Description: Drop-ship supplier/affiliate configurations
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.affiliates (
    id                  UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWID(),
    name                NVARCHAR(200)       NOT NULL,
    code                NVARCHAR(50)        NOT NULL,   -- APREMIUM, BUYAUTOPARTS, TRQ
    base_url            NVARCHAR(500)       NOT NULL,
    api_key             NVARCHAR(500)       NOT NULL,   -- Should be encrypted
    api_secret          NVARCHAR(500)       NULL,       -- Should be encrypted
    is_active           BIT                 NOT NULL    DEFAULT 1,
    retry_policy        NVARCHAR(MAX)       NOT NULL,   -- JSON
    mapping_rules       NVARCHAR(MAX)       NULL,       -- JSON
    headers             NVARCHAR(MAX)       NULL,       -- JSON
    timeout_ms          INT                 NOT NULL    DEFAULT 8000,
    created_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    updated_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    
    CONSTRAINT PK_affiliates PRIMARY KEY (id),
    CONSTRAINT UQ_affiliates_code UNIQUE (code),
    CONSTRAINT CK_affiliates_retry_policy_json CHECK (ISJSON(retry_policy) = 1)
);
GO

-- ----------------------------------------------------------------------------
-- Table: affiliate_product_mappings
-- Description: Maps internal products to affiliate SKUs
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.affiliate_product_mappings (
    id                      UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWID(),
    affiliate_id            UNIQUEIDENTIFIER    NOT NULL,
    product_id              UNIQUEIDENTIFIER    NOT NULL,
    affiliate_sku           NVARCHAR(100)       NOT NULL,
    affiliate_product_id    NVARCHAR(100)       NULL,
    price_multiplier        DECIMAL(5,4)        NULL,       -- e.g., 1.0500 = 5% markup
    is_active               BIT                 NOT NULL    DEFAULT 1,
    created_at              DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    updated_at              DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    
    CONSTRAINT PK_affiliate_product_mappings PRIMARY KEY (id),
    CONSTRAINT FK_affiliate_product_mappings_affiliate FOREIGN KEY (affiliate_id) 
        REFERENCES dbo.affiliates(id) ON DELETE CASCADE,
    CONSTRAINT FK_affiliate_product_mappings_product FOREIGN KEY (product_id) 
        REFERENCES dbo.products(id) ON DELETE CASCADE,
    CONSTRAINT UQ_affiliate_product_mappings UNIQUE (affiliate_id, product_id)
);
GO

CREATE INDEX IX_affiliate_product_mappings_affiliate ON dbo.affiliate_product_mappings(affiliate_id);
CREATE INDEX IX_affiliate_product_mappings_product ON dbo.affiliate_product_mappings(product_id);
GO

-- ----------------------------------------------------------------------------
-- Table: affiliate_orders
-- Description: Orders sent to affiliates for drop-shipping
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.affiliate_orders (
    id                  UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWID(),
    order_id            UNIQUEIDENTIFIER    NOT NULL,
    affiliate_id        UNIQUEIDENTIFIER    NOT NULL,
    status              NVARCHAR(20)        NOT NULL    DEFAULT 'PENDING',
    external_order_id   NVARCHAR(100)       NULL,
    order_lines         NVARCHAR(MAX)       NULL,       -- JSON
    total_amount        DECIMAL(10,2)       NULL,
    tracking_number     NVARCHAR(100)       NULL,
    request_payload     NVARCHAR(MAX)       NULL,       -- JSON
    response_payload    NVARCHAR(MAX)       NULL,       -- JSON
    last_error          NVARCHAR(MAX)       NULL,
    retry_count         INT                 NOT NULL    DEFAULT 0,
    next_retry_at       DATETIME2(7)        NULL,
    created_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    updated_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    completed_at        DATETIME2(7)        NULL,
    
    CONSTRAINT PK_affiliate_orders PRIMARY KEY (id),
    CONSTRAINT FK_affiliate_orders_order FOREIGN KEY (order_id) 
        REFERENCES dbo.orders(id) ON DELETE CASCADE,
    CONSTRAINT FK_affiliate_orders_affiliate FOREIGN KEY (affiliate_id) 
        REFERENCES dbo.affiliates(id) ON DELETE NO ACTION,
    CONSTRAINT CK_affiliate_orders_status CHECK (status IN ('PENDING', 'SENT', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'FAILED', 'CANCELLED'))
);
GO

CREATE INDEX IX_affiliate_orders_order ON dbo.affiliate_orders(order_id);
CREATE INDEX IX_affiliate_orders_affiliate ON dbo.affiliate_orders(affiliate_id);
CREATE INDEX IX_affiliate_orders_status ON dbo.affiliate_orders(status);
GO

-- ============================================================================
-- SECTION 7: Admin & System
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: features
-- Description: Feature definitions for role-based access
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.features (
    id                  UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWID(),
    code                NVARCHAR(100)       NOT NULL,   -- catalog.browse, orders.manage
    name                NVARCHAR(200)       NOT NULL,
    description         NVARCHAR(MAX)       NULL,
    category            NVARCHAR(50)        NOT NULL,   -- catalog, orders, inventory, admin
    is_active           BIT                 NOT NULL    DEFAULT 1,
    created_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    updated_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    
    CONSTRAINT PK_features PRIMARY KEY (id),
    CONSTRAINT UQ_features_code UNIQUE (code)
);
GO

-- ----------------------------------------------------------------------------
-- Table: settings
-- Description: Application configuration settings
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.settings (
    id                  UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWID(),
    [key]               NVARCHAR(100)       NOT NULL,
    value               NVARCHAR(MAX)       NOT NULL,   -- JSON
    description         NVARCHAR(500)       NULL,
    category            NVARCHAR(50)        NOT NULL,   -- general, shipping, tax, payment, email
    is_public           BIT                 NOT NULL    DEFAULT 0,
    created_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    updated_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    
    CONSTRAINT PK_settings PRIMARY KEY (id),
    CONSTRAINT UQ_settings_key UNIQUE ([key]),
    CONSTRAINT CK_settings_value_json CHECK (ISJSON(value) = 1)
);
GO

-- ----------------------------------------------------------------------------
-- Table: webhooks
-- Description: Outgoing webhook configurations
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.webhooks (
    id                  UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWID(),
    name                NVARCHAR(200)       NOT NULL,
    url                 NVARCHAR(500)       NOT NULL,
    events              NVARCHAR(MAX)       NOT NULL,   -- JSON array
    secret              NVARCHAR(255)       NULL,       -- For signature verification
    is_active           BIT                 NOT NULL    DEFAULT 1,
    last_triggered_at   DATETIME2(7)        NULL,
    last_status         INT                 NULL,       -- Last HTTP status code
    failure_count       INT                 NOT NULL    DEFAULT 0,
    created_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    updated_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    
    CONSTRAINT PK_webhooks PRIMARY KEY (id),
    CONSTRAINT CK_webhooks_events_json CHECK (ISJSON(events) = 1)
);
GO

-- ----------------------------------------------------------------------------
-- Table: audit_logs
-- Description: System audit trail
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.audit_logs (
    id                  UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWID(),
    user_id             UNIQUEIDENTIFIER    NULL,
    action              NVARCHAR(100)       NOT NULL,   -- CREATE, UPDATE, DELETE
    entity_type         NVARCHAR(50)        NOT NULL,   -- Product, Order, User
    entity_id           NVARCHAR(100)       NOT NULL,
    previous_value      NVARCHAR(MAX)       NULL,       -- JSON
    new_value           NVARCHAR(MAX)       NULL,       -- JSON
    details             NVARCHAR(MAX)       NULL,       -- JSON
    ip_address          NVARCHAR(50)        NULL,
    user_agent          NVARCHAR(500)       NULL,
    created_at          DATETIME2(7)        NOT NULL    DEFAULT GETUTCDATE(),
    
    CONSTRAINT PK_audit_logs PRIMARY KEY (id),
    CONSTRAINT FK_audit_logs_user FOREIGN KEY (user_id) 
        REFERENCES dbo.users(id) ON DELETE SET NULL
);
GO

CREATE INDEX IX_audit_logs_created_at ON dbo.audit_logs(created_at);
CREATE INDEX IX_audit_logs_entity ON dbo.audit_logs(entity_type, entity_id);
CREATE INDEX IX_audit_logs_user ON dbo.audit_logs(user_id);
GO

-- ============================================================================
-- End of Schema
-- ============================================================================

PRINT 'SN Auto Parts schema created successfully.';
GO

