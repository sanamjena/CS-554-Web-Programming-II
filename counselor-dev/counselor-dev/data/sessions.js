const MUUID = require("uuid-mongodb");
const moment = require("moment");

const collections = require("./index");
const mongoConfig = require("../settings");
const userssmodel = require("../models/users");
const sessionssmodel = require("../models/sessions");
const mongoose = require("mongoose");

const sessions = collections.sessions;
const users = require("./users");
mongoose
  .connect(mongoConfig.env.serverUrl, { dbName: mongoConfig.env.database })
  .then(() =>
    console.log("Connected to Atlas Using Mongoose inside data/sessions")
  )
  .catch((error) => {
    console.log("error is: " + error);
  });

async function addSession(sessionId, userId) {
  const error = new Error();
  error.http_code = 200;
  const errors = {};

  if (sessionId === undefined || sessionId === null) {
    errors["sessionId"] = "sessionId is not defined";
    error.http_code = 400;
  }

  try {
    const session = new sessionssmodel({
      _id: sessionId,
      userId: userId,
      startTime: new Date(),
      isActive: true,
    });
    // ADDED BY SANAM
    const result = session
      .save()
      .then((result) => {
        const res = getSession(result._id);
        return res;
      })
      .catch((err) => {
        console.log(err);
        return err.message;
      });
    return result;
  } catch (e) {
    throw e;
  }
}

async function getSession(sessionId) {
  const error = new Error();
  error.http_code = 200;
  const errors = {};

  if (sessionId === undefined || sessionId === null) {
    errors["id"] = "sessionId is not defined";
    error.http_code = 400;
  }

  // UPDATED BY SANAM TO IMPLEMENT MONGOOSE
  const result = sessionssmodel
    .findById(sessionId)

    .exec()
    .then((doc) => {
      if (doc == null) {
        return "ID does not exist";
      } else {
        console.log("Session found with ID: => " + sessionId);
        return doc;
      }
    })
    .catch((err) => {
      console.log(err);
      return err.message;
    });
  return result;
}

async function endSession(sessionId) {
  const error = new Error();
  error.http_code = 200;
  const errors = {};
  if (typeof sessionId === "string") {
    try {
      sessionId = MUUID.from(sessionId);
    } catch (e) {
      errors["id"] = e.message;
      error.http_code = 400;
      error.message = JSON.stringify({
        errors: errors,
      });
      throw error;
    }
  } else {
    try {
      MUUID.from(sessionId);
    } catch (e) {
      errors["id"] = "id is not defined";
      error.http_code = 400;
      error.message = JSON.stringify({
        errors: errors,
      });
      throw error;
    }
  }
  if (await isSessionValid(sessionId)) {
    // added by sanam
    const value = {
      isActive: false,
    };
    const res = sessionssmodel
      .update({ _id: sessionId }, { $set: value })
      .exec()
      .then((doc) => {
        return doc;
      })
      .catch((err) => {
        console.log(err);
        return err.message;
      });
    return res;
  }
}

async function isSessionValid(sessionId) {
  try {
    if (typeof sessionId === "string") {
      try {
        sessionId = MUUID.from(sessionId);
      } catch (e) {
        errors["id"] = e.message;
        error.http_code = 400;
        error.message = JSON.stringify({
          errors: errors,
        });
        throw error;
      }
    } else {
      try {
        MUUID.from(sessionId);
      } catch (e) {
        errors["id"] = "id is not defined";
        error.http_code = 400;
        error.message = JSON.stringify({
          errors: errors,
        });
        throw error;
      }
    }
    const res = sessionssmodel
      .findById(sessionId)

      .exec()
      .then((doc) => {
        if (doc == null) {
          return "ID does not exist";
        }
        return doc.isActive;
      })
      .catch((err) => {
        console.log(err);
        return err.message;
      });
    return res;
  } catch (e) {
    return false;
  }
}

async function getSessionByUserId(userId) {
  try {
    // Added by sanam
    if (typeof userId === "string") {
      try {
        userId = MUUID.from(userId);
      } catch (e) {
        errors["id"] = e.message;
        error.http_code = 400;
        error.message = JSON.stringify({
          errors: errors,
        });
        throw error;
      }
    } else {
      try {
        MUUID.from(userId);
      } catch (e) {
        errors["id"] = "id is not defined";
        error.http_code = 400;
        error.message = JSON.stringify({
          errors: errors,
        });
        throw error;
      }
    }
    const res = userssmodel
      .findById(userId)

      .exec()
      .then((doc) => {
        if (doc == null) {
          return "ID does not exist";
        }
        return doc;
      })
      .catch((err) => {
        console.log(err);
        return err.message;
      });
    return res;
  } catch (e) {
    throw e;
  }
}

module.exports = {
  addSession,
  endSession,
  isSessionValid,
  getSessionByUserId,
};
