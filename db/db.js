/* eslint-disable no-console */
const moment = require('moment');
const Datastore = require('nedb'); // for in memory database
const config = require('../conf'); // constants file

const db = {};
const dbMemory = new Datastore();

db.insert = () => {
	/*
	 * Loads the database with company configs (realmid and access tokens) from conf.js
	 */
	var qbo = {
		companyId: config.qbo.companyId,
		accessToken: config.qbo.accessToken,
		refreshToken: config.qbo.refreshToken,
		webhooksSubscribedEntites: config.qbo.webhooksSubscribedEntites,
		lastCdcTimestamp: moment().format()
	};
	
	dbMemory.insert([qbo], function (err, newDoc) {
		if (err) {
			return console.log(err);
		}
	});
};

db.dbMemory = dbMemory;

module.exports = db;