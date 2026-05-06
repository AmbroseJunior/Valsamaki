export interface FarmersMarket {
  id: string
  name: string
  nameEn: string
  day: string
  area: string
  streets: string
  lat: number
  lng: number
  hours: string
}

export const FARMERS_MARKETS: FarmersMarket[] = [
  {
    id: 'fm-mon',
    name: 'Λαϊκή Αγορά Καμινίων',
    nameEn: 'Kaminia Farmers Market',
    day: 'Monday',
    area: 'Kaminia, Heraklion',
    streets: 'Smirilou – Fredy Germanou – Patroklou & Kyvelis',
    lat: 35.3295,
    lng: 25.1195,
    hours: 'Monday 07:00–14:00',
  },
  {
    id: 'fm-tue-1',
    name: 'Λαϊκή Αγορά Ν. Αλικαρνασσού',
    nameEn: 'Nea Alikarnassos Farmers Market',
    day: 'Tuesday',
    area: 'Nea Alikarnassos, Heraklion',
    streets: 'Anagenniseos & Anapauseos',
    lat: 35.3338,
    lng: 25.1632,
    hours: 'Tuesday 07:00–14:00',
  },
  {
    id: 'fm-tue-2',
    name: 'Λαϊκή Αγορά Αγ. Ιωάννη – Μεσαμπελιές',
    nameEn: 'Ag. Ioannis – Mesampeliés Farmers Market',
    day: 'Tuesday',
    area: 'Ag. Ioannis – Mesampeliés, Heraklion',
    streets: 'Iolís & Aridaias',
    lat: 35.3418,
    lng: 25.1528,
    hours: 'Tuesday 07:00–14:00',
  },
  {
    id: 'fm-wed-1',
    name: 'Λαϊκή Αγορά Μασταμπά',
    nameEn: 'Mastampa Farmers Market',
    day: 'Wednesday',
    area: 'Mastampa, Heraklion',
    streets: 'Paraskevopoulou',
    lat: 35.3378,
    lng: 25.1292,
    hours: 'Wednesday 07:00–14:00',
  },
  {
    id: 'fm-wed-2',
    name: 'Λαϊκή Αγορά Χριστομιχάλη Ξυλούρη',
    nameEn: 'Xylouri Street Farmers Market',
    day: 'Wednesday',
    area: 'City Centre, Heraklion',
    streets: 'Christomichali Xylouri',
    lat: 35.3395,
    lng: 25.1348,
    hours: 'Wednesday 07:00–14:00',
  },
  {
    id: 'fm-thu',
    name: 'Λαϊκή Αγορά Πατέλες – Κηπούπολη',
    nameEn: 'Pateles – Kipoupoli Farmers Market',
    day: 'Thursday',
    area: 'Pateles – Kipoupoli, Heraklion',
    streets: 'Oikopedo Lydaki (parallel to Itanou)',
    lat: 35.3282,
    lng: 25.1601,
    hours: 'Thursday 07:00–14:00',
  },
  {
    id: 'fm-fri',
    name: 'Λαϊκή Αγορά Παρασκευής',
    nameEn: 'Friday Farmers Market',
    day: 'Friday',
    area: 'Karamanli area, Heraklion',
    streets: 'K. Karamanli – L. Katsoní – M. Galenianou',
    lat: 35.3368,
    lng: 25.1491,
    hours: 'Friday 07:00–14:00',
  },
  {
    id: 'fm-sat',
    name: 'Λαϊκή Αγορά Σαββάτου – Πατέλες',
    nameEn: 'Saturday Farmers Market – Pateles',
    day: 'Saturday',
    area: 'Pateles – Kipoupoli, Heraklion',
    streets: 'Oikopedo Lydaki (parallel to Itanou)',
    lat: 35.3285,
    lng: 25.1604,
    hours: 'Saturday 07:00–14:00',
  },
]
