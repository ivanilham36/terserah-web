import React, { useState, useEffect } from 'react'
//import component bootstrap
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap'
//import BASE URL API
import Api from '../api'
//import js cookie
import Cookies from 'js-cookie'
//hook link
import { useNavigate, Link } from 'react-router-dom'
import { notifySuccess } from '../utils/notify'

const Layout = ({ children }) => {
  //state user
  const [user, setUser] = useState({})
  //navigate
  const navigate = useNavigate()

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

  return (
    <React.Fragment>
      <Navbar bg="white" expand="md" className="shadow-sm mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/rooms" className="brand fs-4">
            Terserah!
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/rooms">
                Ruang
              </Nav.Link>
              <Nav.Link as={Link} to="/options">
                Katalog Opsi
              </Nav.Link>
            </Nav>
            <Nav>
              <NavDropdown title={user.name || 'Akun'} align="end">
                <NavDropdown.Item onClick={logoutHandler}>Logout</NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="pb-5">{children}</Container>
    </React.Fragment>
  )
}

export default Layout
