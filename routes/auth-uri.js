/* eslint-disable no-console */
var express = require('express');
var router = express.Router();
var OAuthClient = require('intuit-oauth');
var config = require('../conf');

router.get('/', function(req,res) {
    config.oauthClient = new OAuthClient({
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        environment: config.environment,
        redirectUri: config.redirectUri
    });

    var authUri = config.oauthClient.authorizeUri(
        {
            scope: [
                OAuthClient.scopes.Accounting,
                OAuthClient.scopes.Payment],
            state: 'intuit-test'
        }
    );
    res.send(authUri);
});

module.exports = router;