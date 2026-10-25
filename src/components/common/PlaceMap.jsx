import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

//tile standar OpenStreetMap (tanpa API key); mode gelap lewat filter CSS di .place-map
const TILE = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

const pin = (kind, label) =>
  L.divIcon({
    className: '',
    html: `<span class="map-pin map-pin-${kind}">${label ?? ''}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })

/**
 * markers: [{ id, lat, lng, title, kind: 'result' | 'candidate' | 'me', label }]
 * Peta OpenStreetMap; gelap/terang ditangani CSS.
 */
function PlaceMap({ markers = [], height = 280, onMarkerClick }) {
  const el = useRef(null)
  const map = useRef(null)
  const layer = useRef(null)
  const clickRef = useRef(onMarkerClick)
  clickRef.current = onMarkerClick

  useEffect(() => {
    map.current = L.map(el.current, { zoomControl: true, scrollWheelZoom: false }).setView([-2.5, 118], 4)
    L.tileLayer(TILE, { attribution: ATTR, maxZoom: 19 }).addTo(map.current)
    layer.current = L.layerGroup().addTo(map.current)

    return () => {
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
