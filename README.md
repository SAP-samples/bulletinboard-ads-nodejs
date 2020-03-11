# bulletinboard-ads
This is the **node.js** version of the advertisements-service for the bulletin board application.
Advertisements can be created, deleted and viewed.
You can interact with the service using a REST client like Postman or the GUI.

## Relation to 'bulletinboard-reviews'
If a user got poor ratings from previous reviews, or hasn't received any reviews yet, the user is considered not trustworthy and will be colored red.

## How to work locally
To execute the tests or to start the service a local database is needed.
The script `start-db.sh` can be used to start a local database (using docker).

### Execute tests
The tests can be executed with npm: `npm test`

### Start service locally
Run `npm start` to start the service.
The service will listen on port 8080.

## A word on cloud readiness

### CloudFoundry
To speed a up the configuration for a deployment in CloudFoundry a [manifest.yaml](manifest.yaml) is provided.

### Kubernetes
For a deployment of the service in Kubernetes a pre-configured yaml-file ([k8s-minimal.yaml](k8s-minimal.yaml)) is already part of the repository.
Along with a basic [Dockerfile](Dockerfile).
