// Description: This file is the entry point of the application.

// Require the packages
const express = require('express');
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
app.use(cors())


// Endpoints
app.get('/', (req, res) => {
  res.send('Hello World!');
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

        // Function to get medal emojis for the first three serial numbers
        function getMedalEmoji(serialNumber) {
          const medals = ['🥇', '🥈', '🥉'];
          return medals[serialNumber - 1] || serialNumber;
        }

        const formattedRow = {};
        for (const key in data) {
          if (formattedData[key]) {
            formattedRow[formattedData[key]] = data[key];
          } else {
            formattedRow[key] = data[key];
          }
        }
        const rank = results.length + 1;
        formattedRow['Rank'] = rank <= 3 ? getMedalEmoji(rank) : rank;
        results.push(formattedRow);
      })
      .on('end', () => {
        res.json(results);
      });

  } else {
    res.send('Invalid secret');
  }
});



// formatted
app.post('/csvdata', (req, res) => {

});



// Listen to the port
app.listen(config.PORT, () => {
  console.clear();
  console.log(colors.green(`Server is running on port ${config.PORT} ✔`));
  console.log(colors.red(`Localhost : http://localhost:${config.PORT}`));
});
