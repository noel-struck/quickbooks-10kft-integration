/* eslint-disable no-console */
const util = require('../util/util');
const queue = require('../queue/queue');
const express = require('express');
const router = express.Router();
const config = require('../conf');
const services = require('../services');

router.post('/', function (req, res) {
	// CHeck if Token is valid
	console.log('webhook oauthClient', config.oauthClient);
	if (config.oauthClient.isAccessTokenValid()) {
		listeningWebhook();
	} else {
		console.log('token is invalid, create a new one');
		config.oauthClient.refresh()
			.then((authResponse) => {
				console.log('token refreshed: ', authResponse);
				services.updateToken(authResponse);
				listeningWebhook();
			})
			.catch(function (e) {
				console.error("The error message is : " + e.originalMessage);
				console.error(e.intuit_tid);
			});
	}

	function listeningWebhook() {
		/**
		 * Method to receive webhooks event notification 
		 * 1. Validates payload
		 * 2. Adds it to a queue
		 * 3. Sends success response back
		 * 
		 * Note: Queue processing happens asynchronously
		 */

		var payload = JSON.stringify(req.body);
		var signature = req.get('intuit-signature')

		// if signature is empty return 401
		if (!signature) {
			return res.status(401).send('FORBIDDEN');
		}

		// if payload is empty, don't do anything
		if (!payload) {
			return res.status(200).send('success');
		}

		// validate signature
		if (util.isValidPayload(signature, payload)) {
			console.log(payload);
			const entities = payload.eventNotifications[0].dataChangeEvent.entities;
			entities.forEach((item) => {
				entityController(item);
			});
			// TODO: Fix issue with AUTH in the following method
			// queue.addToQueue(payload);
			// console.log('task added to queue ');

			// TODO: Call here the corresponding API that match with its entity


			return res.status(200).send('success');
		} else {
			return res.status(401).send('FORBIDDEN');
		}
	}

	function entityController(entity) {
		switch (entity.name) {
			case 'Customer':
				console.log(entity.id);
				break;
			default:
				break;
		}
	}
})

module.exports = router;