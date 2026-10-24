import React, { useState, useEffect } from 'react'
//import BASE URL API
import Api from '../../api'
import { notifySuccess, notifyError, errorMessage } from '../../utils/notify'

function CandidatePicker({ room, onChanged }) {
  const [tab, setTab] = useState('catalog')

  //katalog
  const [query, setQuery] = useState('')
  const [catalog, setCatalog] = useState([])

  //ide AI
  const [topic, setTopic] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiMessage, setAiMessage] = useState('')

  //opsi baru
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priceLevel, setPriceLevel] = useState(1)
  const [tags, setTags] = useState('')

  const candidateIds = (room.options || []).map((o) => o.id)

  const loadCatalog = async () => {
    try {
      const response = await Api.get('/api/options', {
        params: { category: room.category, q: query || undefined },
      })
      setCatalog(response.data.data)
    } catch (error) {
      notifyError(errorMessage(error))
    }
  }

  useEffect(() => {
    loadCatalog()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.category])

  //tambahkan opsi (yang sudah ada) sebagai kandidat
  const addToRoom = async (optionId) => {
    try {
      await Api.post(`/api/rooms/${room.id}/options`, { option_id: optionId })
      notifySuccess('Kandidat ditambahkan.')
      onChanged()
    } catch (error) {
      notifyError(errorMessage(error))
    }
  }

  //buat opsi baru di katalog lalu jadikan kandidat
  const createAndAdd = async (payload) => {
    const created = await Api.post('/api/options', { category: room.category, ...payload })
    await Api.post(`/api/rooms/${room.id}/options`, { option_id: created.data.id })
  }

  const askAi = async (e) => {
    e.preventDefault()
    setAiLoading(true)
    setAiMessage('')
    try {
      const response = await Api.post(`/api/rooms/${room.id}/ai/suggest`, { topic, count: 4 })
      setSuggestions(response.data.suggestions)
      setAiMessage(response.data.message)
    } catch (error) {
      notifyError(errorMessage(error))
    } finally {
      setAiLoading(false)
    }
  }

  const addSuggestion = async (item, index) => {
    try {
      await createAndAdd(item)
      setSuggestions((list) => list.filter((_, i) => i !== index))
      notifySuccess('Ide ditambahkan sebagai kandidat.')
      onChanged()
    } catch (error) {
      notifyError(errorMessage(error))
    }
  }

  const addManual = async (e) => {
    e.preventDefault()
    try {
      await createAndAdd({
        title,
        description: description || null,
        price_level: Number(priceLevel),
        tags: tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
      })
      notifySuccess('Opsi dibuat dan ditambahkan.')
      setTitle('')
      setDescription('')
      setTags('')
      onChanged()
      loadCatalog()
    } catch (error) {
      const first = error.response?.data?.errors
      notifyError(first ? Object.values(first)[0][0] : errorMessage(error))
    }
  }

  return (
    <div className="card card-soft">
      <div className="card-body">
        <h6 className="fw-bold mb-3">Tambah kandidat</h6>

        <ul className="nav nav-pills mb-3">
          {[
            ['catalog', 'Katalog'],
            ['ai', 'Ide AI'],
            ['new', 'Opsi baru'],
          ].map(([key, label]) => (
            <li className="nav-item" key={key}>
              <button
                type="button"
                className={`nav-link py-1 px-3 ${tab === key ? 'active' : ''}`}
                                onClick={() => setTab(key)}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>

        {tab === 'catalog' && (
          <div>
            <div className="input-group mb-2">
              <input
                className="form-control"
                placeholder={`Cari opsi ${room.category}`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button className="btn btn-outline-secondary" type="button" onClick={loadCatalog}>
                Cari
              </button>
            </div>
            {catalog.length === 0 && <div className="small text-muted">Tidak ada opsi di katalog.</div>}
            {catalog.map((opt) => (
              <div className="d-flex justify-content-between align-items-center border-top py-2" key={opt.id}>
                <div>
                  <div>{opt.title}</div>
                  <div className="small text-muted">{(opt.tags || []).join(', ')}</div>
                </div>
                <button
                  className="btn btn-sm btn-outline-primary"
                  disabled={candidateIds.includes(opt.id)}
                  onClick={() => addToRoom(opt.id)}
                >
                  {candidateIds.includes(opt.id) ? 'Sudah' : 'Tambah'}
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'ai' && (
          <div>
            <form onSubmit={askAi} className="input-group mb-2">
              <input
                className="form-control"
                placeholder="Topik, mis. makan siang murah"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <button className="btn btn-brand" type="submit" disabled={aiLoading}>
                {aiLoading ? 'Memikirkan...' : 'Minta ide'}
              </button>
            </form>
            {aiMessage && <div className="small text-muted mb-2">{aiMessage}</div>}
            {suggestions.map((item, index) => (
              <div className="border-top py-2" key={`${item.title}-${index}`}>
                <div className="d-flex justify-content-between align-items-start">
                  <div className="fw-bold">{item.title}</div>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => addSuggestion(item, index)}>
                    Tambahkan
                  </button>
                </div>
                <div className="small text-muted">{item.description}</div>
                <div>
                  {(item.tags || []).map((t) => (
                    <span className="badge bg-light me-1" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'new' && (
          <form onSubmit={addManual}>
            <input
              className="form-control mb-2"
              placeholder="Nama opsi"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              className="form-control mb-2"
              rows={2}
              placeholder="Deskripsi (opsional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <select className="form-select mb-2" value={priceLevel} onChange={(e) => setPriceLevel(e.target.value)}>
              <option value={1}>Harga: murah</option>
              <option value={2}>Harga: sedang</option>
              <option value={3}>Harga: agak mahal</option>
              <option value={4}>Harga: mahal</option>
            </select>
            <input
              className="form-control mb-2"
              placeholder="Tag dipisah koma, mis. halal, nasi, santai"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            <button className="btn btn-brand w-100" type="submit">
              Buat dan tambahkan
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default CandidatePicker
