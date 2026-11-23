// map.js - Gerenciador do Mapa Interativo com Leaflet e OpenStreetMap
import { BADGE_TIERS } from './certification.js';

export class MapManager {
  constructor(containerId = 'map-container', onMarkerClick = null) {
    this.containerId = containerId;
    this.onMarkerClick = onMarkerClick;
    this.map = null;
    this.markersLayer = null;
    this.markersById = new Map();
    this.userMarker = null;
    this.userLocation = { lat: -23.561414, lng: -46.655881 }; // Centro padrão (Av. Paulista, SP)
    this.pickerMarker = null;
    this.isPickerMode = false;
    this.onLocationPicked = null;

    this.initMap();
  }

  initMap() {
    const el = document.getElementById(this.containerId);
    if (!el || typeof L === 'undefined') {
      console.warn('Leaflet ou container do mapa indisponível.');
      return;
    }

    this.map = L.map(this.containerId, {
      center: [this.userLocation.lat, this.userLocation.lng],
      zoom: 14,
      zoomControl: false,
      keyboard: true
    });

    // Adiciona controle de zoom acessível no canto superior direito
    L.control.zoom({ position: 'topright' }).addTo(this.map);

    // Camada OpenStreetMap com estilo limpo
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);

    // Adiciona marcador do usuário
    this.updateUserMarker();

    // Evento de clique para seletor de localização no cadastro
    this.map.on('click', (e) => {
      if (this.isPickerMode && this.onLocationPicked) {
        this.setPickerLocation(e.latlng.lat, e.latlng.lng);
        this.onLocationPicked(e.latlng.lat, e.latlng.lng);
      }
    });
  }

  updateUserMarker() {
    if (!this.map) return;

    if (this.userMarker) {
      this.userMarker.setLatLng([this.userLocation.lat, this.userLocation.lng]);
    } else {
      const userIcon = L.divIcon({
        className: 'user-location-pin',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-5 w-5 bg-blue-600 border-2 border-white shadow-md"></span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      this.userMarker = L.marker([this.userLocation.lat, this.userLocation.lng], {
        icon: userIcon,
        title: 'Sua Localização Atual'
      }).addTo(this.map);

      this.userMarker.bindPopup('<strong>Você está aqui</strong><br><small>Ponto de referência para distâncias</small>');
    }
  }

  renderEstablishments(establishments = []) {
    if (!this.map || !this.markersLayer) return;

    this.markersLayer.clearLayers();
    this.markersById.clear();

    if (establishments.length === 0) return;

    const bounds = L.latLngBounds();
    bounds.extend([this.userLocation.lat, this.userLocation.lng]);

    establishments.forEach(est => {
      if (!est.lat || !est.lng) return;

      const tier = est.scoreData?.tier || BADGE_TIERS.INICIANTE;
      const dist = this.calculateDistance(this.userLocation.lat, this.userLocation.lng, est.lat, est.lng);

      // Ícone estilizado com a cor do selo
      const markerHtml = `
        <div class="custom-marker-pin tier-${tier.id}" style="--badge-color: ${tier.color};" aria-label="${est.name} - ${tier.name}">
          <div class="pin-inner">
            <span class="pin-icon">${this.getCategoryEmoji(est.category)}</span>
          </div>
          <div class="pin-badge-indicator" style="background-color: ${tier.color};"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: markerHtml,
        iconSize: [42, 50],
        iconAnchor: [21, 48],
        popupAnchor: [0, -45]
      });

      const marker = L.marker([est.lat, est.lng], {
        icon: customIcon,
        title: `${est.name} (${tier.name})`
      });

      // Conteúdo do Popup Acessível
      const popupHtml = `
        <div class="p-1 max-w-[240px]">
          <div class="font-bold text-sm text-slate-900 leading-tight mb-1">${est.name}</div>
          <div class="text-xs text-slate-500 mb-1.5 flex items-center gap-1">
            <span>${this.getCategoryEmoji(est.category)} ${est.category}</span>
            <span>•</span>
            <span class="font-medium text-emerald-700">${dist.toFixed(1)} km</span>
          </div>
          <div class="inline-block px-2 py-0.5 rounded text-[11px] font-semibold text-white mb-2" style="background-color: ${tier.color}">
            ${tier.name}
          </div>
          <div class="text-xs text-slate-600 line-clamp-2 mb-2">
            ${est.description || est.address}
          </div>
          <button 
            type="button" 
            class="w-full text-center py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow transition-colors"
            onclick="window.dispatchEvent(new CustomEvent('open-establishment-details', { detail: { id: '${est.id}' } }))"
          >
            Ver Acessibilidade Completa
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        if (this.onMarkerClick) {
          this.onMarkerClick(est);
        }
      });

      this.markersLayer.addLayer(marker);
      this.markersById.set(est.id, marker);
      bounds.extend([est.lat, est.lng]);
    });

    // Ajusta mapa para abranger marcadores se houver algum
    if (establishments.length > 0) {
      this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }

  focusEstablishment(est) {
    if (!this.map || !est.lat || !est.lng) return;
    this.map.flyTo([est.lat, est.lng], 16, {
      animate: true,
      duration: 1.0
    });
    const marker = this.markersById?.get(est.id);
    if (marker) {
      setTimeout(() => {
        try { marker.openPopup(); } catch(e){}
      }, 700);
    }
  }

  centerOnUser() {
    if (!this.map) return;
    this.map.flyTo([this.userLocation.lat, this.userLocation.lng], 15, {
      animate: true,
      duration: 1.0
    });
  }

  requestGeolocation(onSuccess = null, onError = null) {
    if (!navigator.geolocation) {
      if (onError) onError('Geolocalização não suportada no seu navegador.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.userLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        this.updateUserMarker();
        this.centerOnUser();
        if (onSuccess) onSuccess(this.userLocation);
      },
      (err) => {
        console.warn('Geolocalização recusada ou indisponível:', err.message);
        if (onError) onError(err.message);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }

  setUserCoordinates(lat, lng) {
    this.userLocation = { lat: Number(lat), lng: Number(lng) };
    this.updateUserMarker();
    this.centerOnUser();
  }

  enablePickerMode(onLocationPicked) {
    this.isPickerMode = true;
    this.onLocationPicked = onLocationPicked;
    if (this.map) {
      this.map.getContainer().style.cursor = 'crosshair';
    }
  }

  disablePickerMode() {
    this.isPickerMode = false;
    this.onLocationPicked = null;
    if (this.map) {
      this.map.getContainer().style.cursor = '';
    }
    if (this.pickerMarker) {
      this.map.removeLayer(this.pickerMarker);
      this.pickerMarker = null;
    }
  }

  setPickerLocation(lat, lng) {
    if (!this.map) return;
    if (this.pickerMarker) {
      this.pickerMarker.setLatLng([lat, lng]);
    } else {
      const pinIcon = L.divIcon({
        className: 'picker-pin',
        html: `
          <div class="w-8 h-8 bg-red-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs">
            📍
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });
      this.pickerMarker = L.marker([lat, lng], { icon: pinIcon }).addTo(this.map);
    }
    this.map.panTo([lat, lng]);
  }

  // Fórmula de Haversine para cálculo de distância em km
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  getCategoryEmoji(category = '') {
    const cat = category.toLowerCase();
    if (cat.includes('restaurante') || cat.includes('café') || cat.includes('alimentação')) return '☕';
    if (cat.includes('cultura') || cat.includes('teatro') || cat.includes('cinema')) return '🎭';
    if (cat.includes('saúde') || cat.includes('clínica') || cat.includes('hospital')) return '🏥';
    if (cat.includes('lazer') || cat.includes('parque')) return '🌳';
    if (cat.includes('supermercado') || cat.includes('comércio')) return '🛒';
    if (cat.includes('hotel') || cat.includes('turismo')) return '🏨';
    if (cat.includes('escola') || cat.includes('educação')) return '🎓';
    return '📍';
  }

  invalidateSize() {
    if (this.map) {
      setTimeout(() => this.map.invalidateSize(), 200);
    }
  }
}

