var Album = require('../models/album');

/**
 * List Albums
 */
exports.list = (req, h) => {
    return Album.find({}).then((albums) => {
        return { albums: albums };
    }).catch((err) => {
        return { err: err };
    });
}

/**
 * Get Album by ID
 */
exports.get = (req, h) => {
    return Album.findById(req.params.id).then((album) => {
        if (!album) return { message: 'Album not Found' };
        return { album: album };
    }).catch((err) => {
        return { err: err };
    });
}


/**
 * POST an Album
 */
exports.create = (req, h) => {
    const albumData = {
        title: req.payload.title,
        band: req.payload.band,
        genre: req.payload.genre,
        year: req.payload.year
    };

    return Album.create(albumData).then((album) => {
        //return { message: "Album created successfully", album: album };
        return h.response({ message: "Album created successfully", album: album }).created('/albums/' + album._id);
    }).catch((err) => {
        return { err: err };
    });
}

/**
 * PUT | Update Album by ID
 */
exports.update = (req, h) => {
    return Album.findById(req.params.id).then((album) => {
        if (!album) return { err: 'Album not found' };

        album.title = req.payload.title;
        album.band = req.payload.band;
        album.genre = req.payload.genre;
        album.year = req.payload.year;

        album.save();
        return { message: "Album updated successfully" };
    }).catch((err) => {
        return { err: err };
    });
}

/**
 * Delete Album by ID
 */
exports.remove = (req, h) => {
    return Album.findById(req.params.id).then(function (album) {
        if (!album) return { message: 'Album not found' };

        album.remove();
        return { message: "Album deleted successfully" };
    }).catch((err) => {
        return { err: err };
    });
}