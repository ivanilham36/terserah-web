//import Toaster
import { Toaster } from 'react-hot-toast'
//import routes
import Routes from './routes/routes'

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--ink)',
            color: 'var(--bg)',
            borderRadius: '10px',
            fontSize: '0.9rem',
            fontWeight: 500,
            padding: '10px 14px',
          },
          success: { iconTheme: { primary: '#C8F032', secondary: '#121210' } },
        }}
      />
      <Routes />
    </>
  )
}

export default App
