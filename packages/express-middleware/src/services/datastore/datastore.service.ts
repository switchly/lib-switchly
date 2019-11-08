import {Service} from 'typedi';
import {SwitchlyDatastores, DatastoreConfig} from '../../types/index.types';
import ConfigService from '../config/config.service';
import ServiceManager from '../manager';
import { nSQL } from '@nano-sql/core'
import { InanoSQLTableConfig } from '@nano-sql/core/lib/interfaces'
import { Redis } from '@nano-sql/adapter-redis'

const tables: InanoSQLTableConfig[] = [
  {
    name: "switches",
    model: {
        "id:string": { pk: true },
        "name:string": {},
        "key:string": {},
        "description:string": {},
        "active:bool": {},
        "defaultValue:bool": {},
        "enabled:bool": {}
    }
  }
]

@Service()
class DatastoreService {
  private configService: ConfigService
  private serviceManager: ServiceManager = new ServiceManager()
  private type?: SwitchlyDatastores
  private config?: DatastoreConfig

  constructor() {
    this.configService = this.serviceManager.getService<ConfigService>(ConfigService)
  }

  public async init() {
    this.config = this.configService.getConfig().datastore
    this.type = this.config.type || SwitchlyDatastores.Redis
    await this.initializeDatabase()
  }

  private async initializeDatabase(): Promise<void> {
    switch(this.type) {
      case SwitchlyDatastores.Redis: {
        try {
          await nSQL().createDatabase({
            id: this.configService.getConfig().datastore.config.database,
            mode: new Redis({
              host: this.configService.getConfig().datastore.config.host,
              port: this.configService.getConfig().datastore.config.port
            }),
            tables
          })

          if (this.configService.getConfig().datastore.dropDB) {
            await nSQL('switches').query('delete').exec()  
          }
        } catch (error) {
          console.error(error)
        }
      }
    }
  }

  public select(tableName: string, columns?: string[], whereClause?: any[]) {
    const query = nSQL(tableName).query('select', columns)

    if (whereClause) {
      query.where(whereClause)
    }

    return query.exec()
  }

  public delete(tableName: string, whereClause?: any[]) {
    const query = nSQL(tableName).query('delete')

    if (whereClause) {
      query.where(whereClause)
    }

    return query.exec()
  }

  public upsert(tableName: string, data: any, whereClause?: any[]) {
    const query = nSQL(tableName).query('upsert', data)

    if (whereClause) {
      query.where(whereClause)
    }

    return query.exec()
  }

  public total(tableName: string) {
    return nSQL(tableName).query('total', { rebuild: true })
  }

  public async seedTable(tableName: string, data: any) {
    return nSQL(tableName).loadJS(data)
  }
}

export default DatastoreService
