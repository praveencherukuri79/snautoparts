/*
================================================================================
  SN Auto Parts - PostgreSQL Database Schema
================================================================================
  
  Version: 1.0.0
  Generated: 2026-01-06
  Database: PostgreSQL 14+
  
  Description:
    Complete DDL for the SN Auto Parts e-commerce platform.
    This schema supports:
    - User authentication and authorization with role-based feature configs
    - Product catalog with vehicle fitment data
    - Shopping cart and order management
    - Inventory tracking and drop-shipping integrations
    - Audit logging and webhook management
  
  Notes for DBA:
    - All primary keys use UUID (uuid_generate_v4)
    - Timestamps use TIMESTAMPTZ for timezone-aware datetime
    - JSON columns use JSONB for efficient querying
    - Decimal columns use NUMERIC with appropriate precision
    - Foreign keys use ON DELETE CASCADE where appropriate
    - Indexes are created for common query patterns
  
================================================================================
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Drop existing tables (in reverse dependency order)
-- ============================================================================
DROP TABLE IF EXISTS payment_events CASCADE;
DROP TABLE IF EXISTS shipments CASCADE;
DROP TABLE IF EXISTS order_timeline CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS affiliate_orders CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS affiliate_product_mappings CASCADE;
DROP TABLE IF EXISTS affiliates CASCADE;
DROP TABLE IF EXISTS inventory_logs CASCADE;
DROP TABLE IF EXISTS product_fitments CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS saved_vehicles CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS verifications CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS role_feature_configs CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS features CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS webhooks CASCADE;

-- ============================================================================
-- SECTION 1: Authentication & Authorization
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: roles
-- Description: User roles (CUSTOMER, MANAGER, ADMIN)
-- ----------------------------------------------------------------------------
CREATE TABLE roles (
    id                  UUID            NOT NULL    DEFAULT uuid_generate_v4(),
    name                VARCHAR(50)     NOT NULL,
    display_name        VARCHAR(100)    NOT NULL,
    description         TEXT            NULL,
    is_active           BOOLEAN         NOT NULL    DEFAULT TRUE,
    created_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    
    CONSTRAINT pk_roles PRIMARY KEY (id),
    CONSTRAINT uq_roles_name UNIQUE (name)
);

-- ----------------------------------------------------------------------------
-- Table: role_feature_configs
-- Description: JSON feature configuration per role
-- ----------------------------------------------------------------------------
CREATE TABLE role_feature_configs (
    id                  UUID            NOT NULL    DEFAULT uuid_generate_v4(),
    role_id             UUID            NOT NULL,
    config              JSONB           NOT NULL,
    version             INTEGER         NOT NULL    DEFAULT 1,
    created_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    
    CONSTRAINT pk_role_feature_configs PRIMARY KEY (id),
    CONSTRAINT fk_role_feature_configs_role FOREIGN KEY (role_id) 
        REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT uq_role_feature_configs_role UNIQUE (role_id)
);

-- ----------------------------------------------------------------------------
-- Table: users
-- Description: User accounts
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id                  UUID            NOT NULL    DEFAULT uuid_generate_v4(),
    email               VARCHAR(255)    NOT NULL,
    password_hash       VARCHAR(255)    NOT NULL,
    first_name          VARCHAR(100)    NOT NULL,
    last_name           VARCHAR(100)    NOT NULL,
    phone               VARCHAR(30)     NULL,
    avatar_url          VARCHAR(500)    NULL,
    role_id             UUID            NULL,
    is_active           BOOLEAN         NOT NULL    DEFAULT TRUE,
    email_verified      BOOLEAN         NOT NULL    DEFAULT FALSE,
    last_login_at       TIMESTAMPTZ     NULL,
    created_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) 
        REFERENCES roles(id) ON DELETE SET NULL
);

CREATE INDEX ix_users_email ON users(email);
CREATE INDEX ix_users_role ON users(role_id);

-- ----------------------------------------------------------------------------
-- Table: sessions
-- Description: User sessions (managed by Better Auth)
-- ----------------------------------------------------------------------------
CREATE TABLE sessions (
    id                  UUID            NOT NULL    DEFAULT uuid_generate_v4(),
    token               VARCHAR(500)    NOT NULL,
    user_id             UUID            NOT NULL,
    user_agent          VARCHAR(500)    NULL,
    ip_address          VARCHAR(50)     NULL,
    expires_at          TIMESTAMPTZ     NOT NULL,
    created_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    
    CONSTRAINT pk_sessions PRIMARY KEY (id),
    CONSTRAINT uq_sessions_token UNIQUE (token),
    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX ix_sessions_token ON sessions(token);
CREATE INDEX ix_sessions_expires_at ON sessions(expires_at);
CREATE INDEX ix_sessions_user ON sessions(user_id);

-- ----------------------------------------------------------------------------
-- Table: accounts
-- Description: OAuth provider accounts (managed by Better Auth)
-- ----------------------------------------------------------------------------
CREATE TABLE accounts (
    id                      UUID            NOT NULL    DEFAULT uuid_generate_v4(),
    user_id                 UUID            NOT NULL,
    provider                VARCHAR(50)     NOT NULL,
    provider_account_id     VARCHAR(255)    NOT NULL,
    access_token            TEXT            NULL,
    refresh_token           TEXT            NULL,
    access_token_expires_at TIMESTAMPTZ     NULL,
    refresh_token_expires_at TIMESTAMPTZ    NULL,
    scope                   VARCHAR(500)    NULL,
    id_token                TEXT            NULL,
    metadata                JSONB           NULL,
    created_at              TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    
    CONSTRAINT pk_accounts PRIMARY KEY (id),
    CONSTRAINT fk_accounts_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_accounts_provider UNIQUE (provider, provider_account_id)
);

CREATE INDEX ix_accounts_user ON accounts(user_id);

-- ----------------------------------------------------------------------------
-- Table: verifications
-- Description: Email verification and password reset tokens
-- ----------------------------------------------------------------------------
CREATE TABLE verifications (
    id                  UUID            NOT NULL    DEFAULT uuid_generate_v4(),
    identifier          VARCHAR(255)    NOT NULL,
    token               VARCHAR(500)    NOT NULL,
    type                VARCHAR(50)     NOT NULL    DEFAULT 'EMAIL',
    expires_at          TIMESTAMPTZ     NOT NULL,
    used                BOOLEAN         NOT NULL    DEFAULT FALSE,
    created_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    
    CONSTRAINT pk_verifications PRIMARY KEY (id),
    CONSTRAINT uq_verifications_token UNIQUE (token),
    CONSTRAINT ck_verifications_type CHECK (type IN ('EMAIL', 'PASSWORD_RESET', 'TWO_FACTOR'))
);

CREATE INDEX ix_verifications_token ON verifications(token);
CREATE INDEX ix_verifications_identifier ON verifications(identifier);

-- ----------------------------------------------------------------------------
-- Table: addresses
-- Description: User shipping/billing addresses
-- ----------------------------------------------------------------------------
CREATE TABLE addresses (
    id                  UUID            NOT NULL    DEFAULT uuid_generate_v4(),
    user_id             UUID            NOT NULL,
    first_name          VARCHAR(100)    NOT NULL,
    last_name           VARCHAR(100)    NOT NULL,
    company             VARCHAR(200)    NULL,
    address1            VARCHAR(255)    NOT NULL,
    address2            VARCHAR(255)    NULL,
    city                VARCHAR(100)    NOT NULL,
    state               VARCHAR(50)     NOT NULL,
    zip_code            VARCHAR(20)     NOT NULL,
    country             VARCHAR(2)      NOT NULL    DEFAULT 'US',
    phone               VARCHAR(30)     NULL,
    is_default          BOOLEAN         NOT NULL    DEFAULT FALSE,
    is_billing          BOOLEAN         NOT NULL    DEFAULT FALSE,
    created_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    
    CONSTRAINT pk_addresses PRIMARY KEY (id),
    CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX ix_addresses_user ON addresses(user_id);

-- ----------------------------------------------------------------------------
-- Table: saved_vehicles
-- Description: Customer's saved vehicles for quick fitment lookup
-- ----------------------------------------------------------------------------
CREATE TABLE saved_vehicles (
    id                  UUID            NOT NULL    DEFAULT uuid_generate_v4(),
    user_id             UUID            NOT NULL,
    nickname            VARCHAR(100)    NULL,
    year                INTEGER         NOT NULL,
    make                VARCHAR(50)     NOT NULL,
    model               VARCHAR(50)     NOT NULL,
    submodel            VARCHAR(50)     NULL,
    engine              VARCHAR(100)    NULL,
    is_default          BOOLEAN         NOT NULL    DEFAULT FALSE,
    created_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    
    CONSTRAINT pk_saved_vehicles PRIMARY KEY (id),
    CONSTRAINT fk_saved_vehicles_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT ck_saved_vehicles_year CHECK (year >= 1900 AND year <= 2100)
);

CREATE INDEX ix_saved_vehicles_user ON saved_vehicles(user_id);

-- ============================================================================
-- SECTION 2: Product Catalog
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: categories
-- Description: Product categories (hierarchical)
-- ----------------------------------------------------------------------------
CREATE TABLE categories (
    id                  UUID            NOT NULL    DEFAULT uuid_generate_v4(),
    name                VARCHAR(200)    NOT NULL,
    slug                VARCHAR(200)    NOT NULL,
    description         TEXT            NULL,
    image_url           VARCHAR(500)    NULL,
    icon                VARCHAR(50)     NULL,
    parent_id           UUID            NULL,
    sort_order          INTEGER         NOT NULL    DEFAULT 0,
    is_active           BOOLEAN         NOT NULL    DEFAULT TRUE,
    created_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    
    CONSTRAINT pk_categories PRIMARY KEY (id),
    CONSTRAINT uq_categories_slug UNIQUE (slug),
    CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) 
        REFERENCES categories(id) ON DELETE SET NULL
);

CREATE INDEX ix_categories_slug ON categories(slug);
CREATE INDEX ix_categories_parent ON categories(parent_id);

-- ----------------------------------------------------------------------------
-- Table: brands
-- Description: Product brands
-- ----------------------------------------------------------------------------
CREATE TABLE brands (
    id                  UUID            NOT NULL    DEFAULT uuid_generate_v4(),
    name                VARCHAR(200)    NOT NULL,
    slug                VARCHAR(200)    NOT NULL,
    description         TEXT            NULL,
    logo_url            VARCHAR(500)    NULL,
    website_url         VARCHAR(500)    NULL,
    is_active           BOOLEAN         NOT NULL    DEFAULT TRUE,
    created_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    
    CONSTRAINT pk_brands PRIMARY KEY (id),
    CONSTRAINT uq_brands_slug UNIQUE (slug)
);

CREATE INDEX ix_brands_slug ON brands(slug);

-- ----------------------------------------------------------------------------
-- Table: products
-- Description: Product catalog
-- ----------------------------------------------------------------------------
CREATE TABLE products (
    id                  UUID                NOT NULL    DEFAULT uuid_generate_v4(),
    sku                 VARCHAR(100)        NOT NULL,
    name                VARCHAR(500)        NOT NULL,
    slug                VARCHAR(500)        NOT NULL,
    description         TEXT                NULL,
    short_description   VARCHAR(500)        NULL,
    price               NUMERIC(10,2)       NOT NULL,
    compare_at_price    NUMERIC(10,2)       NULL,
    cost_price          NUMERIC(10,2)       NULL,
    category_id         UUID                NOT NULL,
    brand_id            UUID                NULL,
    image_url           VARCHAR(500)        NULL,
    images              JSONB               NOT NULL    DEFAULT '[]'::jsonb,
    weight              NUMERIC(8,2)        NULL,
    weight_unit         VARCHAR(10)         NOT NULL    DEFAULT 'lb',
    length              NUMERIC(8,2)        NULL,
    width               NUMERIC(8,2)        NULL,
    height              NUMERIC(8,2)        NULL,
    dimension_unit      VARCHAR(10)         NOT NULL    DEFAULT 'in',
    stock_quantity      INTEGER             NOT NULL    DEFAULT 0,
    low_stock_threshold INTEGER             NOT NULL    DEFAULT 10,
    upc                 VARCHAR(50)         NULL,
    fulfillment_type    VARCHAR(20)         NOT NULL    DEFAULT 'INVENTORY',
    is_active           BOOLEAN             NOT NULL    DEFAULT TRUE,
    is_featured         BOOLEAN             NOT NULL    DEFAULT FALSE,
    meta_title          VARCHAR(200)        NULL,
    meta_description    TEXT                NULL,
    created_at          TIMESTAMPTZ         NOT NULL    DEFAULT NOW(),
    updated_at          TIMESTAMPTZ         NOT NULL    DEFAULT NOW(),
    
    CONSTRAINT pk_products PRIMARY KEY (id),
    CONSTRAINT uq_products_sku UNIQUE (sku),
    CONSTRAINT uq_products_slug UNIQUE (slug),
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) 
        REFERENCES categories(id) ON DELETE RESTRICT,
    CONSTRAINT fk_products_brand FOREIGN KEY (brand_id) 
        REFERENCES brands(id) ON DELETE SET NULL,
    CONSTRAINT ck_products_fulfillment_type CHECK (fulfillment_type IN ('INVENTORY', 'DROPSHIP', 'MIXED'))
);

CREATE INDEX ix_products_sku ON products(sku);
CREATE INDEX ix_products_slug ON products(slug);
CREATE INDEX ix_products_category ON products(category_id);
CREATE INDEX ix_products_brand ON products(brand_id);
CREATE INDEX ix_products_fulfillment_type ON products(fulfillment_type);
CREATE INDEX ix_products_is_active ON products(is_active);

-- ----------------------------------------------------------------------------
-- Table: product_fitments
-- Description: Vehicle compatibility for products
-- ----------------------------------------------------------------------------
CREATE TABLE product_fitments (
    id                  UUID            NOT NULL    DEFAULT uuid_generate_v4(),
    product_id          UUID            NOT NULL,
    make                VARCHAR(50)     NOT NULL,
    model               VARCHAR(50)     NOT NULL,
    year_start          INTEGER         NOT NULL,
    year_end            INTEGER         NOT NULL,
    submodel            VARCHAR(50)     NULL,
    engine              VARCHAR(100)    NULL,
    notes               TEXT            NULL,
    created_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    
    CONSTRAINT pk_product_fitments PRIMARY KEY (id),
    CONSTRAINT fk_product_fitments_product FOREIGN KEY (product_id) 
        REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT ck_product_fitments_year_range CHECK (year_start <= year_end),
    CONSTRAINT ck_product_fitments_year_valid CHECK (year_start >= 1900 AND year_end <= 2100)
);

CREATE INDEX ix_product_fitments_product ON product_fitments(product_id);
CREATE INDEX ix_product_fitments_make_model ON product_fitments(make, model);
CREATE INDEX ix_product_fitments_year ON product_fitments(year_start, year_end);

-- ============================================================================
-- SECTION 3: Inventory Management
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: inventory_logs
-- Description: Inventory change history
-- ----------------------------------------------------------------------------
CREATE TABLE inventory_logs (
    id                  UUID            NOT NULL    DEFAULT uuid_generate_v4(),
    product_id          UUID            NOT NULL,
    type                VARCHAR(20)     NOT NULL,
    quantity_change     INTEGER         NOT NULL,
    quantity_before     INTEGER         NOT NULL,
    quantity_after      INTEGER         NOT NULL,
    reason              VARCHAR(500)    NULL,
    notes               TEXT            NULL,
    reference_id        VARCHAR(100)    NULL,
    created_by_id       UUID            NULL,
    created_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    
    CONSTRAINT pk_inventory_logs PRIMARY KEY (id),
    CONSTRAINT fk_inventory_logs_product FOREIGN KEY (product_id) 
        REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_inventory_logs_user FOREIGN KEY (created_by_id) 
        REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT ck_inventory_logs_type CHECK (type IN ('IMPORT', 'SALE', 'RETURN', 'ADJUSTMENT', 'RECOUNT', 'DAMAGED', 'RECEIVED'))
);

CREATE INDEX ix_inventory_logs_product ON inventory_logs(product_id);
CREATE INDEX ix_inventory_logs_created_at ON inventory_logs(created_at);

-- ============================================================================
-- SECTION 4: Shopping Cart
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: carts
-- Description: Shopping carts
-- ----------------------------------------------------------------------------
CREATE TABLE carts (
    id                  UUID            NOT NULL    DEFAULT uuid_generate_v4(),
    user_id             UUID            NULL,
    session_id          VARCHAR(100)    NULL,
    created_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    
    CONSTRAINT pk_carts PRIMARY KEY (id),
    CONSTRAINT fk_carts_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX ix_carts_user ON carts(user_id);
CREATE INDEX ix_carts_session ON carts(session_id);

-- ----------------------------------------------------------------------------
-- Table: cart_items
-- Description: Items in shopping carts
-- ----------------------------------------------------------------------------
CREATE TABLE cart_items (
    id                  UUID            NOT NULL    DEFAULT uuid_generate_v4(),
    cart_id             UUID            NOT NULL,
    product_id          UUID            NOT NULL,
    quantity            INTEGER         NOT NULL    DEFAULT 1,
    created_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    
    CONSTRAINT pk_cart_items PRIMARY KEY (id),
    CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) 
        REFERENCES carts(id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) 
        REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT uq_cart_items_cart_product UNIQUE (cart_id, product_id),
    CONSTRAINT ck_cart_items_quantity CHECK (quantity > 0)
);

CREATE INDEX ix_cart_items_cart ON cart_items(cart_id);
CREATE INDEX ix_cart_items_product ON cart_items(product_id);

-- ============================================================================
-- SECTION 5: Orders
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: orders
-- Description: Customer orders
-- ----------------------------------------------------------------------------
CREATE TABLE orders (
    id                      UUID            NOT NULL    DEFAULT uuid_generate_v4(),
    order_number            VARCHAR(50)     NOT NULL,
    user_id                 UUID            NOT NULL,
    status                  VARCHAR(20)     NOT NULL    DEFAULT 'PENDING',
    subtotal                NUMERIC(10,2)   NOT NULL,
    shipping_cost           NUMERIC(10,2)   NOT NULL    DEFAULT 0,
    tax_amount              NUMERIC(10,2)   NOT NULL    DEFAULT 0,
    discount_amount         NUMERIC(10,2)   NOT NULL    DEFAULT 0,
    total                   NUMERIC(10,2)   NOT NULL,
    shipping_address        JSONB           NOT NULL,
    billing_address         JSONB           NULL,
    shipping_method         VARCHAR(100)    NULL,
    shipping_carrier        VARCHAR(100)    NULL,
    payment_method          VARCHAR(50)     NULL,
    payment_intent_id       VARCHAR(255)    NULL,
    is_paid                 BOOLEAN         NOT NULL    DEFAULT FALSE,
    paid_at                 TIMESTAMPTZ     NULL,
    customer_notes          TEXT            NULL,
    internal_notes          TEXT            NULL,
    idempotency_key         VARCHAR(100)    NULL,
    created_at              TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    
    CONSTRAINT pk_orders PRIMARY KEY (id),
    CONSTRAINT uq_orders_order_number UNIQUE (order_number),
    CONSTRAINT uq_orders_idempotency_key UNIQUE (idempotency_key),
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT ck_orders_status CHECK (status IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'))
);

CREATE INDEX ix_orders_order_number ON orders(order_number);
CREATE INDEX ix_orders_user ON orders(user_id);
CREATE INDEX ix_orders_status ON orders(status);
CREATE INDEX ix_orders_created_at ON orders(created_at);

-- ----------------------------------------------------------------------------
-- Table: order_items
-- Description: Items in orders
-- ----------------------------------------------------------------------------
CREATE TABLE order_items (
    id                  UUID            NOT NULL    DEFAULT uuid_generate_v4(),
    order_id            UUID            NOT NULL,
    product_id          UUID            NOT NULL,
    
    -- Product snapshot at time of order
    product_name        VARCHAR(500)    NOT NULL,
    product_sku         VARCHAR(100)    NOT NULL,
    product_image_url   VARCHAR(500)    NULL,
    
    quantity            INTEGER         NOT NULL,
    unit_price          NUMERIC(10,2)   NOT NULL,
    total_price         NUMERIC(10,2)   NOT NULL,
    
    -- Drop-ship tracking
    supplier_id         VARCHAR(50)     NULL,
    supplier_sku        VARCHAR(100)    NULL,
    
    created_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    
    CONSTRAINT pk_order_items PRIMARY KEY (id),
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) 
        REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) 
        REFERENCES products(id) ON DELETE RESTRICT,
    CONSTRAINT ck_order_items_quantity CHECK (quantity > 0)
);

CREATE INDEX ix_order_items_order ON order_items(order_id);
CREATE INDEX ix_order_items_product ON order_items(product_id);

-- ----------------------------------------------------------------------------
-- Table: order_timeline
-- Description: Order status change history
-- ----------------------------------------------------------------------------
CREATE TABLE order_timeline (
    id                  UUID            NOT NULL    DEFAULT uuid_generate_v4(),
    order_id            UUID            NOT NULL,
    status              VARCHAR(50)     NOT NULL,
    title               VARCHAR(200)    NOT NULL,
    description         TEXT            NULL,
    metadata            JSONB           NULL,
    changed_by_id       UUID            NULL,
    created_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    
    CONSTRAINT pk_order_timeline PRIMARY KEY (id),
    CONSTRAINT fk_order_timeline_order FOREIGN KEY (order_id) 
        REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_timeline_user FOREIGN KEY (changed_by_id) 
        REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX ix_order_timeline_order ON order_timeline(order_id);
CREATE INDEX ix_order_timeline_created_at ON order_timeline(created_at);

-- ----------------------------------------------------------------------------
-- Table: shipments
-- Description: Order shipments and tracking
-- ----------------------------------------------------------------------------
CREATE TABLE shipments (
    id                      UUID            NOT NULL    DEFAULT uuid_generate_v4(),
    order_id                UUID            NOT NULL,
    carrier                 VARCHAR(50)     NOT NULL,
    tracking_number         VARCHAR(100)    NOT NULL,
    tracking_url            VARCHAR(500)    NULL,
    shipped_at              TIMESTAMPTZ     NULL,
    estimated_delivery_at   TIMESTAMPTZ     NULL,
    delivered_at            TIMESTAMPTZ     NULL,
    status                  VARCHAR(30)     NOT NULL    DEFAULT 'PENDING',
    created_at              TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    
    CONSTRAINT pk_shipments PRIMARY KEY (id),
    CONSTRAINT fk_shipments_order FOREIGN KEY (order_id) 
        REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT ck_shipments_status CHECK (status IN ('PENDING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'EXCEPTION'))
);

CREATE INDEX ix_shipments_order ON shipments(order_id);
CREATE INDEX ix_shipments_tracking ON shipments(tracking_number);

-- ----------------------------------------------------------------------------
-- Table: payment_events
-- Description: Stripe payment events log
-- ----------------------------------------------------------------------------
CREATE TABLE payment_events (
    id                      UUID            NOT NULL    DEFAULT uuid_generate_v4(),
    order_id                UUID            NOT NULL,
    type                    VARCHAR(50)     NOT NULL,
    status                  VARCHAR(30)     NOT NULL,
    stripe_payment_intent_id VARCHAR(255)   NULL,
    stripe_charge_id        VARCHAR(255)    NULL,
    stripe_refund_id        VARCHAR(255)    NULL,
    amount                  NUMERIC(10,2)   NOT NULL,
    currency                VARCHAR(3)      NOT NULL    DEFAULT 'USD',
    error_code              VARCHAR(50)     NULL,
    error_message           VARCHAR(500)    NULL,
    metadata                JSONB           NULL,
    stripe_event_payload    JSONB           NULL,
    created_at              TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    
    CONSTRAINT pk_payment_events PRIMARY KEY (id),
    CONSTRAINT fk_payment_events_order FOREIGN KEY (order_id) 
        REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT ck_payment_events_type CHECK (type IN ('PAYMENT_INTENT_CREATED', 'PAYMENT_SUCCEEDED', 'PAYMENT_FAILED', 'REFUND_INITIATED', 'REFUND_COMPLETED', 'DISPUTE_CREATED', 'DISPUTE_RESOLVED')),
    CONSTRAINT ck_payment_events_status CHECK (status IN ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED', 'DISPUTED', 'CANCELLED'))
);

CREATE INDEX ix_payment_events_order ON payment_events(order_id);
CREATE INDEX ix_payment_events_stripe_pi ON payment_events(stripe_payment_intent_id);
CREATE INDEX ix_payment_events_created_at ON payment_events(created_at);

-- ============================================================================
-- SECTION 6: Drop-Shipping / Affiliates
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: affiliates
-- Description: Drop-ship supplier configurations
-- ----------------------------------------------------------------------------
CREATE TABLE affiliates (
    id                  UUID            NOT NULL    DEFAULT uuid_generate_v4(),
    name                VARCHAR(200)    NOT NULL,
    code                VARCHAR(50)     NOT NULL,
    base_url            VARCHAR(500)    NOT NULL,
    api_key             VARCHAR(500)    NOT NULL,
    api_secret          VARCHAR(500)    NULL,
    is_active           BOOLEAN         NOT NULL    DEFAULT TRUE,
    retry_policy        JSONB           NOT NULL    DEFAULT '{"maxRetries": 3, "backoffMs": [1000, 5000, 15000]}'::jsonb,
    mapping_rules       JSONB           NULL,
    headers             JSONB           NULL,
    timeout_ms          INTEGER         NOT NULL    DEFAULT 8000,
    created_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    
    CONSTRAINT pk_affiliates PRIMARY KEY (id),
    CONSTRAINT uq_affiliates_code UNIQUE (code)
);

CREATE INDEX ix_affiliates_code ON affiliates(code);
CREATE INDEX ix_affiliates_is_active ON affiliates(is_active);

-- ----------------------------------------------------------------------------
-- Table: affiliate_product_mappings
-- Description: Map internal products to affiliate SKUs
-- ----------------------------------------------------------------------------
CREATE TABLE affiliate_product_mappings (
    id                      UUID            NOT NULL    DEFAULT uuid_generate_v4(),
    affiliate_id            UUID            NOT NULL,
    product_id              UUID            NOT NULL,
    affiliate_sku           VARCHAR(100)    NOT NULL,
    affiliate_product_id    VARCHAR(100)    NULL,
    price_multiplier        NUMERIC(5,4)    NULL,
    is_active               BOOLEAN         NOT NULL    DEFAULT TRUE,
    created_at              TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    
    CONSTRAINT pk_affiliate_product_mappings PRIMARY KEY (id),
    CONSTRAINT fk_affiliate_product_mappings_affiliate FOREIGN KEY (affiliate_id) 
        REFERENCES affiliates(id) ON DELETE CASCADE,
    CONSTRAINT fk_affiliate_product_mappings_product FOREIGN KEY (product_id) 
        REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT uq_affiliate_product_mappings UNIQUE (affiliate_id, product_id)
);

CREATE INDEX ix_affiliate_product_mappings_affiliate ON affiliate_product_mappings(affiliate_id);
CREATE INDEX ix_affiliate_product_mappings_product ON affiliate_product_mappings(product_id);

-- ----------------------------------------------------------------------------
-- Table: affiliate_orders
-- Description: Orders placed with affiliates for drop-shipping
-- ----------------------------------------------------------------------------
CREATE TABLE affiliate_orders (
    id                  UUID            NOT NULL    DEFAULT uuid_generate_v4(),
    order_id            UUID            NOT NULL,
    affiliate_id        UUID            NOT NULL,
    status              VARCHAR(20)     NOT NULL    DEFAULT 'PENDING',
    external_order_id   VARCHAR(100)    NULL,
    order_lines         JSONB           NULL,
    total_amount        NUMERIC(10,2)   NULL,
    tracking_number     VARCHAR(100)    NULL,
    request_payload     JSONB           NULL,
    response_payload    JSONB           NULL,
    last_error          TEXT            NULL,
    retry_count         INTEGER         NOT NULL    DEFAULT 0,
    next_retry_at       TIMESTAMPTZ     NULL,
    created_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    completed_at        TIMESTAMPTZ     NULL,
    
    CONSTRAINT pk_affiliate_orders PRIMARY KEY (id),
    CONSTRAINT fk_affiliate_orders_order FOREIGN KEY (order_id) 
        REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_affiliate_orders_affiliate FOREIGN KEY (affiliate_id) 
        REFERENCES affiliates(id) ON DELETE RESTRICT,
    CONSTRAINT ck_affiliate_orders_status CHECK (status IN ('PENDING', 'SENT', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'FAILED', 'CANCELLED'))
);

CREATE INDEX ix_affiliate_orders_order ON affiliate_orders(order_id);
CREATE INDEX ix_affiliate_orders_affiliate ON affiliate_orders(affiliate_id);
CREATE INDEX ix_affiliate_orders_status ON affiliate_orders(status);

-- ============================================================================
-- SECTION 7: Admin & System
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: features
-- Description: Master list of available features
-- ----------------------------------------------------------------------------
CREATE TABLE features (
    id                  UUID            NOT NULL    DEFAULT uuid_generate_v4(),
    code                VARCHAR(100)    NOT NULL,
    name                VARCHAR(200)    NOT NULL,
    description         TEXT            NULL,
    category            VARCHAR(50)     NOT NULL,
    is_active           BOOLEAN         NOT NULL    DEFAULT TRUE,
    created_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    
    CONSTRAINT pk_features PRIMARY KEY (id),
    CONSTRAINT uq_features_code UNIQUE (code)
);

CREATE INDEX ix_features_code ON features(code);
CREATE INDEX ix_features_category ON features(category);

-- ----------------------------------------------------------------------------
-- Table: settings
-- Description: Application settings key-value store
-- ----------------------------------------------------------------------------
CREATE TABLE settings (
    id                  UUID            NOT NULL    DEFAULT uuid_generate_v4(),
    key                 VARCHAR(100)    NOT NULL,
    value               JSONB           NOT NULL,
    description         VARCHAR(500)    NULL,
    category            VARCHAR(50)     NOT NULL,
    is_public           BOOLEAN         NOT NULL    DEFAULT FALSE,
    created_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    
    CONSTRAINT pk_settings PRIMARY KEY (id),
    CONSTRAINT uq_settings_key UNIQUE (key)
);

CREATE INDEX ix_settings_key ON settings(key);
CREATE INDEX ix_settings_category ON settings(category);

-- ----------------------------------------------------------------------------
-- Table: webhooks
-- Description: Outgoing webhook configurations
-- ----------------------------------------------------------------------------
CREATE TABLE webhooks (
    id                  UUID            NOT NULL    DEFAULT uuid_generate_v4(),
    name                VARCHAR(200)    NOT NULL,
    url                 VARCHAR(500)    NOT NULL,
    events              JSONB           NOT NULL,
    secret              VARCHAR(200)    NULL,
    is_active           BOOLEAN         NOT NULL    DEFAULT TRUE,
    last_triggered_at   TIMESTAMPTZ     NULL,
    last_status         INTEGER         NULL,
    failure_count       INTEGER         NOT NULL    DEFAULT 0,
    created_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    
    CONSTRAINT pk_webhooks PRIMARY KEY (id)
);

CREATE INDEX ix_webhooks_is_active ON webhooks(is_active);

-- ----------------------------------------------------------------------------
-- Table: audit_logs
-- Description: System audit trail
-- ----------------------------------------------------------------------------
CREATE TABLE audit_logs (
    id                  UUID            NOT NULL    DEFAULT uuid_generate_v4(),
    user_id             UUID            NULL,
    action              VARCHAR(100)    NOT NULL,
    entity_type         VARCHAR(50)     NOT NULL,
    entity_id           VARCHAR(100)    NOT NULL,
    previous_value      JSONB           NULL,
    new_value           JSONB           NULL,
    details             JSONB           NULL,
    ip_address          VARCHAR(50)     NULL,
    user_agent          VARCHAR(500)    NULL,
    created_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    
    CONSTRAINT pk_audit_logs PRIMARY KEY (id),
    CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX ix_audit_logs_user ON audit_logs(user_id);
CREATE INDEX ix_audit_logs_action ON audit_logs(action);
CREATE INDEX ix_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX ix_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================================
-- End of Schema
-- ============================================================================

