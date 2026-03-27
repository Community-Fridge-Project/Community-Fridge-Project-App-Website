import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'

// Pages
import Home      from './pages/Home'
import About     from './pages/About'
import Volunteer from './pages/Volunteer'
import Donate    from './pages/Donate'
import News      from './pages/News'
import Contact   from './pages/Contact'
import Admin     from './pages/Admin'
import NotFound  from './pages/NotFound'

export default function App() {
  return (
    <Router>
      <Routes>
        {/* All public pages share the persistent Layout (header + footer) */}
        <Route path="/" element={<Layout />}>
          <Route index          element={<Home />} />
          <Route path="about"   element={<About />} />
          <Route path="volunteer" element={<Volunteer />} />
          <Route path="donate"  element={<Donate />} />
          <Route path="news"    element={<News />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*"       element={<NotFound />} />
        </Route>

        {/* Admin has its own full-screen layout */}
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  )
}
