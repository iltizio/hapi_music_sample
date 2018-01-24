'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const albumModel = new Schema({
    title: { type: String, required: true, index: { unique: true } },
    band: { type: String, required: true },
    genre: { type: String, required: true },
    year: { type: Number, required: true }
});

module.exports = mongoose.model('Album', albumModel, 'albums'); 