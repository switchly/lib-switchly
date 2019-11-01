import EventTargetPolyfill from '@mattkrick/event-target-polyfill'
import EventSourcePolyfill from '@mattkrick/event-source-polyfill'
import camelCase from 'lodash.camelcase'
import React from 'react'
import { Provider } from './switchly.context'
import { FlagValue } from './switchly.types'

window.EventTarget = EventTarget || EventTargetPolyfill
window.EventSource = EventSource || EventSourcePolyfill

interface IFlagProviderProps {
  eventUrl: string
  onConnected: (event: Event) => void
  onFlagsLoaded: (event: Event) => void
  onFlagUpdated: (event: Event) => void
  onError: (error: Error) => void
}

interface IFlagProviderState {
  flags: { [key: string]: boolean }
}

class FlagsProvider extends React.Component<IFlagProviderProps, IFlagProviderState> {
  private eventSource?: EventSource
  private flags: FlagValue[]
  constructor(props: any) {
    super(props)

    this.flags = []
    this.state = {
      flags: {}
    }
  }

  public flattenFlags(flags: FlagValue[]) {
    const flattened: { [key: string]: boolean } = {}

    try {
      flags.forEach((flag: FlagValue) => {
        flattened[camelCase(flag.key)] = flag.enabled
      })
    } catch (e) {
      console.error(e)
    }

    return flattened
  }

  public featuresLoaded(flags: FlagValue[]) {
    this.setState({
      flags: this.flattenFlags(flags)
    })
  }

  public updateFeature(flagData: FlagValue) {
    let featureUpdated = false
    const updatedFlags = this.flags.map(feature => {
      if (feature.key === flagData.key && feature.enabled !== flagData.enabled) {
        feature = {
          ...feature,
          ...flagData
        }

        featureUpdated = true
      }

      return feature
    })

    if (featureUpdated) {
      this.flags = updatedFlags
      this.setState({
        flags: this.flattenFlags(updatedFlags)
      })
    }
  }

  public onEventSourceOpen = (event: Event) => {
    this.props.onConnected(event)
  }

  public parseEvent(event: MessageEvent) {
    return JSON.parse(event.data)
  }

  public onFlagsLoaded(event: MessageEvent) {
    const messageJson = this.parseEvent(event)
    this.flags = messageJson.data
    return this.featuresLoaded(messageJson.data)
  }

  public onFlagUpdated(event: MessageEvent) {
    const messageJson = this.parseEvent(event)
    return this.updateFeature(messageJson.data)
  }

  public attachEventHandlers() {
    this.eventSource && this.eventSource.addEventListener<any>('flags:loaded', this.onFlagsLoaded)
    this.eventSource && this.eventSource.addEventListener<any>('flag:updated', this.onFlagUpdated)
  }

  public onError(error: Error) {
    this.props.onError(error)
  }

  public async initEventSource() {
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

export default FlagsProvider
