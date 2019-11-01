import { SwitchlyConfig, SwitchConfig } from '../../types/index.types'
import { TSMap } from 'typescript-map'
import { Service } from 'typedi'

const defaultConfig: SwitchlyConfig = {
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
  switches: []
}

@Service()
class ConfigService {
  private config: SwitchlyConfig = defaultConfig
  private switchConfig: TSMap<string, boolean> = new TSMap()

  public init(config: SwitchlyConfig) {
    this.config = config
    this.syncConfig()
  }

  private flatternSwitches(
    environment: string = 'local',
    switches: SwitchConfig[],
    parent?: string,
    currentMap: TSMap<string, boolean> = new TSMap()
  ) {
    const flattenedSwitches = currentMap

    switches.forEach((switchConfig: SwitchConfig) => {
      const switchKey: string = parent ? `${parent}.${switchConfig.key}` : switchConfig.key

      if (!flattenedSwitches.has(`${environment}.${switchKey}`)) {
        flattenedSwitches.set(`${environment}.${switchKey}`, switchConfig.enabled)
      }

      if (Array.isArray(switchConfig.switches) && switchConfig.switches.length > 0) {
        this.flatternSwitches(environment, switchConfig.switches, switchKey, flattenedSwitches)
      }
    })

    return flattenedSwitches
  }

  public getConfig(): SwitchlyConfig {
    return this.config
  }

  public async getSwitches() {
    return this.switchConfig.toJSON()
  }

  public syncConfig() {
    if (this.config) {
      // Fetch existing from Redis store

      const switches = this.flatternSwitches(this.config.environment, this.config.switches).toJSON()

      Object.keys(switches).forEach((switchConfig: string) => {
        if (!this.switchConfig.has(switchConfig) || (this.config && this.config.offline)) {
          this.switchConfig.set(switchConfig, switches[switchConfig])
        }
      })
    }
  }
}

export default ConfigService
