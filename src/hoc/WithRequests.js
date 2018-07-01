import Preact from 'preact'
import request from '/util/request'
import {getState} from '/store'

const defaultParse = r => r.result || r

// @TODO: Cache timeout
// @TODO: cancel requests that are no longer valid
const XHRS = {}

export default class WithRequests extends Preact.Component {
  constructor (props) {
    super(props)
    const requests = typeof props.requests === 'function'
      ? props.requests(getState(), props)
      : props.requests
    this.state = {requests, isLoading: true}
  }

  _makeRequests () {
    const requests = this.state.requests || {}
    const keys = Object.keys(requests)

    if (!keys || !keys.length) return

    const results = {}
    const proms = keys.map(k => {
      const {url, parse} = requests[k]
      const {xhr, promise} = XHRS[url] || request({url})
      if (!XHRS[url]) {
        XHRS[url] = {xhr, promise}
      }
      return promise
        .then(r => {
          results[k] = parse ? parse(r) : defaultParse(r)
          return results[k]
        })
    })

    Promise
      .all(proms)
      .then(() => this.setState({_results: results, isLoading: false}))
      .catch(err => this.setState({err}))
  }

  componentDidMount () {
    this._makeRequests()
  }

  render ({children}, {_results = {}, isLoading, err}) {
    const child = children[0]
    if (!child || typeof child !== 'function') {
      throw new Error('WithRequests requires a function as its only child')
    }
    return child({..._results, isLoading, err})
  }
}
