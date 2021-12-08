const mysql = require("mysql");
require("dotenv").config();
const Validator = require("jsonschema").Validator;
const validator = new Validator();

const schema = {
  id: "location",
  type: "object",
  properties: {
    id: {
      type: "number",
      minimum: 0,
    },
    latitude: {
      type: "number",
      minimum: -90,
      maximum: 90,
    },
    longitude: {
      type: "number",
      minimum: -180,
      maximum: 180,
    },
  },
  additionalProperties: false,
};

const connection = mysql.createPool({
  connectionLimit: 10,
  host: "mydb.tamk.fi",
  user: process.env.user,
  password: process.env.password,
  database: process.env.db,
});

let connectionFunctions = {
  connect: () => {
    if (err) throw err;
    connection.getConnection();
  },
  close: () => {
    return new Promise((resolve, reject) => {
      connection.end((err) => reject(err));
      resolve("Connection closed");
    });
  },
  save: (location) => {
    const validLocation = validator.validate(location, schema);
    return new Promise((resolve, reject) => {
      if (validLocation.errors.length == 0) {
        console.log("toimii");
        connection.query(
          "INSERT INTO locations (latitude, longitude) VALUES (?, ?)",
          [location.latitude, location.longitude],
          (err, result) => {
            if (err) {
              reject(err);
            }
            resolve(result.insertId);
          }
        );
      } else {
        reject(validLocation.errors);
      }
    });
  },

  findAll: (queries) => {
    return new Promise((resolve, reject) => {
      if (Object.keys(queries).length === 0) {
        connection.query("SELECT * FROM locations", (err, locations) => {
          if (err) {
            reject(err);
          }
          resolve(locations);
        });
      } else if (queries.minLat && queries.maxLat) {
        connection.query(
          "SELECT * FROM locations WHERE latitude > ? AND latitude < ?",
          [queries.minLat, queries.maxLat],
          (err, locations) => {
            if (err) {
              reject(err);
            }
            resolve(locations);
          }
        );
      } else if (queries.minLon && queries.maxLon) {
        connection.query(
          "SELECT * FROM locations WHERE longitude > ? AND longitude < ?",
          [queries.minLon, queries.maxLon],
          (err, locations) => {
            if (err) {
              reject(err);
            }
            resolve(locations);
          }
        );
      } else if (queries.sortBy) {
        connection.query(
          "SELECT * FROM locations ORDER BY " + queries.sortBy,
          (err, locations) => {
            if (err) {
              reject(err);
            }
            resolve(locations);
          }
        );
      } else {
        reject("Invalid queries/parameters");
      }
    });
  },
  deleteById: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        "DELETE FROM locations WHERE id=?",
        id,
        (err, result) => {
          if (err) {
            reject(err);
          }
          if (result.affectedRows == 0) {
            reject("Id not found");
          } else {
            resolve(`Deleted id: ${id} successfully`);
          }
        }
      );
    });
  },
  findById: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM locations WHERE id=?",
        id,
        (err, location) => {
          if (err) {
            reject(err);
          }
          if (location.length == 0) {
            reject("Id not found");
          } else {
            resolve(location);
          }
        }
      );
    });
  },
};

module.exports = connectionFunctions;
