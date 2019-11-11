export interface ISwitch {
  id?: string
  key: string
  project: string
  environment: string
  enabled: boolean
}

class Switch {
  id?: string
  key: string
  project: string
  environment: string
  enabled: boolean

  constructor (switchData: ISwitch) {
    this.id = switchData.id
    this.key = switchData.key
    this.enabled = switchData.enabled
    this.project = switchData.project
    this.environment = switchData.environment
  }
}

export default Switch