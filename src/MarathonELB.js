const { EventEmitter } = require('events')

const async = require('async')

const ELBUpdater = require('./ELBUpdater')
const Server = require('./Server')
const App = require('./App')
class MarathonELB extends EventEmitter {
  constructor(config) {
    super()
    this.config = config
    this._elb = new ELBUpdater(config)
    this._server = new Server(config)
    this._marathon = config.marathonApi
    this.logger = this.config.logger
  }

  start(cb) {
    this.logger.info('starting marathon-elb')
    this._server.start()
    const events = ['status_update_event', 'health_status_changed_event', 'api_post_event']
    const opts = {
      eventType: events
    }
    this.es = this._marathon.events.createEventSource(opts)
    this.es.on('open', () => this.logger.info('opened event source'))
    this.es.on('error', (err) => {
      this.logger.error({err}, 'error from event source')
      this.emit('error', err)
    })
    for (let et of events) {
      this.logger.info(`registering for ${et} event`)
      this.es.addEventListener(et, this.onEvent.bind(this, et))
    }
    this.update((err, res) => {
      if (err) return cb(err)
      this.logger.info({status: res}, 'ran initial update')
      if (this.config.pollInterval) {
        this.logger.info(`pull for updates every ${this.config.pollInterval} milliseconds`)
        this._interval = setInterval(() => {
          this.logger.info('running perodic update')
          this.update()
        }, this.config.pollInterval)
      }
      cb()
    })
  }

  stop() {
    if (this.es) this.es.close()
    if (this._interval) clearInterval(this._interval)
    this._server.stop()
  }

  onEvent(eventName, event) {
    this.logger.info({eventName, event}, 'handling event')
    this.update()
  }

  update(cb) {
    const self = this
    cb = cb || function defCb(err, res) {
      if (err) {
        self.logger.error({err}, 'had a fatal error, exiting')
        self.emit('error', err)
        return
      }
      self.logger.info({res}, 'ran update')
      self.emit('updated', res)
    }

    this.getApps((err, apps) => {
      if (err) return cb(err)
      async.map(apps, (app, cb) => {
        this._elb.updateTarget(app, cb)
      }, cb)
    })
  }
  getApps(cb) {
    this._marathon.apps.getList({embed: 'apps.tasks'})
    .then((data) => {
      const apps = data.apps
        .map((app) => new App(app, this.config))
        .filter((app) => app.isMelbApp())
      cb(null, apps)
    })
    .catch(cb)
  }
}
module.exports = MarathonELB
