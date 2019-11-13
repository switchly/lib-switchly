import 'reflect-metadata'
import express, { Router, Request, Response, NextFunction } from 'express'
import Container from 'typedi'
import Loggerhead from '@cornerstone-digital/loggerhead'
import bodyParser from 'body-parser'
import path from 'path'

import { SwitchlyConfig, SwitchlyDatastores } from './types/index.types'
import SwitchController from './api/modules/switches/switches.controller'
import LoggerService from './services/logger/logger.service'
import getEnumValues from './utils/getEnumValues'
import SwitchService from './services/switch/switch.service'

const initControllers = (config: SwitchlyConfig) => {
  return {
    SwitchController: new SwitchController(config)
  }
}

const switchlyMiddleware = (router: Router, config: SwitchlyConfig): Router => {
  // const isProduction = process.env.NODE_ENV === 'production'
  const routePrefix = config.routePrefix || ''
  const controllers = initControllers(config)
  const logger: Loggerhead = Container.get(LoggerService).getLogger('Switchly:Middleware')

  logger.info('Middlware Loaded')
  let staticPath = path.resolve('node_modules/@cornerstone-digital/switchly-express-middleware/dist/app')

  router.use(express.static(path.join(__dirname, staticPath)))
  router.use(bodyParser.json({ limit: '2mb' }))
  router.use(bodyParser.urlencoded({ limit: '2mb', extended: true }))
  router.use(async (req: Request, _res: Response, next: NextFunction) => {
    req.app.disable('x-powered-by')
    const switchService = Container.get(SwitchService)
    const flags = await switchService.getSwitches(
      config.project,
      switchService.environmentName
    )

    req.app.set('flags', flags)
    next()
  })
  
  router.post(`${routePrefix}/switches/update`, (req: Request, res: Response) =>
    controllers.SwitchController.updateFlag(req, res)
  )

  router.get(`${routePrefix}/switches/list`, (req: Request, res: Response) =>
    controllers.SwitchController.getSwitchesList(req, res)
  )

  router.get(`${routePrefix}/switches/stream`, (req: Request, res: Response) =>
    controllers.SwitchController.getStream(req, res)
  )

  router.get(routePrefix, (_req: Request, res: Response) => {
    res.sendFile('index.html', {root: path.join(__dirname, staticPath)});
  })

  return router
}

export const switchlyDatastores: SwitchlyDatastores = getEnumValues(SwitchlyDatastores)

export default switchlyMiddleware
