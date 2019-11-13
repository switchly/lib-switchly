import * as React from 'react'
import { renderRoutes } from 'react-router-config'


class MainTemplate extends React.PureComponent<any, {}> {
  public render(): JSX.Element {
    const { route, children } = this.props

    return (
      <React.Fragment>
        {children}
        {route && renderRoutes(route.routes)}
      </React.Fragment>
    )
  }
}

export default MainTemplate
