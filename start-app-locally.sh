#!/bin/sh -e

./prepare-environment-and-db.sh

echo "Starting application server"
if [ "$1" = "debug" ]
  then npm run start:debug
  else npm run start
fi