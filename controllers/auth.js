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

    res.cookie('access_token', token, {
      httpOnly: true,
      sameSite: isIphone ? 'lax' : 'none',
      secure: isIphone ? false : true,
    });

    return res.status(200).json(other);
  });
};

export const logout = (req, res) => {
  // Set cookie options based on user agent
  const userAgent = req.headers['user-agent'];
  const isIphone = userAgent.includes('iPhone');

  res
    .clearCookie('access_token', {
      sameSite: isIphone ? 'lax' : 'none',
      secure: isIphone ? false : true,
    })
    .status(200)
    .json('User has been logged out');
};
