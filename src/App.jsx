import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Group from './pages/Group'
import AdminLogin from './pages/AdminLogin'
import Admin from './pages/Admin'

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/group/:groupName" element={<Group />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<Admin />} />
        </Routes>
    )
}
