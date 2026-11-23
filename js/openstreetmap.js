const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

function categoryFor(tags) {
  const type = tags.amenity || tags.shop || tags.tourism || tags.leisure || tags.craft || 'Local';
  if (/restaurant|cafe|fast_food|bar|pub|food_court|bakery/.test(type)) return 'Restaurante';
  if (/theatre|cinema|arts_centre|museum|gallery|library/.test(type)) return 'Cultura';
  if (/hospital|clinic|doctors|dentist|pharmacy|health/.test(type)) return 'Saúde';
  if (/park|garden|playground|sports|pitch/.test(type)) return 'Lazer';
  if (/supermarket|convenience|greengrocer|mall|department_store/.test(type)) return 'Supermercado';
  if (/hotel|hostel|guest_house|motel|attraction|museum/.test(type)) return 'Hotelaria';
  return type.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function addressFor(tags) {
  const street = [tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(', ');
  const locality = tags['addr:suburb'] || tags['addr:city'] || tags['addr:place'];
  return [street, locality].filter(Boolean).join(' — ') || 'Endereço não informado no OpenStreetMap';
}

export async function getNearbyOSMPlaces({ lat, lng }, { signal } = {}) {
  const query = `[out:json][timeout:18];(nwr(around:3000,${lat},${lng})["name"]["amenity"];nwr(around:3000,${lat},${lng})["name"]["shop"];nwr(around:3000,${lat},${lng})["name"]["tourism"];nwr(around:3000,${lat},${lng})["name"]["leisure"];);out center tags 100;`;
  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: new URLSearchParams({ data: query }),
    signal
  });
  if (!response.ok) throw new Error('O serviço de mapas não respondeu.');
  const payload = await response.json();

  return (payload.elements || []).flatMap((place) => {
    const tags = place.tags || {};
    const latValue = place.lat ?? place.center?.lat;
    const lngValue = place.lon ?? place.center?.lon;
    if (!tags.name || !Number.isFinite(Number(latValue)) || !Number.isFinite(Number(lngValue))) return [];
    const type = ['node', 'way', 'relation'].includes(place.type) ? place.type : 'node';
    return [{
      id: `osm/${type}/${place.id}`,
      source: 'osm',
      name: escapeHtml(tags.name),
      category: escapeHtml(categoryFor(tags)),
      description: 'Local listado no OpenStreetMap. Acessibilidade ainda não verificada pelo AcessaAqui.',
      address: escapeHtml(addressFor(tags)),
      lat: Number(latValue),
      lng: Number(lngValue),
      rating: null,
      reviewsCount: 0,
      verifiedByCommunity: false,
      features: [],
      osmUrl: `https://www.openstreetmap.org/${type}/${place.id}`
    }];
  });
}
