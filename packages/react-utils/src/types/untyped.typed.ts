declare module 'event-source-polyfill'

declare namespace NodeJS {
  export interface Global {
    EventSource: any
  }
}