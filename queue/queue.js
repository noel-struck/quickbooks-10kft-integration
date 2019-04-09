/* eslint-disable no-console */
const async = require('async'); // for queue implementation
const QuickBooks = require('node-quickbooks'); // quickbooks sdk
const config = require('../conf'); // constants file
const database = require('../db/db.js'); // database operations

/**
 * Manages a queue and executes a single async thread to process 
 * the queue whenever an item is added to the queue
 */

// creating a queue with concurrency 1
var q = async.queue(function (task, callback) {
    processTask(task);
    callback();
}, 1);

function addToQueue(payload) {
	q.push(payload);
}

/*
 * Process the queue task
 * 1. Retrieves the realmId from the payload 
 * 2. Queries the database to get the last CDC performed time and auth keys for the realmId
 * 3. Performs CDC for all the subscribed entities using the lastCDCTime retrieved in step 2
 * 4. Updates the database record with the last CDC performed time for the realmId - time when step 3 was performed
 */
function processTask(task) {
	console.log('processing task in queue');

	// get realm id from payload
	var data = JSON.parse(task);
	if (data && data.eventNotifications) {
	
		var realmId = data.eventNotifications[0].realmId;
		
		// get company config
		database.dbMemory.find({ companyId: realmId }, function (err, company) {
			if (err) {
				return console.log(err);
			} else {	   		
				var qbo = new QuickBooks(
							config.clientId,
							config.clientSecret,
							company[0].accessToken,
							false, // No token secret for oAuth2
							company[0].companyId,
							true, // use sandbox account
							true, // enable logs
							4, // minor version
							'2.0', // oAuth2
							company[0].refreshToken); 

				// call CDC
				qbo.changeDataCapture(company[0].webhooksSubscribedEntites, company[0].lastCdcTimestamp, function(err, data) {
					if (err) {
						return console.log('There was an error', err);  
					} else {
					console.log('CDC complete');
					//update timestamp
					database.dbMemory.update({ companyId: realmId }, { $set:{lastCdcTimestamp: data.time}}, {});
					console.log('completed update for realmId ' + realmId);
					console.log('queue task complete');
					}
				});
			}
		});
	}
	
}
module.exports.addToQueue = addToQueue;