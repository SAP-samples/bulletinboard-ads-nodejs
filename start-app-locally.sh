#!/bin/sh -e

set +e; existing_db_container_name=$(docker ps -a -f name=postgres-bulletinboard-ads | grep postgres-bulletinboard-ads); set -e
if [ -z "$existing_db_container_name" ]
then
    echo "DB container doesn't exist, creating"
    docker create -p 5432:5432 --name postgres-bulletinboard-ads postgres:9.6-alpine
fi



is_db_container_running=`docker inspect -f '{{.State.Running}}' postgres-bulletinboard-ads`
if [ $is_db_container_running = "false" ]
then
    echo "Starting DB container"
    docker start postgres-bulletinboard-ads
    sleep 3
fi


export VCAP_SERVICES='{"postgresql":[{"credentials":{"uri":"postgres://postgres@localhost:5432/postgres"}}]}'
export PORT='8080'
export REVIEWS_HOST='http://localhost:9090'

echo "Starting application server"
if [ "$1" = "debug" ]
  then npm run start:debug
  else npm run start
fi