// routes/users.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const pool = require('../db');
const router = express.Router();

const baseUserValidators = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 chars'),
  body('email').isEmail().withMessage('Valid email required'),
  body('phone').optional({ checkFalsy: true }).isLength({ min: 7 }).withMessage('Phone is invalid'),
  body('role_id').isInt({ min: 1 }).withMessage('Role is required')
];

const createUserValidators = [
  ...baseUserValidators,
  body('password').isLength({ min: 8 }).withMessage('Password is required and must be at least 8 chars')
];

const updateUserValidators = [
  ...baseUserValidators,
  body('password').optional({ checkFalsy: true }).isLength({ min: 8 }).withMessage('Password must be at least 8 chars when provided')
];

async function fetchRoles() {
  const [roles] = await pool.query('SELECT role_id, role_name FROM Roles ORDER BY role_id');
  return roles;
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 600000, 64, 'sha512', (err, derivedKey) => {
      if (err) {
        return reject(err);
      }
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

router.get('/', async (req, res) => {
  const [users] = await pool.query(
    `SELECT u.user_id, u.name, u.email, u.phone, u.role_id, r.role_name
     FROM Users u
     JOIN Roles r ON u.role_id = r.role_id
     ORDER BY u.user_id`
  );
  res.render('users_list', { users });
});

router.get('/new', async (req, res) => {
  try {
    const roles = await fetchRoles();
    res.render('users_form', {
      errors: [],
      old: {},
      formAction: '/users/new',
      submitLabel: 'Create User',
      mode: 'create',
      roles
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { error: err });
  }
});

router.post(
  '/new',
  createUserValidators,
  async (req, res) => {
    const errors = validationResult(req);
    const old = req.body;
    const roles = await fetchRoles();
    if (!errors.isEmpty()) {
      return res.status(400).render('users_form', {
        errors: errors.array(),
        old,
        formAction: '/users/new',
        submitLabel: 'Create User',
        mode: 'create',
        roles
      });
    }

    const { name, email, phone, password, role_id } = req.body;
    try {
      const normalizedPassword = password && password.trim();
      const hashedPassword = normalizedPassword ? await hashPassword(normalizedPassword) : null;
      const sql = 'INSERT INTO Users (name, email, phone, hashed_password, role_id) VALUES (?, ?, ?, ?, ?)';
      const [result] = await pool.execute(sql, [name, email, phone || null, hashedPassword, role_id]);
      res.render('success', { message: `User created with id ${result.insertId}` });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { error: err });
    }
  }
);

router.get('/:id', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT u.*, r.role_name
     FROM Users u
     JOIN Roles r ON u.role_id = r.role_id
     WHERE u.user_id = ?`,
    [req.params.id]
  );
  if (!rows.length) {
    return res.status(404).render('error', { error: 'User not found' });
  }
  res.render('user_detail', { user: rows[0] });
});

router.get('/:id/edit', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM Users WHERE user_id = ?', [req.params.id]);
  if (!rows.length) {
    return res.status(404).render('error', { error: 'User not found' });
  }

  const roles = await fetchRoles();
  res.render('users_form', {
    errors: [],
    old: rows[0],
    formAction: `/users/${req.params.id}/edit`,
    submitLabel: 'Update User',
    mode: 'edit',
    roles
  });
});

router.post(
  '/:id/edit',
  updateUserValidators,
  async (req, res) => {
    const userId = req.params.id;
    const [existingRows] = await pool.query('SELECT * FROM Users WHERE user_id = ?', [userId]);
    if (!existingRows.length) {
      return res.status(404).render('error', { error: 'User not found' });
    }
    const existing = existingRows[0];
    const roles = await fetchRoles();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('users_form', {
        errors: errors.array(),
        old: { ...existing, ...req.body },
        formAction: `/users/${userId}/edit`,
        submitLabel: 'Update User',
        mode: 'edit',
        roles
      });
    }

    try {
      const { name, email, phone, password, role_id } = req.body;
      const normalizedPassword = password && password.trim();
      const passwordToPersist = normalizedPassword ? await hashPassword(normalizedPassword) : existing.hashed_password || null;
      await pool.execute(
        'UPDATE Users SET name = ?, email = ?, phone = ?, hashed_password = ?, role_id = ? WHERE user_id = ?',
        [name, email, phone || null, passwordToPersist, role_id, userId]
      );
      res.render('success', { message: `User ${userId} updated` });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { error: err });
    }
  }
);

router.post('/:id/delete', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM Users WHERE user_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).render('error', { error: 'User not found' });
    }
    res.render('success', { message: `User ${req.params.id} deleted` });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { error: err });
  }
});

module.exports = router;
