"use strict";

const resetDB = require("../config/scripts/populateDB")

const Companion = require("./schema/Companion");
const Doctor = require("./schema/Doctor");

const express = require("express");
const { map } = require("..");
const router = express.Router();


// completely resets your database.
// really bad idea irl, but useful for testing
router.route("/reset")
    .get((_req, res) => {
        resetDB(() => {
            res.status(200).send({
                message: "Data has been reset."
            });
        });
    });

router.route("/")
    .get((_req, res) => {
        console.log("GET /");
        res.status(200).send({
            data: "App is running."
        });
    });
    
// ---------------------------------------------------
// Edit below this line
// ---------------------------------------------------
router.route("/doctors")
    .get((req, res) => {
        console.log("GET /doctors");

        // already implemented:
        Doctor.find({})
            .sort('ordering')
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })
    .post((req, res) => {
        console.log("POST /doctors");

        // seasons init as empty list with schema, hard code server side check for seasons input
        if (!req.body.seasons) {
            res.status(500).send();
            return;
        }
        
        Doctor.insertMany([req.body])
            .then(data => {
                
                res.status(201).send(data[0]);
            })
            .catch(err => {
                res.status(500).send(err);
            })
    });

// optional:
router.route("/doctors/favorites")
    .get((req, res) => {
        console.log(`GET /doctors/favorites`);
        res.status(501).send();
    })
    .post((req, res) => {
        console.log(`POST /doctors/favorites`);
        res.status(501).send();
    });
    
router.route("/doctors/:id")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}`);

        Doctor.findById(req.params.id)
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(404).send(err);
            });
    })
    .patch((req, res) => {
        console.log(`PATCH /doctors/${req.params.id}`);

        Doctor.findByIdAndUpdate(req.params.id, req.body, {new: true})
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(404).send(err);
            })
    })
    .delete((req, res) => {
        console.log(`DELETE /doctors/${req.params.id}`);

        Doctor.findByIdAndDelete(req.params.id)
            .then(data => {
                res.status(200).send(null);
            })
            .catch(err => {
                res.status(404).send(err);
            })
    });
    
router.route("/doctors/:id/companions")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}/companions`);

        Companion.find({"doctors": req.params.id})
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(404).send(err);
            })
    });
    

router.route("/doctors/:id/goodparent")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}/goodparent`);
        
        let num_companions = 0;
        let num_companions_alive = 0;
        Doctor.findById(req.params.id)
            .then(data => {
                return Companion.find({"doctors": req.params.id})
            })
            .catch(err => {
                res.status(404).send(err);
                return;
            })
            .then(data => {
                num_companions = data.length;
                return Companion.find({"doctors": req.params.id, "alive": true})
            })
            .catch(err => {
                res.status(200).send(false);
                return;
            })
            .then(data => {
                num_companions_alive = data.length;
                if (num_companions > num_companions_alive) {
                    res.status(200).send(false);
                }
                else {
                    res.status(200).send(true)
                }
            })
            .catch(err => {
                res.status(200).send(false);
            })
    });

// optional:
router.route("/doctors/favorites/:doctor_id")
    .delete((req, res) => {
        console.log(`DELETE /doctors/favorites/${req.params.doctor_id}`);
        res.status(501).send();
    });

router.route("/companions")
    .get((req, res) => {
        console.log("GET /companions");

        // already implemented:
        Companion.find({})
            .sort('ordering')
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })
    .post((req, res) => {
        console.log("POST /companions");

        Companion.insertMany([req.body])
            .then(data => {
                res.status(201).send(data[0]);
            })
            .catch(err => {
                res.status(500).send(err);
            })
    });

router.route("/companions/crossover")
    .get((req, res) => {
        console.log(`GET /companions/crossover`);

        Companion.find({"doctors.1": {"$exists": true}})
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(404).send(err);
            })
    });

// optional:
router.route("/companions/favorites")
    .get((req, res) => {
        console.log(`GET /companions/favorites`);
        res.status(501).send();
    })
    .post((req, res) => {
        console.log(`POST /companions/favorites`);
        res.status(501).send();
    })

router.route("/companions/:id")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}`);

        Companion.findById(req.params.id)
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(404).send(err);
            })
    })
    .patch((req, res) => {
        console.log(`PATCH /companions/${req.params.id}`);

        Companion.findByIdAndUpdate(req.params.id, req.body, {new: true})
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(404).send(err);
            })
    })
    .delete((req, res) => {
        console.log(`DELETE /companions/${req.params.id}`);

        Companion.findByIdAndDelete(req.params.id)
            .then(data => {
                res.status(200).send(null);
            })
            .catch(err => {
                res.status(404).send(err);
            })
    });

router.route("/companions/:id/doctors")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}/doctors`);

        Companion.findById(req.params.id)
            .then(data => {
                return Promise.all(data.doctors.map(id => Doctor.findById(id)));
            })
            .catch(err => {
                res.status(404).send(err);
            })
            .then(values => {
                res.status(200).send(values);
            })
            .catch(err => {
                res.status(501).send(err);
            })
    });

router.route("/companions/:id/friends")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}/friends`);

        Companion.findById(req.params.id)
            .then(data => {
                //{$or: [{"seasons": data.seasons[0]}, {"seasons": data.seasons[0]}, ...]}
                return Companion.find({"_id": {$ne: req.params.id} , $or: data.seasons.map(season => {
                    let object = {};
                    object["seasons"] = season;
                    return object
                })})
            })
            .catch(err => {
                res.status(404).send(err);
            })
            .then(values => {
                res.status(200).send(values);
            })
    });

// optional:
router.route("/companions/favorites/:companion_id")
    .delete((req, res) => {
        console.log(`DELETE /companions/favorites/${req.params.companion_id}`);
        res.status(501).send();
    });

module.exports = router;