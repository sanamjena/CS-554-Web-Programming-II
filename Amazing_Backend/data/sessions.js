const MUUID = require("uuid-mongodb");
const moment = require("moment");

const collections = require("./index");
const mongoConfig = require("../settings");
const User123 = require("../models/users");
const Sessions123 = require("../models/sessions");
const mongoose = require("mongoose");

const sessions = collections.sessions;
const users = require("./users");
const conn = mongoose.connect(mongoConfig.env.serverUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: mongoConfig.env.database,
});

mongoose.connection
  .once("open", () =>
    console.log("Connected to Atlas Using Mongoose inside data/sessions")
  )
  .on("error", (error) => {
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

  // COMMENTED OUT BY SANAM TO IMPLEMENT MONGOOSE

  // if (typeof sessionId === "string") {
  //     try {
  //         sessionId = MUUID.from(sessionId);
  //     } catch (e) {
  //         errors['sessionId'] = e.message;
  //         error.http_code = 400;
  //         error.message = JSON.stringify({
  //             errors: errors
  //         });
  //         throw error
  //     }
  // } else {
  //     try {
  //         MUUID.from(sessionId)
  //     } catch (e) {
  //         errors['sessionId'] = "sessionId is not defined";
  //         error.http_code = 400;
  //         error.message = JSON.stringify({
  //             errors: errors
  //         });
  //         throw error
  //     }
  // }

  try {
    const user = await users.getUserById(userId);

    // const sessionsCollection = await sessions();
    const session = new Sessions123({
      _id: sessionId,
      userId: MUUID.from(user._id),
      startTime: new Date(),
      isActive: true,
    });
    // ADDED BY SANAM
    const sanam = session
      .save()
      .then((result) => {
        return getSession(result._id);
      })
      .catch((err) => {
        console.log(err);
        return err.message;
      });
    return sanam;
    // const insertInfo = await sessionsCollection.insertOne(session);

    // if (insertInfo.insertedCount === 0) {
    //     error.message = JSON.stringify({
    //         'error': "could not create session",
    //         'object': session,
    //         'errors': errors
    //     });
    //     error.http_code = 400;
    //     throw error
    // }

    // const newId = insertInfo.insertedId.toString();

    // return await getSession(newId);
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

  //   if (typeof sessionId === "string") {
  //     try {
  //       sessionId = MUUID.from(sessionId);
  //     } catch (e) {
  //       errors["id"] = e.message;
  //       error.http_code = 400;
  //       error.message = JSON.stringify({
  //         errors: errors,
  //       });
  //       throw error;
  //     }
  //   } else {
  //     errors["id"] = "sessionId is not defined";
  //     error.http_code = 400;
  //     error.message = JSON.stringify({
  //       errors: errors,
  //     });
  //     throw error;
  //   }

  //   const sessionsCollection = await sessions();

  //   const session = await sessionsCollection.findOne({ _id: sessionId });

  //   if (session === null) {
  //     errors["id"] = `news with id ${sessionId} doesn't exists`;
  //     error.http_code = 404;
  //     error.message = JSON.stringify({
  //       errors: errors,
  //     });
  //     throw error;
  //   }

  //   session._id = MUUID.from(session._id).toString();
  //   return session;

  // COMMENTED AND UPDATED BY SANAM TO IMPLEMENT MONGOOSE
  const sanam = Sessions123.findById(sessionId)
    // .select("_id name email animalType likes posts")
    .exec()
    .then((doc) => {
      // console.log(doc);
      if (doc == null) {
        return "ID does not exist";
      } else {
        // console.log("Inside data/users/getUserById ID EXISTS");
        console.log("Session found with ID: => " + sessionId);
        return doc;
      }
    })
    .catch((err) => {
      console.log(err);
      return err.message;
      // console.log(err);
      // res.status(500).json({ error: err });
    });
  return sanam;
}

async function endSession(sessionId) {
  const error = new Error();
  error.http_code = 200;
  const errors = {};

  if (await isSessionValid(sessionId)) {
    let session = await getSession(sessionId);
    session._id = MUUID.from(session._id);
    session.isActive = false;
    session.endTime = new Date();

    const sessionsCollection = await sessions();

    return await sessionsCollection
      .updateOne({ _id: session._id }, { $set: session })
      .then(async function (updateInfo) {
        if (updateInfo.modifiedCount === 0) {
          error.message = JSON.stringify({
            error: "could not end session",
            object: session,
            errors: errors,
          });
          error.http_code = 400;
          throw error;
        }
      });
  }
}

async function isSessionValid(sessionId) {
  try {
    const session = await getSession(sessionId);
    return session.isActive;
  } catch (e) {
    return false;
  }
}

async function getSessionByUserId(userId) {
  try {
    const user = await users.getUserById(userId);
    const sessionsCollection = await sessions();
    return await sessionsCollection
      .find(
        { userId: MUUID.from(user._id) },
        { projection: { _id: false, userId: false } }
      )
      .sort({ startDate: -1 })
      .toArray();
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
