/* eslint-disable no-console */
const util = require('../util/util');
const queue = require('../queue/queue');
const express = require('express');
const router = express.Router();
const config = require('../conf');
const services = require('../services');
const QuickBooks = require('node-quickbooks');
const https = require('https');
const axios = require('axios');
const fs = require('fs');
const moment = require('moment');

router.post('/', function (req, res) {
	// CHeck if Token is valid.
	const sandboxURL = 'https://sandbox-quickbooks.api.intuit.com';
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

	async function listeningWebhook() {
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
			const payloadJSON = JSON.parse(payload);
			const entities = payloadJSON.eventNotifications[0].dataChangeEvent.entities;
			
			// TODO: Fix issue with AUTH in the following method
			// queue.addToQueue(payload);
			// console.log('task added to queue ');

			// Call here the corresponding API that match with its entity
			await processEntities(entities);
			console.log('enttites processed');
			return res.status(200).send('success');
		} else {
			return res.status(401).send('FORBIDDEN');
		}
	}

	async function processEntities(entities) {
		for (const item of entities) {
			await entityController(item);
		}
	}

	function entityController(entity) {
		const entityId = entity.id;
		const entityName = entity.name;
		const companyId = config.qbo.companyId;
		const customerApi = `${sandboxURL}/v3/company/${companyId}/customer/${entityId}`;
		const customerApiOptions = {
			method: 'get',
			url: customerApi,
			headers: {
				'Authorization': `Bearer ${config.qbo.accessToken}`,
				'Accept': 'application/json'
			}
		};

		switch (entityName) {
			case 'Customer':
				const fileName = `${moment().format('YY-MM-DD')}-customer-data.json`;
				axios(customerApiOptions)
					.then((resp) => {
						const jsonData = resp.data.Customer;
						jsonToSave = JSON.stringify(jsonData);
						fs.writeFile(fileName, jsonToSave, (error) => {
							if (error) throw error;
							console.log('file saved');
						})		
					}).catch((error) => {
						console.log('there was an error ', error);
					});
				break;
			default:
				break;
		}
	}
})

module.exports = router;