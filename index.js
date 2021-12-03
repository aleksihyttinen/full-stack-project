const express = require("express");
const app = express();
const connection = require("./db.js");
const cors = require("cors");

app.use(express.json());
app.use(cors());
app.use(express.static("frontend/build"));

app.get("/locations", async (req, res) => {
  try {
    let data = await connection.findAll(req.query);
    res.send(data);
  } catch (err) {
    console.log(err);
    res.statusCode = 400;
    res.end();
  }
});

app.get("/locations/:id([0-9]+)", async (req, res) => {
  let id = req.params.id;
  try {
    let temp = await connection.findById(id);
    if (temp) {
      res.send(temp);
    }
  } catch (err) {
    console.log(err);
    if (err == "Id not found") {
      res.statusCode = 404;
      res.end();
    }
  }
});

app.delete("/locations/:id([0-9]+)", async (req, res) => {
  let id = req.params.id;
  try {
    let result = await connection.deleteById(id);
    res.send(result);
    res.statusCode = 204;
    res.end();
  } catch (err) {
    console.log(err);
    if (err == "Id not found") {
      res.statusCode = 404;
      res.end();
    }
  }
});

app.post("/locations", async (req, res) => {
  let location = req.body;
  try {
    let addedLocation = await connection.save(location);
    res.statusCode = 201;
    console.log({
      id: addedLocation,
      latitude: location.latitude,
      longitude: location.longitude,
    });
    res.send({
      id: addedLocation,
      latitude: location.latitude,
      longitude: location.longitude,
    });
  } catch (err) {
    console.log(err);
    res.statusCode = 400;
    res.end();
  }
});

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening on port ${server.address().port}`);
});
