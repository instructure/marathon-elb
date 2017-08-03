const async = require('async')
const ld = require('lodash')

const Task = require('./Task')
class App {
  constructor(appJson, config) {
    this.config = config
    this._j = appJson || {}
    this._ec2 = config.ec2Client
  }

  get labels() {
    return this._j.labels || {}
  }
  get targetArn() {
    return this.labels[App.TARGET_LABEL]
  }
  get portIndex() {
    return this.labels[App.PORT_INDEX_LABEL] || 0
  }
  get tasks() {
    if (this._tasks) return this._tasks
    this._tasks = this.buildTasks() || []
    return this._tasks
  }
  get taskJson() {
    return this._j.tasks || []
  }

  buildTasks() {
    return this.taskJson.map((tj) => {
      return new Task(tj, this.portIndex, this.config)
    }).filter((t) => t.isValid())
  }

  isMelbApp() {
    return !!this.targetArn
  }

  getTargets(cb) {
    const ipAddrs = this.tasks.map((t) => t.host)
    const portsByHost = ld.keyBy(this.tasks.map((t) => ({host: t.host, port: t.port})), 'host')
    if (ipAddrs.length === 0) return cb(null, [])
    this._ec2.describeInstances(this.buildDescribeParams(ipAddrs), (err, resp) => {
      if (err) return cb(err)
      const instances = ld.flatMap((resp.Reservations || []), (r) => r.Instances || [])
      const targets = instances.map((instance) => {
        const Host = instance.PrivateIpAddress
        const Port = (portsByHost[Host] || {}).port
        const Id = instance.InstanceId
        return {Id, Port}
      }).filter((i) => (i !== null && i.Port && i.Id))
      cb(null, targets)
    })
  }

  buildDescribeParams(ipAddrs) {
    const filters = [
      {
        Name: 'network-interface.addresses.private-ip-address',
        Values: ipAddrs
      },
      {
        Name: 'instance-state-name',
        Values: ['running']
      }
    ]
    if (this.config.vpcId) {
      filters.push({
        Name: 'vpc-id',
        Values: this.config.vpcId
      })
    }
    return {Filters: filters}
  }

  static get TARGET_LABEL() {
    return 'MELB_TARGET_ARN'
  }
  static get PORT_INDEX_LABEL() {
    return 'MELB_PORT_INDEX'
  }
}

module.exports = App
