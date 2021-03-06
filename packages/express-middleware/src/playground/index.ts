import express, { Application, Router } from 'express'
import switchlyMiddleware from '../index'
import { SwitchlyConfig, SwitchlyDatastores } from '../types/index.types'
import Loggerhead from '@cornerstone-digital/loggerhead'
import Container from 'typedi'
import LoggerService from '../services/logger/logger.service'

const app: Application = express()
const router = Router()

const config: SwitchlyConfig = {
  environment: 'local',
  project: 'basket',
  offline: false,
  routePrefix: '/basket',
  logger: {
    namespace: 'Switchly',
    enabled: true,
    level: 7,
    logFile: {
      enabled: true,
      fileName: 'switchly.log',
      options: {
        path: `${process.cwd()}/.logs`,
        compress: true,
        size: '10M',
        maxFiles: 5
      }
    },
    masking: {
      enabled: true,
      enableDefaults: {
        email: true,
        phone: true,
        password: true,
        postcode: true,
        jwt: true
      },
      rules: []
    }
  },
  datastore: {
    type: SwitchlyDatastores.Redis,
    // dropDB: true,
    config: {
      host: 'localhost',
      port: 6379,
      database: 'switchly'
    }
  },
  switches: [
    {
      key: 'bingo',
      enabled: true,
      switches: [
        {
          key: 'subfeature',
          enabled: true,
          switches: [
            {
              key: 'sub-sub-feature',
              enabled: true,
              switches: [
                {
                  key: 'sub-sub-sub-feature',
                  enabled: true
                }
              ]
            },
            {
              key: 'sub-sub-feature1',
              enabled: true,
              switches: [
                {
                  key: 'sub-sub-sub-feature1',
                  enabled: true
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

const logger: Loggerhead = Container.get(LoggerService).getLogger('PlaygroundServer')
app.use(switchlyMiddleware(router, config))

app.listen(3000, () => {
  logger.info(`listening on port 3000`)
})
