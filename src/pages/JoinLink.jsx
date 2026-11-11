import React from 'react'
import { useParams, Navigate } from 'react-router-dom'

//tautan undangan: /join/KODE. Kode disimpan sementara, lalu pengguna diarahkan ke daftar ruang
//(kalau belum login, otomatis diarahkan ke halaman login lebih dulu, dan kode tetap tersimpan)
function JoinLink() {
  const { code } = useParams()

  if (/^[A-Za-z0-9]{6}$/.test(code || '')) {
    try {
      sessionStorage.setItem('terserah_join', code.toUpperCase())
    } catch (e) {
      //abaikan jika penyimpanan diblokir
    }
  }

  return <Navigate to="/rooms" replace />
}

export default JoinLink
