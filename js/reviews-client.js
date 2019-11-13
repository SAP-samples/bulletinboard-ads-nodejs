'use strict'

const client = require('superagent')

function ReviewsClient(reviewsHost) {
    this.getAverageRating = async (contact) => {
        const result = await client.get(`${reviewsHost}/api/v1/averageRatings/${contact}`)
        return result.body.average_rating
    }
}

module.exports = ReviewsClient
