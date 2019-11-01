import React, { ComponentType } from 'react'
import { Consumer } from './switchly.context'

const withFlagsConsumer = () => {
  return (WrappedComponent: ComponentType) => {
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
