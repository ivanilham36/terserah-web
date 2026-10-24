import React, { useState } from 'react'

const KEY = 'theme'

//tema awal: pilihan tersimpan, kalau belum ada ikuti sistem
export function getTheme() {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'dark' || saved === 'light') return saved
  } catch (e) {
    //storage diblokir, abaikan
  }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

//tombol ganti mode gelap / terang
export function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || getTheme())

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    setTheme(next)
    try {
      localStorage.setItem(KEY, next)
    } catch (e) {
      //storage diblokir, tema tetap berganti untuk sesi ini
    }
  }

  const label = theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'

  return (
    <button type="button" className={`theme-toggle ${className}`} onClick={toggle} aria-label={label} title={label}>
      {theme === 'dark' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  )
}
