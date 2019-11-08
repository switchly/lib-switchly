import EventSourcePolyfill from 'event-source-polyfill'
import * as React from 'react'
import { Provider } from './switchly.context'
import { FlagValue, IFlagProviderProps, IFlagProviderState } from './switchly.types'
import { TSMap } from 'typescript-map'

if (typeof window !== 'undefined') {
  window.EventSource = EventSource || EventSourcePolyfill
}

class SwitchlyProvider extends React.Component<IFlagProviderProps, IFlagProviderState> {
  private eventSource?: EventSource
  private flags: FlagValue[]
  constructor(props: any) {
    super(props)

    this.flags = []
    this.state = {
      flags: {}
    }
  }

  private featuresLoaded(flags: any) {
    this.setState({
      flags: this.flattenFlags(flags)
    })
  }

  flattenFlags (flags: FlagValue[]) {
    const flattened: { [key: string]: boolean } = {}

    try {
      flags.forEach((flag: FlagValue) => {
        flattened[flag.key] = flag.enabled
      })
    } catch (e) {
      console.error(e)
    }

    return flattened
  }

  private updateFlag (flagData: FlagValue) {
    let flagUpdated = false
    const updatedFlags = this.flags.map((flag) => {
      if (flag.key === flagData.key && flag.enabled !== flagData.enabled) {
        flag = {
          ...flag,
          ...flagData
        }

        flagUpdated = true
      }

      return flag
    })

    if (flagUpdated) {
      this.flags = updatedFlags
      this.setState({
        flags: this.flattenFlags(updatedFlags)
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
    return this.updateFlag(messageJson.data)
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
