
var config = {};

//sandbox app config
config.clientId = 'Q0LPhko5YOG7bCbjbLfUuzoKjOK7LwECMj6Jh2tOS85x8JhL5o';
config.clientSecret = 'I84RqHjSYFbEna70grWMD3ULR757AlNGFX0j7H5h';
config.environment = 'Sandbox';
config.redirectUri = 'http://localhost:8080/callback';

// APIs URL
config.productionApi = 'https://quickbooks.api.intuit.com';
config.sandboxApi = 'https://sandbox-quickbooks.api.intuit.com';

// This is the object that will contains the token in the whole app
config.oauthClient = null;
config.tokenJson = {};
config.tokenExpiration = 0;

//sandbox verifier token
config.webhooksverifier = '800968ac-e100-4985-b46e-bb6f91a68d97';

//change port number as needed
config.port = 8080;

// sandbox company config for QuickBook Online
config.qbo = {};
config.qbo.companyId = '123146326747624';
config.qbo.accessToken = '';
config.qbo.tokenSecret = '';
config.qbo.refreshToken = '';
//add more entities if required
config.qbo.webhooksSubscribedEntites = 'Customer,Vendor,Invoice';

module.exports = config;