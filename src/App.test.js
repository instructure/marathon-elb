const App = require('./App')
jest.mock('./Config')
const Config = require('./Config')
let instanceResp = [{
  PrivateIpAddress: '10.0.0.1',
  InstanceId: 'i-1234513413'
}]

let resvResp = [
  {Instances: instanceResp},
  {
    Instances: [
      {
        PrivateIpAddress: '10.0.0.3',
        InstanceId: 'i-1234513413'
      }
    ]
  }
]
const mockEc2 = jest.fn((params, cb) => {
  cb(null, {Reservations: resvResp})
})
Config.mockImplementation(() => {
  return {
    ec2Client: {
      describeInstances: mockEc2
    },
    vpcId: 'vpc-abcde'
  }
})
const mockConfig = new Config()
describe('App', () => {
  const j = {
    labels: {
      [App.TARGET_LABEL]: 'my-arn',
      [App.PORT_INDEX_LABEL]: 1,
      foo: 'bar'
    },
    tasks: [
      {
        ports: [1000, 1001],
        host: '10.0.0.1'
      },
      {
        ports: [1000, 1001],
        host: '10.0.0.2'
      },
      {
        ports: [1000, 1001],
        // this should always return a stable address
        host: 'dns.msftncsi.com'
      }
    ]
  }
  describe('getters', () => {
    const app = new App(j, mockConfig)
    it('should get labels', () => {
      expect(app.labels).toEqual({
        [App.TARGET_LABEL]: 'my-arn',
        [App.PORT_INDEX_LABEL]: 1,
        foo: 'bar'
      })
    })
    it('should get targetArn', () => {
      expect(app.targetArn).toBe('my-arn')
    })
    it('should get portIndex', () => {
      expect(app.portIndex).toBe(1)
    })
    it('should get taskJson', () => {
      expect(app.taskJson).toEqual(j.tasks)
    })
    it('should get tasks', () => {
      const tasks = app.tasks
      expect(tasks.length).toBe(3)
      expect(tasks.map((t) => t.host)).toEqual(['10.0.0.1', '10.0.0.2', 'dns.msftncsi.com'])
    })
  })
  describe('isMelbApp', () => {
    it('should return true when it has a targetArn', () => {
      const app = new App(j, mockConfig)
      expect(app.isMelbApp()).toBe(true)
    })
    it('should return false when no targetArn', () => {
      const noArn = {
        labels: {
          [App.PORT_INDEX_LABEL]: 1,
          foo: 'bar'
        },
        tasks: [
          {
            ports: [1000, 1001],
            host: '10.0.0.1'
          }
        ]
      }
      const app = new App(noArn, mockConfig)
      expect(app.isMelbApp()).toBe(false)
    })
  })
  describe('getTargets', () => {
    const app = new App(j, mockConfig)
    it('should return the expected targets', (done) => {
      app.getTargets((err, targets) => {
        if (err) return done(err)
        const args = mockEc2.mock.calls[0][0]
        const addrs = args.Filters[0].Values
        expect(addrs).toEqual(['10.0.0.1', '10.0.0.2', '131.107.255.255'])
        expect(targets).toEqual([
          {
            Id: 'i-1234513413',
            Port: 1001
          }
        ])
        done()
      })
    })
  })
})
