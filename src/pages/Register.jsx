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
import GoogleButton from '../components/common/GoogleButton'

function Register() {
  //title page
  document.title = 'Daftar - Terserah!'

  //navigate
  const navigate = useNavigate()

  //state form
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
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

    await Api.post('/api/auth/register', { name, username, email, password })
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
    <AuthShell>
      <h1 className="auth-title">Buat akunmu</h1>
      <p className="text-muted mb-4">Gratis. Cukup satu menit sampai ruang pertamamu siap.</p>

      {validation.message && !validation.errors && <div className="alert alert-danger py-2">{validation.message}</div>}

      <form onSubmit={registerHandler}>
        <label className="mb-1">Nama</label>
        <input
          type="text"
          className="form-control mb-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama lengkap"
        />
        {validation.errors?.name && <div className="text-danger small mb-2">{validation.errors.name[0]}</div>}

        <label className="mb-1 mt-3">Username</label>
        <input
          type="text"
          className="form-control mb-1"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
          placeholder="huruf kecil, angka, titik, underscore"
          autoComplete="username"
        />
        {validation.errors?.username && <div className="text-danger small mb-2">{validation.errors.username[0]}</div>}

        <label className="mb-1 mt-3">Email</label>
        <input
          type="email"
          className="form-control mb-1"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama@email.com"
        />
        {validation.errors?.email && <div className="text-danger small mb-2">{validation.errors.email[0]}</div>}

        <label className="mb-1 mt-3">Password</label>
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

        <button className="btn btn-brand btn-lg w-100 mt-4" type="submit" disabled={isLoading}>
          {isLoading ? 'Memproses...' : 'Daftar'}
        </button>
      </form>

      <GoogleButton />

      <div className="mt-3 small">
        Sudah punya akun? <Link to="/login">Masuk</Link>
      </div>
    </AuthShell>
  )
}

export default Register
