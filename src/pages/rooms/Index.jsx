import React, { useState, useEffect } from 'react'
//import BASE URL API
import Api from '../../api'
//import layout
import Layout from '../../layouts/Layout'
//import react router dom
import { Link, useNavigate } from 'react-router-dom'
import { notifySuccess, notifyError, errorMessage } from '../../utils/notify'

const CATEGORIES = ['makanan', 'film', 'liburan', 'hadiah', 'lainnya']

function RoomsIndex() {
  //title page
  document.title = 'Ruang - Terserah!'

  const navigate = useNavigate()

  //state
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('makanan')
  const [useLocation, setUseLocation] = useState(false)
  const [code, setCode] = useState('')

  //ambil daftar ruang
  const fetchRooms = async () => {
    try {
      const response = await Api.get('/api/rooms')
      setRooms(response.data)
    } catch (error) {
      notifyError(errorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRooms()
  }, [])

  //buat ruang baru
  const createHandler = async (e) => {
    e.preventDefault()

    try {
      const response = await Api.post('/api/rooms', {
        name,
        category,
        use_location: useLocation,
      })
      notifySuccess('Ruang dibuat. Bagikan kodenya ke teman.')
      navigate(`/rooms/${response.data.id}`)
    } catch (error) {
      const first = error.response?.data?.errors
      notifyError(first ? Object.values(first)[0][0] : errorMessage(error))
    }
  }

  //gabung ruang dengan kode
  const joinHandler = async (e) => {
    e.preventDefault()

    try {
      const response = await Api.post('/api/rooms/join', { code })
      notifySuccess('Berhasil bergabung.')
      navigate(`/rooms/${response.data.id}`)
    } catch (error) {
      notifyError(errorMessage(error))
    }
  }

  return (
    <Layout>
      <div className="row g-4">
        <div className="col-lg-8">
          <h4 className="fw-bold mb-3">Ruang saya</h4>

          {loading && <p className="text-muted">Memuat...</p>}

          {!loading && rooms.length === 0 && (
            <div className="card card-soft">
              <div className="card-body text-center text-muted py-5">
                Belum ada ruang. Buat ruang baru atau gabung dengan kode dari temanmu.
              </div>
            </div>
          )}

          <div className="row g-3">
            {rooms.map((room) => (
              <div className="col-md-6" key={room.id}>
                <Link to={`/rooms/${room.id}`} className="text-decoration-none text-dark">
                  <div className="card card-soft room-card h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <h5 className="fw-bold mb-1">{room.name}</h5>
                        <span
                          className={`badge ${room.status === 'decided' ? 'bg-success' : 'bg-warning text-dark'}`}
                        >
                          {room.status === 'decided' ? 'Sudah diputuskan' : 'Terbuka'}
                        </span>
                      </div>
                      <div className="text-muted small mb-2">
                        {room.category} - oleh {room.owner?.name}
                      </div>
                      <span className="room-code">{room.code}</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card card-soft mb-3">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Buat ruang baru</h6>
              <form onSubmit={createHandler}>
                <input
                  className="form-control mb-2"
                  placeholder="Nama ruang, mis. Makan siang tim"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <input
                  className="form-control mb-2"
                  list="category-list"
                  placeholder="Kategori"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
                <datalist id="category-list">
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="useLocation"
                    checked={useLocation}
                    onChange={(e) => setUseLocation(e.target.checked)}
                  />
                  <label className="form-check-label small" htmlFor="useLocation">
                    Pertimbangkan jarak (pakai lokasi anggota)
                  </label>
                </div>
                <button className="btn btn-brand w-100" type="submit">
                  Buat ruang
                </button>
              </form>
            </div>
          </div>

          <div className="card card-soft">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Gabung dengan kode</h6>
              <form onSubmit={joinHandler}>
                <input
                  className="form-control mb-2 text-uppercase"
                  placeholder="Kode 6 karakter"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={8}
                  required
                />
                <button className="btn btn-outline-secondary w-100" type="submit">
                  Gabung
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default RoomsIndex
