"use strict";

const mongoose = require('mongoose');

// Define the movie schema

const fileSaveSchema  = new mongoose.Schema({

    file_name: {
        type: String,
        required: true
    },
    sys_file_name:{
        type: String,
        required: true
    }
});


// Export the Movie model
module.exports = mongoose.model('fileSave', fileSaveSchema);