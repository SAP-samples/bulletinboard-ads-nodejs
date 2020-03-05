# bulletinboard-ads
This is the Advertisements service of the bulletin board application.

## How to work locally

Before starting or testing the app, use the script `start-db.sh` to start the postgres database in a docker container.

Run `npm test` to execute the test suite.

If you want to start the app, run `npm start`.

_If you work on Windows, you might run into issues with hanging processes after killing the script with CTRL+C. This can be avoided by using a different shell: <YOUR_GIT_INSTALLATION_DIRECTORY>\bin\sh.exe (This is NOT the git bash started when using the shortcut!). You could also configure your IDE to use this shell as the default terminal._

## How to work in the cloud (with Cloud Foundry (CF))

Create a CF account & *login to your org and space*.
You should already have a running `bulletinboard-reviews` app before you deploy your application (otherwise ads cannot be displayed or created).
Make sure the exposed URI matches the `REVIEWS_HOST` environment variable in [manifest.yaml](manifest.yaml).
Run script `deploy-to-cf.sh`. This will create a postgres db instance and push your app to CF.

## Relation to 'bulletinboard-reviews'

If a user got poor ratings from previous reviews, or hasn't received any reviews yet, the user is considered untrusted and will be colored red.
