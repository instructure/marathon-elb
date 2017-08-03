const ld = require('lodash')
class ELBUpdater {
  constructor(config) {
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
    this._elb.describeTargetHealth({TargetGroupArn: targetArn}, (err, resp) => {
      if (err) return cb(err)
      const curTargets = (resp.TargetHealthDescriptions || []).map((t) => t.Target)
      const toRemove = ld.differenceBy(curTargets, targets, (t) => `${t.Id}:${t.Port}`)

      if (toRemove.length === 0) return cb()
      this._elb.deregisterTargets({
        TargetGroupArn: this.targetArn,
        Targets: toRemove
      }, cb)
    })
  }

  updateTargets(targetArn, targets, cb) {
    this._elb.registerTargets({
      TargetGroupArn: this.targetArn,
      Targets: targets
    }, cb)
  }
}
module.exports = ELBUpdater
