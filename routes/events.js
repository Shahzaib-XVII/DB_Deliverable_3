// routes/events.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const { formatDateTime } = require('../utils/datetime');
const router = express.Router();

const EVENT_STATUSES = ['DRAFT', 'PUBLISHED', 'CANCELLED'];
const eventValidators = [
  body('title').trim().isLength({ min: 3 }).withMessage('Title required'),
  body('venue_id').isInt({ min: 1 }).withMessage('Venue required'),
  body('start_datetime').isISO8601().withMessage('Start date/time required'),
  body('end_datetime').isISO8601().withMessage('End date/time required'),
  body('status').optional({ checkFalsy: true }).isIn(EVENT_STATUSES),
  body('created_by').optional({ checkFalsy: true }).isInt()
];

async function fetchEventFormData() {
  const [venues] = await pool.query('SELECT venue_id, name FROM Venue ORDER BY venue_id');
  const [users] = await pool.query('SELECT user_id, name FROM Users ORDER BY user_id');
  return { venues, users };
}

router.get('/', async (req, res) => {
  const [events] = await pool.query(
    `SELECT e.event_id, e.title, e.status, e.start_datetime, e.end_datetime, v.name AS venue_name
     FROM Event e
     JOIN Venue v ON e.venue_id = v.venue_id
     ORDER BY e.event_id`
  );
  res.render('events_list', { events });
});

router.get('/new', async (req, res) => {
  const { venues, users } = await fetchEventFormData();
  res.render('events_form', {
    errors: [],
    old: {},
    venues,
    users,
    formAction: '/events/new',
    submitLabel: 'Create Event',
    mode: 'create',
    statuses: EVENT_STATUSES
  });
});

router.post(
  '/new',
  eventValidators,
  async (req, res) => {
    const errors = validationResult(req);
    const old = req.body;
    const { venues, users } = await fetchEventFormData();
    if (!errors.isEmpty()) {
      return res.status(400).render('events_form', {
        errors: errors.array(),
        old,
        venues,
        users,
        formAction: '/events/new',
        submitLabel: 'Create Event',
        mode: 'create',
        statuses: EVENT_STATUSES
      });
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

router.get('/:id', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT e.*, v.name AS venue_name, u.name AS created_by_name
     FROM Event e
     JOIN Venue v ON e.venue_id = v.venue_id
     LEFT JOIN Users u ON e.created_by = u.user_id
     WHERE e.event_id = ?`,
    [req.params.id]
  );
  if (!rows.length) {
    return res.status(404).render('error', { error: 'Event not found' });
  }
  res.render('event_detail', { event: rows[0] });
});

router.get('/:id/edit', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM Event WHERE event_id = ?', [req.params.id]);
  if (!rows.length) {
    return res.status(404).render('error', { error: 'Event not found' });
  }
  const { venues, users } = await fetchEventFormData();
  const old = {
    ...rows[0],
    start_datetime: formatDateTime(rows[0].start_datetime),
    end_datetime: formatDateTime(rows[0].end_datetime)
  };
  res.render('events_form', {
    errors: [],
    old,
    venues,
    users,
    formAction: `/events/${req.params.id}/edit`,
    submitLabel: 'Update Event',
    mode: 'edit',
    statuses: EVENT_STATUSES
  });
});

router.post(
  '/:id/edit',
  eventValidators,
  async (req, res) => {
    const eventId = req.params.id;
    const [existingRows] = await pool.query('SELECT * FROM Event WHERE event_id = ?', [eventId]);
    if (!existingRows.length) {
      return res.status(404).render('error', { error: 'Event not found' });
    }
    const { venues, users } = await fetchEventFormData();
    const errors = validationResult(req);
    const mergedOld = {
      ...existingRows[0],
      ...req.body,
      start_datetime: req.body.start_datetime || formatDateTime(existingRows[0].start_datetime),
      end_datetime: req.body.end_datetime || formatDateTime(existingRows[0].end_datetime)
    };

    if (!errors.isEmpty()) {
      return res.status(400).render('events_form', {
        errors: errors.array(),
        old: mergedOld,
        venues,
        users,
        formAction: `/events/${eventId}/edit`,
        submitLabel: 'Update Event',
        mode: 'edit',
        statuses: EVENT_STATUSES
      });
    }

    const { title, description, venue_id, start_datetime, end_datetime, status, created_by } = req.body;
    try {
      await pool.execute(
        `UPDATE Event
         SET title = ?, description = ?, venue_id = ?, start_datetime = ?, end_datetime = ?, status = ?, created_by = ?
         WHERE event_id = ?`,
        [title, description || null, venue_id, start_datetime, end_datetime, status || 'DRAFT', created_by || null, eventId]
      );
      res.render('success', { message: `Event ${eventId} updated` });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { error: err });
    }
  }
);

router.post('/:id/delete', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM Event WHERE event_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).render('error', { error: 'Event not found' });
    }
    res.render('success', { message: `Event ${req.params.id} deleted` });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { error: err });
  }
});

module.exports = router;
