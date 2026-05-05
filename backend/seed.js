require('dotenv').config({ path: __dirname + '/.env' });
const mysql = require('mysql2/promise');

async function seed() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        console.log("Seeding Phoenix Mall parking slots...");
        // Clear existing slots first
        await pool.query('DELETE FROM Bookings');
        await pool.query('DELETE FROM Parking_Slots');

        const levels = [1, 2, 3, 4, 5];
        const rows = ['A', 'B', 'C', 'D'];
        let count = 0;

        for (const level of levels) {
            for (const row of rows) {
                for (let i = 1; i <= 5; i++) {
                    const location = `Level ${level} - ${row}${i}`;
                    let price = 15.00;
                    let type = 'basic';
                    
                    if (level === 1) {
                        price = 50.00;
                        type = 'premium';
                    } else if (level <= 3) {
                        price = 30.00;
                        type = 'semi';
                    }

                    await pool.query(
                        'INSERT INTO Parking_Slots (location, status, type, price_per_hour) VALUES (?, "available", ?, ?)',
                        [location, type, price]
                    );
                    count++;
                }
            }
        }
        console.log(`Successfully generated ${count} parking slots for Phoenix Mall!`);
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
}

seed();
