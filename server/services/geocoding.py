import json, urllib.parse, urllib.request

def geocode(address, city):
    """Converte endereço em coordenadas via Nominatim (OpenStreetMap). Retorna (lat, lng, UF) ou None."""
    q = urllib.parse.urlencode({"q": f"{address}, {city}, Brasil", "format": "json", "limit": 1, "addressdetails": 1})
    req = urllib.request.Request("https://nominatim.openstreetmap.org/search?" + q,
                                 headers={"User-Agent": "AcessaAqui/1.0 (projeto academico IFAC)"})
    try:
        with urllib.request.urlopen(req, timeout=8) as r:
            data = json.load(r)
    except Exception:
        return None
    if not data: return None
    uf = (data[0].get("address", {}).get("ISO3166-2-lvl4") or "").split("-")[-1]
    return float(data[0]["lat"]), float(data[0]["lon"]), uf
