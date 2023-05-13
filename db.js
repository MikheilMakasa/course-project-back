import mysql from 'mysql';
import * as dotenv from 'dotenv';

dotenv.config();

let db;

function handleDisconnect() {
  db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DATABASE_PORT,
  });

  db.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      // Retry connection after a delay
      setTimeout(handleDisconnect, 2000);
    } else {
      console.log('Connected to the database');
    }
  });

  db.on('error', (err) => {
    console.error('Database connection error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();

export default db;
