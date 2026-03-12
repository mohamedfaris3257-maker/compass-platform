import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="text-8xl mb-6">🧭</div>
      <h1 className="font-display text-5xl text-navy mb-4">404</h1>
      <p className="text-2xl font-display text-muted mb-4">You seem a little lost.</p>
      <p className="text-muted font-body mb-8 max-w-md">
        We couldn't find the page you were looking for. Let's get you back on track.
      </p>
      <Link to="/">
        <Button size="lg">Back to Home</Button>
      </Link>
    </div>
  )
}
