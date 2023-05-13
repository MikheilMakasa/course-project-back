import mysql from 'mysql';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  connectionLimit: 10, // Adjust the limit based on your needs
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
  port: process.env.DATABASE_PORT,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');

  // Handle disconnection
  connection.on('error', (error) => {
    console.error('Database connection error:', error);
    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      // Reconnect on lost connection
      connection.destroy();
      pool.getConnection((err, newConnection) => {
        if (err) {
          console.error('Error reconnecting to the database:', err);
          return;
        }
        console.log('Reconnected to the database');
        connection = newConnection;
      });
    } else {
      throw error;
    }
  });
});

export default pool;
