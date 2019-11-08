import { Context, createContext, useContext } from 'react'
import { IFlagContext } from './switchly.types'

const context: Context<IFlagContext> = createContext({ flags: {} })
const { Provider, Consumer } = context

export const useFlags = () => {
  const { flags } = useContext(context)

  return flags
}

export { Provider, Consumer }
export default context
