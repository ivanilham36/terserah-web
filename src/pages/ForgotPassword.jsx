import React, { useState } from 'react'
//import BASE URL API
import Api from '../api'
import { useNavigate, Link } from 'react-router-dom'
import { notifySuccess, notifyError, errorMessage } from '../utils/notify'
import AuthShell from '../components/common/AuthShell'

function ForgotPassword() {
  document.title = 'Lupa password - Terserah!'

  const navigate = useNavigate()

  //langkah 1: minta kode, langkah 2: kode + password baru
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setLoading] = useState(false)

  const firstError = (error) => {
    const errors = error.response?.data?.errors
    return errors ? Object.values(errors)[0][0] : errorMessage(error)
  }

  const requestCode = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await Api.post('/api/auth/forgot-password', { email })
      notifySuccess('Jika email terdaftar, kode sudah dikirim. Cek inbox dan folder spam.')
      setStep(2)
    } catch (error) {
      notifyError(firstError(error))
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await Api.post('/api/auth/reset-password', { email, code, password })
      notifySuccess('Password diubah. Silakan login.')
      navigate('/login')
    } catch (error) {
      notifyError(firstError(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell>
      <h1 className="auth-title">Lupa password?</h1>

      {step === 1 && (
        <React.Fragment>
          <p className="text-muted mb-4">Masukkan email akunmu. Kami kirim kode 6 digit untuk membuat password baru.</p>
          <form onSubmit={requestCode}>
            <label className="mb-1">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
            />
            <button className="btn btn-brand btn-lg w-100 mt-4" type="submit" disabled={isLoading}>
              {isLoading ? 'Mengirim...' : 'Kirim kode'}
            </button>
          </form>
        </React.Fragment>
      )}

      {step === 2 && (
        <React.Fragment>
          <p className="text-muted mb-4">
            Kode dikirim ke <strong>{email}</strong> dan berlaku 15 menit.
          </p>
          <form onSubmit={resetPassword}>
            <label className="mb-1">Kode 6 digit</label>
            <input
              className="form-control mono"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              required
            />
            <label className="mb-1 mt-3">Password baru</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              minLength={6}
              required
            />
            <button className="btn btn-brand btn-lg w-100 mt-4" type="submit" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : 'Simpan password baru'}
            </button>
          </form>
          <button type="button" className="btn btn-link p-0 mt-3 small" onClick={() => setStep(1)}>
            Kirim ulang kode / ganti email
          </button>
        </React.Fragment>
      )}

      <div className="mt-3 small">
        <Link to="/login">Kembali ke login</Link>
      </div>
    </AuthShell>
  )
}

export default ForgotPassword
