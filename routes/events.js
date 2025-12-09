// routes/events.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const router = express.Router();

router.get('/new', async (req, res) => {
  // load venues and users for form selects
  const [venues] = await pool.query('SELECT venue_id, name FROM Venue ORDER BY venue_id');
  const [users] = await pool.query('SELECT user_id, name FROM Users ORDER BY user_id');
  res.render('events_form', { errors: [], old: {}, venues, users });
});

router.post('/new',
  body('title').trim().isLength({ min: 3 }).withMessage('Title required'),
  body('venue_id').isInt({ min: 1 }).withMessage('Venue required'),
  body('start_datetime').isISO8601().withMessage('Start date/time required'),
  body('end_datetime').isISO8601().withMessage('End date/time required'),
  body('created_by').optional({ checkFalsy: true }).isInt(),
  async (req, res) => {
    const errors = validationResult(req);
    const old = req.body;
    const [venues] = await pool.query('SELECT venue_id, name FROM Venue ORDER BY venue_id');
    const [users] = await pool.query('SELECT user_id, name FROM Users ORDER BY user_id');
    if (!errors.isEmpty()) {
      return res.status(400).render('events_form', { errors: errors.array(), old, venues, users });
    }

    const { title, description, venue_id, start_datetime, end_datetime, status, created_by } = req.body;
    try {
      const sql = `INSERT INTO Event (title, description, venue_id, start_datetime, end_datetime, status, created_by)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
      const [result] = await pool.execute(sql, [title, description || null, venue_id, start_datetime, end_datetime, status || 'DRAFT', created_by || null]);
      res.render('success', { message: `Event created with id ${result.insertId}` });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { error: err });
    }
  }
);

module.exports = router;