import { IEnvironment } from '..'
import { getObjectId } from '../../utils/objectIdUtils'

export const envNames = [ 
  'DEV',
  'DEV-1',
  'INT',
  'INT-1',
  'QA',
  'QA-1',
  'SIT-1',
  'SIT-3',
  'PAT',
  'PROD-A',
  'PROD-B'
]

const environments: IEnvironment[] = envNames.map((envName: string) => {
  const envKey = envName.toLowerCase().replace(' ', '-')
  return {
    id: getObjectId(envName).toHexString(),
    name: envName,
    key: envKey,
    description: `${envName} Environment`,
    active: true
  }
})

export default environments