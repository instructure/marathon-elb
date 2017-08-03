const path = require('path')
const fs = require('fs')
exports.command = 'config [path]'
exports.describe = 'Generate a config file at the same path'
exports.builder = {
}
exports.handler = (argv) => {
  const outPath = argv.path || './config.js'
  const fp = path.resolve(process.cwd(), outPath)
  console.log('writing sample config to ' + fp)
  const sampleFile = fs.readFileSync(path.resolve(__dirname, '../example_config.js'), 'utf8')
  fs.writeFileSync(fp, sampleFile)
}
