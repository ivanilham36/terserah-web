import React from 'react'
import { notifySuccess, notifyError } from '../../utils/notify'

//salin teks ke clipboard, dengan cadangan untuk browser lama / koneksi tanpa https
const copyText = async (value) => {
  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch (e) {
    try {
      const el = document.createElement('textarea')
      el.value = value
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(el)
      return ok
    } catch (e2) {
      return false
    }
  }
}

function ShareRoom({ room }) {
  const url = `${window.location.origin}/join/${room.code}`
  const text = `Ayo ikut memutuskan "${room.name}" di Terserah! Kode ruang: ${room.code}`
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  //menu share bawaan perangkat: WhatsApp, Telegram, Instagram, email, dan lainnya
  const shareHandler = async () => {
    try {
      await navigator.share({ title: 'Terserah!', text, url })
    } catch (e) {
      //pengguna menutup menu share bukan kesalahan
      if (e && e.name === 'AbortError') return
      const ok = await copyText(`${text}\n${url}`)
      ok ? notifySuccess('Tautan undangan disalin.') : notifyError('Gagal membagikan, salin kodenya manual.')
    }
  }

  const copyHandler = async () => {
    const ok = await copyText(`${text}\n${url}`)
    ok ? notifySuccess('Tautan undangan disalin.') : notifyError('Gagal menyalin, salin kodenya manual.')
  }

  const waUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`

  return (
    <div className="d-flex flex-wrap gap-2 justify-content-md-end mt-2">
      {canShare && (
        <button type="button" className="btn btn-sm btn-primary" onClick={shareHandler}>
          Bagikan
        </button>
      )}
      <a className="btn btn-sm btn-outline-success" href={waUrl} target="_blank" rel="noopener noreferrer">
        WhatsApp
      </a>
      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={copyHandler}>
        Salin tautan
      </button>
    </div>
  )
}

export default ShareRoom
