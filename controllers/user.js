import db from '../db.js';
import jwt from 'jsonwebtoken';

export const getUsers = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json('Not authenticated!');
  }

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    const userId = decodedToken.id;

    // Check if the user is an admin
    const isAdminQuery = 'SELECT isAdmin FROM users WHERE id = ?';
    db.query(isAdminQuery, [userId], (err, userData) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (userData.length === 0) {
        return res.status(404).json('User not found!');
      }

      const user = userData[0];
      if (!user.isAdmin) {
        return res.status(403).json('Unauthorized!');
      }

      // Retrieve all users' information
      const getUsersQuery = 'SELECT id, username, email, isAdmin FROM users';
      db.query(getUsersQuery, (err, usersData) => {
        if (err) {
          return res.status(500).json(err);
        }

        return res.status(200).json(usersData);
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(403).json('Token is not valid!');
  }
};
export const makeAdmin = async (req, res) => {
  const { emailList } = req.body;

  try {
    await Promise.all(
      emailList.map(async (email) => {
        await db.query('UPDATE users SET isAdmin = ? WHERE email = ?', [
          'true',
          email,
        ]);
      })
    );

    return res.json({ status: 200, message: 'Users successfully made admin' });
  } catch (error) {
    return res.json({ status: 400, message: error });
  }
};

export const unmakeAdmin = async (req, res) => {
  const { emailList } = req.body;

  try {
    await Promise.all(
      emailList.map(async (email) => {
        await db.query('UPDATE users SET isAdmin = ? WHERE email = ?', [
          'false',
          email,
        ]);
      })
    );

    return res.json({
      status: 200,
      message: 'Users successfully unmade from being admin',
    });
  } catch (error) {
    return res.json({ status: 400, message: error });
  }
};

export const deleteUser = async (req, res) => {
  const { emailList } = req.body;

  try {
    await Promise.all(
      emailList.map(async (email) => {
        await db.query('DELETE FROM users WHERE email = ?', [email]);
      })
    );

    return res.json({ status: 200, message: 'Users successfully deleted' });
  } catch (error) {
    return res.json({ status: 400, message: error });
  }
};
