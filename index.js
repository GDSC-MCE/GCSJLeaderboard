// Description: This file is the entry point of the application.

// Require the packages
const express = require('express');
const path = require('path');
const config = require('./config');
const colors = require('colors');
const cors = require('cors');
const app = express();
const { google } = require("googleapis");
const spreadsheetId = (config.SPREADSHEET_ID);
const fs = require('fs');
const csv = require('csv-parser');




// Middlewares
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));
app.use(cors());
app.use(express.static(path.join(__dirname, '/dist'))); // For deployment


// Endpoints
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, '/dist/index.html'));
});


app.post('/api/gcsj/leaderboard', (req, res) => {
  const { secret } = req.body;
  if (secret === config.SECRET) {

    const results = [];

    fs.createReadStream('./assets/csv/gcsj.csv')
      .pipe(csv())
      .on('data', (data) => {
        const formattedData = {
          'Student Name': 'StudentName',
          'Student Email': 'StudentEmail',
          'Institution': 'Institution',
          'Enrolment Date & Time': 'EnrolmentDateTime',
          'Enrolment Status': 'EnrolmentStatus',
          'Google Cloud Skills Boost Profile URL': 'GoogleCloudSkillsBoostProfileURL',
          '# of Courses Completed': 'NumberOfCoursesCompleted',
          '# of Skill Badges Completed': 'NumberOfSkillBadgesCompleted',
          '# of GenAI Game Completed': 'NumberOfGenAIGameCompleted',
          'Total Completions of both Pathways': 'TotalCompletionsOfBothPathways',
          'Redemption Status': 'RedemptionStatus'
        };

        const formattedRow = {};
        for (const key in data) {
          if (formattedData[key]) {
            formattedRow[formattedData[key]] = data[key];
          } else {
            formattedRow[key] = data[key];
          }
        }
        formattedRow['Score'] = parseInt(formattedRow.NumberOfCoursesCompleted) +
          parseInt(formattedRow.NumberOfSkillBadgesCompleted) +
          parseInt(formattedRow.NumberOfGenAIGameCompleted);

        results.sort((a, b) => b.Score - a.Score);
        results.push(formattedRow);
      })
      .on('end', () => {
        res.json(results);
      });

  } else {
    res.send('Invalid secret');
  }
});


// Listen to the port
app.listen(config.PORT, () => {
  console.clear();
  console.log(colors.green(`Server is running on port ${config.PORT} ✔`));
  console.log(colors.red(`Localhost : http://localhost:${config.PORT}`));
});
