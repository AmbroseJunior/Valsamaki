#!/usr/bin/env python3
"""
Valsamaki — OpenStreetMap seed script for Crete businesses.

Filters applied:
  1. Must have a name
  2. Chain filter: drops rows with brand/brand:wikidata tags or known chain names
  3. Accommodation filter: hotels/apartments only kept if they have an authentic
     signal (Greek name, or eco/agro/traditional/boutique/farm keyword)
  4. Motel: dropped entirely

Usage:
  export SUPABASE_URL=https://yourproject.supabase.co
  export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
  python3 /tmp/osm_seed_crete.py
"""
import json, os, time, urllib.request, urllib.parse, urllib.error
from collections import Counter

# ── Config ────────────────────────────────────────────────────────────────────
SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
SERVICE_KEY  = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')

if not SUPABASE_URL or not SERVICE_KEY or 'placeholder' in SUPABASE_URL:
    print('ERROR: Set env vars before running:')
    print('  export SUPABASE_URL=https://yourproject.supabase.co')
    print('  export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key')
    exit(1)

OVERPASS_URL = 'https://overpass-api.de/api/interpreter'
BBOX         = '34.80,23.50,35.70,26.40'  # south,west,north,east — Crete

# ── Known chains blocklist ────────────────────────────────────────────────────
CHAIN_NAMES = {
    'starbucks', "mcdonald's", 'mcdonalds', 'kfc', 'burger king', 'subway',
    'pizza hut', 'dominos', "domino's", 'costa', 'costa coffee', 'gregorys',
    "gregory's", "goody's", 'goodys', 'everest', 'flocafe', 'mikel',
    'mikel coffee', 'hilton', 'marriott', 'sheraton', 'holiday inn', 'ibis',
    'novotel', 'best western', 'accor', 'four seasons', 'radisson', 'hyatt',
    'intercontinental', 'lidl', 'aldi', 'carrefour', 'coffee island',
    'ab vassilopoulos', 'sklavenitis', 'masoutis', 'jumbo', 'public',
    'kotsovolos', 'china wok',
}

# Keywords in name/description that signal authentic accommodation
AUTHENTIC_KEYWORDS = {
    'eco', 'agro', 'agritourism', 'agrotourism', 'organic', 'farm',
    'traditional', 'boutique', 'villa', 'cretan', 'stone', 'nature',
    'mountain', 'olive', 'vineyard', 'monastery', 'heritage',
}

def is_chain(tags):
    if tags.get('brand') or tags.get('brand:wikidata'):
        return True
    name = (tags.get('name') or '').lower().strip()
    return any(name == c or name.startswith(c + ' ') for c in CHAIN_NAMES)

def has_authentic_signal(tags):
    """True if an accommodation has a local/authentic character."""
    if tags.get('name:el'):
        return True
    haystack = ' '.join([
        tags.get('name', ''),
        tags.get('name:en', ''),
        tags.get('description', ''),
    ]).lower()
    return any(kw in haystack for kw in AUTHENTIC_KEYWORDS)

def get_category(tags):
    amenity  = tags.get('amenity', '')
    tourism  = tags.get('tourism', '')
    historic = tags.get('historic', '')
    shop     = tags.get('shop', '')
    leisure  = tags.get('leisure', '')
    craft    = tags.get('craft', '')

    if amenity in ('restaurant', 'cafe', 'bar', 'fast_food', 'tavern', 'biergarten'):
        return 'restaurant'

    if tourism in ('hotel', 'apartment'):
        # Only keep if authentically local
        return 'accommodation' if has_authentic_signal(tags) else None
    if tourism == 'motel':
        return None  # drop entirely
    if tourism in ('guest_house', 'hostel', 'chalet'):
        return 'accommodation'

    if amenity == 'marketplace' or shop in ('farm', 'deli', 'health_food', 'organic', 'cheese', 'honey'):
        return 'market'
    if shop in ('wine', 'olive_oil') or craft in ('winery', 'distillery', 'olive_oil', 'beekeeper'):
        return 'producer'
    if tourism in ('museum', 'gallery', 'artwork') or historic in ('archaeological_site', 'monastery', 'castle', 'ruins', 'church'):
        return 'culture'
    if leisure in ('spa', 'fitness_centre') or tourism == 'spa':
        return 'wellness'
    if tourism in ('viewpoint', 'attraction') or leisure in ('beach_resort', 'nature_reserve', 'beach'):
        return 'nature'
    return None

# ── Overpass query ────────────────────────────────────────────────────────────
QUERY = f"""
[out:json][timeout:120];
(
  node["amenity"~"^(restaurant|cafe|bar|fast_food|tavern|biergarten|marketplace)$"]({BBOX});
  node["tourism"~"^(hotel|guest_house|hostel|apartment|motel|chalet|museum|gallery|artwork|viewpoint|attraction|spa)$"]({BBOX});
  node["historic"~"^(archaeological_site|monastery|castle|ruins|church)$"]({BBOX});
  node["shop"~"^(farm|wine|olive_oil|deli|health_food|organic|cheese|honey)$"]({BBOX});
  node["craft"~"^(winery|distillery|olive_oil|beekeeper)$"]({BBOX});
  node["leisure"~"^(spa|fitness_centre|beach_resort|nature_reserve|beach)$"]({BBOX});
);
out body;
"""

print('Querying OpenStreetMap Overpass API for Crete...')
data = urllib.parse.urlencode({'data': QUERY}).encode()
req  = urllib.request.Request(OVERPASS_URL, data=data,
       headers={'User-Agent': 'Valsamaki/1.0 (ethanlewbaird@gmail.com)'})
with urllib.request.urlopen(req, timeout=150) as resp:
    result = json.loads(resp.read())

elements = result.get('elements', [])
print(f'  Raw OSM nodes: {len(elements)}')

# ── Filter and build rows ─────────────────────────────────────────────────────
rows = []
skipped = Counter()

for el in elements:
    tags = el.get('tags', {})
    name = tags.get('name:en') or tags.get('name') or tags.get('name:el')
    if not name:
        skipped['no_name'] += 1
        continue
    if is_chain(tags):
        skipped['chain'] += 1
        continue
    category = get_category(tags)
    if not category:
        skipped['filtered_category'] += 1
        continue

    desc_parts = []
    if tags.get('cuisine'):
        desc_parts.append(tags['cuisine'].replace(';', ', ').replace('_', ' ').title())
    if tags.get('description'):
        desc_parts.append(tags['description'])
    if tags.get('opening_hours'):
        desc_parts.append(f"Hours: {tags['opening_hours']}")

    tag_list = []
    if tags.get('diet:vegetarian') in ('yes', 'only'): tag_list.append('vegetarian')
    if tags.get('diet:vegan')      in ('yes', 'only'): tag_list.append('vegan')
    if tags.get('organic')         in ('yes', 'only'): tag_list.append('organic')
    if tags.get('outdoor_seating') == 'yes':           tag_list.append('outdoor-seating')
    if tags.get('wheelchair')      == 'yes':           tag_list.append('accessible')
    if tags.get('internet_access') in ('yes', 'wlan'): tag_list.append('wifi')

    addr_parts = [tags.get('addr:street', ''), tags.get('addr:housenumber', ''), tags.get('addr:city', '')]
    address = ' '.join(p for p in addr_parts if p).strip() or None

    rows.append({
        'name':        name,
        'description': '; '.join(desc_parts) if desc_parts else None,
        'category':    category,
        'lat':         el.get('lat'),
        'lng':         el.get('lon'),
        'address':     address,
        'phone':       tags.get('phone') or tags.get('contact:phone'),
        'website':     tags.get('website') or tags.get('contact:website'),
        'tags':        tag_list,
        'images':      [],
        'source':      'osm',
        'is_claimed':  False,
        'is_verified': False,
        'osm_id':      el.get('id'),
        'is_active':   True,
    })

print(f'\n  Skipped — no name        : {skipped["no_name"]}')
print(f'  Skipped — chain/brand    : {skipped["chain"]}')
print(f'  Skipped — generic accom  : {skipped["filtered_category"]}')
print(f'  Ready to insert          : {len(rows)}')

cats = Counter(r['category'] for r in rows)
print('\n  By category:')
for cat, count in sorted(cats.items(), key=lambda x: -x[1]):
    print(f'    {cat:20s} {count}')

# ── Insert into Supabase in batches ───────────────────────────────────────────
BATCH_SIZE = 50
inserted   = 0
errors     = 0

print(f'\nInserting into Supabase...')
for i in range(0, len(rows), BATCH_SIZE):
    batch = rows[i:i + BATCH_SIZE]
    body  = json.dumps(batch).encode()
    req   = urllib.request.Request(
        f'{SUPABASE_URL}/rest/v1/businesses',
        data=body,
        headers={
            'Content-Type':  'application/json',
            'Authorization': f'Bearer {SERVICE_KEY}',
            'apikey':        SERVICE_KEY,
            'Prefer':        'resolution=ignore-duplicates,return=minimal',
        },
        method='POST',
    )
    try:
        with urllib.request.urlopen(req) as resp:
            inserted += len(batch)
            print(f'  Batch {i // BATCH_SIZE + 1:3d}: +{len(batch)} (total {inserted})')
    except urllib.error.HTTPError as e:
        print(f'  Batch {i // BATCH_SIZE + 1:3d}: ERROR {e.code} — {e.read().decode()[:200]}')
        errors += 1
    time.sleep(0.2)

print(f'\nDone. Inserted: {inserted}  Errors: {errors}')
