import React, { useEffect, useRef } from 'react'
import Api from '../../api'
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom'
import { notifySuccess, notifyError, errorMessage } from '../../utils/notify'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

//muat skrip Google Identity Services sekali saja
let scriptPromise
const loadScript = () => {
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://accounts.google.com/gsi/client'
      s.async = true
      s.onload = resolve
      s.onerror = reject
      document.head.appendChild(s)
    })
  }
  return scriptPromise
}

/** Tombol "Lanjut dengan Google": daftar otomatis bila belum punya akun, gabung bila email sama. */
function GoogleButton() {
  const box = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!CLIENT_ID) return
    let cancelled = false

    const draw = () => {
      if (cancelled || !window.google || !box.current) return
      const dark = document.documentElement.getAttribute('data-theme') === 'dark'
      box.current.innerHTML = ''
      window.google.accounts.id.renderButton(box.current, {
        theme: dark ? 'filled_black' : 'outline',
        size: 'large',
        shape: 'pill',
        text: 'continue_with',
        width: 320,
      })
    }

    loadScript()
      .then(() => {
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: async (resp) => {
            try {
              const r = await Api.post('/api/auth/google', { credential: resp.credential })
              Cookies.set('token', r.data.token)
              if (r.data.password_cleared) {
                notifySuccess('Akunmu digabung dengan Google. Password lama dihapus demi keamanan; pasang lagi lewat Lupa password bila perlu.')
              } else {
                notifySuccess(r.status === 201 ? 'Akun dibuat dengan Google.' : 'Login berhasil.')
              }
              navigate('/rooms')
            } catch (error) {
              notifyError(errorMessage(error))
            }
          },
        })
        draw()
      })
      .catch(() => {})

    //gambar ulang saat tema berganti
    const observer = new MutationObserver(draw)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [navigate])

  if (!CLIENT_ID) return null

  return (
    <div className="mt-4">
      <div className="d-flex align-items-center gap-3 text-muted small mb-3">
        <hr className="flex-grow-1 m-0" />
        atau
        <hr className="flex-grow-1 m-0" />
      </div>
      {/* color-scheme: light agar iframe Google transparan (tanpa kotak putih) di mode gelap */}
      <div ref={box} className="d-flex justify-content-center" style={{ minHeight: 44, colorScheme: 'light' }} />
    </div>
  )
}

export default GoogleButton
