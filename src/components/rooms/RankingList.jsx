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
        <div className="card-body text-center text-muted py-5">
          Belum ada kandidat. Tambahkan dari katalog, minta ide AI, atau buat opsi baru di panel kanan.
        </div>
      </div>
    )
  }

  return (
    <React.Fragment>
      {ranked.map((item, index) => {
        const myVote = myVotes[item.option_id]

        return (
          <div className="card card-soft mb-3" key={item.option_id}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <span className="badge bg-secondary me-2">#{index + 1}</span>
                  <span className="fw-bold fs-5">{item.title}</span>
                </div>
                <div className="fs-4 fw-bold brand">{item.score}</div>
              </div>

              <div className="progress my-2" style={{ height: '8px' }}>
                <div className="progress-bar" style={{ width: `${item.score}%`, background: '#5b3df5' }} />
              </div>

              <div className="mb-2">
                {Object.entries(item.breakdown).map(([key, value]) => (
                  <span className="badge bg-light text-dark border me-1" key={key}>
                    {LABELS[key] || key} {Math.round(value * 100)}%
                  </span>
                ))}
                {item.up_votes > 0 && (
                  <span className="badge bg-success">{item.up_votes} suka</span>
                )}
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
                    Hapus kandidat
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
            <h6 className="fw-bold">Tersingkir ({excluded.length})</h6>
            {excluded.map((item) => (
              <div className="d-flex justify-content-between align-items-center border-top py-2" key={item.option_id}>
                <div>
                  <div>{item.title}</div>
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
