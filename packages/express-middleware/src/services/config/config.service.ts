import { SwitchlyConfig, SwitchlyDatastores } from '../../types/index.types'
import { Service } from 'typedi'

const defaultConfig: SwitchlyConfig = {
  environment: process.env.NODE_ENV || 'local',
  project: process.env.SWITCHLY_PROJECT_NAME || 'default',
  offline: true,
  routePrefix: '/basket',
  datastore: {
    type: SwitchlyDatastores.Redis,
    config: {
      host: 'localhost',
      port: 6379,
      database: 'switchly'
    }
  },
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
  switches: []
}

@Service()
class ConfigService {
  private config: SwitchlyConfig = defaultConfig

  public async init(config: SwitchlyConfig): Promise<void> {
    this.config = config
  }

  public getConfig(): SwitchlyConfig {
    return this.config
  }
}

export default ConfigService
