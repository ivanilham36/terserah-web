import React, { useState, useEffect } from 'react'
//import component bootstrap
import { Modal } from 'react-bootstrap'
//import BASE URL API
import Api from '../../api'
import { notifySuccess, notifyError, errorMessage } from '../../utils/notify'

function ReviewModal({ show, onHide, option, onSaved }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (show) {
      setRating(5)
      setComment('')
    }
  }, [show])

  const submitHandler = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      await Api.post(`/api/options/${option.id}/reviews`, {
        rating: Number(rating),
        comment: comment || null,
      })
      notifySuccess('Ulasan disimpan.')
      onSaved()
      onHide()
    } catch (error) {
      notifyError(errorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <form onSubmit={submitHandler}>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5">Ulas: {option?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <label className="small mb-1">Rating</label>
          <select className="form-select mb-2" value={rating} onChange={(e) => setRating(e.target.value)}>
            <option value={5}>5 - Sangat bagus</option>
            <option value={4}>4 - Bagus</option>
            <option value={3}>3 - Cukup</option>
            <option value={2}>2 - Kurang</option>
            <option value={1}>1 - Buruk</option>
          </select>
          <label className="small mb-1">Komentar (opsional)</label>
          <textarea className="form-control" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
          <div className="small text-muted mt-2">Satu ulasan per orang untuk tiap opsi. Mengirim lagi akan memperbarui ulasanmu.</div>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-outline-secondary" onClick={onHide}>
            Batal
          </button>
          <button type="submit" className="btn btn-brand" disabled={saving}>
            {saving ? 'Menyimpan...' : 'Kirim ulasan'}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export default ReviewModal
