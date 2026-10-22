//import hook react
import React, { useState } from 'react'
//import BASE URL API
import Api from '../api'
//import js cookie
import Cookies from 'js-cookie'
//import react router dom
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { notifySuccess } from '../utils/notify'

function Register() {
  //title page
  document.title = 'Daftar - Terserah!'

  //navigate
  const navigate = useNavigate()

  //state form
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  //state loading & validation
  const [isLoading, setLoading] = useState(false)
  const [validation, setValidation] = useState({})

  //function "registerHandler"
  const registerHandler = async (e) => {
    e.preventDefault()

    setLoading(true)
    setValidation({})

    await Api.post('/api/auth/register', { name, email, password })
      .then((response) => {
        setLoading(false)
        //set cookie (register langsung login)
        Cookies.set('token', response.data.token)
        notifySuccess('Akun berhasil dibuat.')
        navigate('/rooms')
      })
      .catch((error) => {
        setLoading(false)
        setValidation(error.response?.data || { message: 'Tidak dapat terhubung ke server.' })
      })
  }

  if (Cookies.get('token')) {
    return <Navigate to="/rooms" replace />
  }

  return (
    <div className="auth-wrap">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4">
            <div className="text-center mb-4">
              <h2 className="brand">Terserah!</h2>
              <p className="text-muted mb-0">Buat akun untuk mulai memutuskan bareng.</p>
            </div>
            <div className="card card-soft">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3">Daftar</h5>

                {validation.message && !validation.errors && (
                  <div className="alert alert-danger py-2">{validation.message}</div>
                )}

                <form onSubmit={registerHandler}>
                  <label className="mb-1">Nama</label>
                  <input
                    type="text"
                    className="form-control mb-1"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama lengkap"
                  />
                  {validation.errors?.name && (
                    <div className="text-danger small mb-2">{validation.errors.name[0]}</div>
                  )}

                  <label className="mb-1 mt-2">Email</label>
                  <input
                    type="email"
                    className="form-control mb-1"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                  />
                  {validation.errors?.email && (
                    <div className="text-danger small mb-2">{validation.errors.email[0]}</div>
                  )}

                  <label className="mb-1 mt-2">Password</label>
                  <input
                    type="password"
                    className="form-control mb-1"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                  />
                  {validation.errors?.password && (
                    <div className="text-danger small mb-2">{validation.errors.password[0]}</div>
                  )}

                  <button className="btn btn-brand w-100 mt-3" type="submit" disabled={isLoading}>
                    {isLoading ? 'Memproses...' : 'Daftar'}
                  </button>
                </form>

                <div className="text-center mt-3 small">
                  Sudah punya akun? <Link to="/login">Masuk</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
