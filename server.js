'use strict';

const Hapi = require('hapi');
//const Hoek = require('hoek');
const Mongoose = require('mongoose');
const AlbumController = require('./src/controllers/album');
const MongoDBUrl = 'mongodb://localhost:27017/musicapi';

const server = new Hapi.Server({
  port: 3000,
  host: 'localhost'
});

server.route({
  method: 'GET',
  path: '/albums',
  handler: AlbumController.list
});

server.route({
  method: 'GET',
  path: '/albums/{id}',
  handler: AlbumController.get
});
server.route({
  method: 'POST',
  path: '/albums',
  handler: AlbumController.create
});

server.route({
  method: 'PUT',
  path: '/albums/{id}',
  handler: AlbumController.update
});

server.route({
  method: 'DELETE',
  path: '/albums/{id}',
  handler: AlbumController.remove
});

// (async () => {
//   try {
//     await server.register(Hoek);
//   }
//   catch (err) {
//     console.log(err)
//   }
// })();

(async () => {
  try {
    //await server.register({ plugin: require('vision') });

    await server.start();
    // Once started, connect to Mongo through Mongoose
    Mongoose.connect(MongoDBUrl, {}).then(() => { console.log(`Connected to Mongo server`) }, err => { console.log(err) });
    console.log(`Server running at: ${server.info.uri}`);
  }
  catch (err) {
    console.log(err)
  }
})();

module.exports = server;