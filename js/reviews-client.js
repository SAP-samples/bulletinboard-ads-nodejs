'use strict'

const client = require('superagent')

function ReviewsClient(reviewsUrl) {
    this.getAverageRating = async (contact) => {
        const result = await client.get(`${reviewsUrl}/api/v1/averageRatings/${contact}`)
        return result.body.average_rating
    }
}

module.exports = ReviewsClient
