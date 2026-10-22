//import toats
import toast from 'react-hot-toast'

const style = {
  borderRadius: '10px',
  background: '#333',
  color: '#fff',
}

export const notifySuccess = (message) =>
  toast.success(message, { duration: 3000, position: 'top-right', style })

export const notifyError = (message) =>
  toast.error(message, { duration: 4000, position: 'top-right', style })

//ambil pesan error dari response Laravel
export const errorMessage = (error) =>
  error.response?.data?.message || 'Terjadi kesalahan, coba lagi.'
