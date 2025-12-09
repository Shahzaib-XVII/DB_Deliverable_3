// routes/reservations.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const router = express.Router();

router.get('/new', async (req, res) => {
  const [users] = await pool.query('SELECT user_id, name FROM Users ORDER BY user_id');
  const [events] = await pool.query('SELECT event_id, title FROM Event ORDER BY event_id');
  const [seats] = await pool.query('SELECT seat_id, section_id, row_label, seat_number FROM Seat ORDER BY seat_id LIMIT 200');
  res.render('reservation_form', { errors: [], old: {}, users, events, seats });
});

router.post('/new',
  body('user_id').optional({ checkFalsy: true }).isInt(),
  body('event_id').isInt({ min: 1 }).withMessage('Event required'),
  body('seat_id').isInt({ min: 1 }).withMessage('Seat required'),
  body('hold_expires_at').isISO8601().withMessage('Valid expiry datetime required'),
  async (req, res) => {
    const errors = validationResult(req);
    const old = req.body;
    const [users] = await pool.query('SELECT user_id, name FROM Users ORDER BY user_id');
    const [events] = await pool.query('SELECT event_id, title FROM Event ORDER BY event_id');
    const [seats] = await pool.query('SELECT seat_id, section_id, row_label, seat_number FROM Seat ORDER BY seat_id LIMIT 200');
    if (!errors.isEmpty()) {
      return res.status(400).render('reservation_form', { errors: errors.array(), old, users, events, seats });
    }

    const { user_id, event_id, seat_id, hold_expires_at } = req.body;
    try {
      // Use prepared statement to insert reservation
      const sql = `INSERT INTO Reservation (user_id, event_id, seat_id, hold_expires_at) VALUES (?, ?, ?, ?)`;
      const [result] = await pool.execute(sql, [user_id || null, event_id, seat_id, hold_expires_at]);
      res.render('success', { message: `Reservation created with id ${result.insertId}` });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { error: err });
    }
  }
);

module.exports = router;