import 'reflect-metadata'
import { Router, Request, Response } from 'express'
import { SwitchlyConfig } from './types/index.types'
import SwitchController from './app/modules/switches/switches.controller'
import Container from 'typedi'
import Loggerhead from '@cornerstone-digital/loggerhead'
import LoggerService from './services/logger/logger.service'

const initControllers = (config: SwitchlyConfig) => {
  return {
    SwitchController: new SwitchController(config)
  }
}

const switchlyMiddleware = (router: Router, config: SwitchlyConfig): Router => {
  const routePrefix = config.routePrefix || ''
  const controllers = initControllers(config)
  const logger: Loggerhead = Container.get(LoggerService).getLogger('SwitchlyMiddleware')

  logger.info('Middlware Loaded')

  router.get(`${routePrefix}/switches/list`, (req: Request, res: Response) =>
    controllers.SwitchController.getSwitchesList(req, res)
  )

  router.get(`${routePrefix}/switches/stream`, (req: Request, res: Response) =>
    controllers.SwitchController.getStream(req, res)
  )

  return router
}

export default switchlyMiddleware
