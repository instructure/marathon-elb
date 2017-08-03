const AWS = require('aws-sdk')
const Marathon = require('marathon-node')
const bunyan = require('bunyan')
const ONE_SEC = 1000
const ONE_MIN = ONE_SEC * 60
class Config {
  constructor(configPath) {
    this.configFile = require(configPath)
    this.validate()
  }

  validate() {
    if (!this.configFile && typeof this.configFile !== 'object') throw new Error('invalid config passed, must be an object')
    if (!this.configFile.marathonUrl) throw new Error('must define marathonUrl')
    if (!this.configFile.awsRegion) throw new Error('must define awsRegion')
  }

  get awsRegion() {
    return this.configFile.awsRegion
  }

  get credentialProvider() {
    if (this.configFile.credentialProvider) return this.configFile.credentialProvider
    return new AWS.CredentialProviderChain()
  }

  get elbClient() {
    if (this.configFile.elbClient) return this.configFile.elbClient
    return new AWS.ELBv2({region: this.awsRegion, credentialProvider: this.credentialProvider})
  }

  get ec2Client() {
    if (this.configFile.ec2Client) return this.configFile.ec2Client
    return new AWS.EC2({region: this.awsRegion, credentialProvider: this.credentialProvider})
  }

  get marathonRequestOpts() {
    return this.configFile.marathonRequestOpts || {}
  }

  get marathonUrl() {
    return this.configFile.marathonUrl
  }

  get marathonApi() {
    if (this.configFile.marathonApi) return this.configFile.marathonAPi
    return Marathon(this.marathonUrl, this.marathonRequestOpts)
  }

  get pollInterval() {
    if (this.configFile.pollInterval === 0) return null
    return this.configFile.pollInterval || ONE_MIN * 10
  }

  get vpcId() {
    return this.configFile.vpcId || null
  }

  get logger() {
    if (this.configFile.logger) return this.configFile.logger
    return bunyan.createLogger({name: 'marathon-elb'})
  }
}
module.exports = Config
