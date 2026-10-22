import React, { useState, useEffect, useCallback } from 'react'
//import react router dom
import { useParams, Link } from 'react-router-dom'
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

function RoomShow() {
  const { id } = useParams()

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
        <Link to="/rooms" className="small text-decoration-none">
          &larr; Semua ruang
        </Link>
      </div>

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
        <div>
          <h3 className="fw-bold mb-1">{room.name}</h3>
          <span className="badge bg-secondary me-2">{room.category}</span>
          <span className={`badge ${open ? 'bg-warning text-dark' : 'bg-success'}`}>
            {open ? 'Terbuka' : 'Sudah diputuskan'}
          </span>
        </div>
        <div className="text-end">
          <div className="small text-muted">Kode undangan</div>
          <span className="room-code fs-5">{room.code}</span>
        </div>
      </div>

      {deciding && <div className="alert alert-info">AI sedang menuliskan alasan keputusan...</div>}

      {!open && room.decided_option && (
        <div className="card card-soft mb-4" style={{ borderLeft: '5px solid #198754' }}>
          <div className="card-body">
            <div className="text-muted small">Keputusan kelompok</div>
            <h4 className="fw-bold mb-2">{room.decided_option.title}</h4>
            {room.decision_reason && <p className="mb-0">{room.decision_reason}</p>}
          </div>
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-7">
          <h5 className="fw-bold mb-3">Ranking kandidat</h5>
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
          {open && <PreferenceForm room={room} member={myMember} onSaved={load} />}

          <div className="card card-soft mb-3">
            <div className="card-body">
              <h6 className="fw-bold mb-2">Anggota ({room.members.length})</h6>
              {room.members.map((m) => (
                <div className="d-flex justify-content-between small py-1" key={m.id}>
                  <span>
                    {m.name}
                    {m.id === room.owner_id && <span className="badge bg-light text-dark border ms-1">pemilik</span>}
                  </span>
                  <span className="text-muted">{m.pivot.pref_text ? 'sudah isi preferensi' : 'belum isi preferensi'}</span>
                </div>
              ))}
            </div>
          </div>

          {open && <CandidatePicker room={room} onChanged={load} />}
        </div>
      </div>
    </Layout>
  )
}

export default RoomShow
