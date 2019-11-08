import * as React from 'react'
import { Consumer } from './switchly.context'

const withFlagsConsumer = () => {
  return (WrappedComponent: React.ComponentType) => {
    return (props: any) => (
      <Consumer>
        {({ flags }) => {
          return <WrappedComponent flags={flags} {...props} />
        }}
      </Consumer>
    )
  }
}

export default withFlagsConsumer
