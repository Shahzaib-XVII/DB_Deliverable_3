// app.js - minimal Express app demonstrating insertion endpoints
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();

const usersRouter = require('./routes/users');
const eventsRouter = require('./routes/events');
const reservationsRouter = require('./routes/reservations');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('home');
});

app.use('/users', usersRouter);
app.use('/events', eventsRouter);
app.use('/reservations', reservationsRouter);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
