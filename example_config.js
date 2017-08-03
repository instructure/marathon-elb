module.exports = {
  marathonUrl: 'http://marathon.mesos:8080', // required, path to the marathon url
  awsRegion: process.env.AWS_REGION, // required, but you probably just want this to be AWS_REGION
  logger: null, // a logger instance that conforms to bunyan API, defaults to a new instance
  credentialProvider: null, // optional, defaults to build in credential provider
  elbClient: null, // optional, creates an elbv2 client with region and credential provider
  ec2Client: null, // optional, creates an ec2 client with region and credential provider
  marathonRequestOpts: null, // optional, opts to request lib, defaults to {}, set if you need auth and such
  marathonApi: null, // optional, defaults to new instance of https://github.com/elasticio/marathon-node with opts defined above
  pollInterval: null, // set a poll interval in milliseconds to periodically check, this shouldn't be needed but is a safety net against drift, set to 0 to disable, defaults to 10 minutes
  vpcId: null // if you have multiple vpcs with overlapping ip ranges, we need to VPC to properly look up instanceIds by ip address, should be the VPC where your marathon is running
}
