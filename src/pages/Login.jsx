//import hook react
import React, { useState } from 'react'
//import BASE URL API
import Api from '../api'
//import js cookie
import Cookies from 'js-cookie'
//import react router dom
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { notifySuccess } from '../utils/notify'

function Login() {
  //title page
  document.title = 'Login - Terserah!'

  //navigate
  const navigate = useNavigate()

  //state user
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  //state loading
  const [isLoading, setLoading] = useState(false)

  //state validation
  const [validation, setValidation] = useState({})

  //function "loginHandler"
  const loginHandler = async (e) => {
    e.preventDefault()

    //set state isLoading to "true"
    setLoading(true)
    setValidation({})

    await Api.post('/api/auth/login', { email, password })
      .then((response) => {
        setLoading(false)
        //set cookie
        Cookies.set('token', response.data.token)
        notifySuccess('Login berhasil.')
        //redirect
        navigate('/rooms')
      })
      .catch((error) => {
        setLoading(false)
        //simpan response validasi / pesan error ke state "validation"
        setValidation(error.response?.data || { message: 'Tidak dapat terhubung ke server.' })
      })
  }

  //sudah login, langsung arahkan ke halaman ruang
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
              <p className="text-muted mb-0">Putuskan bareng-bareng, tanpa debat panjang.</p>
            </div>
            <div className="card card-soft">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3">Masuk</h5>

                {validation.message && (
                  <div className="alert alert-danger py-2">{validation.message}</div>
                )}

                <form onSubmit={loginHandler}>
                  <label className="mb-1">Email</label>
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
                    placeholder="Password"
                  />
                  {validation.errors?.password && (
                    <div className="text-danger small mb-2">{validation.errors.password[0]}</div>
                  )}

                  <button className="btn btn-brand w-100 mt-3" type="submit" disabled={isLoading}>
                    {isLoading ? 'Memproses...' : 'Masuk'}
                  </button>
                </form>

                <div className="text-center mt-3 small">
                  Belum punya akun? <Link to="/register">Daftar</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
