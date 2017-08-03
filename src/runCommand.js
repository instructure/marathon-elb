const path = require('path')
const MarathonElb = require('./MarathonELB')
const Config = require('./Config')
exports.command = 'run'
exports.describe = 'Run the marathon-elb service'
exports.builder = {
  config: {
    alias: 'c',
    default: './config.js',
    describe: 'the path to the config file, see `config` command for details'
  }
}
exports.handler = (argv) => {
  const conf = new Config(path.resolve(process.cwd(), argv.config))
  const melb = new MarathonElb(conf)
  melb.on('error', (err) => {
    throw err
  })
  melb.start((err) => {
    if (err) throw err

    function stop() {
      console.log('stopping')
      melb.stop()
      process.nextTick(() => process.exit())
    }
    process.on('SIGINT', stop)
    process.on('SIGTERM', stop)
  })
}
