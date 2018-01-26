'use strict';
// Hapi framework
const Hapi = require('hapi');

const Mongoose = require('mongoose');

// assertion library
const Code = require('code');
// Lab test runner
const Lab = require('lab');
// instance of our test suite
const lab = exports.lab = Lab.script();
//Stub and spies
const Sinon = require('sinon');

const Server = require('../server');

const fakeAlbumList = [
    {
        title: "title1",
        band: 'band1',
        genre: 'genre1',
        year: 1978
    },
    {
        title: "title2",
        band: 'band2',
        genre: 'genre2',
        year: 1979
    }];

const fakeErr = { msg: 'fake error to be thrown' };

lab.experiment('Testing Server Module', () => {
    lab.before(function () {
        Sinon.stub(Mongoose, 'connect').resolves({});
    });

    lab.after(function () {
        Code.expect(Mongoose.connect.called).to.equal(true);
        Mongoose.connect.restore();
    });

    lab.test('it starts up a server.', async () => {
        Code.expect(Server).to.exist();
        Code.expect(Server.started).not.equal(0);
    });

    lab.test('GET /albums OK', async () => {
        Sinon.stub(Mongoose.Model, 'find').resolves(fakeAlbumList);

        const response = await Server.inject({ method: 'GET', url: '/albums' });
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result.albums).not.be.null();
        Code.expect(response.result.albums).to.equal(fakeAlbumList);

        Mongoose.Model.find.restore();
    });

    lab.test('GET /albums KO', async () => {
        Sinon.stub(Mongoose.Model, 'find').rejects(fakeErr);

        const response = await Server.inject({ method: 'GET', url: '/albums' });
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result.albums).to.be.undefined();
        Code.expect(response.result.err).not.be.null();
        Code.expect(response.result.err).to.equal(fakeErr);

        Mongoose.Model.find.restore();
    });

    lab.test('GET /albums/{id}', async () => {
        var albumId = '123abc';
        var stub = Sinon.stub(Mongoose.Model, 'findById').resolves(fakeAlbumList[0]);

        const response = await Server.inject({ method: 'GET', url: '/albums/' + albumId });

        var callStubArg = stub.getCall(0).args[0];
        Code.expect(callStubArg).to.equal(albumId);

        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result.album).not.be.null();
        Code.expect(response.result.album).to.equal(fakeAlbumList[0]);

        Mongoose.Model.findById.restore();
    });

    lab.test('GET /albums/{id} NOT FOUND', async () => {
        Sinon.stub(Mongoose.Model, 'findById').resolves(null);

        const response = await Server.inject({ method: 'GET', url: '/albums/123abc' });
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result.album).to.be.undefined();
        Code.expect(response.result.message).to.equal('Album not Found');

        Mongoose.Model.findById.restore();
    });

    lab.test('GET /albums/{id} KO', async () => {
        Sinon.stub(Mongoose.Model, 'findById').rejects(fakeErr);

        const response = await Server.inject({ method: 'GET', url: '/albums/123abc' });
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result.album).to.be.undefined();
        Code.expect(response.result.err).not.be.null();
        Code.expect(response.result.err).to.equal(fakeErr);

        Mongoose.Model.findById.restore();
    });

    lab.test('POST /albums OK', async () => {
        var payload = {
            title: fakeAlbumList[0].title,
            genre: fakeAlbumList[0].genre,
            band: fakeAlbumList[0].band,
            year: fakeAlbumList[0].year
        };

        var fakeGeneratedId = "FAKEID";
        var stub = Sinon.stub(Mongoose.Model, 'create')
            .callsFake((albumData) => {
                albumData._id = fakeGeneratedId
            })
            .resolves(payload);

        const response = await Server.inject({ method: 'POST', url: '/albums', payload: payload });

        var callStubArg = stub.getCall(0).args[0];
        Code.expect(callStubArg).to.equal(payload);

        Code.expect(response.statusCode).to.equal(201);
        Code.expect(response.result.message).not.be.null();
        Code.expect(response.result.message).to.equal('Album created successfully');
        Code.expect(response.result.album).not.be.null();
        Code.expect(response.result.album).to.equal(payload);
        Code.expect(response.headers.location).to.equal('/albums/' + payload._id);

        Mongoose.Model.create.restore();
    });

    lab.test('POST /albums KO', async () => {
        var payload = {
            title: fakeAlbumList[0].title,
            genre: fakeAlbumList[0].genre,
            band: fakeAlbumList[0].band,
            year: fakeAlbumList[0].year
        };
        var stub = Sinon.stub(Mongoose.Model, 'create').rejects(fakeErr);

        const response = await Server.inject({ method: 'POST', url: '/albums', payload: payload });

        var callStubArg = stub.getCall(0).args[0];
        Code.expect(callStubArg).to.equal(payload);

        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result.album).to.be.undefined();
        Code.expect(response.result.err).not.be.null();
        Code.expect(response.result.err).to.equal(fakeErr);

        Mongoose.Model.create.restore();
    });

    lab.test('PUT /albums/{id} OK', async () => {
        var albumId = '123abc';
        var payload = {
            title: fakeAlbumList[0].title,
            genre: fakeAlbumList[0].genre,
            band: fakeAlbumList[0].band,
            year: 2018
        };
        var spy = Sinon.spy();
        var albumToUpdate = {
            title: fakeAlbumList[0].title,
            genre: fakeAlbumList[0].genre,
            band: fakeAlbumList[0].band,
            year: fakeAlbumList[0].year
        };
        albumToUpdate.save = spy;
        var stub = Sinon.stub(Mongoose.Model, 'findById').resolves(albumToUpdate);

        const response = await Server.inject({ method: 'PUT', url: '/albums/' + albumId, payload: payload });

        var callStubArg = stub.getCall(0).args[0];
        Code.expect(callStubArg).to.equal(albumId);

        Code.expect(response.statusCode).to.equal(200);
        Code.expect(spy.called).to.equal(true);
        Code.expect(response.result.message).not.be.null();
        Code.expect(response.result.message).to.equal('Album updated successfully');
        Code.expect(albumToUpdate.year).to.equal(payload.year);

        Mongoose.Model.findById.restore();
    });

    lab.test('PUT /albums/{id} NOT FOUND', async () => {
        var albumId = '123abc';
        var payload = {
            title: fakeAlbumList[0].title,
            genre: fakeAlbumList[0].genre,
            band: fakeAlbumList[0].band,
            year: 2018
        };

        var stub = Sinon.stub(Mongoose.Model, 'findById').resolves(null);

        const response = await Server.inject({ method: 'PUT', url: '/albums/' + albumId, payload: payload });

        var callStubArg = stub.getCall(0).args[0];
        Code.expect(callStubArg).to.equal(albumId);

        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result.message).to.be.undefined();
        Code.expect(response.result.err).not.be.null();
        Code.expect(response.result.err).to.equal('Album not found');

        Mongoose.Model.findById.restore();
    });

    lab.test('PUT /albums/{id} KO', async () => {
        var albumId = '123abc';
        var payload = {
            title: fakeAlbumList[0].title,
            genre: fakeAlbumList[0].genre,
            band: fakeAlbumList[0].band,
            year: 2018
        };

        var stub = Sinon.stub(Mongoose.Model, 'findById').rejects(fakeErr);

        const response = await Server.inject({ method: 'PUT', url: '/albums/' + albumId, payload: payload });

        var callStubArg = stub.getCall(0).args[0];
        Code.expect(callStubArg).to.equal(albumId);

        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result.message).to.be.undefined();
        Code.expect(response.result.err).not.be.null();
        Code.expect(response.result.err).to.equal(fakeErr);

        Mongoose.Model.findById.restore();
    });

    lab.test('DELETE /albums/{id} OK', async () => {
        var albumId = '123abc';
        var spy = Sinon.spy();
        var albumToDelete = {
            title: fakeAlbumList[0].title,
            genre: fakeAlbumList[0].genre,
            band: fakeAlbumList[0].band,
            year: fakeAlbumList[0].year
        };
        albumToDelete.remove = spy;
        var stub = Sinon.stub(Mongoose.Model, 'findById').resolves(albumToDelete);

        const response = await Server.inject({ method: 'DELETE', url: '/albums/' + albumId });

        var callStubArg = stub.getCall(0).args[0];
        Code.expect(callStubArg).to.equal(albumId);

        Code.expect(response.statusCode).to.equal(200);
        Code.expect(spy.called).to.equal(true);
        Code.expect(response.result.message).not.be.null();
        Code.expect(response.result.message).to.equal('Album deleted successfully');

        Mongoose.Model.findById.restore();
    });

    lab.test('DELETE /albums/{id} NOT FOUND', async () => {
        var spy = Sinon.spy();
        Sinon.stub(Mongoose.Model, 'findById').resolves(null);

        const response = await Server.inject({ method: 'DELETE', url: '/albums/123abc' });
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(spy.called).to.equal(false);
        Code.expect(response.result.message).not.be.null();
        Code.expect(response.result.message).to.equal('Album not found');

        Mongoose.Model.findById.restore();
    });

    lab.test('DELETE /albums/{id} KO', async () => {
        var spy = Sinon.spy();
        Sinon.stub(Mongoose.Model, 'findById').rejects(fakeErr);

        const response = await Server.inject({ method: 'DELETE', url: '/albums/123abc' });
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(spy.called).to.equal(false);
        Code.expect(response.result.err).not.be.null();
        Code.expect(response.result.err).to.equal(fakeErr);

        Mongoose.Model.findById.restore();
    });
});

