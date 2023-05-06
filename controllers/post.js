import db from '../db.js';
import jwt from 'jsonwebtoken';
import cloudinary from '../utils/cloudinary.js';

export const getPosts = (req, res) => {
  const q = req.query.cat
    ? 'SELECT * FROM posts WHERE cat=?'
    : 'SELECT * FROM posts';

  db.query(q, [req.query.cat], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    return res.status(200).json(data);
  });
};

export const getPost = (req, res) => {
  const q =
    'SELECT p.id, `username`, `title`, `description`, p.img, u.img AS userImg, `cat`, `date` FROM users u JOIN posts p ON u.id=p.uid WHERE p.id= ?';

  db.query(q, [req.params.id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }
    return res.status(200).json(data[0]);
  });
};

export const addPost = async (req, res) => {
  const token = req.cookies.access_token;
  console.log(token);
  if (!token) {
    return res.status(401).json('not authenticated!');
  }

  jwt.verify(token, process.env.SECRET_KEY, async (err, userInfo) => {
    try {
      if (err) {
        return res.status(403).json('Token is not valid!');
      }

      const result = await cloudinary.uploader.upload(req.body.image, {
        folder: 'posts',
      });
      const imgForMySql = await result.secure_url;
      const q =
        'INSERT INTO posts(`title`, `description`, `img`, `cat`,`date`, `uid`) VALUES (?)';

      const values = [
        req.body.title,
        req.body.description,
        imgForMySql,
        req.body.cat,
        req.body.date,
        userInfo.id,
      ];
      db.query(q, [values], (err, data) => {
        if (err) {
          return res.status(500).json(err);
        }
        return res.status(200).json('Post has been created!');
      });

      const image = ''; // DELETE later
    } catch (error) {}
  });
};

export const deletePost = (req, res) => {
  const token = req.cookies.access_token;
  console.log(token);
  if (!token) {
    return res.status(401).json('not authenticated!');
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, userInfo) => {
    if (err) {
      return res.status(403).json('Token is not valid!');
    }
    const postId = req.params.id;

    const q = 'DELETE FROM posts WHERE `id` = ? AND `uid` = ?';

    db.query(q, [postId, userInfo.id], (err, data) => {
      if (err) {
        return res.status(403).json('You can delete only your posts');
      }
      return res.status(200).json('Post has been deleted!');
    });
  });
};

export const updatePost = (req, res) => {
  const token = req.cookies.access_token;
  console.log(token);
  if (!token) {
    return res.status(401).json('not authenticated!');
  }

  jwt.verify(token, process.env.SECRET_KEY, async (err, userInfo) => {
    try {
      if (err) {
        return res.status(403).json('Token is not valid!');
      }

      const result = await cloudinary.uploader.upload(req.body.image, {
        folder: 'posts',
      });
      const imgForMySql = await result.secure_url;
      const postId = req.params.id;
      const q =
        'UPDATE posts SET `title`=?, `description`=?, `img`=?, `cat`=? WHERE `id`=? AND `uid`=?';

      const values = [
        req.body.title,
        req.body.description,
        imgForMySql,
        req.body.cat,
        userInfo.id,
      ];
      db.query(q, [...values, postId, userInfo.id], (err, data) => {
        if (err) {
          return res.status(500).json(err);
        }
        return res.status(200).json('Post has been updated!');
      });

      const image = ''; // DELETE later
    } catch (error) {}
  });
};
