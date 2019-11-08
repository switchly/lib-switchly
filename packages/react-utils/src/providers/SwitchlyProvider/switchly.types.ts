export interface FlagValue {
  id: string
  key: string
  enabled: boolean
}

export interface IFlagContext {
  flags: { [key: string]: boolean }
}

export interface IFlagProviderProps {
  eventUrl: string
  onConnected?: (event: Event) => void
  onFlagsLoaded?: (event: Event) => void
  onFlagUpdated?: (event: Event) => void
  onError?: (error: Error) => void
}

export interface IFlagProviderState {
  flags: { [key: string]: boolean }
}