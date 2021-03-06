import { Service } from 'typedi'
import ConfigService from '../config/config.service'
import ServiceManager from '../manager'
import {SwitchConfig, SwitchlyConfig} from '../../types/index.types'
import {TSMap} from 'typescript-map'
import DatastoreService from '../datastore/datastore.service'
// import {getObjectId} from '../../utils/objectIdUtils'
import LoggerService from '../logger/logger.service'
import Loggerhead from '@cornerstone-digital/loggerhead'
import uuid from 'uuid'
// import Switch from '../../model/switch/switch.model'

@Service()
class SwitchService {
  private configService: ConfigService
  private datastoreService: DatastoreService
  private loggerService: LoggerService
  private serviceManager: ServiceManager = new ServiceManager()
  private config?: SwitchlyConfig
  private switchConfig: TSMap<string, SwitchConfig> = new TSMap()
  private logger: Loggerhead

  constructor() {
    this.configService = this.serviceManager.getService<ConfigService>(ConfigService)
    this.datastoreService = this.serviceManager.getService<DatastoreService>(DatastoreService)
    this.loggerService = this.serviceManager.getService<LoggerService>(LoggerService)
    this.logger = this.loggerService.getLogger('Switchly:SwitchService')
  }

  public async init() {
    this.config = this.configService.getConfig()
    await this.datastoreService.init()
    await this.syncSwitches()
  }

  private flatternSwitches(
    environment: string = 'local',
    switches: SwitchConfig[],
    parent?: string,
    currentMap: TSMap<string, SwitchConfig> = new TSMap()
  ) {
    const flattenedSwitches = currentMap

    switches.forEach((switchConfig: SwitchConfig) => {
      const switchKey: string = parent ? `${parent}.${switchConfig.key}` : switchConfig.key
      const switchData = Object.assign({}, switchConfig)
      delete switchData.switches

      if (!flattenedSwitches.has(`${environment}.${switchKey}`)) {
        switchData.id = uuid.v4()
        switchData.key = `${environment}.${switchKey}`
        switchData.environment = this.configService.getConfig().environment
        switchData.project = this.configService.getConfig().project
        flattenedSwitches.set(`${environment}.${switchKey}`, switchData)
      }

      if (Array.isArray(switchConfig.switches) && switchConfig.switches.length > 0) {
        this.flatternSwitches(environment, switchConfig.switches, switchKey, flattenedSwitches)
      }
    })

    return flattenedSwitches
  }

  private get switchData () {
    const switchJSON = this.switchConfig.toJSON()
    const switchData = Object.keys(switchJSON).map((switchKey) => {
      return this.switchConfig.get(switchKey)
    })

    return switchData
  }

  private async syncRedis(): Promise<any> {
    this.logger.debug('Syncing with Redis')
    return this.datastoreService.upsert('switches', this.switchData)
  }

  public get environmentName(): string | undefined {
    return this.configService.getConfig().environment ? this.configService.getConfig().environment : undefined
  }

  public async updateSwitch(project: string, environment: string, key: string, enabled: boolean) {
    this.logger.debug('Updating Switch', key)
    const switchData = await this.switchConfig.get(key)
    switchData.enabled = enabled
    return this.datastoreService.upsert('switches', switchData, [
      ["key", "=", key],
      "AND",
      ["project", "=", project],
      "AND",
      ["environment", "=", environment]
    ])
  }

  public async getSwitch(project: string, environment: string, key: string) {
    return this.datastoreService.select('switches', [], [
      ["key", "=", key],
      "AND",
      ["project", "=", project],
      "AND",
      ["environment", "=", environment]
    ])
  }

  public async syncSwitches() {
    if (this.config && this.config.switches) {
      // this.datastoreService.delete('switches')
      const currentSwitches: SwitchConfig[] = await this.getSwitches(
        this.configService.getConfig().project,
        this.environmentName
      )
      
      if (currentSwitches && currentSwitches.length) {
        currentSwitches.forEach((switchConfig: SwitchConfig) => {
          if (this.config && !this.config.offline) {
            this.switchConfig.set(switchConfig.key, switchConfig)
          }
        })
      }

      const switches = this.flatternSwitches(this.config.environment, this.config.switches).toJSON()

      Object.keys(switches).forEach((switchConfig: string) => {
        if (!this.switchConfig.has(switchConfig) || (this.config && this.config.offline)) {
          this.switchConfig.set(switchConfig, switches[switchConfig])
        }
      })

      // Sync Back to Redis
      await this.syncRedis()
    }
  }

  public async getSwitches(project: string, environment?: string, columns: string[] = []): Promise<any> {
    try {
      const whereClause = []
      const selectCols = columns ? columns : []
      if (project) {
        whereClause.push(["project", "=", project])
      }

      if (environment) {
        if (whereClause.length > 0) {
          whereClause.push("AND")
        }
        whereClause.push(["environment", "=", environment])
      }
      
      const switches = await this.datastoreService.select('switches', selectCols, whereClause)

      return switches
    } catch (error) {
      console.error(error)
    }
  }
}

export default SwitchService