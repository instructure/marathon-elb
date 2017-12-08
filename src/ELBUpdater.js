const ld = require('lodash')
class ELBUpdater {
  constructor(config) {
    this.logger = config.logger
    this._elb = config.elbClient
  }

  updateTarget(app, cb) {
    const targetArn = app.targetArn
    const remove = this.removeTargets.bind(this, targetArn)
    const update = this.updateTargets.bind(this, targetArn)
    app.getTargets((err, targets) => {
      if (err) return cb(err)
      remove(targets, (err) => {
        if (err) return cb(err)
        update(targets, cb)
      })
    })
  }

  removeTargets(targetArn, targets, cb) {
    const opts = {TargetGroupArn: targetArn}
    this.logger.debug(opts, 'Calling describeTargetHealth')
    this._elb.describeTargetHealth(opts, (err, resp) => {
      if (err) return cb(err)
      this.logger.debug({input: opts, output: resp}, 'respose describeTargetHealth')
      const curTargets = (resp.TargetHealthDescriptions || []).map((t) => t.Target)
      const toRemove = ld.differenceBy(curTargets, targets, (t) => `${t.Id}:${t.Port}`)

      if (toRemove.length === 0) return cb()
      this.logger.debug({targetArn, toRemove}, 'removing targets')
      this._elb.deregisterTargets({
        TargetGroupArn: targetArn,
        Targets: toRemove
      }, cb)
    })
  }

  updateTargets(targetArn, targets, cb) {
    if (targets.length === 0) return cb()
    this.logger.debug({targetArn, targets}, 'updating targets')
    this._elb.registerTargets({
      TargetGroupArn: targetArn,
      Targets: targets
    }, cb)
  }
}
module.exports = ELBUpdater
