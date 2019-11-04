'use strict'

const express = require('express')
const bodyParser = require('body-parser')

function ExpressServer(adsService) {
	const CREATED = 201;
	const NO_CONTENT = 204;

	let httpServer
	const app = express()
	app.use(bodyParser.json())

	app.get('/api/v1/ads', async (req, res) => {
		const ads = await adsService.getAll()
		res.send(ads)
	})

	app.post('/api/v1/ads', async (req, res) => {
		const ad = await adsService.createAd(req.body)
		res.status(CREATED).header('location', `/api/v1/ads/${ad.id}`).send(ad)
	})

	app.delete('/api/v1/ads', async (req, res) => {
		await adsService.deleteAll()
		res.status(NO_CONTENT).end()
	})

	this.start = function (port) {
		httpServer = app.listen(port)
		console.log(`Server started on port ${port}`)
	}

	this.stop = async function () {
		await adsService.stop()
		httpServer.close()
	}
}

module.exports = ExpressServer