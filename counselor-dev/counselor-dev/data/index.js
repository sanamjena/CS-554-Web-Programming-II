const { MongoClient, ServerApiVersion } = require("mongodb");
const mongoConfig = require("../settings").mongoConfig1;
const mongoose = require("mongoose");

let _client = undefined;
let _db = undefined;

const dbConnection = async () => {
  if (!_client) {
    _client = new MongoClient(mongoConfig.serverUrl, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    await _client.connect();
    _db = _client.db(mongoConfig.database);
  }

  return _db;
};

const getCollection = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }
    return _col;
  };
};

module.exports = {
  users: getCollection("users"),
  articles: getCollection("articles"),
  sessions: getCollection("sessions"),
};
