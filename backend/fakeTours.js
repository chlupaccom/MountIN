"use strict";

const mongoose = require('mongoose');

const config = require('./src/config');
const TourModel = require('./src/models/tour');


//Connect to the MongoDB database; then start the server
mongoose
    .connect(config.mongoURI)
    .then(() => {
        console.log('connected to db');
        mongoConnected()
    })
    .catch(err => {
        console.log('Error connecting to the database', err.message);
        process.exit(err.statusCode);
    });

function mongoConnected() {
    let tour = {
        "name": "Englisher garten fancy tour",
        "description": "Klar, der Chinesische Turm mit seinem Biergarten ist im Sommer und Herbst die ideale Möglichkeit einzukehren, aber auch davor lohnt es sich schon vorbeizuschauen: Sobald das Wetter mitspielt, ist die Stimmung hier immer gut - und die Jahreszeit wurscht.",
        "image": {
            "large": "https://muenchen-res.cloudinary.com/.imaging/stk/responsive/image300/dms/th/bg/fruehling/bildergalerien/fruehling-im-englischen-garten-2014/02-fruehling-im-e-garten/document/02-fruehling-im-e-garten.jpg",
            "thumbnail": "https://muenchen-res.cloudinary.com/.imaging/stk/responsive/image300/dms/th/bg/fruehling/bildergalerien/fruehling-im-englischen-garten-2014/02-fruehling-im-e-garten/document/02-fruehling-im-e-garten.jpg"
        },
        "date": "2018-06-25 15:30:15",
        "difficulty": 1,
        "type": 1,
        "cost": 0,
        "creator": {
            "username": "TheUser",
            "professional": true
        },
        "route": [
            [
                [
                    48.1832805,
                    11.627528100000063
                ],
                [
                    48.1553265,
                    11.599204999999984
                ],
                [
                    48.15050249999999,
                    11.591269600000032
                ],
                [
                    48.1442772,
                    11.58956360000002
                ],
                [
                    48.1455281,
                    11.585220299999946
                ],
                [
                    48.1527438,
                    11.589502100000004
                ],
                [
                    48.15850931971225,
                    11.593022672111715
                ],
                [
                    48.1735935,
                    11.611018599999966
                ]
            ]
        ],
        "rating": 5
    };

    TourModel.create(tour)
        .then(tour => {
            console.log('Created: ' + tour.name);
            process.exit();

        })
        .catch(error => console.log('Error: ' + error));
}

