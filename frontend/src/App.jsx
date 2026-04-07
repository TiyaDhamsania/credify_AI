import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Landing from './pages/Landing'
import Apply   from './pages/Apply'
import Result  from './pages/Result'
import Navbar  from './components/Navbar'

export default function App() {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/"       element={<Landing />} />
          <Route path="/apply"  element={<Apply />} />
          <Route path="/result" element={<Result />} />
        </Routes>
      </AnimatePresence>
    </div>
  )
}
