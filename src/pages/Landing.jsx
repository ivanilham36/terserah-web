import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Cookies from 'js-cookie'
import Logo from '../components/common/Logo'
import { ThemeToggle } from '../utils/theme'

//animasi muncul saat elemen masuk layar
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

//data contoh untuk hero (bukan data asli)
const DEMO = [
  { id: 1, name: 'Kedai Kopi Senja', note: 'kopi / wifi / halal', base: 91.4 },
  { id: 2, name: 'Warung Nasi Bu Tini', note: 'murah / halal', base: 77.6 },
  { id: 3, name: 'Sate Pak Joko', note: 'sate / ramai', base: 74.9 },
  { id: 4, name: 'Ramen Kita', note: 'ramen / nyaman', base: 69.3 },
]
const ROW_H = 68
const GAP = 8

//hero interaktif: tekan suka atau veto, urutan bergerak
const Deck = () => {
  const [votes, setVotes] = useState({})

  const score = (o) => Math.min(100, o.base + (votes[o.id] === 'up' ? 5 : 0))
  const active = DEMO.filter((o) => votes[o.id] !== 'veto').sort((a, b) => score(b) - score(a))
  const out = DEMO.filter((o) => votes[o.id] === 'veto')
  const order = [...active, ...out]

  const vote = (id, type) => setVotes((v) => ({ ...v, [id]: v[id] === type ? undefined : type }))

  return (
    <div className="deck" aria-label="Contoh ruang keputusan yang bisa dicoba">
      <div className="deck-head">
        <div>
          <div className="eyebrow-mono mb-1">ruang</div>
          <div className="deck-title">Makan siang tim</div>
        </div>
        <span className="room-code">TRSRH1</span>
      </div>

      <div className="deck-list" style={{ height: DEMO.length * ROW_H + (DEMO.length - 1) * GAP }}>
        {DEMO.map((o) => {
          const pos = order.findIndex((x) => x.id === o.id)
          const isOut = votes[o.id] === 'veto'
          const isTop = !isOut && pos === 0
          return (
            <div
              key={o.id}
              className={`deck-row ${isTop ? 'top' : ''} ${isOut ? 'out' : ''}`}
              style={{ transform: `translateY(${pos * (ROW_H + GAP)}px)` }}
            >
              <span className="rk">{isOut ? 'x' : String(pos + 1).padStart(2, '0')}</span>
              <div style={{ minWidth: 0 }}>
                <div className="nm">{o.name}</div>
                <div className="nt">{isOut ? 'gugur: di-veto' : votes[o.id] === 'up' ? '+5 dari suka' : o.note}</div>
              </div>
              <span className="sc">{isOut ? '--' : score(o).toFixed(1)}</span>
              <div className="acts">
                <button
                  type="button"
                  className={`mini-btn ${votes[o.id] === 'up' ? 'on-up' : ''}`}
                  onClick={() => vote(o.id, 'up')}
                >
                  Suka
                </button>
                <button
                  type="button"
                  className={`mini-btn ${votes[o.id] === 'veto' ? 'on-veto' : ''}`}
                  onClick={() => vote(o.id, 'veto')}
                >
                  Veto
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="deck-foot">
        <span>data contoh, coba sendiri</span>
        <button type="button" onClick={() => setVotes({})}>
          reset
        </button>
      </div>
    </div>
  )
}

const Seg = ({ label, value }) => (
  <div className="meter">
    <div className="meter-top">
      <span>{label}</span>
      <b>{value}%</b>
    </div>
    <div className="seg lime">
      <i style={{ width: `${value}%` }} />
    </div>
  </div>
)

const PHRASES = ['terserah', 'apa aja boleh', 'ngikut aja', 'bebas deh', 'yang penting kenyang', 'gimana kamu aja', 'samain aja', 'terserah kamu']

function Landing() {
  //title page
  document.title = 'Terserah! - Stop bilang terserah. Hitung bareng.'

  useReveal()

  //garis bawah navbar muncul setelah di-scroll
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const loggedIn = !!Cookies.get('token')
  const cta = loggedIn ? '/rooms' : '/register'

  return (
    <React.Fragment>
      <header className={`lp-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="container lp-nav-inner">
          <Logo />
          <nav className="lp-links">
            <a href="#cara-kerja">Cara kerja</a>
            <a href="#ai">Peran AI</a>
            <a href="#untuk-apa">Untuk apa saja</a>
          </nav>
          <div className="d-flex align-items-center gap-2">
            <ThemeToggle />
            {loggedIn ? (
              <Link to="/rooms" className="btn btn-brand btn-sm">
                Buka aplikasi
              </Link>
            ) : (
              <React.Fragment>
                <Link to="/login" className="btn btn-sm d-none d-sm-inline-block" style={{ color: 'var(--ink)' }}>
                  Masuk
                </Link>
                <Link to="/register" className="btn btn-brand btn-sm">
                  Mulai
                </Link>
              </React.Fragment>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container">
            <div className="hero-grid">
              <div>
                <div className="eyebrow-mono">keputusan kelompok, dihitung</div>
                <h1>
                  Stop bilang <span className="strike">terserah</span>.
                  <br />
                  <span className="mark">Hitung bareng.</span>
                </h1>
                <p className="lead">
                  Semua orang ceritakan maunya dengan bahasa sehari-hari. Terserah! membaca, menghitung skor tiap
                  pilihan, lalu kalian vote atau veto. Hasilnya keluar lengkap dengan alasan.
                </p>
                <div className="hero-cta">
                  <Link to={cta} className="btn btn-brand btn-lg">
                    {loggedIn ? 'Buka ruang saya' : 'Buat ruang'} &rarr;
                  </Link>
                  <a href="#cara-kerja" className="btn btn-ghost btn-lg">
                    Lihat cara kerja
                  </a>
                </div>
                <div className="hero-stats">
                  <span>
                    <b>04</b> kriteria skor
                  </span>
                  <span>
                    <b>01</b> veto cukup
                  </span>
                  <span>
                    <b>00</b> keputusan oleh AI
                  </span>
                </div>
              </div>

              <Deck />
            </div>
          </div>
        </section>

        <div className="marquee-wrap" aria-hidden="true">
          <div className="marquee">
            <div className="marquee-track">
              {[...PHRASES, ...PHRASES, ...PHRASES, ...PHRASES].map((p, i) => (
                <span key={i}>{p}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="container">
          <section className="section" id="cara-kerja">
            <div className="sec-head reveal">
              <div className="eyebrow-mono">01 / cara kerja</div>
              <h2>Tiga langkah. Nol debat panjang.</h2>
            </div>

            <div className="rows">
              <div className="how reveal">
                <div className="num">01</div>
                <div>
                  <h3>Ceritakan maumu</h3>
                  <p>Tulis bebas seperti ngobrol. AI mengubahnya jadi preferensi yang bisa dihitung.</p>
                </div>
                <div className="viz">
                  <div className="typing-line">pengen yang halal, murah, nggak pedas</div>
                  <div className="chips">
                    <span className="chip good">halal</span>
                    <span className="chip good">murah</span>
                    <span className="chip bad">hindari: pedas</span>
                  </div>
                </div>
              </div>

              <div className="how reveal">
                <div className="num">02</div>
                <div>
                  <h3>Lihat peringkatnya</h3>
                  <p>Empat kriteria digabung jadi satu skor. Tiap bagian terlihat, tidak ada kotak hitam.</p>
                </div>
                <div className="viz">
                  <div className="formula">
                    skor = <b>0.30</b> pref + <b>0.25</b> rating + <b>0.20</b> harga + <b>0.25</b> jarak
                  </div>
                  <Seg label="Preferensi" value={100} />
                  <Seg label="Rating" value={80} />
                  <Seg label="Harga" value={100} />
                  <Seg label="Jarak" value={93} />
                </div>
              </div>

              <div className="how reveal">
                <div className="num">03</div>
                <div>
                  <h3>Vote, veto, putuskan</h3>
                  <p>Suka menaikkan skor. Satu veto menggugurkan pilihan. Pemilik ruang menetapkan, alasannya ditulis otomatis.</p>
                </div>
                <div className="viz">
                  <div className="ticket">
                    <div>
                      <div className="k">keputusan kelompok</div>
                      <div className="t">Kedai Kopi Senja</div>
                    </div>
                    <div className="t">93.2</div>
                  </div>
                  <div className="formula">sate pak joko: gugur, di-veto anggota</div>
                </div>
              </div>
            </div>
          </section>

          <section className="inverse reveal" id="ai">
            <div>
              <div className="eyebrow-mono mb-3" style={{ color: '#9b978b' }}>
                02 / peran ai
              </div>
              <h2>
                AI cuma membaca dan menjelaskan. <em>Yang memutuskan: rumus.</em>
              </h2>
              <p>
                Skor dihitung algoritma yang bisa diuji, jadi hasilnya konsisten. AI membantu di dua ujung: membaca
                preferensi dan menuliskan alasan. Kalau AI gagal, aplikasi tidak ikut mati.
              </p>
            </div>
            <div className="ladder">
              <div className="rung">
                <span className="led" />
                <div>
                  <div className="n">gpt-oss-20b</div>
                  <div className="d">dicoba pertama</div>
                </div>
                <span className="st">ok</span>
              </div>
              <div className="rung">
                <span className="led" />
                <div>
                  <div className="n">gpt-oss-120b</div>
                  <div className="d">kalau model pertama gagal atau kena batas</div>
                </div>
                <span className="st">fallback</span>
              </div>
              <div className="rung">
                <span className="led" />
                <div>
                  <div className="n">Mode cadangan</div>
                  <div className="d">parser kata kunci dan teks template, tanpa AI</div>
                </div>
                <span className="st">tetap jalan</span>
              </div>
            </div>
          </section>

          <section className="section" id="untuk-apa">
            <div className="sec-head reveal">
              <div className="eyebrow-mono">03 / untuk apa saja</div>
              <h2>Bukan cuma tempat makan.</h2>
            </div>
            <div className="big-list reveal">
              {[
                ['Makan siang', 'makanan'],
                ['Nonton bareng', 'film'],
                ['Liburan', 'liburan'],
                ['Kado', 'hadiah'],
                ['Nongkrong', 'lainnya'],
              ].map(([t, c]) => (
                <div className="big-item" key={t}>
                  <span>{t}</span>
                  <span>kategori / {c}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="closer reveal">
            <h2>Mulai dari satu ruang.</h2>
            <Link to={cta} className="btn btn-brand btn-lg">
              {loggedIn ? 'Buka ruang saya' : 'Buat ruang pertama'} &rarr;
            </Link>
            <div className="footer-word" aria-hidden="true">
              terserah<span className="bang">!</span>
            </div>
          </section>

          <footer className="lp-footer">
            <span>&copy; 2026 Terserah!</span>
            </span>
          </footer>
        </div>
      </main>
    </React.Fragment>
  )
}

export default Landing
