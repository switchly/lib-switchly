import { Application } from 'express'
import { LoggerheadConfig } from '@cornerstone-digital/loggerhead'

export interface SwitchConfig {
  id?: string
  key: string
  enabled: boolean
  switches?: SwitchConfig[]
}

export interface SwitchStreamEntry {
  key: string
  enabled: boolean
}

export enum SwitchlyDatastores {
  Mongo = 'Mongo',
  Redis = 'Redis'
}

export interface MongoDatastoreConfig {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database: string;
}

export interface RedisDatastoreConfig {
  host?: string;
  port?: number;
  database: string;
}

export enum SwitchlyLanguages {
  React = 'React',
  Node = 'Node',
  Java = 'Java',
  DotNet = 'DotNet',
  TypeScript = 'TypeScript'
}

export interface DatastoreConfig {
  type: SwitchlyDatastores
  dropDB?: boolean,
  config: RedisDatastoreConfig | MongoDatastoreConfig
}

export interface SwitchlyConfig {
  environment: string
  routePrefix?: string
  offline?: boolean
  logger: LoggerheadConfig
  datastore: DatastoreConfig
  switches?: SwitchConfig[],
  demoMode?: boolean
}

export interface EventData extends Application {
  id: string
  type: string
  data: string | object | object[]
}
