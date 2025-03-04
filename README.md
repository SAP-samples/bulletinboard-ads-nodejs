## Deprecation Notice

This public repository is read-only and no longer maintained.

![](https://img.shields.io/badge/STATUS-NOT%20CURRENTLY%20MAINTAINED-red.svg?longCache=true&style=flat)

---
[![REUSE status](https://api.reuse.software/badge/github.com/SAP-samples/bulletinboard-ads-nodejs)](https://api.reuse.software/info/github.com/SAP-samples/bulletinboard-ads-nodejs)

# Bulletin Board - Advertisements Service

## Description

This is the advertisements service for the bulletin board application. Users can advertise things that they would like to sell. The server is written in Node.js. The client is written using Preact and SAP UI5 Web Components. The purpose of this application is to demonstrate Microservice development and related tradeoffs. In particular, this service is tightly coupled to the bulletinboard-reviews service, through a synchronous HTTP call to an API for a very specific feature that the advertisements service needs. This is a typical pitfall in Microservice development and can be mitigated by leveraging eventual consistency & asynchronous communication.

### Relation to 'bulletinboard-reviews'

If a contact of an advertisement got poor ratings from previous reviews, or hasn't received any reviews yet, the contact is considered not trustworthy and will be colored red.

## Requirements

The following tools are required to run the service locally:
- Node.js, v16 or later
- Docker engine, v20 or later
  - Alternatively, a PostgreSQL database, v9.6 or later
- Optionally a Bourne shell
  - Provided shell scripts make the startup easier
  - Git bash is a good choice for Windows users

## Local Setup

- Start a pre-configured database using Docker: `./start-db.sh`
  - If you want to start the database manually, or use your own PostgreSQL installation without Docker, have a look into the shell script to know the required configuration for version, database name, port, credentials and schema
- Install the required dependencies: `npm ci`
- Run the tests: `npm test`
- Start the service: `npm start`
  - The service will listen on port 8080

**NOTE:** since this is a sample for a typical Microservice pitfall, the service is tightly coupled to the bulletinboard-reviews service. You need to start the bulletinboard-reviews as well so that the advertisements service works correctly!

## Cloud Setup

### Cloud Foundry

For a deployment on Cloud Foundry, a pre-configured [manifest.yaml](manifest.yaml) with placeholders is provided.

### Kubernetes

For a deployment on Kubernetes, a pre-configured [k8s-minimal.yaml](k8s-minimal.yaml) with placeholders is provided, along with a basic [Dockerfile](Dockerfile).

## HTTP API

The following endpoints are supported and tested:
- `GET /api/v1/ads`: get all advertisements
  - Response:
    - `200 OK`
  - Response Body:
    ```
    [
      {
        ... // properties of the adveertisement
      },
      ...
    ]
    ```
- `GET /api/v1/ads/:id`: get single advertisement
  - Response: `200 OK`
    ```
    {
      "id": <int>,
      "title": <text>,
      "price": <number>,
      "contact": "<text>",
      "averageContactRating": <text>,
      "currency": <text>,
      "category": <text>,
      "createdAt": <date>,
      "modifiedAt": <date>,
      "reviewsUrl": <text>
    }
    ```
- `GET /api/v1/ads/:id`: get single advertisement
  - Response:
    - `200 OK`
- `POST /api/v1/ads`: post a new advertisement
  - Request Body:
    ```
    {
      "title": <text>,
      "currency": <text>,
      "price": <number>,
      "contact": <text>,
      "category": <text>
    }
    ```
  - Response:
    - `201 Created`
- `PUT /api/v1/ads/:id`: update an advertisement
  - Request Headers:
    - `Content-Type: application/json`
  - Request Body:
    ```
    {
      "id": <int>,
      "title": <text>,
      "currency": <text>,
      "price": <number>,
      "contact": <text>,
      "category": <text>
    }
    ```
  - Response:
    - `200 OK`
- `DELETE /api/v1/ads/:id`: delete single advertisement
  - Response:
    - `204 No content`
- `DELETE /api/v1/ads/`: delete all advertisements
  - Response:
    - `204 No content`

## How to obtain support
[Create an issue](https://github.com/SAP-samples/bulletinboard-reviews/issues) in this repository if you find a bug or have questions about the content.

For additional support, [ask a question in SAP Community](https://answers.sap.com/questions/ask.html).

## Contributing
If you wish to contribute code, offer fixes or improvements, please send a pull request. Due to legal reasons, contributors will be asked to accept a DCO when they create the first pull request to this project. This happens in an automated fashion during the submission process. SAP uses [the standard DCO text of the Linux Foundation](https://developercertificate.org/).

## License
Copyright (c) 2021 SAP SE or an SAP affiliate company. All rights reserved. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](LICENSES/Apache-2.0.txt) file.
