import AJV from 'ajv'
import { SwitchlyConfig } from '../types/index.types'

const configSchema = {
  type: 'object',
  properties: {
    additionalProperties: true,
    namespace: { type: 'string', default: '' },
    enabled: { type: 'boolean', default: true },
    level: { enum: [0, 1, 2, 3, 4, 5, 6, 7], default: 2 },
    timeStamp: { type: 'boolean', default: true },
    timeStampFormat: { type: 'string', default: 'YYYY-MM-DD HH:mm:ss' },
    logFile: {
      default: {},
      properties: {
        enabled: { type: 'boolean', default: true },
        fileName: { type: 'string', default: 'debug.log' },
        options: {
          default: {},
          properties: {
            path: { type: 'string', default: `${process.cwd()}/.logs` },
            interval: { type: 'string', default: '1d' },
            compress: { type: 'boolean', default: true },
            immutable: { type: 'boolean', default: false },
            size: { type: 'string', default: '10M' },
            maxFiles: { type: 'number', default: 7 }
          }
        }
      }
    },
    masking: {
      default: {},
      properties: {
        enabled: { type: 'boolean', default: false },
        enableDefaults: {
          properties: {
            email: { type: 'boolean', default: false },
            phone: { type: 'boolean', default: false },
            postcode: { type: 'boolean', default: false },
            password: { type: 'boolean', default: false },
            jwt: { type: 'boolean', default: false }
          }
        },
        rules: {
          type: 'array',
          default: [],
          items: [
            {
              type: 'object',
              if: { properties: { name: { const: 'RegEx' } } },
              then: { properties: { matchValue: { format: 'regex' } } },
              properties: {
                name: { type: 'string' },
                type: { enum: ['Key', 'KeyIncludes', 'RegEx'] },
                matchValue: { type: 'string' },
                replaceWith: { type: 'string' }
              }
            }
          ]
        }
      }
    }
  }
}

const configValidator = new AJV({ allErrors: true, useDefaults: true })

const getConfig = (config: SwitchlyConfig): SwitchlyConfig => {
  configValidator.validate(configSchema, config)

  if (configValidator.errors && Array.isArray(configValidator.errors)) {
    console.error(configValidator.errors)
    process.exit()
  }

  return config
}

export default getConfig
