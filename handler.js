const mongoose = require('mongoose');
const validator = require('validator');
const RestaurantModel = require('./model/Restaurant.js');

require('dotenv').config();

const { MONGO_USER, MONGO_PASSWORD } = process.env

const mongoString = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@ds141952.mlab.com:41952/serverlessly`;

const createErrorResponse = (statusCode, message) => ({
  statusCode: statusCode || 501,
  headers: { 'Content-Type': 'text/plain' },
  body: message || 'Incorrect id',
});

const dbExecute = (db, fn) => db.then(fn).finally(() => db.close());

function dbConnectAndExecute(dbUrl, fn) {
  return dbExecute(mongoose.connect(dbUrl, { useMongoClient: true }), fn);
}

module.exports.restaurant = (event, context, callback) => {
  if (!validator.isAlphanumeric(event.pathParameters.id)) {
    callback(null, createErrorResponse(400, 'Incorrect id'));
    return;
  }

  dbConnectAndExecute(mongoString, () => (
    RestaurantModel
      .find({ _id: event.pathParameters.id })
      .then(restaurant => callback(null, { statusCode: 200, body: JSON.stringify(restaurant) }))
      .catch(err => callback(null, createErrorResponse(err.statusCode, err.message)))
  ));
};


module.exports.createUser = (event, context, callback) => {
  const data = JSON.parse(event.body);

  const restaurant = new RestaurantModel({
    name: data.name,
    location: data.location,
    type: data.type,
  });

  if (restaurant.validateSync()) {
    callback(null, createErrorResponse(400, 'Incorrect restaurant data'));
    return;
  }

  dbConnectAndExecute(mongoString, () => (
    restaurant
      .save()
      .then(() => callback(null, {
        statusCode: 200,
        body: JSON.stringify({ id: restaurant.id }),
      }))
      .catch(err => callback(null, createErrorResponse(err.statusCode, err.message)))
  ));
};

module.exports.deleteRestaurant = (event, context, callback) => {
  if (!validator.isAlphanumeric(event.pathParameters.id)) {
    callback(null, createErrorResponse(400, 'Incorrect id'));
    return;
  }

  dbConnectAndExecute(mongoString, () => (
    RestaurantModel
      .remove({ _id: event.pathParameters.id })
      .then(() => callback(null, { statusCode: 200, body: JSON.stringify('Ok') }))
      .catch(err => callback(null, createErrorResponse(err.statusCode, err.message)))
  ));
};

module.exports.updateRestaurant = (event, context, callback) => {
  const data = JSON.parse(event.body);
  const id = event.pathParameters.id;

  if (!validator.isAlphanumeric(id)) {
    callback(null, createErrorResponse(400, 'Incorrect id'));
    return;
  }

  const restaurant = new RestaurantModel({
    _id: id,
    name: data.name,
    firstname: data.firstname,
    birth: data.birth,
    city: data.city,
    ip: event.requestContext.identity.sourceIp,
  });

  if (restaurant.validateSync()) {
    callback(null, createErrorResponse(400, 'Incorrect parameter'));
    return;
  }

  dbConnectAndExecute(mongoString, () => (
    RestaurantModel.findByIdAndUpdate(id, restaurant)
      .then(() => callback(null, { statusCode: 200, body: JSON.stringify('Ok') }))
      .catch(err => callback(err, createErrorResponse(err.statusCode, err.message)))
  ));
};