/* eslint-disable no-console */
const express = require('express');
const router = express.Router();
const config = require('../conf');
const db = require('../db/db');
const services = require('../services');

router.get('/', function(req, res) {
    config.oauthClient.createToken(req.url)
       .then(function(authResponse) {
            services.updateToken(authResponse);
            db.insert();
         })
        .catch(function(e) {
             console.log(e);
         });
    res.send('');
});

module.exports = router;