class Task {
  constructor(taskJson, portIndex, config) {
    this._j = taskJson
    this._portIndex = portIndex
  }

  get ports() {
    return this._j.ports || []
  }
  get host() {
    return this._j.host
  }

  isValid() {
    return this.ports[this._portIndex] > 0 && !!this.host
  }
}
module.exports = Task
