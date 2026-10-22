import React, { useState, useEffect } from 'react'
//import component bootstrap
import { Modal } from 'react-bootstrap'
//import BASE URL API
import Api from '../../api'
import { notifySuccess, notifyError, errorMessage } from '../../utils/notify'

const CATEGORIES = ['makanan', 'film', 'liburan', 'hadiah', 'lainnya']

function OptionFormModal({ show, onHide, option, onSaved }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('makanan')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [priceLevel, setPriceLevel] = useState(1)
  const [tags, setTags] = useState('')
  const [validation, setValidation] = useState({})
  const [saving, setSaving] = useState(false)

  //isi form saat modal dibuka (edit) atau kosongkan (tambah)
  useEffect(() => {
    if (show) {
      setTitle(option?.title ?? '')
      setCategory(option?.category ?? 'makanan')
      setDescription(option?.description ?? '')
      setAddress(option?.address ?? '')
      setLat(option?.lat ?? '')
      setLng(option?.lng ?? '')
      setPriceLevel(option?.price_level ?? 1)
      setTags((option?.tags ?? []).join(', '))
      setValidation({})
    }
  }, [show, option])

  const submitHandler = async (e) => {
    e.preventDefault()
    setSaving(true)
    setValidation({})

    const payload = {
      title,
      category,
      description: description || null,
      address: address || null,
      lat: lat === '' ? null : Number(lat),
      lng: lng === '' ? null : Number(lng),
      price_level: Number(priceLevel),
      tags: tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
    }

    try {
      if (option) {
        await Api.put(`/api/options/${option.id}`, payload)
        notifySuccess('Opsi diperbarui.')
      } else {
        await Api.post('/api/options', payload)
        notifySuccess('Opsi ditambahkan.')
      }
      onSaved()
      onHide()
    } catch (error) {
      if (error.response?.data?.errors) {
        setValidation(error.response.data.errors)
      } else {
        notifyError(errorMessage(error))
      }
    } finally {
      setSaving(false)
    }
  }

  const err = (field) =>
    validation[field] && <div className="text-danger small mt-1">{validation[field][0]}</div>

  return (
    <Modal show={show} onHide={onHide} centered>
      <form onSubmit={submitHandler}>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5">{option ? 'Edit opsi' : 'Tambah opsi'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <label className="small mb-1">Nama opsi</label>
          <input className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} />
          {err('title')}

          <div className="row mt-2">
            <div className="col-6">
              <label className="small mb-1">Kategori</label>
              <input
                className="form-control"
                list="option-categories"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <datalist id="option-categories">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              {err('category')}
            </div>
            <div className="col-6">
              <label className="small mb-1">Harga</label>
              <select className="form-select" value={priceLevel} onChange={(e) => setPriceLevel(e.target.value)}>
                <option value={1}>Murah</option>
                <option value={2}>Sedang</option>
                <option value={3}>Agak mahal</option>
                <option value={4}>Mahal</option>
              </select>
              {err('price_level')}
            </div>
          </div>

          <label className="small mb-1 mt-2">Deskripsi</label>
          <textarea className="form-control" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />

          <label className="small mb-1 mt-2">Tag (pisahkan dengan koma)</label>
          <input
            className="form-control"
            placeholder="mis. halal, nasi, santai"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          <label className="small mb-1 mt-2">Alamat (opsional)</label>
          <input className="form-control" value={address} onChange={(e) => setAddress(e.target.value)} />

          <div className="row mt-2">
            <div className="col-6">
              <label className="small mb-1">Latitude (opsional)</label>
              <input className="form-control" value={lat} onChange={(e) => setLat(e.target.value)} />
              {err('lat')}
            </div>
            <div className="col-6">
              <label className="small mb-1">Longitude (opsional)</label>
              <input className="form-control" value={lng} onChange={(e) => setLng(e.target.value)} />
              {err('lng')}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-outline-secondary" onClick={onHide}>
            Batal
          </button>
          <button type="submit" className="btn btn-brand" disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export default OptionFormModal
