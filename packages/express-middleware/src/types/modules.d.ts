declare module 'react-express-middleware'
declare module 'node-sass-middleware'
declare module 'react-ssr'
declare module 'react-router-dom/BrowserRouter'

declare module NodeJS  {
  interface Global {
    EventSource: any
  }
}