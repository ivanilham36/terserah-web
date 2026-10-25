import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const TILES = {
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
}
const ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'

const currentTheme = () => (document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light')

const pin = (kind, label) =>
  L.divIcon({
    className: '',
    html: `<span class="map-pin map-pin-${kind}">${label ?? ''}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })

/**
 * markers: [{ id, lat, lng, title, kind: 'result' | 'candidate' | 'me', label }]
 * Peta OpenStreetMap (tile CARTO) yang ikut tema terang/gelap.
 */
function PlaceMap({ markers = [], height = 280, onMarkerClick }) {
  const el = useRef(null)
  const map = useRef(null)
  const tile = useRef(null)
  const layer = useRef(null)
  const clickRef = useRef(onMarkerClick)
  clickRef.current = onMarkerClick

  useEffect(() => {
    map.current = L.map(el.current, { zoomControl: true, scrollWheelZoom: false }).setView([-2.5, 118], 4)
    tile.current = L.tileLayer(TILES[currentTheme()], { attribution: ATTR, maxZoom: 19, subdomains: 'abcd' }).addTo(map.current)
    layer.current = L.layerGroup().addTo(map.current)

    //ikuti pergantian tema
    const observer = new MutationObserver(() => tile.current.setUrl(TILES[currentTheme()]))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    return () => {
      observer.disconnect()
      map.current.remove()
    }
  }, [])

  useEffect(() => {
    layer.current.clearLayers()
    const pts = []
    markers.forEach((m) => {
      if (m.lat == null || m.lng == null) return
      const p = [Number(m.lat), Number(m.lng)]
      pts.push(p)
      const marker = L.marker(p, { icon: pin(m.kind || 'result', m.label), title: m.title }).addTo(layer.current)
      if (m.title) marker.bindTooltip(m.title, { direction: 'top', offset: [0, -10] })
      marker.on('click', () => clickRef.current && clickRef.current(m))
    })
    if (pts.length) map.current.fitBounds(L.latLngBounds(pts), { padding: [30, 30], maxZoom: 16 })
    setTimeout(() => map.current && map.current.invalidateSize(), 0)
  }, [markers])

  return <div ref={el} className="place-map" style={{ height }} />
}

export default PlaceMap
