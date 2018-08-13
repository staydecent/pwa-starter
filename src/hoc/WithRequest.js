import React from 'react'
import equal from '/util/equal'
import makeRequest from '/util/makeRequest'
import {getState} from '/store'

const OK_TIME = 30000
const CACHE = {}
const cache = (endpoint, result) => {
  CACHE[endpoint] = {result, timestamp: Date.now()}
  console.log(endpoint, result)
}
const validCache = endpoint => {
  const ts = CACHE[endpoint] && CACHE[endpoint].timestamp
  if (!ts) return false
  const diff = Date.now() - ts
  return diff < OK_TIME
}

export const clearCache = endpoint => {
  CACHE[endpoint] = null
  console.log('clearCache', endpoint, CACHE)
}

export default class WithRequest extends React.Component {
  constructor (props) {
    super(props)
    this.state = {...(this.state || {}), isLoading: true, result: null, error: null}
    this._existing = null
  }

  _performRequest (endpoint, parse) {
    const token = getState().token
    const headers = {}
    if (token) {
      headers.Authorization = `Token ${token}`
    }
    const {xhr, promise} = makeRequest({endpoint, headers})

    this._existing = xhr
    this._existing._endpoint = endpoint

    promise
      .then(result => cache(endpoint, result) || this.setState({result, isLoading: false}))
      .catch(error => console.log('_performRequest', {error}) || this.setState({error, isLoading: false}))
  }

  _loadResult (props) {
    if (!props.request || !props.request.endpoint) {
      return
    }
    if (this._existing && !this.state.error) {
      this._existing.abort()
      this._existing = null
    }

    const {endpoint, parse} = props.request
    if (validCache(endpoint)) {
      this.setState({result: CACHE[endpoint].result, isLoading: false})
    } else {
      this._performRequest(endpoint, parse)
    }
  }

  componentDidMount () {
    this._loadResult(this.props)
  }

  shouldComponentUpdate (nextProps, nextState) {
    const nextEnpoint = (nextProps.request || {}).endpoint
    const currEnpoint = (this.props.request || {}).endpoint
    if (currEnpoint !== nextEnpoint) {
      return true
    }
    return !equal(nextState, this.state)
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (!this._existing) return
    if ((this.props.request || {}).endpoint !== this._existing._endpoint) {
      this._loadResult(this.props)
    }
  }

  render () {
    const child = this.props.children || this.children[0]
    if (!child || typeof child !== 'function') {
      throw new Error('WithRequest requires a function as its only child')
    }
    return child(this.state)
  }
}