import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import AppLayout from './components/AppLayout.jsx'
import { LoginModal, UpgradeModal } from './components/Modals.jsx'
import Landing from './pages/Landing.jsx'
import ImageDetection from './pages/ImageDetection.jsx'
import VideoDetection from './pages/VideoDetection.jsx'
import Batch from './pages/Batch.jsx'
import Reports from './pages/Reports.jsx'
import Performance from './pages/Performance.jsx'
import ApiSettings from './pages/ApiSettings.jsx'
import { useRoute, navigate } from './router.jsx'
import { useStore } from './store.jsx'
import { useEffect } from 'react'

const TITLES = {
  image: 'Image detection',
  video: 'Video detection',
  batch: 'Batch processing',
  reports: 'Reports',
  performance: 'Model performance',
  api: 'Settings',
}

export default function App() {
  const path = useRoute()
  const { modal } = useStore()
  const parts = path.split('/').filter(Boolean)

  useEffect(() => {
    if (path === '/app' || path === '/app/') navigate('/app/image')
  }, [path])

  let body
  if (parts[0] !== 'app') {
    body = (
      <>
        <Navbar />
        <Landing />
        <Footer />
      </>
    )
  } else {
    const page = parts[1] || 'image'
    const pages = {
      image: <ImageDetection />,
      video: <VideoDetection />,
      batch: <Batch />,
      reports: <Reports id={parts[2]} />,
      performance: <Performance />,
      api: <ApiSettings />,
    }
    body = (
      <AppLayout path={'/app/' + page} title={TITLES[page] || 'Image detection'}>
        {pages[page] || pages.image}
      </AppLayout>
    )
  }
  return (
    <>
      {body}
      {modal === 'login' && <LoginModal />}
      {modal === 'upgrade' && <UpgradeModal />}
    </>
  )
}
