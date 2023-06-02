#!/bin/bash
# This updates a specific deployment so that if it referenced anywhere else it does not
# need to be updated to the latest deployment id.
# Path: scripts/update_release.sh

release_name=${RELEASE_NAME:-"schedul8r"}
deployment_id=$(clasp deployments | grep "$release_name" | awk -F' ' '{print $2}')

if [ -z "$deployment_id" ]
then
  echo "Creating new deployment: $release_name"

  clasp deploy -d "$release_name"
else
    echo "Updating existing deployment: $release_name"
    
    clasp deploy -i "$deployment_id" -d "$release_name"
fi
