import { useParams } from 'react-router-dom'

export default function ApplicationDetail() {
  const { id } = useParams()
  return <div className="p-md">Application Detail for {id} — coming next</div>
}
