import db from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

export const register = (req, res) => {
  try {
    // CHECK EXISTING USER
    const q = 'SELECT * FROM users WHERE email = ? OR username = ?';

    db.query(q, [req.body.email, req.body.username], (err, data) => {
      if (err) {
        return res.json(err);
      }
      if (data.length) {
        return res.status(409).json({ error: 'User already exists' });
      }

      // HASHING THE PASSWORD AND CREATING A USER
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(req.body.password, salt);

      const q = 'INSERT INTO users(`username`,`email`,`password`) VALUES (?)';
      const values = [req.body.username, req.body.email, hash];

      db.query(q, [values], (err, data) => {
        if (err) {
          return res.json(err);
        }
        return res.status(201).json({ message: 'User has been created' });
      });
    });
  } catch (error) {
    console.log(error);
  }
};

export const login = (req, res) => {
  // CHECK IF USER EXISTS
  const q = 'SELECT * FROM users WHERE username= ?';

  db.query(q, [req.body.username], (err, data) => {
    if (err) {
      return res.json(err);
    }
    if (data.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // CHECK IF PASSWORD MATCHES
    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      data[0].password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({ error: 'Wrong username or password' });
    }

    const token = jwt.sign({ id: data[0].id }, process.env.SECRET_KEY);

    const { password, ...other } = data[0];

    // Set cookie based on user agent
    const userAgent = req.headers['user-agent'];
    const isIphone = userAgent.includes('iPhone');

    const cookieOptions = {
      httpOnly: true,
      secure: !isIphone,
      sameSite: isIphone ? 'Lax' : 'None',
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    };

    res.setHeader(
      'Set-Cookie',
      serialize('access_token', token, cookieOptions)
    );

    return res.status(200).json(other);
  });
};

export const logout = (req, res) => {
  // Set cookie options based on user agent
  const userAgent = req.headers['user-agent'];
  const isIphone = userAgent.includes('iPhone');

  const cookieOptions = {
    sameSite: isIphone ? 'Lax' : 'None',
    secure: !isIphone,
    maxAge: 0,
  };

  res.setHeader('Set-Cookie', serialize('access_token', '', cookieOptions));

  return res.status(200).json('User has been logged out');
};
