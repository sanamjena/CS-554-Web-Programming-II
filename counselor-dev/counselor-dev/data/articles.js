const MUUID = require("uuid-mongodb");
const collections = require("./index");
const _ = require("underscore");
const stellarService = require("../services/stellarService");
const articleConfig = require("../settings").articleConfig;
const stellarConfig = require("../settings").stellarConfig;
const mongoConfig = require("../settings");
const usersmodel = require("../models/users");
const articlesmodel = require("../models/articles");
const mongoose = require("mongoose");

const sessions = collections.sessions;
const userfunction = require("./users");
mongoose
  .connect(mongoConfig.env.serverUrl, { dbName: mongoConfig.env.database })
  .then(() =>
    console.log("Connected to Atlas Using Mongoose inside data/articles")
  )
  .catch((error) => {
    console.log("error is: " + error);
  });

async function create(newArticle, authorId) {
  const error = new Error();
  error.http_code = 200;
  const errors = {};

  if (newArticle === undefined || _.isEmpty(newArticle)) {
    errors["task"] = "task object not defined";
    error.http_code = 400;
  } else if (typeof newArticle !== "object") {
    errors["task"] = "invalid type of task";
    error.http_code = 400;
  }

  if (!newArticle.hasOwnProperty("title")) {
    errors["title"] = "missing property";
    error.http_code = 400;
  } else if (typeof newArticle["title"] !== "string") {
    errors["title"] = "invalid type";
    error.http_code = 400;
  }

  if (!newArticle.hasOwnProperty("text")) {
    errors["text"] = "missing property";
    error.http_code = 400;
  } else if (typeof newArticle["text"] !== "string") {
    errors["text"] = "invalid type";
    error.http_code = 400;
  }

  if (!newArticle.hasOwnProperty("html")) {
    newArticle["html"] = "";
  } else if (typeof newArticle["html"] !== "string") {
    errors["html"] = "invalid type";
    error.http_code = 400;
  }

  if (!newArticle.hasOwnProperty("keywords")) {
    newArticle["keywords"] = [];
  } else if (!Array.isArray(newArticle["keywords"])) {
    errors["keywords"] = "invalid type";
    error.http_code = 400;
  }

  try {
    if (authorId === undefined || authorId === null) {
      errors["id"] = "id is not defined";
      error.http_code = 400;
    }
    // Added By Sanam to Implement Mongoose
    if (typeof authorId === "string") {
      try {
        authorId = MUUID.from(authorId);
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
        MUUID.from(authorId);
      } catch (e) {
        errors["id"] = "id is not defined";
        error.http_code = 400;
        error.message = JSON.stringify({
          errors: errors,
        });
        throw error;
      }
    }

    const test1 = new articlesmodel({
      _id: MUUID.v4(),
      title: newArticle.title,
      text: newArticle.text,
      html: newArticle.html,
      keywords: newArticle.keywords,
      ratings: [],
      author: authorId,
      cost: mongoConfig.articleConfig.initialCost,
      read: 0,
      rating: 0,
    });
    const projection = {
      balance: true,
    };
    const upd = await userfunction.getUserById(authorId, projection);
    const result = test1
      .save()
      .then((result) => {
        const newId = MUUID.from(result._id).toString();
        //adding published
        usersmodel
          .updateOne(
            { _id: authorId },
            {
              $push: {
                published: {
                  articleId: result._id,
                  cost: mongoConfig.articleConfig.initialCost,
                },
              },
            }
          )
          .exec()
          .then((res) => {
            return res;
          })
          .catch((error) => {
            console.log(error);
            return error.message;
          });

        //adding balance

        var bal = upd.balance;
        bal = bal + parseInt(mongoConfig.articleConfig.initialCost);
        const jena = {
          balance: bal,
        };
        usersmodel
          .updateOne({ _id: authorId }, { $set: jena })
          .exec()
          .then((doc) => {
            return doc;
          })
          .catch((err) => {
            console.log(err);
            return err.message;
          });
        return get(newId);
      })
      .catch((error) => {
        console.log(error);
        return error.message;
      });
    return result;
  } catch (e) {
    throw e;
  }
}

async function getpublishedbyuser(userId) {
  const result = await userfunction.getPublished(userId);
  return result;
}

async function getpurchasedbyuser(userId) {
  const result = await userfunction.getPurchased(userId);
  return result;
}

async function get(articleId) {
  const error = new Error();
  error.http_code = 200;
  const errors = {};

  if (articleId === undefined || articleId === null) {
    errors["id"] = "id is not defined";
    error.http_code = 400;
  }

  if (typeof articleId === "string") {
    try {
      articleId = MUUID.from(articleId);
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
      articleId = MUUID.from(articleId);
    } catch (e) {
      errors["id"] = "id is not defined";
      error.http_code = 400;
      error.message = JSON.stringify({
        errors: errors,
      });
      throw error;
    }
  }
  // Added By Sanam to Implement Mongoose
  const result = articlesmodel
    .findOne({ _id: articleId })
    .exec()
    .then((doc) => {
      return doc;
    })
    .catch((error) => {
      console.log(error);
      return error.message;
    });
  return result;
}

async function update(articleId, updatedArticle, partial = false) {
  const error = new Error();
  error.http_code = 200;
  const errors = {};

  if (updatedArticle === undefined || _.isEmpty(updatedArticle)) {
    errors["article"] = "article object not defined";
    error.http_code = 400;
  } else if (typeof updatedArticle !== "object") {
    errors["article"] = "invalid type of article";
    error.http_code = 400;
  }

  if (!partial && !updatedArticle.hasOwnProperty("title")) {
    errors["title"] = "missing property";
    error.http_code = 400;
  } else if (
    updatedArticle.hasOwnProperty("title") &&
    typeof updatedArticle["title"] !== "string"
  ) {
    errors["title"] = "invalid type";
    error.http_code = 400;
  }

  if (!partial && !updatedArticle.hasOwnProperty("text")) {
    errors["text"] = "missing property";
    error.http_code = 400;
  } else if (
    updatedArticle.hasOwnProperty("text") &&
    typeof updatedArticle["text"] !== "string"
  ) {
    errors["text"] = "invalid type";
    error.http_code = 400;
  }

  if (!partial && !updatedArticle.hasOwnProperty("html")) {
    errors["html"] = "missing property";
    error.http_code = 400;
  } else if (
    updatedArticle.hasOwnProperty("html") &&
    typeof updatedArticle["html"] !== "string"
  ) {
    errors["html"] = "invalid type";
    error.http_code = 400;
  }

  if (!updatedArticle.hasOwnProperty("keywords")) {
    updatedArticle["keywords"] = [];
  } else if (!Array.isArray(updatedArticle["keywords"])) {
    errors["keywords"] = "invalid type";
    error.http_code = 400;
  }

  if (error.http_code !== 200) {
    error.message = JSON.stringify({ errors: errors });
    throw error;
  }

  //   added by sanam
  if (articleId === undefined || articleId === null) {
    errors["id"] = "id is not defined";
    error.http_code = 400;
  }
  // Added By Sanam to Implement Mongoose
  if (typeof articleId === "string") {
    try {
      articleId = MUUID.from(articleId);
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
      MUUID.from(articleId);
    } catch (e) {
      errors["id"] = "id is not defined";
      error.http_code = 400;
      error.message = JSON.stringify({
        errors: errors,
      });
      throw error;
    }
  }

  try {
    const result = articlesmodel
      .updateOne({ _id: articleId }, { $set: updatedArticle })
      .exec()
      .then((doc) => {
        return doc;
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

module.exports = {
  create,
  get,
  update,
};
