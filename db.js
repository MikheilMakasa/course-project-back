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

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }

  connection.on('error', (err) => {
    console.error('Database connection error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      // Re-establish the connection
      pool.getConnection((err, connection) => {
        if (err) {
          console.error('Error reconnecting to the database:', err);
        } else {
          console.log('Reconnected to the database');
          connection.release();
        }
      });
    } else {
      throw err;
    }
  });

  console.log('Connected to the database');
  connection.release();
});

export default pool;
