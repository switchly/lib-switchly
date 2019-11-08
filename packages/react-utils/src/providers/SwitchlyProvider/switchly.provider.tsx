import EventSourcePolyfill from 'event-source-polyfill'
import * as React from 'react'
import { Provider } from './switchly.context'
import { FlagValue, IFlagProviderProps, IFlagProviderState } from './switchly.types'

if (typeof window !== 'undefined') {
  window.EventSource = EventSource || EventSourcePolyfill
}

class SwitchlyProvider extends React.Component<IFlagProviderProps, IFlagProviderState> {
  private eventSource?: EventSource
  private flags: { [key: string]: boolean }
  constructor(props: any) {
    super(props)

    this.flags = {}
    this.state = {
      flags: {}
    }
  }

  private featuresLoaded(flags: any) {
    this.setState({
      flags
    })
  }

  private updateFeature(flagData: FlagValue) {
    let featureUpdated = false
    
    if (this.flags[flagData.key] !== flagData.enabled) {
      this.flags[flagData.key] = flagData.enabled

      featureUpdated = true
    }

    if (featureUpdated) {
      this.setState({
        flags: this.flags
      })
    }
  }

  private onEventSourceOpen (event: Event) {
    this.props.onConnected && this.props.onConnected(event)
  }

  private parseEvent(event: MessageEvent) {
    return JSON.parse(event.data)
  }

  public onFlagsLoaded(event: MessageEvent) {
    const messageJson = JSON.parse(event.data)
    this.flags = messageJson.data

    return this.featuresLoaded(messageJson.data)
  }

  private onFlagUpdated(event: MessageEvent) {
    const messageJson = this.parseEvent(event)
    return this.updateFeature(messageJson.data)
  }

  private attachEventHandlers() {
    this.eventSource && this.eventSource.addEventListener<any>('flags:loaded', this.onFlagsLoaded.bind(this))
    this.eventSource && this.eventSource.addEventListener<any>('flag:updated', this.onFlagUpdated.bind(this))
  }

  private onError(error: Error) {
    this.props.onError && this.props.onError(error)
  }

  private async initEventSource() {
    return new Promise((resolve, reject) => {
      try {
        this.eventSource = new EventSource(this.props.eventUrl)

        if (this.eventSource) {
          this.eventSource.onopen = (event: Event) => {
            this.onEventSourceOpen(event)
          }

          this.attachEventHandlers()
        }

        resolve()
      } catch (error) {
        this.onError(error)
        return reject(error)
      }
    })
  }

  public async componentDidMount() {
    await this.initEventSource()
  }

  public componentWillUnmount() {
    this.eventSource && this.eventSource.close()
  }

  public render(): JSX.Element {
    return <Provider value={this.state}>{this.props.children}</Provider>
  }
}

export default SwitchlyProvider
