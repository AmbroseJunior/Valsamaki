// Scraped from incrediblecrete.gr — tourist places for the Map > Places tab

export type PlaceCategory =
  | 'archaeological'
  | 'beach'
  | 'gorge'
  | 'cave'
  | 'museum'
  | 'nature'

export interface CretePlace {
  id: string
  title: string
  subtitle: string
  category: PlaceCategory
  region: 'Heraklion' | 'Chania' | 'Rethymno' | 'Lasithi'
  location: string
  coordinates: { lat: number; lng: number }
  description: string
  hours?: string
  price?: string
  tags: string[]
  image: string
  highlights: string[]
  source: { name: string; url: string }
}

const SOURCE = {
  name: 'Incredible Crete',
  url: 'https://www.incrediblecrete.gr/en/',
}

export const SCRAPED_PLACES: CretePlace[] = [
  // ── Archaeological Sites ────────────────────────────────────────────────────
  {
    id: 'ic-arch-1',
    title: 'Palace of Knossos',
    subtitle: 'Largest Minoan Palace',
    category: 'archaeological',
    region: 'Heraklion',
    location: '5 km south of Heraklion',
    coordinates: { lat: 35.2976, lng: 25.1634 },
    description:
      'The largest centre of Minoan civilisation, legendary home of King Minos and the mythical Labyrinth. The palace spans ~20,000 m² across multiple floors featuring advanced sewerage, lightwells, and world-renowned frescoes. Excavated and partially reconstructed by Arthur Evans in the early 20th century.',
    hours: 'Apr–Oct 08:00–20:00 · Nov–Mar 08:00–15:00',
    price: '€15 (combo with Heraklion Museum €20)',
    tags: ['minoan', 'palace', 'archaeology', 'frescoes', 'labyrinth', 'UNESCO'],
    image: 'https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?w=800&q=80',
    highlights: ['Throne Room', 'Grand Staircase', 'Dolphin Fresco', 'Minoan drainage system'],
    source: SOURCE,
  },
  {
    id: 'ic-arch-2',
    title: 'Palace of Phaistos',
    subtitle: 'Second-Largest Minoan Palace',
    category: 'archaeological',
    region: 'Heraklion',
    location: 'Messara Plain, South Crete',
    coordinates: { lat: 35.0533, lng: 24.8113 },
    description:
      'Built around 1900 BC, Phaistos was the second-largest Minoan palace and an administrative and religious centre. Destroyed and rebuilt multiple times, it is where the famous Phaistos Disc was discovered — an undeciphered clay disc bearing the world\'s first printed text.',
    hours: 'Daily 08:00–20:00 (summer) · 08:30–15:00 (winter)',
    price: '€8',
    tags: ['minoan', 'palace', 'phaistos disc', 'messara', 'archaeology'],
    image: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=800&q=80',
    highlights: ['Grand Propylon', 'Theatre Area', 'Phaistos Disc discovery site', 'Panoramic Messara views'],
    source: SOURCE,
  },
  {
    id: 'ic-arch-3',
    title: 'Palace of Zakros',
    subtitle: 'Minoan Eastern Gateway',
    category: 'archaeological',
    region: 'Lasithi',
    location: 'Kato Zakros, East Crete',
    coordinates: { lat: 35.0980, lng: 26.2634 },
    description:
      'The fourth-largest Minoan palace, Zakros served as a major port and commercial gateway to the East. Covering 8,000+ m² with 300+ rooms, it housed ceremonial halls, royal quarters, and workshops for perfumes and faience. Reached via the dramatic Gorge of the Dead.',
    hours: 'Daily 08:30–15:00',
    price: '€6',
    tags: ['minoan', 'palace', 'port', 'east crete', 'gorge of the dead'],
    image: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&q=80',
    highlights: ['Central Court', 'Workshop Area', 'Royal Apartments', 'Adjacent Gorge of the Dead trail'],
    source: SOURCE,
  },
  {
    id: 'ic-arch-4',
    title: 'Ancient Aptera',
    subtitle: 'Venetian Fortress & City-State',
    category: 'archaeological',
    region: 'Chania',
    location: 'Bay of Souda, Chania',
    coordinates: { lat: 35.4777, lng: 24.0783 },
    description:
      'A major city-state overlooking the Bay of Souda that thrived in the Classical and Hellenistic periods. Features impressive Roman water tanks, a 3,700-capacity theatre, bath complexes, and the Monastery of Agios Ioannis Theologos. The name derives from the myth of the Sirens who lost their feathers (apta = featherless) here.',
    hours: 'Tue–Sun 08:30–15:00',
    price: '€6',
    tags: ['ancient', 'hellenistic', 'theatre', 'venetian', 'souda bay'],
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    highlights: ['Roman cisterns', 'Ancient theatre', 'Monastery of Agios Ioannis', 'Bay of Souda views'],
    source: SOURCE,
  },
  {
    id: 'ic-arch-5',
    title: 'Ancient Gortys',
    subtitle: 'Capital of Roman Crete',
    category: 'archaeological',
    region: 'Heraklion',
    location: 'Messara Plain, Central Crete',
    coordinates: { lat: 35.0578, lng: 24.9457 },
    description:
      'The ancient capital of Roman Crete and Cyrene, Gortys spans ~1,000 acres across multiple hills. Inhabited since Neolithic times, it contains an acropolis, necropolis, temple of Apollo, and the famous Great Inscription — the earliest known example of Greek law, carved in boustrophedon style.',
    hours: 'Daily 08:00–20:00 (summer)',
    price: '€6',
    tags: ['roman', 'ancient law', 'acropolis', 'inscription', 'messara'],
    image: 'https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?w=800&q=80',
    highlights: ['Great Law Inscription', 'Basilica of Titus', 'Acropolis ruins', 'Temple of Apollo'],
    source: SOURCE,
  },
  {
    id: 'ic-arch-6',
    title: 'Ancient Eleftherna',
    subtitle: 'Geometric & Archaic City',
    category: 'archaeological',
    region: 'Rethymno',
    location: 'Foothills of Mount Ida, Rethymno',
    coordinates: { lat: 35.2614, lng: 24.6817 },
    description:
      'A major ancient city during the Geometric and Archaic periods that minted its own coins from the 4th century BC. Stretching across Pyrgi and Nisi hills, discoveries span from 3rd millennium BC to modern times, including a unique bowstring arch bridge, Hellenistic quarter, and remarkable funerary pyres.',
    hours: 'Tue–Sun 09:00–15:00',
    price: '€6',
    tags: ['geometric', 'archaic', 'excavation', 'mount ida', 'museum'],
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
    highlights: ['New Archaeological Museum', 'Bowstring arch bridge', 'Hellenistic quarter', 'Funerary pyres'],
    source: SOURCE,
  },
  // ── Beaches ─────────────────────────────────────────────────────────────────
  {
    id: 'ic-beach-1',
    title: 'Balos Lagoon',
    subtitle: 'Pink-Sand Venetian Lagoon',
    category: 'beach',
    region: 'Chania',
    location: 'Gramvousa Peninsula, NW Chania',
    coordinates: { lat: 35.5747, lng: 23.5681 },
    description:
      'One of Crete\'s most photographed beaches — a stunning turquoise lagoon with pink-tinged sand and shallow warm waters nestled between the Gramvousa Peninsula and Cape Tigani. Accessible by boat from Kissamos or a 3 km hike from a car park. The nearby Venetian fortress of Gramvousa crowns the clifftop.',
    hours: 'Open year-round · Boat ferries Apr–Oct',
    price: 'Boat ferry ~€18 return · Parking €5',
    tags: ['blue flag', 'lagoon', 'gramvousa', 'pink sand', 'iconic'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    highlights: ['Pink-tinged sand', 'Venetian fortress views', 'Shallow turquoise lagoon', 'Snorkelling'],
    source: SOURCE,
  },
  {
    id: 'ic-beach-2',
    title: 'Elafonissi Beach',
    subtitle: 'Pink-Sand Island Beach',
    category: 'beach',
    region: 'Chania',
    location: 'SW tip of Crete, Chania',
    coordinates: { lat: 35.2706, lng: 23.5376 },
    description:
      'A protected nature reserve beach at the southwestern tip of Crete featuring pink-sand shores coloured by crushed shells and coral. A shallow lagoon separates a small islet you can wade across. The crystal waters and dune ecosystem make it one of Greece\'s most unique beaches.',
    hours: 'Open year-round',
    price: 'Parking €3–5',
    tags: ['nature reserve', 'pink sand', 'island', 'lagoon', 'protected', 'blue flag'],
    image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80',
    highlights: ['Wade-across islet', 'Pink shell sand', 'Shallow crystal lagoon', 'Protected dune ecosystem'],
    source: SOURCE,
  },
  {
    id: 'ic-beach-3',
    title: 'Preveli Palm Beach',
    subtitle: 'River-Fed Gorge Beach',
    category: 'beach',
    region: 'Rethymno',
    location: 'Preveli, South Rethymno',
    coordinates: { lat: 35.1347, lng: 24.6698 },
    description:
      'A unique beach where a freshwater river meets the Libyan Sea, flanked by Europe\'s only natural palm forest (Phoenix Theophrasti). Accessible by boat from Agia Galini or a scenic 30-minute hike down from Preveli Monastery. The river lagoon is perfect for swimming year-round.',
    hours: 'Open year-round · Boat service Apr–Oct',
    price: 'Boat ~€12 · Parking €3',
    tags: ['palm forest', 'river', 'gorge', 'monastery', 'south coast', 'unique'],
    image: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=800&q=80',
    highlights: ['Palm forest riverside', 'Freshwater river lagoon', 'Preveli Monastery above', 'Boat access'],
    source: SOURCE,
  },
  {
    id: 'ic-beach-4',
    title: 'Falassarna Beach',
    subtitle: 'Ancient Port & Sunset Beach',
    category: 'beach',
    region: 'Chania',
    location: 'Kissamos, NW Chania',
    coordinates: { lat: 35.5136, lng: 23.5716 },
    description:
      'A 3 km stretch of golden sand rated among Greece\'s best beaches, backed by the ruins of the ancient Minoan port of Falassarna. The broad shallow bay is perfect for families and offers spectacular Aegean sunsets. The beach has repeatedly won Blue Flag status.',
    hours: 'Open year-round',
    price: 'Free entry',
    tags: ['blue flag', 'golden sand', 'ancient port', 'sunset', 'swimming', 'NW Crete'],
    image: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&q=80',
    highlights: ['3 km golden beach', 'Ancient Falassarna ruins', 'Renowned sunset views', 'Shallow calm waters'],
    source: SOURCE,
  },
  {
    id: 'ic-beach-5',
    title: 'Agia Galini Beach',
    subtitle: 'Colourful Fishing Village Beach',
    category: 'beach',
    region: 'Rethymno',
    location: 'Agia Galini, South Rethymno',
    coordinates: { lat: 35.0953, lng: 24.6910 },
    description:
      'Nestled beneath colourful cliff-side houses, Agia Galini is a charming fishing village on the Libyan Sea with a pebble-and-sand beach. The sheltered cove offers calm waters and a vibrant taverna scene. Boat trips depart daily to neighbouring beaches including Agiofarango and Matala.',
    hours: 'Open year-round',
    price: 'Free entry',
    tags: ['fishing village', 'libyan sea', 'boat trips', 'south coast', 'tavernas'],
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
    highlights: ['Colourful cliff-side village', 'Boat trips to caves & beaches', 'Calm sheltered cove', 'Fresh seafood tavernas'],
    source: SOURCE,
  },
  // ── Gorges ──────────────────────────────────────────────────────────────────
  {
    id: 'ic-gorge-1',
    title: 'Samaria Gorge',
    subtitle: "Europe's Longest Gorge",
    category: 'gorge',
    region: 'Chania',
    location: 'White Mountains National Park, Chania',
    coordinates: { lat: 35.2839, lng: 23.9731 },
    description:
      'The crown jewel of Cretan hiking — Europe\'s longest gorge winds 16 km through the White Mountains National Park. Past the legendary Iron Gates (two 300 m cliffs just 3 m apart), the trail ends at the crystal-clear waters of Agia Roumeli on the Libyan Sea. Home to the rare Cretan wild goat (kri-kri).',
    hours: 'May–Oct · Gate opens 07:00, last entry 15:00',
    price: '€5 national park fee',
    tags: ['hiking', 'national park', 'kri-kri', 'iron gates', 'UNESCO', 'challenging'],
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    highlights: ['Iron Gates (3 m wide passage)', 'Kri-kri wild goat habitat', '16 km trail', 'Libyan Sea finish'],
    source: SOURCE,
  },
  {
    id: 'ic-gorge-2',
    title: 'Imbros Gorge',
    subtitle: 'WWII History & Nature Trail',
    category: 'gorge',
    region: 'Chania',
    location: 'Sfakia, South Chania',
    coordinates: { lat: 35.2456, lng: 24.1283 },
    description:
      'A stunning 8 km gorge through the White Mountains used by Allied forces to evacuate to Egypt during WWII. Much easier than Samaria, the trail narrows to just 1.5 m at its tightest point through soaring 300 m limestone walls. Wild fig trees, oleander, and rock formations make this a botanist\'s paradise.',
    hours: 'Open year-round · Best Apr–Nov',
    price: '€2',
    tags: ['hiking', 'WWII', 'sfakia', 'easy-moderate', 'wildflowers', 'limestone'],
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
    highlights: ['1.5 m narrowest passage', 'WWII evacuation route', 'Wild fig trees', 'Chora Sfakion exit'],
    source: SOURCE,
  },
  {
    id: 'ic-gorge-3',
    title: 'Agia Irini Gorge',
    subtitle: 'Family-Friendly Mountain Trail',
    category: 'gorge',
    region: 'Chania',
    location: 'Selino, SW Chania',
    coordinates: { lat: 35.3572, lng: 23.8567 },
    description:
      'A beautiful 7 km gorge through the White Mountains that is more accessible than Samaria. Lush vegetation — plane trees, oleander, rockrose — lines the well-maintained trail. The route starts from the village of Agia Irini and ends at Sougia on the Libyan Sea, where you can take a boat back.',
    hours: 'Apr–Oct',
    price: '€2',
    tags: ['hiking', 'family-friendly', 'plane trees', 'sougia', 'white mountains'],
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    highlights: ['Lush plane tree canopy', 'Sougia beach finish', 'Gentle gradient', 'Rich birdlife'],
    source: SOURCE,
  },
  {
    id: 'ic-gorge-4',
    title: 'Kourtaliotiko Gorge',
    subtitle: 'Sacred Water Gorge',
    category: 'gorge',
    region: 'Rethymno',
    location: 'Kourtaliotis River, South Rethymno',
    coordinates: { lat: 35.1803, lng: 24.6783 },
    description:
      'Crete\'s most water-rich gorge, carved by the Kourtaliotis River through dramatic limestone walls. The route passes the hermit Chapel of Agios Nikolaos with its freshwater spring, griffon vulture colonies nesting in the cliffs, and emerald rock pools — ending at Preveli Palm Beach and the Libyan Sea.',
    hours: 'Open year-round',
    price: 'Free',
    tags: ['gorge', 'river', 'griffon vulture', 'chapel', 'preveli', 'swimming holes'],
    image: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=800&q=80',
    highlights: ['Griffon vulture nesting', 'Chapel of Agios Nikolaos', 'Swimming rock pools', 'Preveli Beach exit'],
    source: SOURCE,
  },
  // ── Caves ───────────────────────────────────────────────────────────────────
  {
    id: 'ic-cave-1',
    title: 'Diktaean Cave (Psychro)',
    subtitle: 'Birthplace of Zeus',
    category: 'cave',
    region: 'Lasithi',
    location: 'Lasithi Plateau, Psychro',
    coordinates: { lat: 35.1525, lng: 25.4716 },
    description:
      'According to Greek mythology, this cave on the Lasithi Plateau is the birthplace of Zeus. One of Crete\'s major Minoan sacred sites, the cave contains two chambers — a small upper cave and a large lower grotto with a subterranean lake. Thousands of votive offerings were discovered here by archaeologists.',
    hours: 'Daily 08:00–20:00 (summer) · 08:30–15:00 (winter)',
    price: '€6',
    tags: ['mythology', 'zeus', 'minoan', 'sacred', 'lasithi plateau', 'UNESCO'],
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    highlights: ['Subterranean sacred lake', 'Votive offering discoveries', 'Birthplace of Zeus', 'Lasithi Plateau views'],
    source: SOURCE,
  },
  {
    id: 'ic-cave-2',
    title: 'Cave of Melidoni',
    subtitle: 'Ancient Sanctuary & Memorial',
    category: 'cave',
    region: 'Rethymno',
    location: 'Melidoni, East Rethymno',
    coordinates: { lat: 35.3547, lng: 24.6247 },
    description:
      'An ancient sanctuary cave dedicated to Talos (the giant bronze guardian of Crete) and Hermes, with archaeological finds dating to Neolithic times. In 1824, over 370 Cretans seeking refuge from Ottoman forces were asphyxiated here — making it a powerful memorial of the Cretan struggle for independence.',
    hours: 'Daily 09:00–19:00',
    price: '€3',
    tags: ['cave', 'sanctuary', 'ottoman history', 'neolithic', 'talos', 'memorial'],
    image: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800&q=80',
    highlights: ['Ancient Talos sanctuary', '1824 Ottoman siege memorial', 'Stalactite formations', 'Neolithic artefacts'],
    source: SOURCE,
  },
  {
    id: 'ic-cave-3',
    title: 'Sfendoni Cave (Zoniana)',
    subtitle: "Crete's Most Spectacular Cave",
    category: 'cave',
    region: 'Rethymno',
    location: 'Zoniana, Central Rethymno',
    coordinates: { lat: 35.2414, lng: 24.7283 },
    description:
      'The most spectacular of Crete\'s show caves, Sfendoni Cave contains some of the largest and most impressive stalactite and stalagmite formations in Europe. Guided tours walk through 250 m of illuminated chambers where ancient bear skeletons have been discovered alongside prehistoric artefacts.',
    hours: 'Daily 10:00–17:00',
    price: '€5',
    tags: ['cave', 'stalactites', 'guided tour', 'prehistoric', 'bear fossils', 'show cave'],
    image: 'https://images.unsplash.com/photo-1548533931-5c5a5bb1e411?w=800&q=80',
    highlights: ['Giant stalactite formations', 'Ancient bear fossils', 'Illuminated 250 m chambers', 'Prehistoric artefacts'],
    source: SOURCE,
  },
  // ── Nature & Mountains ───────────────────────────────────────────────────────
  {
    id: 'ic-nature-1',
    title: 'Mount Ida (Psiloritis)',
    subtitle: "Crete's Highest Peak",
    category: 'nature',
    region: 'Rethymno',
    location: 'Psiloritis, Central Crete',
    coordinates: { lat: 35.2189, lng: 24.7456 },
    description:
      'At 2,456 m, Psiloritis is the highest peak in Crete and a UNESCO Geopark. According to legend, Zeus was raised here in the Idaean Cave. The mountain range shelters rare endemic plants, griffon vultures, and the Cretan wild goat. A popular 3-hour trail leads from Nida plateau to the summit.',
    hours: 'Open year-round · Summit hike Apr–Oct recommended',
    price: 'Free',
    tags: ['mountain', 'hiking', 'UNESCO geopark', 'endemic plants', 'summit', 'kri-kri'],
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    highlights: ['2,456 m summit', 'UNESCO Geopark status', 'Idaean Cave of Zeus', 'Griffon vultures'],
    source: SOURCE,
  },
  {
    id: 'ic-nature-2',
    title: 'Vai Palm Forest Beach',
    subtitle: "Europe's Largest Natural Palm Forest",
    category: 'nature',
    region: 'Lasithi',
    location: 'Vai, East Lasithi',
    coordinates: { lat: 35.2488, lng: 26.2601 },
    description:
      'A unique protected landscape where Europe\'s largest natural date palm forest (Phoenix Theophrasti — Crete\'s native species) meets a sandy beach. The forest of thousands of palms creates an otherworldly tropical atmosphere. The sheltered bay has crystal-clear warm waters and a protected status.',
    hours: 'Open year-round · Best May–Sep',
    price: 'Parking €3',
    tags: ['palm forest', 'protected', 'unique', 'east crete', 'swimming', 'endemic species'],
    image: 'https://images.unsplash.com/photo-1502301197179-65228ab57f78?w=800&q=80',
    highlights: ["Europe's largest palm forest", 'Cretan Phoenix palm species', 'Protected beach', 'Eastern tip of Crete'],
    source: SOURCE,
  },
]

export function getPlacesByCategory(category: PlaceCategory): CretePlace[] {
  return SCRAPED_PLACES.filter((p) => p.category === category)
}

export function getPlacesByRegion(region: CretePlace['region']): CretePlace[] {
  return SCRAPED_PLACES.filter((p) => p.region === region)
}

export function searchPlaces(query: string): CretePlace[] {
  const term = query.toLowerCase().trim()
  if (!term) return SCRAPED_PLACES
  return SCRAPED_PLACES.filter(
    (p) =>
      p.title.toLowerCase().includes(term) ||
      p.location.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term) ||
      p.tags.some((t) => t.toLowerCase().includes(term)) ||
      p.region.toLowerCase().includes(term)
  )
}
