//import react router dom
import { Routes, Route, Navigate } from 'react-router-dom'

//import component private routes
import PrivateRoute from './PrivateRoutes'

//import pages
import Landing from '../pages/Landing.jsx'
import Login from '../pages/Login.jsx'
import Register from '../pages/Register.jsx'
import ForgotPassword from '../pages/ForgotPassword.jsx'
import RoomsIndex from '../pages/rooms/Index.jsx'
import RoomShow from '../pages/rooms/Show.jsx'
import OptionsIndex from '../pages/options/Index.jsx'

function RoutesIndex() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      {/* rute tidak dikenal kembali ke beranda */}
      <Route path="*" element={<Navigate to="/" replace />} />

      {/* route publik */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* private route */}
      <Route
        path="/rooms"
        element={
          <PrivateRoute>
            <RoomsIndex />
          </PrivateRoute>
        }
      />
      <Route
        path="/rooms/:id"
        element={
          <PrivateRoute>
            <RoomShow />
          </PrivateRoute>
        }
      />
      <Route
        path="/options"
        element={
          <PrivateRoute>
            <OptionsIndex />
          </PrivateRoute>
        }
      />
    </Routes>
  )
}

export default RoutesIndex


