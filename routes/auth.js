const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const userRepo = require('../repositories/users');

const cookieOpts = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
});

router.get('/refresh-token', async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const user = await userRepo.findById(decoded.userId);
    if (!user || user.refresh_token !== token) {
      return res.status(403).json({ message: 'Invalid or mismatched refresh token' });
    }

    const newAccessToken = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(403).json({ message: 'Token expired or invalid' });
  }
});

router.post('/logout', async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(204);

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const user = await userRepo.findById(decoded.userId);
    if (user && user.refresh_token === token) {
      await userRepo.updateRefreshToken(user.id, null);
    }
  } catch (err) {
    // still clear cookie
  }

  res.clearCookie('refreshToken', cookieOpts());
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
