const express = require('express');
const mysql = require('mysql2/promise');
const EventEmitter = require('events');

const app = express();
app.use(express.json());

// Initialize the internal event bus for microservice decoupling
const eventBus = new EventEmitter();

// Database Connection Pool (Mitigates connection overload from IoT spikes)
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: 'supermarket_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Logistics Event Listener: Triggers when stock falls below min_threshold
eventBus.on('check_restock', (itemId, currentStock, minThreshold) => {
    if (currentStock < minThreshold) {
        console.log(`[ALERT] RESTOCK TRIGGERED FOR ${itemId}. Current: ${currentStock}, Min: ${minThreshold}`);
        // In production, this would send an MQTT/HTTP payload to the warehouse API
    }
});

// Core IoT Endpoint: Receives Node-RED payloads
app.post('/api/inventory', async (req, res) => {
    try {
        const { item_id, units_removed, location } = req.body;
        console.log(`[INBOUND] IoT Payload - Item: ${item_id}, Removed: ${units_removed}, Zone: ${location}`);

        // --- Production DB Logic (Commented out for local testing without active DB) ---
        // await pool.execute('UPDATE Inventory_Log SET Calculated_Units = Calculated_Units - ? WHERE Item_ID = ?', [units_removed, item_id]);
        // const [rows] = await pool.execute('SELECT Calculated_Units, Min_Stock_Threshold FROM Product JOIN Inventory_Log ON Product.Item_ID = Inventory_Log.Item_ID WHERE Product.Item_ID = ?', [item_id]);
        // const currentStock = rows[0].Calculated_Units;
        // const minThreshold = rows[0].Min_Stock_Threshold;
        
        // --- Simulated DB Logic for Demo purposes ---
        const currentStock = 8;   // Simulating stock falling to 8
        const minThreshold = 10;  // Simulating a minimum requirement of 10

        // Fire the internal event to the Logistics Service
        eventBus.emit('check_restock', item_id, currentStock, minThreshold);

        res.status(200).send({ message: "Stock updated securely and logistics events processed" });
    } catch (error) {
        console.error("[ERROR] Database operation failed:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Inventory Management Microservice running on port ${PORT}`);
});