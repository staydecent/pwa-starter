// This is our global store. Which is basically just an single, global JavaScript object,
// which is immutable. Meaning you cannot mutate the object directly, but instead must call
// `store.setState` or dispatch actions similar to redux.

import createStore from 'atom'
import devtools from 'atom/devtools'

import pathReducer from '@wasmuth/path-reducer'

import { DEBUG } from '/consts'

// Load state set by react-snap during prerendering
const preloadedState = window.__PRELOADED_STATE__
delete window.__PRELOADED_STATE__ // let it get garbage-collected

// Define the global state on page load.
export const initialState = {
  clicks: 0,
  // In the browser, we initialize the currentPath prop, which is set
  // by [Router](https://github.com/inputlogic/elements/tree/master/components/router)
  currentPath: typeof window !== 'undefined'
    ? window.location.pathname + window.location.search
    : '/',
  // `pendingRequests` is used by the [WithRequest](https://github.com/inputlogic/elements/tree/master/components/with-request) HoC.
  pendingRequests: 0,
  // Pre-rendering will have already computed some values for global state,
  // and should be initialized on the client.
  ...(
    typeof window !== 'undefined'
      ? preloadedState || {}
      : {}
  )
}

// You can either define your reducers here, or add them later with:
// `store.addReducer(reducer)`
const reducers = [
  pathReducer
]

// If DEBUG is true, we will enable Redux devtools
const store = typeof window !== 'undefined' && DEBUG
  ? devtools(createStore(reducers, initialState))
  : createStore(reducers, initialState)

// Tell react-snap how to save Redux state
window.snapSaveState = () => ({
  __PRELOADED_STATE__: store.getState()
})

export default store

export const getState = store.getState
export const setState = store.setState

// This is a simple Provider used in the RootApp to provide the
// store instance on the React Context, so any child Component can
// access it.
export function Provider (props) {
  this.getChildContext = () => ({ store: props.store })
}
Provider.prototype.render = props => props.children[0]
