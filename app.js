require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
// Setup your Middleware and API Router here

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use('/api', require('./api'));

module.exports = app;
