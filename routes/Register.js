const express = require('express');
const router = express.Router();

const userRepo = require('../repositories/users');
const { validateUsers } = require('../validations/Usersvalidation');
const validateRequest = require('../middleware/validateRequest');
const asyncWrapper = require('../middleware/asyncWrapper');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const cookieOpts = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

router.post(
  '/',
  validateRequest(validateUsers),
  asyncWrapper(async (req, res) => {
    const { password, ...rest } = req.validatedBody;

    const existing = await userRepo.findExistingByEmailOrUsername(rest.email, rest.username);
    if (existing) {
      return res.status(409).json({ message: 'Email or Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userRepo.createUser({
      firstName: rest.firstName,
      lastName: rest.lastName,
      username: rest.username,
      email: rest.email,
      passwordHash: hashedPassword,
    });

    const payload = { userId: user.id, username: user.username };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    await userRepo.updateRefreshToken(user.id, refreshToken);

    res.cookie('refreshToken', refreshToken, cookieOpts());

    res.status(201).json({
      message: 'User created',
      accessToken,
      user: { ...rest },
    });
  })
);

module.exports = router;
