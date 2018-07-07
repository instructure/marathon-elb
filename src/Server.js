const http = require('http')
const url = require('url')

function healthRoute(req, res) {
  const health = {
    ts: new Date(),
    pid: process.pid,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    status: 'ok'
  }

  res.writeHead(200, {'Content-Type': 'application/json'})

  return res.end(JSON.stringify(health))
}

function handle(logger, req, res) {
  const method = req.method.toLowerCase()
  const path = (url.parse(req.url)).pathname

  logger.info({path, method}, 'received http request')

  if (path === '/health' && method === 'get') {
    logger.info('running health check')
    return healthRoute(req, res)
  } else {
    logger.info('not found')
    res.writeHead(404, 'Not Found')
    return res.end('Not Found\n')
  }
}

class Server {
  constructor(config) {
    this.config = config
    this.logger = this.config.logger
    this._server = http.createServer(handle.bind(null, config.logger))
  }
  start() {
    const port = this.config.serverPort
    this._server.listen(port, (err) => {
      if (err) throw err
      this.logger.info({port: port}, 'started health server')
    })
  }
  stop() {
    this._server.close((err) => {
      if (err) throw err
      this.logger.info('stopped health server')
    })
  }
}

module.exports = Server
