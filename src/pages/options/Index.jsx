import React, { useState, useEffect, useCallback } from 'react'
//import react confirm alert
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'
//import BASE URL API
import Api from '../../api'
//import layout
import Layout from '../../layouts/Layout'
import OptionFormModal from '../../components/options/OptionFormModal'
import ReviewModal from '../../components/options/ReviewModal'
import { notifySuccess, notifyError, errorMessage } from '../../utils/notify'

const CATEGORIES = ['makanan', 'film', 'liburan', 'hadiah', 'lainnya']
const PRICE = ['', 'Murah', 'Sedang', 'Agak mahal', 'Mahal']

function OptionsIndex() {
  //title page
  document.title = 'Katalog Opsi - Terserah!'

  //state
  const [me, setMe] = useState(null)
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(true)

  //modal
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [reviewing, setReviewing] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await Api.get('/api/options', {
        params: { page, q: query || undefined, category: category || undefined },
      })
      setItems(response.data.data)
      setMeta({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total,
      })
    } catch (error) {
      notifyError(errorMessage(error))
    } finally {
      setLoading(false)
    }
  }, [page, query, category])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    Api.get('/api/auth/me')
      .then((response) => setMe(response.data))
      .catch(() => {})
  }, [])

  const searchHandler = (e) => {
    e.preventDefault()
    setPage(1)
    setQuery(search)
  }

  const canManage = (option) => me && (me.role === 'admin' || option.created_by === me.id)

  const openCreate = () => {
    setEditing(null)
    setShowForm(true)
  }

  const openEdit = (option) => {
    setEditing(option)
    setShowForm(true)
  }

  //hapus dengan konfirmasi
  const deleteHandler = (option) => {
    confirmAlert({
      title: 'Hapus opsi?',
      message: `"${option.title}" akan dihapus dari katalog dan semua ruang.`,
      buttons: [
        {
          label: 'Ya, hapus',
          onClick: async () => {
            try {
              await Api.delete(`/api/options/${option.id}`)
              notifySuccess('Opsi dihapus.')
              fetchData()
            } catch (error) {
              notifyError(errorMessage(error))
            }
          },
        },
        { label: 'Batal' },
      ],
    })
  }

  return (
    <Layout>
      <div className="page-head d-flex flex-wrap justify-content-between align-items-end gap-3">
        <div>
          <h1 className="page-title">Katalog Opsi</h1>
          <p className="page-sub">Kumpulan pilihan yang bisa dipakai di ruang mana pun.</p>
        </div>
        <button className="btn btn-brand" onClick={openCreate}>
          + Tambah opsi
        </button>
      </div>

      <form className="row g-2 mb-3" onSubmit={searchHandler}>
        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Cari nama opsi"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={category}
            onChange={(e) => {
              setPage(1)
              setCategory(e.target.value)
            }}
          >
            <option value="">Semua kategori</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <button className="btn btn-ghost w-100" type="submit">
            Cari
          </button>
        </div>
      </form>

      {loading && <p className="text-muted">Memuat...</p>}

      {!loading && items.length === 0 && (
        <div className="card card-soft">
          <div className="empty-state">
            <div className="empty-icon">?</div>
            <div className="fw-bold text-dark mb-1">Tidak ada opsi yang cocok</div>
            Coba kata kunci atau kategori lain.
          </div>
        </div>
      )}

      <div className="row g-3">
        {items.map((option) => (
          <div className="col-md-6" key={option.id}>
            <div className="card card-soft room-card h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <h6 className="fw-bold mb-1" style={{ fontSize: '1.02rem', letterSpacing: '-0.015em' }}>
                    {option.title}
                  </h6>
                  <span className="badge bg-secondary">{option.category}</span>
                </div>
                <div className="small text-muted mb-2">
                  {PRICE[option.price_level]} -{' '}
                  {option.reviews_avg_rating
                    ? `${Number(option.reviews_avg_rating).toFixed(1)} / 5 (${option.reviews_count} ulasan)`
                    : 'belum ada ulasan'}
                </div>
                {option.description && <p className="small mb-2">{option.description}</p>}
                <div className="mb-3">
                  {(option.tags || []).map((t) => (
                    <span className="badge bg-light me-1" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-primary" onClick={() => setReviewing(option)}>
                    Ulas
                  </button>
                  {canManage(option) && (
                    <React.Fragment>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => openEdit(option)}>
                        Edit
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => deleteHandler(option)}>
                        Hapus
                      </button>
                    </React.Fragment>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {meta.last_page > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={meta.current_page <= 1}
            onClick={() => setPage(meta.current_page - 1)}
          >
            Sebelumnya
          </button>
          <span className="small text-muted">
            Halaman {meta.current_page} dari {meta.last_page} ({meta.total} opsi)
          </span>
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={meta.current_page >= meta.last_page}
            onClick={() => setPage(meta.current_page + 1)}
          >
            Berikutnya
          </button>
        </div>
      )}

      <OptionFormModal show={showForm} onHide={() => setShowForm(false)} option={editing} onSaved={fetchData} />
      <ReviewModal
        show={!!reviewing}
        onHide={() => setReviewing(null)}
        option={reviewing}
        onSaved={fetchData}
      />
    </Layout>
  )
}

export default OptionsIndex
