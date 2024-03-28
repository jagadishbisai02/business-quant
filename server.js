const express = require("express");
const url = require("url");
const connection = require("./mysqldbconn");
const bodyParser = require("body-parser");

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

app.use(bodyParser.json());

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

// Routes

// GET all users
app.get("/historic", (req, res) => {
  try {
    // Parse the request URL
    const queryObject = url.parse(req.url, true).query;

    // Extract parameters
    const ticker = queryObject.ticker;
    const columns = queryObject.column.split(",");
    const period = queryObject.period;

    // Construct the MySQL query
    let mysqlQuery = `SELECT ${columns.join(
      ", "
    )} FROM employeedb.historic WHERE ticker = ? AND TIMESTAMPDIFF(YEAR, date, CURDATE()) <= ?`;

    // Execute the MySQL query
    connection.query(mysqlQuery, [ticker, period], (err, results) => {
      if (err) {
        console.error("Error fetching users:", err);
        res.status(500);
        res.send("Error fetching users");
        return;
      }
      res.json(results);
    });
  } catch (error) {}
});

//GET Id's specific users
app.get("/historic/:ticker", (req, res) => {
  try {
    connection.query(
      "SELECT * FROM historic WHERE ticker=?",
      [req.params.ticker],
      (err, data) => {
        if (err) {
          return res.json("Error");
        } else {
          return res.json(data);
        }
      }
    );
  } catch (error) {}
});

// POST a new user
app.post("/historic", (req, res) => {
  const { ticker, date, revenue, gp, fcf, capex } = req.body;
  connection.query(
    `INSERT INTO historic (ticker,date,revenue,gp,fcf,capex) VALUES ('${ticker}', '${date}', '${revenue}','${gp}','${fcf}','${capex}')`,
    (err, result) => {
      if (err) {
        console.error("Error creating user:", err);
        res.status(500);
        res.send("Error creating user");
        return;
      } else {
        res.status(201);
        res.send("User created successfully", result);
      }
    }
  );
});

// for update single row on database
app.patch("/historic", (req, res) => {
  const historic = req.body;
  connection.query(
    "UPDATE historic SET ? WHERE ticker=" + historic.ticker,
    [historic],
    (err, data) => {
      if (err) {
        return res.json("Error");
      } else {
        return res.json(data);
      }
    }
  );
});

//for insert details on database
app.put("/historic", (req, res) => {
  const historic = req.body;
  connection.query(
    "UPDATE historic SET ? WHERE ticker=" + historic.ticker,
    [historic],
    (err, data) => {
      if (err) {
        return res.json("Error");
      } else {
        if (data.affectedRows == 0) {
          const historic = req.body;
          const historicData = [
            historic.ticker,
            historic.date,
            historic.revenue,
            historic.gp,
            historic.fcf,
            historic.capex,
          ];
          connection.query(
            "INSERT INTO historic(ticker,date,revenue,gp,fcf,capex) values(?)",
            [historicData],
            (err, data) => {
              if (err) {
                return res.json("Error");
              } else {
                return res.json(data);
              }
            }
          );
        }
        return res.json(data);
      }
    }
  );
});

//for deleting data from database on Id's
app.delete("/historic/:ticker", (req, res) => {
  connection.query(
    "DELETE FROM historic WHERE ticker=?",
    [req.params.ticker],
    (err, data) => {
      if (err) {
        return res.json("Error");
      } else {
        return res.json(data);
      }
    }
  );
});
