-- Supermarket IoT Database Schema (3NF Normalized)

CREATE TABLE Store_Location (
    Location_ID INT PRIMARY KEY,
    Zone_Name VARCHAR(50),
    Aisle_Number INT
);

CREATE TABLE Product (
    Item_ID VARCHAR(50) PRIMARY KEY,
    Product_Name VARCHAR(100),
    Unit_Weight_Grams DECIMAL(5,2),
    Min_Stock_Threshold INT
);

CREATE TABLE Inventory_Log (
    Log_ID INT PRIMARY KEY AUTO_INCREMENT,
    Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    Item_ID VARCHAR(50),
    Location_ID INT,
    Calculated_Units INT,
    FOREIGN KEY (Item_ID) REFERENCES Product(Item_ID),
    FOREIGN KEY (Location_ID) REFERENCES Store_Location(Location_ID)
);

-- Seed Initial Data
INSERT INTO Product (Item_ID, Product_Name, Unit_Weight_Grams, Min_Stock_Threshold) 
VALUES ('ITEM-492', 'Organic Apples', 150.00, 10);