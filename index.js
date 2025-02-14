const express = require('express');
const Detail = require('./table.js'); // Ensure this path is correct
const cors = require('cors');
const axios = require('axios'); // Import axios for making HTTP requests

const app = express();
app.use(cors()); // Enable CORS
app.use(express.json()); // For parsing application/json

// Basic test route
app.get('/', (req, res) => {
  res.send("It is working");
});

// Route to get all details
app.get('/detail', async (req, res) => {
  try {
    const data = await Detail.find();
    res.send(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to get details based on company
app.post('/newchat', async (req, res) => {
  const { company } = req.body;
  console.log('Received data:', company);

  try {
    const data1 = await Detail.find({ company }); // Ensure you are querying the correct field
    console.log('Fetched data:', data1);

    // Send the fetched data back to the client
    res.status(200).json({ message: 'Data received', data: data1 });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Error fetching data' });
  }
});

// Route to get details based on branch
app.post('/branch', async (req, res) => {
  const { branch } = req.body;
  console.log('Received data:', branch);

  try {
    const data1 = await Detail.find({ branch }); // Ensure you are querying the correct field
    console.log('Fetched data:', data1);

    // Send the fetched data back to the client
    res.status(200).json({ message: 'Data received', data: data1 });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Error fetching data' });
  }
});

// Route to search students based on a single keyword search
app.get('/students/search', async (req, res) => {
  const { keyword } = req.query;

  // Create a search condition to search across multiple fields
  const searchCriteria = {
    $or: [
      { name: { $regex: keyword, $options: 'i' } },       // Search in the name field (case-insensitive)
      { Roll_no: { $regex: keyword, $options: 'i' } },    // Search in the roll number field
      { company: { $regex: keyword, $options: 'i' } },    // Search in the company field
      { branch: { $regex: keyword, $options: 'i' } },     // Search in the branch field
      { year: { $regex: keyword, $options: 'i' } }        // Search in the year field
    ]
  };

  try {
    const students = await Detail.find(searchCriteria);   // Fetch students based on the search criteria
    res.json(students);                                   // Send the results back to the frontend
  } catch (error) {
    console.error('Error fetching students:', error);     // Log the error for debugging
    res.status(500).json({ error: 'Internal Server Error' }); // Return an error response
  }
});

// // Route to search students based on various parameters
// app.get('/students/search', async (req, res) => {
//   const { name, rollNumber, company, branch, year } = req.query;

//   // Create an object to hold search criteria
//   const searchCriteria = {};

//   // Conditionally add filters based on the query parameters provided
//   if (name) {
//     searchCriteria.name = { $regex: name, $options: 'i' }; // Case-insensitive search
//   }
//   if (rollNumber) {
//     searchCriteria.Roll_no = rollNumber; // Exact match
//   }
//   if (company) {
//     searchCriteria.company = { $regex: company, $options: 'i' }; // Case-insensitive search
//   }
//   if (branch) {
//     searchCriteria.branch = branch; // Exact match
//   }
//   if (year) {
//     searchCriteria.year = year; // Exact match
//   }

//   try {
//     const students = await Detail.find(searchCriteria);
//     res.json(students);
//   } catch (error) {
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// Route to filter students based on branch, company, and year
app.get("/filter", async (req, res) => {
  const { branch, company, year,course } = req.query;

  // Build the search filter object
  const searchFilter = {};
  
  if (branch) {
    searchFilter.branch = { $regex: branch, $options: 'i' }; // Case-insensitive regex for branch
  }
  if (company) {
    searchFilter.company = { $regex: company, $options: 'i' }; // Case-insensitive regex for company
  }
  if (year) {
    searchFilter.year = year; // Exact match for year
  }
  if (course) {
    searchFilter.course = course;
  }

  try {
    // Fetch data from the database based on the combined filters
    const students = await Detail.find(searchFilter);
    
    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found matching the selected filters.' });
    }

    res.json(students); // Return the filtered results
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'An error occurred while fetching students.' });
  }
});


app.post('/jobs', (req, res) => {
  const { query } = req.body; // Expecting { "query": "job title or keywords" }

  // Validate input
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required.' });
  }

  // Prepare search parameters for the Jobicy API
  const apiUrl = `https://jobicy.com/api/v2/remote-jobs?count=30&geo=usa&industry=${encodeURIComponent(query)}`;

  // Make a request to the Jobicy API
  https.get(apiUrl, (apiResponse) => {
    let data = '';

    // Collect data chunks
    apiResponse.on('data', (chunk) => {
      data += chunk;
    });

    // When the response is complete
    apiResponse.on('end', () => {
      const results = JSON.parse(data); // Parse the JSON data

      // Check if jobs are present in the results
      if (results && results.jobs && results.jobs.length > 0) {
        return res.json(results.jobs); // Send job listings back to the client
      } else {
        return res.status(404).json({ error: 'No job listings found.' });
      }
    });
  }).on('error', (error) => {
    console.error('Error fetching job data:', error);
    return res.status(500).json({ error: 'An error occurred while fetching job data.' });
  });
});

app.get("/placements", async (req, res) => {
  try {
    const placements = await Detail.find();
    res.json(placements);
  } catch (err) {
    res.status(500).json({ error: "Error fetching placement data" });
  }
});

// Start the server

// Start the server on port 8080
app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
