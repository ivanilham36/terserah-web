//import hook react
import React, { useState } from 'react'
//import BASE URL API
import Api from '../api'
//import js cookie
import Cookies from 'js-cookie'
//import react router dom
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { notifySuccess } from '../utils/notify'
import AuthShell from '../components/common/AuthShell'

function Login() {
  //title page
  document.title = 'Masuk - Terserah!'

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
    <AuthShell>
      <h1 className="auth-title">Selamat datang kembali</h1>
      <p className="text-muted mb-4">Masuk untuk melanjutkan ke ruang keputusanmu.</p>

      {validation.message && <div className="alert alert-danger py-2">{validation.message}</div>}

      <form onSubmit={loginHandler}>
        <label className="mb-1">Email</label>
        <input
          type="email"
          className="form-control mb-1"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama@email.com"
        />
        {validation.errors?.email && <div className="text-danger small mb-2">{validation.errors.email[0]}</div>}

        <div className="d-flex justify-content-between align-items-end mt-3">
          <label className="mb-1">Password</label>
          <Link to="/forgot-password" className="small mb-1">
            Lupa password?
          </Link>
        </div>
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

        <button className="btn btn-brand btn-lg w-100 mt-4" type="submit" disabled={isLoading}>
          {isLoading ? 'Memproses...' : 'Masuk'}
        </button>
      </form>

      <div className="mt-3 small">
        Belum punya akun? <Link to="/register">Daftar</Link>
      </div>
    </AuthShell>
  )
}

export default Login
