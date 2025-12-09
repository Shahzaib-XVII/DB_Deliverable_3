// routes/reservations.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const { formatDateTime } = require('../utils/datetime');
const router = express.Router();

const RESERVATION_STATUSES = ['HELD', 'EXPIRED', 'CONFIRMED', 'CANCELLED'];
const reservationValidators = [
  body('user_id').optional({ checkFalsy: true }).isInt(),
  body('event_id').isInt({ min: 1 }).withMessage('Event required'),
  body('seat_id').isInt({ min: 1 }).withMessage('Seat required'),
  body('hold_expires_at').isISO8601().withMessage('Valid expiry datetime required'),
  body('status').optional({ checkFalsy: true }).isIn(RESERVATION_STATUSES)
];

async function fetchReservationOptions() {
  const [users] = await pool.query('SELECT user_id, name FROM Users ORDER BY user_id');
  const [events] = await pool.query('SELECT event_id, title FROM Event ORDER BY event_id');
  const [seats] = await pool.query('SELECT seat_id, section_id, row_label, seat_number FROM Seat ORDER BY seat_id LIMIT 200');
  return { users, events, seats };
}

router.get('/', async (req, res) => {
  const [reservations] = await pool.query(
    `SELECT r.hold_id, r.status, r.hold_expires_at, u.name AS user_name, e.title AS event_title,
            s.section_id, s.row_label, s.seat_number
     FROM Reservation r
     LEFT JOIN Users u ON r.user_id = u.user_id
     JOIN Event e ON r.event_id = e.event_id
     JOIN Seat s ON r.seat_id = s.seat_id
     ORDER BY r.hold_id`
  );
  res.render('reservations_list', { reservations });
});

router.get('/new', async (req, res) => {
  const { users, events, seats } = await fetchReservationOptions();
  res.render('reservation_form', {
    errors: [],
    old: {},
    users,
    events,
    seats,
    statuses: RESERVATION_STATUSES,
    formAction: '/reservations/new',
    submitLabel: 'Create Hold',
    mode: 'create'
  });
});

router.post(
  '/new',
  reservationValidators,
  async (req, res) => {
    const errors = validationResult(req);
    const old = req.body;
    const { users, events, seats } = await fetchReservationOptions();
    if (!errors.isEmpty()) {
      return res.status(400).render('reservation_form', {
        errors: errors.array(),
        old,
        users,
        events,
        seats,
        statuses: RESERVATION_STATUSES,
        formAction: '/reservations/new',
        submitLabel: 'Create Hold',
        mode: 'create'
      });
    }

    const { user_id, event_id, seat_id, hold_expires_at, status } = req.body;
    try {
      const sql = `INSERT INTO Reservation (user_id, event_id, seat_id, hold_expires_at, status) VALUES (?, ?, ?, ?, ?)`;
      const [result] = await pool.execute(sql, [user_id || null, event_id, seat_id, hold_expires_at, status || 'HELD']);
      res.render('success', { message: `Reservation created with id ${result.insertId}` });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { error: err });
    }
  }
);

router.get('/:id', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT r.*, u.name AS user_name, e.title AS event_title, s.section_id, s.row_label, s.seat_number
     FROM Reservation r
     LEFT JOIN Users u ON r.user_id = u.user_id
     JOIN Event e ON r.event_id = e.event_id
     JOIN Seat s ON r.seat_id = s.seat_id
     WHERE r.hold_id = ?`,
    [req.params.id]
  );
  if (!rows.length) {
    return res.status(404).render('error', { error: 'Reservation not found' });
  }
  res.render('reservation_detail', { reservation: rows[0] });
});

router.get('/:id/edit', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM Reservation WHERE hold_id = ?', [req.params.id]);
  if (!rows.length) {
    return res.status(404).render('error', { error: 'Reservation not found' });
  }
  const { users, events, seats } = await fetchReservationOptions();
  const old = {
    ...rows[0],
    hold_expires_at: formatDateTime(rows[0].hold_expires_at)
  };
  res.render('reservation_form', {
    errors: [],
    old,
    users,
    events,
    seats,
    statuses: RESERVATION_STATUSES,
    formAction: `/reservations/${req.params.id}/edit`,
    submitLabel: 'Update Reservation',
    mode: 'edit'
  });
});

router.post(
  '/:id/edit',
  reservationValidators,
  async (req, res) => {
    const holdId = req.params.id;
    const [existingRows] = await pool.query('SELECT * FROM Reservation WHERE hold_id = ?', [holdId]);
    if (!existingRows.length) {
      return res.status(404).render('error', { error: 'Reservation not found' });
    }
    const { users, events, seats } = await fetchReservationOptions();
    const errors = validationResult(req);
    const mergedOld = {
      ...existingRows[0],
      ...req.body,
      hold_expires_at: req.body.hold_expires_at || formatDateTime(existingRows[0].hold_expires_at)
    };

    if (!errors.isEmpty()) {
      return res.status(400).render('reservation_form', {
        errors: errors.array(),
        old: mergedOld,
        users,
        events,
        seats,
        statuses: RESERVATION_STATUSES,
        formAction: `/reservations/${holdId}/edit`,
        submitLabel: 'Update Reservation',
        mode: 'edit'
      });
    }

    const { user_id, event_id, seat_id, hold_expires_at, status } = req.body;
    try {
      await pool.execute(
        `UPDATE Reservation
         SET user_id = ?, event_id = ?, seat_id = ?, hold_expires_at = ?, status = ?
         WHERE hold_id = ?`,
        [user_id || null, event_id, seat_id, hold_expires_at, status || 'HELD', holdId]
      );
      res.render('success', { message: `Reservation ${holdId} updated` });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { error: err });
    }
  }
);

router.post('/:id/delete', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM Reservation WHERE hold_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).render('error', { error: 'Reservation not found' });
    }
    res.render('success', { message: `Reservation ${req.params.id} deleted` });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { error: err });
  }
});

module.exports = router;
