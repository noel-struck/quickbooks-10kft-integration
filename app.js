/* eslint-disable no-console */

'use strict';

require('dotenv').config();

var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var ngrok =  (process.env.NGROK_ENABLED==="true") ? require('ngrok'):null;

/**
 * Configure View and Handlebars
 */
var urlencodedParser = bodyParser.urlencoded({extended: true});
app.use(urlencodedParser);
app.use(express.static(path.join(__dirname, '/public')));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(bodyParser.json());

// TODO: Check this for webhook, probably be part of this main Doc
var webhooks = require('./routes/webhooks.js');
var authUri = require('./routes/auth-uri.js');
var callback = require('./routes/callback');
var refreshToken = require('./routes/refresh-token');

var redirectUri = '';

// Index
app.get('/', function(req, res) { res.render('index'); });

// When you are connected
app.get('/connected', function(req, res) { res.render('connected'); });

// Get the AuthorizeUri
app.use('/authUri', authUri);

// Handle the callback to extract the `Auth Code` and exchange them for `Bearer-Tokens`
app.use('/callback', callback);

// Refresh token
app.use('/refreshAccessToken', refreshToken);

// Webhooks POST listening
app.use('/webhooks', webhooks);


/**
 * Start server on HTTP (will use ngrok for HTTPS forwarding)
 */
const server = app.listen(process.env.PORT || 8000, () => {
    console.log(`💻 Server listening on port ${server.address().port}`);
    if(!ngrok){
        redirectUri = `${server.address().port}` + '/callback';
        console.log(`💳  See the Sample App in your browser : ` + 'http://localhost:' + `${server.address().port}`);
        console.log(`💳  Copy this into Redirect URI on the browser : ` + 'http://localhost:' + `${server.address().port}` + '/callback');
        console.log(`💻  Make Sure this redirect URI is also copied on your app in : https://developer.intuit.com`);
    }
});

/**
 * Optional : If NGROK is enabled
 */
if (ngrok) {
    console.log("NGROK Enabled");
    ngrok.connect({addr: process.env.PORT || 8000}, (err, url) => {
            if (err) {
                process.exit(1);
            }
            else {
                redirectUri = url + '/callback';
                console.log(`💳  See the Sample App in your browser: ${url}`);
                console.log(`💳  Copy and paste this Redirect URI on the browser :  ${redirectUri}`);
                console.log(`💻  Make Sure this redirect URI is also copied on your app in : https://developer.intuit.com`);

            }
        }
    );
}