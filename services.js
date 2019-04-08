/* eslint-disable no-underscore-dangle */
var config = require('./conf');

var oauth2_token_json = null;

// Public Methods

var services = {}

services.updateToken = function(authResponse) {
    oauth2_token_json = JSON.stringify(authResponse.getJson(), null, 2);
    config.tokenJson = oauth2_token_json;
    config.jsonContentType = authResponse.response.headers['content-type'];
    const authObj = JSON.parse(config.tokenJson);
    config.qbo.accessToken = authObj.access_token;
    config.qbo.refreshToken = authObj.refresh_token;
}

module.exports = services;