const express = require('express');
const taskRepo = require('../repositories/tasks');
const userRepo = require('../repositories/users');
const asyncWrapper = require('../middleware/asyncWrapper');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

const cookieOpts = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

router.post(
  '/',
  asyncWrapper(async (req, res) => {
    const { username, password } = req.body;

    const user = await userRepo.findByUsername(username);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const accessToken = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    await userRepo.updateRefreshToken(user.id, refreshToken);

    res.cookie('refreshToken', refreshToken, cookieOpts());

    const tasks = await taskRepo.findForUser(username);

    res.status(200).json({
      message: 'Login successful',
      accessToken,
      user: {
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      tasks,
    });
  })
);

module.exports = router;
