import React from 'react'
import { Link } from 'react-router-dom'

//wordmark: tanda seru di kotak lime sedikit miring
export const Wordmark = () => (
  <span className="wordmark">
    terserah<span className="bang">!</span>
  </span>
)

const Logo = ({ to = '/' }) => (
  <Link to={to} className="wordmark" aria-label="Terserah!">
    terserah<span className="bang">!</span>
  </Link>
)

export default Logo
