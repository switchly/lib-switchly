import { Application } from 'express'
import { LoggerheadConfig } from '@cornerstone-digital/loggerhead'

export interface SwitchConfig {
  key: string
  enabled: boolean
  switches?: SwitchConfig[]
}

export interface SwitchStreamEntry {
  key: string
  enabled: boolean
}

export type SwitchlyDatastores = 'Mongo' | 'Redis'

export interface MongoDatastoreConfig {
  url: string
}

export interface RedisDatastoreConfig {
  url: string
}

export type SwitchlyLanguages = 'React' | 'Node' | 'JAVA' | '.NET' | 'TypeScript'

export interface SwitchlyConfig {
  environment: string
  routePrefix?: string
  offline?: boolean
  logger: LoggerheadConfig
  datastore: {
    type: SwitchlyDatastores
    config: MongoDatastoreConfig | RedisDatastoreConfig
  }
  switches: SwitchConfig[]
}

export interface EventData extends Application {
  id: string
  type: string
  data: string | object | object[]
}
