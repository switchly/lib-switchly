import { Service } from 'typedi'
import ConfigService from '../config/config.service'
import Loggerhead from '@cornerstone-digital/loggerhead'
import ServiceManager from '../manager'

@Service()
class LoggerService {
  private configService: ConfigService
  private serviceManager: ServiceManager = new ServiceManager()

  constructor() {
    this.configService = this.serviceManager.getService<ConfigService>(ConfigService)
  }

  public getLogger(namespace: string): Loggerhead {
    const loggerConfig = this.configService.getConfig().logger
    if (namespace) {
      loggerConfig.namespace = namespace
    }

    return new Loggerhead(loggerConfig)
  }
}

export default LoggerService
