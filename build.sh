#!/bin/bash
set -e

docker build -t instructuredata/marathon-elb .
docker push instructuredata/marathon-elb
