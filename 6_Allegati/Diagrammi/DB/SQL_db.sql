-- X2SEVENVAULT RELATIONAL DATABASE SCHEMA (ENGLISH)
-- FULL HIERARCHY: items → shelves → aisles → warehouses

CREATE DATABASE x2sevenvault;
USE x2sevenvault;

-- 1. WAREHOUSES TABLE
CREATE TABLE warehouses (
    warehouse_id VARCHAR(10) PRIMARY KEY,
    name         VARCHAR(50) NOT NULL,
    description  TEXT,
    is_active    BOOLEAN DEFAULT TRUE
);

-- 2. AISLES TABLE
CREATE TABLE aisles (
    aisle_id     VARCHAR(10) PRIMARY KEY,
    name         VARCHAR(50) NOT NULL,
    warehouse_id VARCHAR(10),
    description  TEXT,
    is_active    BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id)
);

-- 3. SHELVES TABLE
CREATE TABLE shelves (
    shelf_id    VARCHAR(15) PRIMARY KEY,
    name        VARCHAR(50) NOT NULL,
    aisle_id    VARCHAR(10),
    description VARCHAR(50),
    is_active   BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (aisle_id) REFERENCES aisles(aisle_id)
);

-- 4. PHYSICAL PROPERTIES TABLES
CREATE TABLE weight (
    weight_id INT PRIMARY KEY AUTO_INCREMENT,
    unit      VARCHAR(10)    NOT NULL,
    value     DECIMAL(10,2)  NOT NULL
);

CREATE TABLE width (
    width_id INT PRIMARY KEY AUTO_INCREMENT,
    unit     VARCHAR(10)    NOT NULL,
    value    DECIMAL(10,2)  NOT NULL
);

CREATE TABLE height (
    height_id INT PRIMARY KEY AUTO_INCREMENT,
    unit      VARCHAR(10)    NOT NULL,
    value     DECIMAL(10,2)  NOT NULL
);

CREATE TABLE physical_property (
    physical_property_id INT PRIMARY KEY AUTO_INCREMENT,
    weight_id            INT NOT NULL,
    width_id             INT NOT NULL,
    height_id            INT NOT NULL,
    FOREIGN KEY (weight_id) REFERENCES weight(weight_id),
    FOREIGN KEY (width_id)  REFERENCES width(width_id),
    FOREIGN KEY (height_id) REFERENCES height(height_id)
);

-- 5. USER ROLES TABLE
CREATE TABLE user_roles (
    role_id     INT PRIMARY KEY AUTO_INCREMENT,
    role_name   VARCHAR(50) NOT NULL,
    description TEXT
);

-- 6. USERS TABLE
CREATE TABLE users (
    user_id   VARCHAR(50)  PRIMARY KEY,
    email     VARCHAR(100) UNIQUE NOT NULL,
    role_id   INT,
    full_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (role_id) REFERENCES user_roles(role_id)
);

-- 7. ITEMS TABLE
CREATE TABLE items (
    item_id              VARCHAR(50)  PRIMARY KEY,
    name                 VARCHAR(100) NOT NULL,
    description          TEXT,
    ai_class_id          VARCHAR(50)  NOT NULL UNIQUE COMMENT 'AI classifier class ID',
    is_ai                BOOLEAN      DEFAULT FALSE,
    shelf_id             VARCHAR(15),
    aisle_id             VARCHAR(10),
    warehouse_id         VARCHAR(10),
    quantity             INT          DEFAULT 1,
    physical_property_id INT          NOT NULL,
    is_active            BOOLEAN      DEFAULT TRUE,
    FOREIGN KEY (shelf_id)             REFERENCES shelves(shelf_id),
    FOREIGN KEY (aisle_id)             REFERENCES aisles(aisle_id),
    FOREIGN KEY (warehouse_id)         REFERENCES warehouses(warehouse_id),
    FOREIGN KEY (physical_property_id) REFERENCES physical_property(physical_property_id)
);