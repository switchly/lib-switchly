import { Request, Response } from 'express'
import uuid from 'uuid'
import ConfigService from '../../../services/config/config.service'
import ServiceManager from '../../../services/manager'
import { SwitchlyConfig } from '../../../types/index.types'
import Loggerhead from '@cornerstone-digital/loggerhead'
import LoggerService from '../../../services/logger/logger.service'
import SwitchService from '../../../services/switch/switch.service'

class SwitchController {
  private serviceManager: ServiceManager = new ServiceManager()
  private configService: ConfigService
  private switchService: SwitchService
  private logger: Loggerhead

  public constructor(config: SwitchlyConfig) {
    this.configService = this.serviceManager.getService<ConfigService>(ConfigService)
    this.switchService = this.serviceManager.getService<SwitchService>(SwitchService)
    this.logger = this.serviceManager.getService<LoggerService>(LoggerService).getLogger('Switchly:Controller')
    this.initServices(config)

    return this
  }

  private async initServices(config: SwitchlyConfig) {
    await this.configService.init(config)
    await this.switchService.init()
  }

  public createEvent(
    type: string,
    data: any
  ): { id: string; type: string; data: string | object | object[] } {
    return {
      id: uuid.v4(),
      type,
      data
    }
  }

  private async fetchRandomSwitch() {
    const switches = await this.switchService.getSwitches(
      this.configService.getConfig().project,
      this.switchService.environmentName
    )
    const keyArr = Object.keys(switches)

    return keyArr[Math.floor(Math.random() * keyArr.length)]
  }

  public constructSSE(res: Response, type: string, id: string, data: any): void {
    res.write('id: ' + id + '\n')
    res.write('event: ' + type + '\n')
    res.write('data: ' + JSON.stringify(this.createEvent(type, data)) + '\n\n')
  }

  public async getSwitchesList(_req: Request, res: Response): Promise<any> {
    this.logger.info('Getting switch list')
    const switches = await this.switchService.getSwitches(
      this.configService.getConfig().project,
      this.switchService.environmentName
    )
    return res.status(200).send(switches)
  }

  public async updateFlag(req: Request, res: Response): Promise<any> {

    req.app.emit(
      'flag:event',
      this.createEvent('flag:updated', {
        key: req.body.key,
        enabled: req.body.enabled
      })
    )

    return res.status(200).send('Flag updated')
  }

  public async enableStream(_req: Request, res: Response) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    })

    res.write('\n')
  }

  public async getStream(req: Request, res: Response): Promise<void> {
    this.logger.info('Switch stream connected')
    try {
      await this.enableStream(req, res)    
  
      const switches = await this.switchService.getSwitches(
        this.configService.getConfig().project,
        this.switchService.environmentName
      )
      
      this.constructSSE(res, 'flags:loaded', uuid.v4(), switches)
  
      req.app.on('flag:event', (event: any) => {
        this.constructSSE(res, event.type, event.id, event.data)

        return this
      })

      if (this.configService.getConfig().demoMode) {
        setInterval(async () => {
          const key = await this.fetchRandomSwitch()
          req.app.emit(
            'flag:event',
            this.createEvent('flag:updated', {
              key,
              enabled: !Math.round(Math.random())
            })
          )
        }, 5000)
      }

      req.on('close', () => {
        req.app.removeAllListeners()
        res.end()
      })
    } catch (error) {
      console.error(error)
    }
  }
}

export default SwitchController
