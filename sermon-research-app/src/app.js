const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const researchRoutes = require('./routes/research');
const sermonRoutes = require('./routes/sermons');
const citationRoutes = require('./routes/citations');
const analysisRoutes = require('./routes/analysis');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/research', researchRoutes);
app.use('/api/sermons', sermonRoutes);
app.use('/api/citations', citationRoutes);
app.use('/api/analysis', analysisRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Sermon Research App running on port ${PORT}`);
});

module.exports = app;