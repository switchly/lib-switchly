import 'reflect-metadata'
import { Router, Request, Response, NextFunction } from 'express'
// import path from 'path'
// import webpackDevMiddleware from 'webpack-dev-middleware'
// import webpackHotMiddleware from 'webpack-hot-middleware'
// import webpack from 'webpack'
// import helmet from 'helmet'
import Container from 'typedi'
import Loggerhead from '@cornerstone-digital/loggerhead'

import { SwitchlyConfig, SwitchlyDatastores } from './types/index.types'
import SwitchController from './api/modules/switches/switches.controller'
import LoggerService from './services/logger/logger.service'
import getEnumValues from './utils/getEnumValues'

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

  router.use((req: Request, _res: Response, next: NextFunction) => {
    req.app.disable('x-powered-by')
    next()
  })

  // router.use(helmet())

  // if (isProduction) {
  //   // In real app better to use nginx for static assets
  //   const httpHeaders = { maxAge: 31536000, redirect: false, lastModified: true };
  //   router.use(express.static(path.resolve(__dirname, 'dist'), httpHeaders));
  // } else {
  //   const webpackConfig = require(path.join(__dirname, 'webpack.config.js'))
  //   const compiler = webpack(webpackConfig);

  //   router.use(
  //     webpackDevMiddleware(compiler, {
  //       publicPath: webpackConfig.output.publicPath,
  //       serverSideRender: true,
  //       stats: 'errors-only',
  //       logLevel: 'error'
  //     })
  //   );
  //   router.use(webpackHotMiddleware(compiler, { log: console.log }));
  // }

  router.get(`${routePrefix}/switches/list`, (req: Request, res: Response) =>
    controllers.SwitchController.getSwitchesList(req, res)
  )

  router.get(`${routePrefix}/switches/stream`, (req: Request, res: Response) =>
    controllers.SwitchController.getStream(req, res)
  )

  return router
}

export const switchlyDatastores: SwitchlyDatastores = getEnumValues(SwitchlyDatastores)

export default switchlyMiddleware
