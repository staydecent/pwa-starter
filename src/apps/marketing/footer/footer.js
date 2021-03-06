import { Link } from '@app-elements/router'

export function MarketingFooter () {
  return (
    <div className='footer bg-white'>
      <div className='container'>
        <div className='pt-4 pb-8'>
          <div className='grid-4'>
            <div className='measure-narrow'>
              <h1>PWA</h1>
              <p>We're a neat, little company making an awesome app for you!</p>
            </div>
            <div className='measure-narrow'>&nbsp;</div>
            <nav>
              <h2 className='nav-title'>Product</h2>
              <Link name='home'>Home</Link>
              <Link name='home'>Home</Link>
              <Link name='home'>Home</Link>
              <Link name='home'>Home</Link>
            </nav>
            <nav>
              <h2 className='nav-title'>Company</h2>
              <Link name='home'>Home</Link>
              <Link name='home'>Home</Link>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}
