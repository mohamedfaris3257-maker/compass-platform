import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'

// Redirect to Assessment which handles step 0 (StudentInfo)
export default function StudentInfo() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-5xl mb-4">🧭</div>
      <h1 className="font-display text-3xl text-navy mb-4">Ready to begin?</h1>
      <p className="text-muted font-body mb-8 text-center max-w-md">
        You'll complete a short form about yourself, then answer 40 questions. The whole process takes about 15 minutes.
      </p>
      <Button size="lg" onClick={() => navigate('/assessment')}>
        Start Assessment
      </Button>
    </div>
  )
}
