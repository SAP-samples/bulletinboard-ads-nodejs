'use strict'

const express = require('express')
const bodyParser = require('body-parser')

function ExpressServer(adsService) {

	let httpServer
	const app = express()
	app.use(bodyParser.json())

	this.start = function (port) {
		//REVISE are we listening to early - what if the DB is not yet connected?
		httpServer = app.listen(port)
		console.log(`Server started on port ${port}`)
	}

	this.stop = async function () {
		await adsService.stop()
		httpServer.close()
	}
}

module.exports = ExpressServer