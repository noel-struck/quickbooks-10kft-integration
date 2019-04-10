/* eslint-disable no-console */
const util = require('../util/util');
const queue = require('../queue/queue');
const express = require('express');
const router = express.Router();
const config = require('../conf');
const services = require('../services');
const QuickBooks = require('node-quickbooks');
const axios = require('axios');
const moment = require('moment');

router.post('/', function (req, res) {
	// CHeck if Token is valid.
	if (config.oauthClient.isAccessTokenValid()) {
		listeningWebhook();
	} else {
		console.log('token is invalid, creating a new one...');
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
		/*
		 * Method to receive webhooks event notification 
		 * 1. Validates payload
		 * 2. Adds it to a queue
		 * 3. Sends success response back
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
			queue.addToQueue(payload);
			processEntities(entities);
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
		const qbo = new QuickBooks(
			config.clientId,
			config.clientSecret,
			config.qbo.accessToken,
			false, // No token secret for oAuth2
			config.qbo.companyId,
			true, // use sandbox account
			true, // enable logs
			4, // minor version
			'2.0', // oAuth2
			config.qbo.refreshToken); 

		switch (entityName) {
			case 'Customer':
				qbo.getCustomer(entityId, (error, resp) => {
					if (error){
						console.log('Could not save data in 10Kft ', error)
					} else {
						const tenKftProject = parseProjectFromQboToTenKft(resp);
						createTenKftProject(tenKftProject);
					};
				});
				break;
			default:
				break;
		}
	}

	function parseProjectFromQboToTenKft(payload) {
		return {
			name: payload.DisplayName,
			starts_at: moment(payload.MetaData.CreateTime).format('YYYY-MM-DD'),
			ends_at: moment(payload.MetaData.LastUpdatedTime).add(1, 'year').format('YYYY-MM-DD') // Edit this to the right time average for a project
		};
		
	}

	function createTenKftProject(payload) {
		const tenKftProjectApi = `${config.tenKft.sandboxApi}/api/v1/projects`;
		const apiOptions = {
			method: 'post',
			url: tenKftProjectApi,
			data: payload,
			headers: {
				'Content-Type': 'application/json',
				'auth': config.tenKft.token
			}
		}
		axios(apiOptions)
			.then((resp) => {
				console.log('Project added to 10Kft!');
			})
			.catch((error) => {
				console.log('There was an error trying to insert a new project in 10Kft ', error);
			})
	}
})

module.exports = router;