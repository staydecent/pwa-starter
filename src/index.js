import { render } from 'react'

// Entry Point of Your App
// -----------------------

// `src/index.js` contains your top-most Component that will be mounted to the DOM and
// is the entry point for your entire app. Everything starts here!

// We use [atom](https://github.com/staydecent/atom) for global state management.
// It is a tiny alternative to Redux, yet maintains compatibility with Redux DevTools!

// [inputlogic/elements](https://github.com/inputlogic/elements) houses common Components
// that many PWAs will end up needing. In this case, we are importing Helmet for managing
// title and meta tags, Notification for displaying notifications, and Router which may be
// the most important Component of all.
import Helmet from '@app-elements/helmet'
import Notification from '@app-elements/notification'
import { Router, RouteProvider } from '@app-elements/router'
import { configure } from '@app-elements/use-request/request'

// Here, we import Components we want to render on *all* routes. For example,
// we include a GlobalHeader, and a *NotFound* component which renders when no route is
// matched. (If your app does not need these global elements, you can of course remove them.)
import { AllModals } from '/elements/all-modals'
import { GlobalHeader } from '/elements/global-header'
import { NotFound } from '/elements/not-found'

// We'll also import this file that extends some native functions.
import '/util/extend-xhr'

// ### Our top-level components

import { AuthApp, routes as authRoutes } from '/apps/auth'
import { MainApp, routes as mainRoutes } from '/apps/main'
import { MarketingApp, routes as marketingRoutes } from '/apps/marketing'

// Settings
import { API_URL } from '/consts'

// Configure the request function
configure({ apiUrl: API_URL, storage: window.localStorage })

// Define our top-level routes
const routes = {
  main: {
    routes: mainRoutes,
    component: MainApp
  },
  auth: {
    routes: authRoutes,
    component: AuthApp
  },
  marketing: {
    routes: marketingRoutes,
    component: MarketingApp
  }
}

// And, finally, our Root! This is the top-level Component to render
// into the DOM and kick-start our entire app!

// First, our entire app is wrapped in the RouteProvider component, which must
// be given the top-level routes object. RouteProvider exposes the route context
// to all child components.
// Then we include the Component's that we want to be rendered on *all* routes.
function Root () {
  return (
    <RouteProvider routes={routes}>
      <div className='main-app-container'>
        {/* ___CHANGEME___ */}
        <Helmet
          title='Welcome'
          titleTemplate='PWA Starter | %s'
          defaultTitle='Welcome'
        />

        <AllModals />
        <GlobalHeader />
        <Notification />
        <Router routes={routes} />
        <NotFound />
      </div>
    </RouteProvider>
  )
}

render(<Root />, document.getElementById('root'))
