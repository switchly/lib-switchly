export interface IEnvironment {
  id: string
  name: string
  key: string
  description: string
  active: boolean
}

class Environment {
  id?: string
  name!: string
  key!: string
  description!: string
  active!: boolean
}

export default Environment