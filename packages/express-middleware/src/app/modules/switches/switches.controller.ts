import { Request, Response } from 'express'
import uuid from 'uuid'
import ConfigService from '../../../services/config/config.service'
import ServiceManager from '../../../services/manager'
import { SwitchlyConfig } from '../../../types/index.types'
import Loggerhead from '@cornerstone-digital/loggerhead'
import Container from 'typedi'
import LoggerService from '../../../services/logger/logger.service'

class SwitchController {
  private serviceManager: ServiceManager = new ServiceManager()
  private configService: ConfigService
  private logger: Loggerhead

  public constructor(config: SwitchlyConfig) {
    this.configService = this.serviceManager.getService<ConfigService>(ConfigService)
    this.configService.init(config)
    this.configService.syncConfig()
    this.logger = Container.get(LoggerService).getLogger('SwitchController')

    return this
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
    const switches = await this.configService.getSwitches()
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
    const switches = await this.configService.getSwitches()
    return res.status(200).send(switches)
  }

  public async getStream(req: Request, res: Response): Promise<void> {
    this.logger.info('Switch stream connected')
    try {
      req.socket.setNoDelay(true)
      res.writeHead(200, {
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Content-Type': 'text/event-stream',
        'Access-Control-Allow-Origin': '*',
        'Encoding-Type': 'chunked'
      })

      res.write('\n')
      const switches = await this.configService.getSwitches()
      this.constructSSE(res, 'flags:loaded', uuid.v4(), switches)

      req.app.on('flag:event', (event: any) => {
        this.constructSSE(res, event.type, event.id, event.data)

        return this
      })

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
