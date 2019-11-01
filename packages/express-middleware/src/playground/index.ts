import express, { Application, Router } from 'express'
import switchlyMiddleware from '../index'
import { SwitchlyConfig } from '../types/index.types'
import Loggerhead from '@cornerstone-digital/loggerhead'
import Container from 'typedi'
import LoggerService from '../services/logger/logger.service'

const app: Application = express()
const router = Router()

const config: SwitchlyConfig = {
  environment: process.env.NODE_ENV || 'local',
  offline: true,
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
    type: 'Redis',
    config: {
      url: ''
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
              enabled: true
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
