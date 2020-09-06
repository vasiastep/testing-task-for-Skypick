const { Router } = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { check, validationResult } = require('express-validator')
const User = require('../../models/User')
const { jwtSecret } = require('../../constants/keys')

const router = Router()

// /api/auth/register
router.post(
  '/register',
  [
    check('email', 'Wrong email').isEmail(),
    check('password', 'Min password length is 6 symbols').isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Wrong data during registration',
        })
      }

      const { email, password, name, surname } = req.body

      const candidate = await User.findOne({ email })

      if (candidate) {
        return res
          .status(400)
          .json({ exists: true, email, message: 'This email is already using' })
      }

      const hashedPassword = await bcrypt.hash(password, 12)

      const user = new User({
        email,
        password: hashedPassword,
        name,
        surname,
      })

      await user.save()

      res.status(201).json({
        message: 'User was successfully created',
      })
    } catch (e) {
      res.status(500).json({ message: 'Something went wrong' })
    }
  }
)

// /api/auth/login
router.post(
  '/login',
  [
    check('email', 'Wrong email').isEmail(),
    check('password', 'Min password length is 6 symbols').isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ errors: errors.array(), message: 'Wrong data during login' })
      }

      const { email, password } = req.body

      const user = await User.findOne({ email })

      if (!user) {
        return res.status(400).json("We can't find such user")
      }

      const passwordMatches = await bcrypt.compare(password, user.password)

      if (!passwordMatches) {
        return res.status(400).json('Wrong password, try again')
      }

      const token = jwt.sign({ userId: user.id }, jwtSecret, {
        expiresIn: '1h',
      })

      res.json({ token, userId: user.id, userData: user })
    } catch (e) {
      res.status(500).json({ message: 'Something went wrong' })
    }
  }
)

module.exports = router
