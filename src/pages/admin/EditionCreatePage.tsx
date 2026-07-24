import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { EditionForm } from './components/EditionForm'

export default function EditionCreatePage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/admin/editions">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Link>
        </Button>
        <h2 className="text-2xl font-bold text-gray-800">Nova Edição</h2>
      </div>
      <EditionForm onSaved={(id) => navigate(`/admin/editions/${id}`)} />
    </div>
  )
}
