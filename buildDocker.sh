#!/bin/bash
set -e

version=$(cat package.json | jq .version -r)
echo "publish version $version to docker"

docker build -t instructuredata/marathon-elb:${version} .
docker push instructuredata/marathon-elb:${version}
