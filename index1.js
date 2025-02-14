const express = require('express');
const router = express.Router();
const Detail = require('./table');
const cors = require('cors');

const app = express();
app.use(cors()); // Enable CORS
app.use(express.json()); // For parsing application/json

// Route to search students based on various parameters
router.get('/students/search', async (req, res) => {
  const { name, rollNumber, company, branch, year } = req.query;

  // Create an object to hold search criteria
  const searchCriteria = {};

  // Conditionally add filters based on the query parameters provided
  if (name) {
    searchCriteria.name = { $regex: name, $options: 'i' }; // Case-insensitive search
  }
  if (rollNumber) {
    searchCriteria.Roll_no = rollNumber; // Exact match
  }
  if (company) {
    searchCriteria.company = { $regex: company, $options: 'i' }; // Case-insensitive search
  }
  if (branch) {
    searchCriteria.branch = branch; // Exact match
  }
  if (year) {
    searchCriteria.year = year; // Exact match
  }

  try {
    const students = await Detail.find(searchCriteria);
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
