import pool from '../db.js';
import jwt from 'jsonwebtoken';

export const getPosts = (req, res) => {
  const q = req.query.cat
    ? 'SELECT * FROM posts WHERE cat=?'
    : 'SELECT * FROM posts';

  pool.query(q, [req.query.cat], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    return res.status(200).json(data);
  });
};
export const getPost = (req, res) => {
  const postId = req.params.id;

  const postQuery = `
    SELECT p.id, u.username, p.title, p.description, p.img, p.cat, p.date, p.likes_count
    FROM users u
    JOIN posts p ON u.id = p.uid
    WHERE p.id = ?
  `;

  const likesQuery = `
    SELECT l.id AS likeId, l.user_id AS likeUserId, l.post_id AS likePostId
    FROM likes l
    WHERE l.post_id = ?
  `;

  pool.query(postQuery, [postId], (err, postData) => {
    if (err) {
      return res.status(500).json(err);
    }

    pool.query(likesQuery, [postId], (err, likesData) => {
      if (err) {
        return res.status(500).json(err);
      }

      const post = postData[0];
      const likes = likesData;

      const result = {
        id: post.id,
        username: post.username,
        title: post.title,
        description: post.description,
        img: post.img,
        cat: post.cat,
        date: post.date,
        likes_count: post.likes_count,
        likes: likes,
      };

      return res.status(200).json(result);
    });
  });
};

export const addPost = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json('Not authenticated!');
  }

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    const userId = decodedToken.id;

    const q =
      'INSERT INTO posts(`title`, `description`, `img`, `cat`, `date`, `uid`, `likes_count`) VALUES (?)';

    const values = [
      req.body.title,
      req.body.description,
      req.body.image,
      req.body.cat,
      req.body.date,
      userId,
      0, // Initialize likes_count to 0
    ];
    pool.query(q, [values], (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }
      return res.status(200).json('Post has been created!');
    });
  } catch (error) {
    console.log(error);
    return res.status(403).json('Token is not valid!');
  }
};

export const deletePost = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json('Not authenticated!');
  }

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    const userId = decodedToken.id;
    const postId = req.params.id;

    const q = 'DELETE FROM posts WHERE `id` = ? AND `uid` = ?';

    pool.query(q, [postId, userId], (err, data) => {
      if (err) {
        return res.status(403).json('You can delete only your posts');
      }
      return res.status(200).json('Post has been deleted!');
    });
  } catch (error) {
    console.log(error);
    return res.status(403).json('Token is not valid!');
  }
};

export const updatePost = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json('Not authenticated!');
  }

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    const userId = decodedToken.id;
    const postId = req.params.id;
    const q =
      'UPDATE posts SET `title`=?, `description`=?, `img`=?, `cat`=?  WHERE `id`=? AND `uid`=?';

    const values = [
      req.body.title,
      req.body.description,
      req.body.image,
      req.body.cat,
      postId,
      userId,
    ];

    pool.query(q, values, (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }
      return res.status(200).json('Post has been updated!');
    });
  } catch (error) {
    console.log(error);
    return res.status(403).json('Token is not valid!');
  }
};

export const likePost = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json('Not authenticated!');
  }

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    const userId = decodedToken.id;
    const postId = req.params.id;

    // Check if the user has already liked the post
    const selectQuery = 'SELECT * FROM likes WHERE post_id = ? AND user_id = ?';

    pool.query(selectQuery, [postId, userId], (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (data.length === 0) {
        // User has not liked the post, add a new like
        const insertQuery =
          'INSERT INTO likes (post_id, user_id) VALUES (?, ?)';

        pool.query(insertQuery, [postId, userId], (err, data) => {
          if (err) {
            return res.status(500).json(err);
          }

          // Increment the likes_count in the posts table
          const updateQuery =
            'UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?';

          pool.query(updateQuery, [postId], (err, data) => {
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

        pool.query(deleteQuery, [postId, userId], (err, data) => {
          if (err) {
            return res.status(500).json(err);
          }

          // Decrement the likes_count in the posts table
          const updateQuery =
            'UPDATE posts SET likes_count = likes_count - 1 WHERE id = ?';

          pool.query(updateQuery, [postId], (err, data) => {
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
    return res.status(403).json('Token is not valid!');
  }
};
