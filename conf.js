
var config = {};

//sandbox app config
config.environment = 'Sandbox';
config.redirectUri = 'http://localhost:8080/callback';

// This is the object that will contains the token in the whole app
config.oauthClient = null;
config.tokenJson = {};
config.tokenExpiration = 0;

//sandbox verifier token
config.webhooksverifier = '800968ac-e100-4985-b46e-bb6f91a68d97';

//change port number as needed
config.port = 8080;

// APIs URL
config.qbo = {};
config.qbo.productionApi = 'https://quickbooks.api.intuit.com';
config.qbo.sandboxApi = 'https://sandbox-quickbooks.api.intuit.com';
config.qbo.companyId = '123146326747624';
config.qbo.accessToken = '';
config.qbo.tokenSecret = false;
config.qbo.refreshToken = '';
//add more entities if required
config.qbo.webhooksSubscribedEntites = 'Customer,Vendor,Invoice';

// 10Kft Credentials
config.tenKft= {};
config.tenKft.productionApi = 'https://api.10000ft.com';
config.tenKft.sandboxApi = 'https://vnext.10000ft.com';

module.exports = config;