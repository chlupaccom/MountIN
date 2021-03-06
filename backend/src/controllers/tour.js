"use strict";


const TourModel = require('../models/tour');
const UserModel = require('../models/user');
const MessageModel = require('../models/message');

const create = (req, res) => {
    if (Object.keys(req.body).length === 0) return res.status(400).json({
        error: 'Bad Request',
        message: 'The request body is empty'
    });

    //update the route to GeoJson format
    if (req.body.route !== undefined && req.body.route.length > 1) {
        req.body.route = {
            "type": "MultiPoint",
            "coordinates": req.body.route.map(point => [point[1], point[0]])
        };
    }

    req.body.creator = req.userId;
    UserModel.findById(req.body.creator).then(creator => {
        if (creator !== null) {
            TourModel.create(req.body)
                .then(tour => {
                    creator.tours.push(tour._id);
                    creator.save(err => {
                        if (err) {
                            // Attempt a rollback of the tour creation
                            tour.remove().then(() => {
                                console.log('Removed created tour as user model update failed');
                                res.status(500).json({
                                    error: 'Internal server error',
                                    message: 'Failed to update user schema on create tour'
                                })
                            });
                        } else {
                            console.log('Tour correctly created');
                            res.status(201).json(tour);
                        }
                    })
                })
                .catch(error => res.status(500).json({
                    error: 'Internal server error',
                    message: error.message
                }));
        } else {
            res.status(400).json({
                error: 'Bad request',
                message: 'Creator does not exist'
            });
        }
    }).catch(error => res.status(500).json({
        error: 'Internal server error',
        message: error
    }));
};

const read = (req, res) => {
    TourModel.findById(req.params.id).populate('creator participants').exec()
        .then(tour => {
            //otherwise it is immutable or what
            tour = JSON.parse(JSON.stringify(tour));
            tour.route = tour.route.coordinates.map(point => [point[1], point[0]]);

            if (!tour) return res.status(404).json({
                error: 'Not Found',
                message: `Tour not found`
            });

            res.status(200).json(tour)

        })
        .catch(error => res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        }));

};

const update = (req, res) => {
    if (Object.keys(req.body).length === 0) return res.status(400).json({
        error: 'Bad Request',
        message: 'The request body is empty'
    });
    if (!req.body._id) return res.status(400).json({
        error: 'Bad Request',
        message: 'There is no _id in the body'
    });
    // if (0 == 0) return res.status(400).json({
    //     error: 'Bad Request',
    //     message: 'The id in the request is' + req.body._id
    // });

    if (req.body.route !== undefined && req.body.route.length > 1) {
        req.body.route = {
            "type": "MultiPoint",
            "coordinates": req.body.route.map(point => [point[1], point[0]])
        };
    }

    TourModel.findByIdAndUpdate(req.body._id, req.body, {new: true, runValidators: true}).exec()
        .then(tour => res.status(200).json(tour))
        .catch(error => res.status(500).json({
            error: 'Internal server error',
            message: error.message
        }));
};

const remove = async (req, res) => {
    try {
        let tour = await TourModel.findByIdAndRemove(req.params.id).exec();
        await MessageModel.remove({tourId: tour._id}).exec();
        res.status(200).json({message: `Tour with id${req.params.id} was deleted`});
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        })
    }
};

const list = (req, res) => {
    TourModel.find.sort({date: 1}).exec()
        .then(tours => {

            return res.status(200).json(tours)
        })
        .catch(error => res.status(500).json({
            error: 'Internal server error',
            message: error.message
        }));
};

const search = (req, res) => {
    let query = {$and: []};
    let guideTypesArray = [];

    // Filter for GuideTypes: Map them to boolean field user.professional
    if (req.query.guideTypes !== undefined) {
        let rawGuideTypes = req.query.guideTypes.split(',');
        rawGuideTypes.map(type => {
            if (type === '1') {
                guideTypesArray.push(true);
            } else if (type === '2') {
                guideTypesArray.push(false);
            }
        })
    } else {
        guideTypesArray = [true, false];
    }
    console.log('GuideTypes', guideTypesArray);

    // Filter for Difficulty
    if (req.query.difficulties !== undefined) {
        query.$and.push({
            $or: req.query.difficulties.split(',').map((diff) => {
                return {difficulty: diff}
            })
        });
    }

    // Filter for Date from
    if (req.query.dateAfter === undefined) {
        query.date = {
            $gte: new Date().setHours(0, 0, 0),
        }
    }

    if (req.query.dateAfter !== undefined) {
        let d = new Date(req.query.dateAfter);
        query.date = {
            $gte: d.setHours(0, 0, 0),
        }
    }

    // Filter for Date to
    if (req.query.dateBefore !== undefined) {
        if (query.date === undefined) {
            query.date = {};
        }
        let d = new Date(req.query.dateBefore);
        query.date.$lte = d.setHours(23, 59, 59);
    }

    // Filter for Activity Types
    if (req.query.activityTypes !== undefined) {
        query.$and.push({
            $or: req.query.activityTypes.split(',').map((type) => {
                return {type}
            })
        });
    }

    // Location filter
    if (req.query.lat !== undefined && req.query.lng !== undefined) {
        query.route = {
            $nearSphere: {
                $geometry: {
                    type: 'Point',
                    coordinates: [req.query.lng, req.query.lat]
                },
            }
        };
        if (req.query.distance !== undefined) {
            query.route.$nearSphere.$maxDistance = req.query.distance * 1000;
        }
    }

    // Price filter
    if (req.query.price !== undefined && req.query.price.length > 2) {
        let arrayPrices = req.query.price.split(',');
        query.cost = {
            $gte: arrayPrices[0],
            $lte: arrayPrices[1]
        }
    }

    // Delete $and query if no filter was applied
    if (query.$and.length === 0) {
        delete query.$and;
    }

    // Custom join: Get all users with a specific professional field value and then use the _id to filter the tours
    UserModel.find().where('professional').in(guideTypesArray).select('_id').exec()
        .then(creators => {
            TourModel.find(query).where('creator').in(creators)
                .sort({date: 1})
                .skip(parseInt(req.query.skip)).limit(28).exec()
                .then(tours => {
                    res.status(200).json(tours.map(tour => {
                        //we dont need the type of GEO object, so the tour is just coordinates
                        if (tour.route && tour.route.coordinates) {
                            //it is not gonna change the route without this line
                            tour = JSON.parse(JSON.stringify(tour));
                            //swaping the order of coordinates because of mongoDB
                            tour.route = tour.route.coordinates.map(point => [point[1], point[0]]);
                        }
                        return tour;
                    }))
                })
                .catch(error => res.status(500).json({
                    error: 'Internal server error',
                    message: error.message
                }));
        })
};

const getParticipants = (req, res) => {
    TourModel.findById(req.params.id).populate('participants').select('participants').exec()
        .then(participants => {
            if (!participants) return res.status(404).json({
                error: 'Not Found',
                message: `Specified tour not found`
            });
            res.status(200).json(participants)
        })
        .catch(error => res.status(500).json({
            error: 'Internal server error',
            message: error.message
        }));
};


const join = async (req, res) => {
    //need value from body
    if (req.body.joined === undefined) {
        res.status(400).json({
            error: 'Bad request',
            message: "No state provided"
        });
        return;
    }
    try {
        //getting tour from db
        let tour = await TourModel.findById(req.params.id).exec();
        //handle if there is no tour we want
        if (tour === null) {
            res.status(400).json({
                error: 'Bad request',
                message: "Tour not found"
            });
            return;
        }
        //convert participant array of object to array of strings
        let participants = tour.participants.map(id => id.toString());
        //find user in db
        let user = await UserModel.findById(req.userId).exec();
        //handle if there is no user like that
        if (user === null) {
            res.status(400).json({
                error: 'Bad request',
                message: "User not found"
            });
            return;
        }
        //convert tours to array of strings
        let tours = user.toursAttending.map(id => id.toString());

        if (req.body.joined) {
            //if there already is the participant, we should not add him again
            if (!participants.includes(req.userId)) {
                participants.push(req.userId);
            }
            //same thing with tours array in user object
            if (!tours.includes(req.params.id)) {
                tours.push(req.params.id);
            }
        } else {
            //removing user and tour or both objects
            if (participants.includes(req.userId)) {
                let idx = participants.indexOf(req.userId);
                participants.splice(idx, 1);
            }
            if (tours.includes(req.params.id)) {
                let idx = tours.indexOf(req.params.id);
                tours.splice(idx, 1);
            }
        }
        //seting the arrays to parent objects
        tour.participants = participants;
        user.toursAttending = tours;

        //saving both to db
        tour.save((err) => {
            if (err)
                res.status(500).json({
                    error: 'Internal server error',
                    message: err
                });
            else {
                user.save(async (err) => {
                    if (err)
                        res.status(500).json({
                            error: 'Internal server error',
                            message: err
                        });
                    else {
                        let tour = await TourModel.findById(req.params.id).populate('participants').exec();
                        tour = JSON.parse(JSON.stringify(tour));
                        tour.route = tour.route.coordinates.map(point => [point[1], point[0]]);
                        res.status(200).json(tour);
                        if (req.body.joined)
                            sendEmail(tour, user.email);

                    }
                });
            }
        });
    } catch (err) {
        res.status(500).json({
            error: 'Internal server error',
            message: err
        });
    }
};

const sendEmail = (tour, to) => {
    let mailer = require("nodemailer");

// Use Smtp Protocol to send Email
    let smtpTransport = mailer.createTransport({
        service: "Gmail",
        host: "smtp.gmail.com",
        auth: {
            user: "mountin@chlupac.com",
            pass: "dlkjfsdlkjfsda876kJSH!2627@"
        }
    });


    let mail = {
        from: "MountIN service <mountin@chlupac.com>",
        to: to,
        subject: "Joined tour " + tour.name,
        html: "<b>Congratulations! You just joined the tour. Tour takes place at " + tour.date + ".</b>"
    };

    smtpTransport.sendMail(mail, function (error) {
        if (error) {
            console.log(error);
        }
        smtpTransport.close();
    });
};

module.exports = {
    create,
    read,
    update,
    remove,
    list,
    search,
    getParticipants,
    join
};