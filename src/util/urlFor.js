import qs from '/util/qs'
import routePairs from '/routes'

// Transform our `Component => Object` pairs to a single Object.
// The `urlFor` function below will reference it to return a URL string
// for a given name.

const allRoutes = routePairs
  .map(p => p[1])
  .reduce((acc, el) => ({...acc, ...el}), {})

// Get the path string for the route with name `name`
// Best understood with an example:

// ```
// const routes = {
//   myRoute: '/some/:fancy/:route'
// }
// urlFor('myRoute', {
//   args: {fancy: 12, route: 'r2d2'},
//   queries: {search: 'hi'}
// })
// > '/some/12/r2d2?search=hi'
// ```

export const urlFor = (name, {args = {}, queries = {}} = {}) => {
  const rule = allRoutes[name]
  if (!rule) {
    console.warn('No route found for name: ' + name)
    return
  }
  const replaced = Object
    .keys(args)
    .reduce((acc, k) => acc.replace(`:${k}`, args[k]), rule.path)
  const hasQueries = Object.keys(queries).length > 0
  return `${replaced}${!hasQueries ? '' : '?' + qs.stringify(queries)}`
}

export default urlFor
