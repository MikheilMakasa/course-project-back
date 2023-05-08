import db from '../db.js';
import jwt from 'jsonwebtoken';

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
    'SELECT p.id, `username`, `title`, `description`, p.img, u.img AS userImg, `cat`, `date`, p.likes_count FROM users u JOIN posts p ON u.id=p.uid WHERE p.id= ?';

  db.query(q, [req.params.id], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }
    return res.status(200).json(data[0]);
  });
};

export const addPost = async (req, res) => {
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).json('not authenticated!');
  }

  jwt.verify(token, process.env.SECRET_KEY, async (err, userInfo) => {
    try {
      if (err) {
        return res.status(403).json('Token is not valid!');
      }

      const q =
        'INSERT INTO posts(`title`, `description`, `img`, `cat`, `date`, `uid`, `likes_count`) VALUES (?)';

      const values = [
        req.body.title,
        req.body.description,
        req.body.image,
        req.body.cat,
        req.body.date,
        userInfo.id,
        0, // Initialize likes_count to 0
      ];
      db.query(q, [values], (err, data) => {
        if (err) {
          return res.status(500).json(err);
        }
        return res.status(200).json('Post has been created!');
      });
    } catch (error) {
      console.log(error);
    }
  });
};

export const deletePost = (req, res) => {
  const token = req.cookies.access_token;

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

  if (!token) {
    return res.status(401).json('not authenticated!');
  }

  jwt.verify(token, process.env.SECRET_KEY, async (err, userInfo) => {
    try {
      if (err) {
        return res.status(403).json('Token is not valid!');
      }

      const postId = req.params.id;
      const q =
        'UPDATE posts SET `title`=?, `description`=?, `img`=?, `cat`=?  WHERE `id`=? AND `uid`=?';

      const values = [
        req.body.title,
        req.body.description,
        req.body.image,
        req.body.cat,
        postId,
        userInfo.id,
      ];

      db.query(q, values, (err, data) => {
        if (err) {
          return res.status(500).json(err);
        }
        return res.status(200).json('Post has been updated!');
      });
    } catch (error) {
      console.log(error);
    }
  });
};

export const likePost = (req, res) => {
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).json('not authenticated!');
  }

  jwt.verify(token, process.env.SECRET_KEY, async (err, userInfo) => {
    try {
      if (err) {
        return res.status(403).json('Token is not valid!');
      }

      const postId = req.params.id;
      const userId = userInfo.id;

      // Check if the user has already liked the post
      const selectQuery =
        'SELECT * FROM likes WHERE post_id = ? AND user_id = ?';

      db.query(selectQuery, [postId, userId], (err, data) => {
        if (err) {
          return res.status(500).json(err);
        }

        if (data.length === 0) {
          // User has not liked the post, add a new like
          const insertQuery =
            'INSERT INTO likes (post_id, user_id) VALUES (?, ?)';

          db.query(insertQuery, [postId, userId], (err, data) => {
            if (err) {
              return res.status(500).json(err);
            }

            // Increment the likes_count in the posts table
            const updateQuery =
              'UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?';

            db.query(updateQuery, [postId], (err, data) => {
              if (err) {
                return res.status(500).json(err);
              }

              return res.status(200).json('Post has been liked!');
            });
          });
        } else {
          // User has already liked the post, remove the like
          const deleteQuery =
            'DELETE FROM likes WHERE post_id = ? AND user_id = ?';

          db.query(deleteQuery, [postId, userId], (err, data) => {
            if (err) {
              return res.status(500).json(err);
            }

            // Decrement the likes_count in the posts table
            const updateQuery =
              'UPDATE posts SET likes_count = likes_count - 1 WHERE id = ?';

            db.query(updateQuery, [postId], (err, data) => {
              if (err) {
                return res.status(500).json(err);
              }

              return res.status(200).json('Post has been unliked!');
            });
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
  });
};
