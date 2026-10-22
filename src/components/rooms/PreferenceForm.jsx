import React, { useState, useEffect } from 'react'
//import BASE URL API
import Api from '../../api'
import { notifySuccess, notifyError, errorMessage } from '../../utils/notify'

//pref_parsed dari pivot bisa berupa string JSON
const parsePref = (value) => {
  if (!value) return null
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch (e) {
      return null
    }
  }
  return value
}

function PreferenceForm({ room, member, onSaved }) {
  const [budget, setBudget] = useState('')
  const [text, setText] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)

  //isi form sekali saja dari data server (supaya tidak menimpa ketikan saat auto-refresh)
  useEffect(() => {
    if (member && !loaded) {
      setBudget(member.pivot.budget_max ?? '')
      setText(member.pivot.pref_text ?? '')
      setLat(member.pivot.lat ?? '')
      setLng(member.pivot.lng ?? '')
      setLoaded(true)
    }
  }, [member, loaded])

  const parsed = parsePref(member?.pivot?.pref_parsed)

  //ambil lokasi dari browser
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      notifyError('Browser tidak mendukung lokasi.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6))
        setLng(pos.coords.longitude.toFixed(6))
      },
      () => notifyError('Izin lokasi ditolak.'),
    )
  }

  const saveHandler = async (e) => {
    e.preventDefault()
    setSaving(true)

    const body = {
      budget_max: budget === '' ? null : Number(budget),
      pref_text: text,
    }
    if (room.use_location) {
      body.lat = lat === '' ? null : Number(lat)
      body.lng = lng === '' ? null : Number(lng)
    }

    try {
      await Api.put(`/api/rooms/${room.id}/me`, body)
      notifySuccess('Preferensi disimpan.')
      onSaved()
    } catch (error) {
      const first = error.response?.data?.errors
      notifyError(first ? Object.values(first)[0][0] : errorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card card-soft mb-3">
      <div className="card-body">
        <h6 className="fw-bold mb-3">Preferensiku</h6>
        <form onSubmit={saveHandler}>
          <label className="small mb-1">Ceritakan keinginanmu dengan bebas</label>
          <textarea
            className="form-control mb-2"
            rows={3}
            placeholder="mis. pengen yang halal dan murah, tapi nggak mau pedas"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <label className="small mb-1">Budget maksimal (Rp, opsional)</label>
          <input
            type="number"
            min="0"
            className="form-control mb-2"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />

          {room.use_location && (
            <div className="mb-2">
              <label className="small mb-1">Lokasiku</label>
              <div className="input-group mb-1">
                <input className="form-control" placeholder="Lat" value={lat} onChange={(e) => setLat(e.target.value)} />
                <input className="form-control" placeholder="Lng" value={lng} onChange={(e) => setLng(e.target.value)} />
              </div>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={useMyLocation}>
                Pakai lokasiku sekarang
              </button>
            </div>
          )}

          <button className="btn btn-brand w-100 mt-2" type="submit" disabled={saving}>
            {saving ? 'AI sedang membaca...' : 'Simpan'}
          </button>
        </form>

        {parsed && (
          <div className="mt-3">
            <div className="small text-muted mb-1">Yang dipahami AI dari teksmu:</div>
            {(parsed.likes || []).map((w) => (
              <span className="badge bg-success me-1" key={`l-${w}`}>
                {w}
              </span>
            ))}
            {(parsed.avoid || []).map((w) => (
              <span className="badge bg-danger me-1" key={`a-${w}`}>
                hindari: {w}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PreferenceForm
