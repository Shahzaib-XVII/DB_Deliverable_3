// routes/users.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const router = express.Router();

router.get('/new', (req, res) => {
  res.render('users_form', { errors: [], old: {} });
});

router.post('/new',
  // validation
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 chars'),
  body('email').isEmail().withMessage('Valid email required'),
  body('phone').optional({ checkFalsy: true }).isLength({ min: 7 }).withMessage('Phone is invalid'),
  body('role_id').isInt({ min: 1 }).withMessage('Role is required'),
  async (req, res) => {
    const errors = validationResult(req);
    const old = req.body;
    if (!errors.isEmpty()) {
      return res.status(400).render('users_form', { errors: errors.array(), old });
    }

    const { name, email, phone, hashed_password, role_id } = req.body;
    try {
      const sql = 'INSERT INTO Users (name, email, phone, hashed_password, role_id) VALUES (?, ?, ?, ?, ?)';
      const [result] = await pool.execute(sql, [name, email, phone || null, hashed_password || null, role_id]);
      res.render('success', { message: `User created with id ${result.insertId}` });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { error: err });
    }
  }
);

module.exports = router;