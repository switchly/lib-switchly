export interface ISwitch {
  id?: string
  key: string
  enabled: boolean
}

class Switch {
  id?: string
  key: string
  enabled: boolean

  constructor (switchData: ISwitch) {
    this.id = switchData.id
    this.key = switchData.key
    this.enabled = switchData.enabled
  }
}

export default Switch