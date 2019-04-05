/* eslint-disable no-console */
var express = require('express');
var router = express.Router();
var config = require('../conf');
const services = require('../services');
/**
 * Refresh the access-token
 */
router.get('/', function(req, res){
    // The object must be created
    config.oauthClient.refresh()
        .then(function(authResponse){
            console.log('The Refresh Token is  '+ JSON.stringify(authResponse.getJson()));
            services.updateToken(authResponse);
        })
        .catch(function(e) {
            console.error(e);
        });
});

module.exports = router;