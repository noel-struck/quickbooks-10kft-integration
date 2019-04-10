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
            res.send('You are connected to QBO');
         })
        .catch(function(e) {
             console.log(e);
             res.send('There was issue when trying to connect to QBO: ', e);
         });
});

module.exports = router;