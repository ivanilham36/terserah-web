import React, { useState, useEffect } from 'react'
//import component bootstrap
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap'
//import BASE URL API
import Api from '../api'
//import js cookie
import Cookies from 'js-cookie'
//hook link
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { notifySuccess } from '../utils/notify'
import { Wordmark } from '../components/common/Logo'
import { ThemeToggle } from '../utils/theme'

const Layout = ({ children }) => {
  //state user
  const [user, setUser] = useState({})
  //navigate & lokasi saat ini (untuk menu aktif)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  //ambil data user yang login
  useEffect(() => {
    Api.get('/api/auth/me')
      .then((response) => setUser(response.data))
      .catch(() => {})
  }, [])

  //function logout
  const logoutHandler = async (e) => {
    e.preventDefault()

    try {
      await Api.post('/api/auth/logout')
    } catch (error) {
      //token mungkin sudah tidak valid, tetap lanjut logout di sisi client
    }

    //remove token
    Cookies.remove('token')
    notifySuccess('Logout berhasil.')
    navigate('/login')
  }

  const initial = (user.name || '?').trim().charAt(0).toUpperCase()

  return (
    <React.Fragment>
      <Navbar expand="md" className="app-nav mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/rooms">
            <Wordmark />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Nav className="me-auto ms-md-3">
              <Nav.Link as={Link} to="/rooms" active={pathname.startsWith('/rooms')}>
                Ruang
              </Nav.Link>
              <Nav.Link as={Link} to="/options" active={pathname.startsWith('/options')}>
                Katalog Opsi
              </Nav.Link>
            </Nav>
            <Nav className="flex-row align-items-center gap-3 mt-3 mt-md-0">
              <ThemeToggle />
              <NavDropdown
                align="end"
                title={
                  <span className="avatar-btn">
                    <span className="avatar">{initial}</span>
                    <span className="d-md-none">{user.name || 'Akun'}</span>
                  </span>
                }
              >
                <NavDropdown.Item as="div" className="small text-muted" style={{ pointerEvents: 'none' }}>
                  {user.email}
                </NavDropdown.Item>
                <NavDropdown.Item onClick={logoutHandler}>Keluar</NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="pb-5" style={{ maxWidth: 1080 }}>
        {children}
      </Container>
    </React.Fragment>
  )
}

export default Layout
