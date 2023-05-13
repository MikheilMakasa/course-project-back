import mysql from 'mysql';
import * as dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
  port: process.env.DATABASE_PORT,
};

const pool = mysql.createPool(dbConfig);

function handleDisconnect() {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      // Retry connection after a delay
      setTimeout(handleDisconnect, 2000);
    } else {
      console.log('Connected to the database');
      // Release the connection back to the pool
      connection.release();
    }
  });

  pool.on('error', (err) => {
    console.error('Database connection error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();

export default pool;
