import React from 'react'
import Logo from './Logo'
import { ThemeToggle } from '../../utils/theme'

//kerangka halaman login / daftar: form di kiri, panel lime di kanan
const AuthShell = ({ children }) => (
  <div className="auth-shell">
    <div className="auth-main">
      <div className="auth-top">
        <Logo />
        <ThemeToggle />
      </div>
      <div className="auth-card">{children}</div>
      <div className="eyebrow-mono">&copy; 2026 Terserah!</div>
    </div>

    <aside className="auth-side">
      <span className="big-bang" aria-hidden="true">
        !
      </span>
      <h2 className="auth-quote">
        Stop bilang
        <br />
        terserah.
        <br />
        Hitung bareng.
      </h2>
      <p>Ceritakan maumu, biarkan skor yang menimbang, lalu vote atau veto. Alasannya ditulis otomatis.</p>
    </aside>
  </div>
)

export default AuthShell
