import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="section-py section-container text-center min-h-[60vh] flex flex-col
                    items-center justify-center">
      <span className="text-7xl mb-6" role="img" aria-label="Fridge">🧊</span>
      <h1 className="text-5xl font-extrabold text-gray-900 mb-3">404</h1>
      <h2 className="text-2xl font-bold text-gray-700 mb-4">Page Not Found</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        Oops — this page is empty, like a fridge that needs restocking.
        Let's get you back on track.
      </p>
      <Link to="/" className="btn-primary text-base px-8 py-4">
        Back to Home
      </Link>
    </div>
  )
}
