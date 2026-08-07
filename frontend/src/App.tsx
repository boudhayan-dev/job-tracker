import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import TrackJob from './pages/TrackJob'
import ApplicationDetail from './pages/ApplicationDetail'
import ResumeViewer from './pages/ResumeViewer'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/track" element={<TrackJob />} />
      <Route path="/applications/:id" element={<ApplicationDetail />} />
      <Route path="/applications/:id/resume" element={<ResumeViewer />} />
    </Routes>
  )
}

export default App
