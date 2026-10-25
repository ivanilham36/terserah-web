import React, { useState, useEffect, useCallback } from 'react'
//import react router dom
import { useParams, Link, useNavigate } from 'react-router-dom'
//import react confirm alert
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'
//import BASE URL API
import Api from '../../api'
//import layout
import Layout from '../../layouts/Layout'
import { notifySuccess, notifyError, errorMessage } from '../../utils/notify'
//import components
import PreferenceForm from '../../components/rooms/PreferenceForm'
import CandidatePicker from '../../components/rooms/CandidatePicker'
import RankingList from '../../components/rooms/RankingList'
import PlaceMap from '../../components/common/PlaceMap'
import ReviewModal from '../../components/options/ReviewModal'

function RoomShow() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [reviewing, setReviewing] = useState(false)

  //state
  const [room, setRoom] = useState(null)
  const [rec, setRec] = useState({ ranked: [], excluded: [] })
  const [me, setMe] = useState(null)
  const [error, setError] = useState('')
  const [deciding, setDeciding] = useState(false)

  //ambil data ruang, ranking, dan user yang login
  const load = useCallback(async () => {
    try {
      const [roomRes, recRes, meRes] = await Promise.all([
        Api.get(`/api/rooms/${id}`),
        Api.get(`/api/rooms/${id}/recommendations`),
        Api.get('/api/auth/me'),
      ])
      setRoom(roomRes.data)
      setRec(recRes.data)
      setMe(meRes.data)
      document.title = `${roomRes.data.name} - Terserah!`
    } catch (err) {
      setError(errorMessage(err))
    }
  }, [id])

  //muat saat dibuka, lalu refresh otomatis tiap 10 detik supaya vote anggota lain terlihat
  useEffect(() => {
    load()
    const timer = setInterval(load, 10000)
    return () => clearInterval(timer)
  }, [load])

  if (error) {
    return (
      <Layout>
        <div className="alert alert-danger">{error}</div>
        <Link to="/rooms">Kembali ke daftar ruang</Link>
      </Layout>
    )
  }

  if (!room || !me) {
    return (
      <Layout>
        <p className="text-muted">Memuat...</p>
      </Layout>
    )
  }

  const isOwner = room.owner_id === me.id
  const open = room.status === 'open'
  const myMember = (room.members || []).find((m) => m.id === me.id)

  //peta suaraku: option_id -> type
  const myVotes = {}
  ;(room.votes || []).forEach((v) => {
    if (v.user_id === me.id) myVotes[v.option_id] = v.type
  })

  //vote / veto; menekan suara yang sama lagi = mencabut
  const voteHandler = async (optionId, type, current) => {
    try {
      if (current === type) {
        await Api.delete(`/api/rooms/${room.id}/votes/${optionId}`)
      } else {
        await Api.post(`/api/rooms/${room.id}/votes`, { option_id: optionId, type })
      }
      load()
    } catch (err) {
      notifyError(errorMessage(err))
    }
  }

  const removeHandler = async (optionId) => {
    try {
      await Api.delete(`/api/rooms/${room.id}/options/${optionId}`)
      load()
    } catch (err) {
      notifyError(errorMessage(err))
    }
  }

  //hapus ruang (pemilik) atau keluar (anggota)
  const leaveHandler = () => {
    confirmAlert({
      title: isOwner ? 'Hapus ruang ini?' : 'Keluar dari ruang?',
      message: isOwner
        ? 'Ruang, kandidat, dan semua suara akan dihapus untuk semua anggota. Tempatnya tetap tersimpan di "Tempat saya".'
        : 'Suaramu di ruang ini ikut dihapus.',
      buttons: [
        {
          label: isOwner ? 'Ya, hapus' : 'Ya, keluar',
          onClick: async () => {
            try {
              await Api.delete(isOwner ? `/api/rooms/${room.id}` : `/api/rooms/${room.id}/members/me`)
              notifySuccess(isOwner ? 'Ruang dihapus.' : 'Kamu sudah keluar.')
              navigate('/rooms')
            } catch (err) {
              notifyError(errorMessage(err))
            }
          },
        },
        { label: 'Batal' },
      ],
    })
  }

  //titik peta: semua kandidat yang punya koordinat, bernomor sesuai ranking
  const rankOf = {}
  rec.ranked.forEach((r, i) => (rankOf[r.option_id] = i + 1))
  const mapMarkers = (room.options || [])
    .filter((o) => o.lat != null && o.lng != null)
    .map((o) => ({
      id: o.id,
      lat: o.lat,
      lng: o.lng,
      title: o.title,
      kind: room.decided_option_id === o.id ? 'candidate' : 'result',
      label: rankOf[o.id] || '',
    }))

  //putuskan (khusus pemilik ruang), dengan konfirmasi
  const decideHandler = (item) => {
    confirmAlert({
      title: 'Putuskan pilihan ini?',
      message: `"${item.title}" akan ditetapkan sebagai keputusan dan ruang ditutup.`,
      buttons: [
        {
          label: 'Ya, putuskan',
          onClick: async () => {
            setDeciding(true)
            try {
              await Api.post(`/api/rooms/${room.id}/decide`, { option_id: item.option_id })
              notifySuccess('Keputusan ditetapkan.')
              await load()
            } catch (err) {
              notifyError(errorMessage(err))
            } finally {
              setDeciding(false)
            }
          },
        },
        { label: 'Batal' },
      ],
    })
  }

  return (
    <Layout>
      <div className="mb-3">
        <Link to="/rooms" className="small fw-semibold">
          &larr; Semua ruang
        </Link>
      </div>

      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
        <div>
          <h1 className="page-title mb-2">{room.name}</h1>
          <span className="badge bg-secondary me-2">{room.category}</span>
          <span className={`status-dot ${open ? '' : 'done'}`}>{open ? 'Terbuka' : 'Sudah diputuskan'}</span>
        </div>
        <div className="text-md-end">
          <div className="small text-muted mb-1">Kode undangan</div>
          <span className="room-code" style={{ fontSize: '1.05rem', padding: '5px 14px' }}>
            {room.code}
          </span>
          <div className="mt-2">
            <button className="btn btn-sm btn-outline-danger" onClick={leaveHandler}>
              {isOwner ? 'Hapus ruang' : 'Keluar dari ruang'}
            </button>
          </div>
        </div>
      </div>

      {deciding && <div className="alert alert-info">AI sedang menuliskan alasan keputusan...</div>}

      {!open && room.decided_option && (
        <div className="decision-card mb-4">
          <div className="decision-kicker">Keputusan kelompok &#10003;</div>
          <h2 className="decision-title">{room.decided_option.title}</h2>
          {room.decision_reason && (
            <p className="mb-3">{room.decision_reason}</p>
          )}
          <button className="btn btn-ghost btn-sm" onClick={() => setReviewing(true)}>
            Sudah ke sana? Beri ulasan
          </button>
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="eyebrow-mono mb-3">Ranking kandidat</div>
          <RankingList
            ranked={rec.ranked}
            excluded={rec.excluded}
            myVotes={myVotes}
            isOwner={isOwner}
            open={open}
            onVote={voteHandler}
            onDecide={decideHandler}
            onRemove={removeHandler}
          />
        </div>

        <div className="col-lg-5">
          {mapMarkers.length > 0 && (
            <div className="mb-3">
              <div className="eyebrow-mono mb-2">Peta kandidat</div>
              <PlaceMap markers={mapMarkers} height={240} />
            </div>
          )}
          {open && <PreferenceForm room={room} member={myMember} onSaved={load} />}

          <div className="card card-soft mb-3">
            <div className="card-body">
              <h6 className="fw-bold mb-2">Anggota ({room.members.length})</h6>
              {room.members.map((m) => (
                <div className="d-flex justify-content-between small py-1" key={m.id}>
                  <span>
                    {m.name}
                    {m.id === room.owner_id && <span className="badge bg-light ms-1">pemilik</span>}
                  </span>
                  <span className="text-muted">{m.pivot.pref_text ? 'sudah isi preferensi' : 'belum isi preferensi'}</span>
                </div>
              ))}
            </div>
          </div>

          {open && <CandidatePicker room={room} onChanged={load} />}
        </div>
      </div>
      <ReviewModal
        show={reviewing}
        onHide={() => setReviewing(false)}
        option={room.decided_option}
        onSaved={() => {
          setReviewing(false)
          load()
        }}
      />
    </Layout>
  )
}

export default RoomShow
