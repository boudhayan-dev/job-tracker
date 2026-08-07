import { useParams } from 'react-router-dom'

export default function ResumeViewer() {
  const { id } = useParams()
  return <div className="p-md">Resume Viewer for {id} — coming next</div>
}
