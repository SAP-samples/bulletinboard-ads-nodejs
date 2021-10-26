import client from 'superagent'

class ReviewsClient {
  #reviewsHost

  constructor (reviewsHost) {
    this.#reviewsHost = reviewsHost
  }

  async getAverageRating (contact) {
    const result = await client.get(`${this.#reviewsHost}/api/v1/averageRatings/${contact}`)
    return result.body.average_rating
  }
}

export default ReviewsClient
