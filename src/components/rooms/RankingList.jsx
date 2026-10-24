import React from 'react'

const LABELS = {
  preference: 'Preferensi',
  rating: 'Rating',
  price: 'Harga',
  distance: 'Jarak',
}

function RankingList({ ranked, excluded, myVotes, isOwner, open, onVote, onDecide, onRemove }) {
  if (ranked.length === 0 && excluded.length === 0) {
    return (
      <div className="card card-soft">
        <div className="empty-state">
          <div className="empty-icon">+</div>
          <div className="fw-bold text-dark mb-1">Belum ada kandidat</div>
          Tambahkan dari katalog, minta ide AI, atau buat opsi baru di panel kanan.
        </div>
      </div>
    )
  }

  return (
    <React.Fragment>
      {ranked.map((item, index) => {
        const myVote = myVotes[item.option_id]

        return (
          <div className={`card card-soft rank-card mb-3 ${index === 0 ? 'is-top' : ''}`} key={item.option_id}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start gap-3 mb-1">
                <div className="d-flex align-items-center gap-2">
                  <span className="rank-num">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <div className="rank-title">{item.title}</div>
                    {item.up_votes > 0 && <span className="badge bg-success">{item.up_votes} suka</span>}
                  </div>
                </div>
                <div className="rank-score">{item.score}</div>
              </div>

              <div className="meter-grid">
                {Object.entries(item.breakdown).map(([key, value]) => (
                  <div className="meter" key={key}>
                    <div className="meter-top">
                      <span>{LABELS[key] || key}</span>
                      <b>{Math.round(value * 100)}%</b>
                    </div>
                    <div className="seg lime">
                      <i style={{ width: `${Math.round(value * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {open && (
                <div className="d-flex flex-wrap gap-2">
                  <button
                    className={`btn btn-sm ${myVote === 'up' ? 'btn-success' : 'btn-outline-success'}`}
                    onClick={() => onVote(item.option_id, 'up', myVote)}
                  >
                    Suka
                  </button>
                  <button
                    className={`btn btn-sm ${myVote === 'veto' ? 'btn-danger' : 'btn-outline-danger'}`}
                    onClick={() => onVote(item.option_id, 'veto', myVote)}
                  >
                    Veto
                  </button>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => onRemove(item.option_id)}>
                    Hapus
                  </button>
                  {isOwner && (
                    <button className="btn btn-sm btn-brand ms-auto" onClick={() => onDecide(item)}>
                      Putuskan ini
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}

      {excluded.length > 0 && (
        <div className="card card-soft">
          <div className="card-body">
            <h6 className="fw-bold mb-1">Tersingkir ({excluded.length})</h6>
            {excluded.map((item) => (
              <div
                className="d-flex justify-content-between align-items-center gap-2 border-top mt-2 pt-2"
                key={item.option_id}
                style={{ borderColor: 'var(--line-2)' }}
              >
                <div>
                  <div className="fw-semibold" style={{ color: 'var(--ink-2)' }}>
                    {item.title}
                  </div>
                  <div className="small text-muted">{item.reason}</div>
                </div>
                {open && myVotes[item.option_id] === 'veto' && (
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => onVote(item.option_id, 'veto', 'veto')}
                  >
                    Cabut veto saya
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </React.Fragment>
  )
}

export default RankingList
