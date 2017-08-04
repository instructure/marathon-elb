const Task = require('./Task')
const valid = {
  ports: [
    1000, 1001
  ],
  host: '10.0.0.1'
}
const invalid = {
  host: '10.0.0.1'
}
describe('Task', () => {
  describe('isValid', () => {
    it('should give valid for valid array an index', () => {
      const t = new Task(valid, 0, {})
      expect(t.isValid()).toBe(true)
    })
    it('should give invalid for an index outside the array', () => {
      const t = new Task(valid, 2, {})
      expect(t.isValid()).toBe(false)
    })
    it('should give invalid if we just plain up do not have stuff', () => {
      const t = new Task(invalid, 0, {})
      expect(t.isValid()).toBe(false)
    })
  })
})
