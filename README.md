# bulletinboard-ads
This is the **Node.js** version of the advertisements-service for the bulletin board application.
Advertisements can be created, deleted and viewed.
You can interact with the service using a REST client like Postman or the GUI.

## Relation to 'bulletinboard-reviews'
If a user got poor ratings from previous reviews, or hasn't received any reviews yet, the user is considered not trustworthy and will be colored red.

## How to work locally
To execute the tests or to start the service a local database is needed.
The script `start-db.sh` can be used to start a local database (using Docker).

Also the dependencies need to be installed. Run `npm install` to install those.

### Execute tests
The tests can be executed with npm: `npm test`

### Start service locally
Run `npm start` to start the service.
The service will listen on port 8080.

## A word on cloud readiness

### Cloud Foundry
To speed a up the configuration for a deployment in Cloud Foundry a [manifest.yaml](manifest.yaml) with placeholders is provided.

### Kubernetes
For a deployment of the service in Kubernetes a pre-configured yaml-file ([k8s-minimal.yaml](k8s-minimal.yaml)) with placeholders is already part of the repository.
Along with a basic [Dockerfile](Dockerfile).

## Interact with the application

### Using the API
The following endpoints are supported and tested (remember to set the `application/json` content-type header):
- `GET /api/v1/ads`: get all ads
  Response: `200 OK`
  Response Body:
```
    [
        {
            "id": <int>,
            "title": <text>,
            "price": <number>,
            "contact": "<text>",
            "contactRatingState": <text>, //correlates to the average rating from the reviews service
            "currency": <text>,
            "category": <text>,
            "purchasedOn": <date>,
            "metadata": {
                "createdAt": <date>,
                "modifiedAt": <date>,
                "version": <int>
            },
            "reviewsUrl": <text> //redirectUrl
        },
        ...
    ]
```
- `GET /api/v1/ads/:id`: get single ad
  Response: `200 OK`
```
    {
        "id": <int>,
        "title": <text>,
        "price": <number>,
        "contact": "<text>",
        "contactRatingState": <text>, //correlates to the average rating from the reviews service
        "currency": <text>,
        "category": <text>,
        "purchasedOn": <date>,
        "metadata": {
            "createdAt": <date>,
            "modifiedAt": <date>,
            "version": <int>
        },
        "reviewsUrl": <text> //redirectUrl
    }
```
- `GET /api/v1/ads/:id`: get single ad
  Response: `200 OK`
- `POST /api/v1/ads`: post a new ad
  Request Body:
```
    {
        "title": <text>,
        "currency": <text>,
        "price": <number>,
        "contact": <text>,
        "category": <text>,     //optional
        "purchasedOn": <date>   //optional
    }
```
- `PUT /api/v1/ads/:id`: update an ad
  Request Body:
```
    {
        "id": <int>,
        "title": <text>,
        "currency": <text>,
        "price": <number>,
        "contact": <text>,
        "category": <text>,   //optional
        "purchasedOn": <date> //optional
    }
```
  Response: `201 Created`
- `DELETE /api/v1/ads`: delete all ads
  Response: `204 No Content`


