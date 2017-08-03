Marathon-ELB
======

Use an AWS ALB aka application load balancer aka ELBv2 for marathon apps.

This essentially just follows the marathon event bus and makes calls to AWS apis to keep the ALB in sync

## How to
1. Create an ALB with a listener configured how you want (such as hostname, rules, etc) as well as a target group
2. Add a label with `MELB_TARGET_ARN` with the target group arn in your marathon config
3. Make sure your server has the following permissions:
  - `ec2:DescribeInstances`
  - `elasticloadbalancing:DeregisterTargets`
  - `elasticloadbalancing:DescribeTargetHealth`
  - `elasticloadbalancing:RegisterTargets`

## Docker Image
Instead of needing to deal with this repo, you can just use the docker image

`docker pull instructuredata/marathon-elb:$version`
`docker run -e AWS_REGION=us-east-1 instructedata/marathon-elb:$version`


## Deploying to docker
run `./buildDocker.sh`. This requires `jq` tool

## Roadmap
This is pretty bare bones, should be relatively easy to make this a lot nicer, some ideas:

- Configure targetGroup health check from marathon info where possible (when it is use an http health check on same port)
- Dynamically create new target groups with rules, such as hostname based routing. Since a single ELB can now route multiple apps with host based routing this seems doable.
  The biggest problem is simply that we will have to traverse and match the whole ruleset for an ELB since they don't have names
- Allow setting other attributes from labels
