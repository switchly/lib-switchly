import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { default as SwitchyProvider } from '../providers/SwitchlyProvider/switchly.provider'
import { default as withFlagsConsumer } from '../providers/SwitchlyProvider/switchly.consumer'

const App = (props) => {
  console.log(props)

  return <h1>Hello World</h1>
}

const AppWithFlags = withFlagsConsumer()(App)

ReactDOM.render(
  <SwitchyProvider 
    eventUrl='http://localhost:3000/basket/switches/stream'
  >
    <AppWithFlags />
  </SwitchyProvider>,
  document.getElementById('root')
)