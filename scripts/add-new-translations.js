const fs = require('fs');

const translations = {
  el: {
    explore: {
      priceAny: 'Οποιαδήποτε τιμή', priceFree: 'Δωρεάν', priceUnder30: 'Κάτω από €30', priceUnder60: 'Κάτω από €60',
      distanceAny: 'Οποιαδήποτε απόσταση', filterSortDefault: 'Προεπιλογή', filterSortRated: 'Κορυφαία βαθμολογία',
      filterSortPrice: 'Τιμή ↑', filterSortNearest: 'Πλησιέστερα', aiSuggestions: 'Προτάσεις AI',
      priceLabel: 'Τιμή', distanceLabel: 'Απόσταση', sortBy: 'Ταξινόμηση', clearFilters: 'Καθαρισμός φίλτρων',
      kmAway: 'χλμ μακριά', healthBenefits: 'Οφέλη για την Υγεία', hours: 'Ώρες', getDirections: 'Οδηγίες',
      askValsamaki: 'Ρώτησε τον Βαλσαμάκη', planYourVisit: 'Σχεδίασε την Επίσκεψή σου',
      buildItinerary: 'Δημιούργησε το προσωποποιημένο σου πρόγραμμα', planNow: 'Σχέδιο →',
    },
    events: {
      upTo: 'Έως', attendees: 'συμμετέχοντες', rsvp: 'Δήλωση', searchPlaceholder: 'Αναζήτηση εκδηλώσεων...',
      noEventsFound: 'Δεν βρέθηκαν εκδηλώσεις για "{search}".',
      noEventsSoon: 'Δεν βρέθηκαν εκδηλώσεις. Επιστρέψτε σύντομα!',
      all: 'Όλα', culture: 'Πολιτισμός', outdoor: 'Υπαίθριο', music: 'Μουσική',
      market: 'Αγορά', workshop: 'Εργαστήριο', sports: 'Αθλητισμός', showMore: '+{count} ακόμα', showLess: 'Λιγότερα',
    },
    chatbot: {
      headerTitle: 'Ρώτησε τον Βαλσαμάκη', headerSubtitle: 'Ο AI οδηγός σου για αυθεντική Κρήτη',
      loading: 'Φόρτωση…', guestTitle: 'Μίλα με τον AI οδηγό σου για την Κρήτη',
      guestSubtitle: 'Συνδέσου για να ρωτήσεις για τοπικούς παραγωγούς, φαγητό και εμπειρίες.',
      guestSignIn: 'Σύνδεση για συνομιλία', openAriaLabel: 'Άνοιγμα AI οδηγού',
      promptTitle: 'Ρώτησέ με οτιδήποτε για την Κρήτη',
      quickSuggestion1: 'Καλύτερες φάρμες ελαιολάδου;', quickSuggestion2: 'Τοπικές αγορές αυτή την εβδομάδα;',
      quickSuggestion3: 'Παραδοσιακές κρητικές συνταγές',
    },
    dashboard: {
      mapView: 'Χάρτης', mapSubtitle: 'Βρες εμπειρίες κοντά σου',
      localProducts: 'Τοπικά Προϊόντα', localProductsSubtitle: 'Ανακάλυψε τις φυσικές τους ιδιότητες',
      basedOnInterest: 'Βάσει του ενδιαφέροντός σου για {interests}',
      dietHighlighted: 'Επισήμανση επιλογών {diet}',
      interestLocalFood: 'τοπικό φαγητό', interestOliveOil: 'ελαιόλαδο', interestHiking: 'πεζοπορία',
      interestHistory: 'ιστορία', interestWellness: 'ευεξία', interestWine: 'κρασί',
      vegFriendly: 'φιλικό προς χορτοφάγους', plantBased: 'φυτικής βάσης',
      seafoodInclusive: 'με θαλασσινά', glutenFree: 'χωρίς γλουτένη',
    },
  },
  de: {
    explore: {
      priceAny: 'Beliebiger Preis', priceFree: 'Kostenlos', priceUnder30: 'Unter €30', priceUnder60: 'Unter €60',
      distanceAny: 'Beliebige Entfernung', filterSortDefault: 'Standard', filterSortRated: 'Bestbewertet',
      filterSortPrice: 'Preis ↑', filterSortNearest: 'Nächstgelegene', aiSuggestions: 'KI-Vorschläge',
      priceLabel: 'Preis', distanceLabel: 'Entfernung', sortBy: 'Sortieren nach', clearFilters: 'Filter löschen',
      kmAway: 'km entfernt', healthBenefits: 'Gesundheitsvorteile', hours: 'Öffnungszeiten',
      getDirections: 'Wegbeschreibung', askValsamaki: 'Valsamaki fragen',
      planYourVisit: 'Besuch planen', buildItinerary: 'Persönliche Kreta-Route erstellen', planNow: 'Planen →',
    },
    events: {
      upTo: 'Bis zu', attendees: 'Teilnehmer', rsvp: 'Anmelden', searchPlaceholder: 'Veranstaltungen suchen...',
      noEventsFound: 'Keine Veranstaltungen für "{search}" gefunden.',
      noEventsSoon: 'Keine Veranstaltungen gefunden. Schau bald wieder vorbei!',
      all: 'Alle', culture: 'Kultur', outdoor: 'Outdoor', music: 'Musik',
      market: 'Markt', workshop: 'Workshop', sports: 'Sport', showMore: '+{count} mehr', showLess: 'Weniger',
    },
    chatbot: {
      headerTitle: 'Valsamaki fragen', headerSubtitle: 'KI-Reiseführer für authentisches Kreta',
      loading: 'Laden…', guestTitle: 'Chatte mit deinem Kreta KI-Guide',
      guestSubtitle: 'Melde dich an, um über lokale Produzenten, Essen und Erlebnisse zu fragen.',
      guestSignIn: 'Anmelden zum Chatten', openAriaLabel: 'KI-Guide öffnen',
      promptTitle: 'Frag mich alles über Kreta',
      quickSuggestion1: 'Beste Olivenöl-Farmen?', quickSuggestion2: 'Lokale Märkte diese Woche?',
      quickSuggestion3: 'Traditionelle kretische Rezepte',
    },
    dashboard: {
      mapView: 'Kartenansicht', mapSubtitle: 'Erlebnisse in deiner Nähe finden',
      localProducts: 'Lokale Produkte', localProductsSubtitle: 'Natürliche Eigenschaften und Gesundheitsvorteile entdecken',
      basedOnInterest: 'Basierend auf deinem Interesse an {interests}',
      dietHighlighted: '{diet} Optionen hervorgehoben',
      interestLocalFood: 'lokales Essen', interestOliveOil: 'Olivenöl', interestHiking: 'Wandern',
      interestHistory: 'Geschichte', interestWellness: 'Wellness', interestWine: 'Wein',
      vegFriendly: 'vegetarierfreundlich', plantBased: 'pflanzenbasiert',
      seafoodInclusive: 'mit Meeresfrüchten', glutenFree: 'glutenfrei',
    },
  },
  es: {
    explore: {
      priceAny: 'Cualquier precio', priceFree: 'Gratis', priceUnder30: 'Menos de €30', priceUnder60: 'Menos de €60',
      distanceAny: 'Cualquier distancia', filterSortDefault: 'Predeterminado', filterSortRated: 'Mejor valorados',
      filterSortPrice: 'Precio ↑', filterSortNearest: 'Más cercano', aiSuggestions: 'Sugerencias IA',
      priceLabel: 'Precio', distanceLabel: 'Distancia', sortBy: 'Ordenar por', clearFilters: 'Limpiar filtros',
      kmAway: 'km de distancia', healthBenefits: 'Beneficios para la salud', hours: 'Horarios',
      getDirections: 'Cómo llegar', askValsamaki: 'Preguntar a Valsamaki',
      planYourVisit: 'Planifica tu visita', buildItinerary: 'Crea tu itinerario personalizado por Creta', planNow: 'Planear →',
    },
    events: {
      upTo: 'Hasta', attendees: 'asistentes', rsvp: 'Inscribirse', searchPlaceholder: 'Buscar eventos...',
      noEventsFound: 'No se encontraron eventos para "{search}".',
      noEventsSoon: 'No se encontraron eventos. ¡Vuelve pronto!',
      all: 'Todos', culture: 'Cultura', outdoor: 'Exterior', music: 'Música',
      market: 'Mercado', workshop: 'Taller', sports: 'Deportes', showMore: '+{count} más', showLess: 'Menos',
    },
    chatbot: {
      headerTitle: 'Preguntar a Valsamaki', headerSubtitle: 'Guía IA de Creta auténtica',
      loading: 'Cargando…', guestTitle: 'Chatea con tu guía IA de Creta',
      guestSubtitle: 'Inicia sesión para preguntar sobre productores locales, comida y experiencias.',
      guestSignIn: 'Iniciar sesión para chatear', openAriaLabel: 'Abrir guía IA',
      promptTitle: 'Pregúntame cualquier cosa sobre Creta',
      quickSuggestion1: '¿Mejores fincas de aceite de oliva?', quickSuggestion2: '¿Mercados locales esta semana?',
      quickSuggestion3: 'Recetas tradicionales cretenses',
    },
    dashboard: {
      mapView: 'Ver mapa', mapSubtitle: 'Encuentra experiencias cerca de ti',
      localProducts: 'Productos locales', localProductsSubtitle: 'Descubre sus propiedades naturales y beneficios',
      basedOnInterest: 'Basado en tu interés en {interests}',
      dietHighlighted: 'Opciones {diet} destacadas',
      interestLocalFood: 'comida local', interestOliveOil: 'aceite de oliva', interestHiking: 'senderismo',
      interestHistory: 'historia', interestWellness: 'bienestar', interestWine: 'vino',
      vegFriendly: 'apto para vegetarianos', plantBased: 'basado en plantas',
      seafoodInclusive: 'con mariscos', glutenFree: 'sin gluten',
    },
  },
  fr: {
    explore: {
      priceAny: 'Tout prix', priceFree: 'Gratuit', priceUnder30: 'Moins de €30', priceUnder60: 'Moins de €60',
      distanceAny: 'Toute distance', filterSortDefault: 'Par défaut', filterSortRated: 'Mieux notés',
      filterSortPrice: 'Prix ↑', filterSortNearest: 'Le plus proche', aiSuggestions: 'Suggestions IA',
      priceLabel: 'Prix', distanceLabel: 'Distance', sortBy: 'Trier par', clearFilters: 'Effacer les filtres',
      kmAway: 'km de distance', healthBenefits: 'Bienfaits pour la santé', hours: 'Horaires',
      getDirections: 'Itinéraire', askValsamaki: 'Demander à Valsamaki',
      planYourVisit: 'Planifier votre visite', buildItinerary: 'Créez votre itinéraire personnalisé en Crète', planNow: 'Planifier →',
    },
    events: {
      upTo: "Jusqu'à", attendees: 'participants', rsvp: "S'inscrire", searchPlaceholder: 'Rechercher des événements...',
      noEventsFound: 'Aucun événement trouvé pour "{search}".',
      noEventsSoon: 'Aucun événement trouvé. Revenez bientôt!',
      all: 'Tous', culture: 'Culture', outdoor: 'Plein air', music: 'Musique',
      market: 'Marché', workshop: 'Atelier', sports: 'Sports', showMore: '+{count} de plus', showLess: 'Moins',
    },
    chatbot: {
      headerTitle: 'Demander à Valsamaki', headerSubtitle: 'Guide IA de la Crète authentique',
      loading: 'Chargement…', guestTitle: 'Chattez avec votre guide IA de Crète',
      guestSubtitle: 'Connectez-vous pour poser des questions sur les producteurs locaux, la nourriture et les expériences.',
      guestSignIn: 'Se connecter pour chatter', openAriaLabel: 'Ouvrir le guide IA',
      promptTitle: 'Posez-moi tout sur la Crète',
      quickSuggestion1: 'Meilleures fermes oléicoles?', quickSuggestion2: 'Marchés locaux cette semaine?',
      quickSuggestion3: 'Recettes crétoises traditionnelles',
    },
    dashboard: {
      mapView: 'Vue carte', mapSubtitle: 'Trouvez des expériences près de vous',
      localProducts: 'Produits locaux', localProductsSubtitle: 'Découvrez leurs propriétés naturelles et bienfaits',
      basedOnInterest: 'Basé sur votre intérêt pour {interests}',
      dietHighlighted: 'Options {diet} mises en avant',
      interestLocalFood: 'cuisine locale', interestOliveOil: "huile d'olive", interestHiking: 'randonnée',
      interestHistory: 'histoire', interestWellness: 'bien-être', interestWine: 'vin',
      vegFriendly: 'végétarien-friendly', plantBased: 'à base de plantes',
      seafoodInclusive: 'avec fruits de mer', glutenFree: 'sans gluten',
    },
  },
  it: {
    explore: {
      priceAny: 'Qualsiasi prezzo', priceFree: 'Gratuito', priceUnder30: 'Meno di €30', priceUnder60: 'Meno di €60',
      distanceAny: 'Qualsiasi distanza', filterSortDefault: 'Predefinito', filterSortRated: 'Meglio valutati',
      filterSortPrice: 'Prezzo ↑', filterSortNearest: 'Più vicino', aiSuggestions: 'Suggerimenti IA',
      priceLabel: 'Prezzo', distanceLabel: 'Distanza', sortBy: 'Ordina per', clearFilters: 'Cancella filtri',
      kmAway: 'km di distanza', healthBenefits: 'Benefici per la salute', hours: 'Orari',
      getDirections: 'Indicazioni', askValsamaki: 'Chiedi a Valsamaki',
      planYourVisit: 'Pianifica la tua visita', buildItinerary: 'Crea il tuo itinerario personalizzato in Creta', planNow: 'Pianifica →',
    },
    events: {
      upTo: 'Fino a', attendees: 'partecipanti', rsvp: 'Iscriviti', searchPlaceholder: 'Cerca eventi...',
      noEventsFound: 'Nessun evento trovato per "{search}".',
      noEventsSoon: 'Nessun evento trovato. Torna presto!',
      all: 'Tutti', culture: 'Cultura', outdoor: 'Outdoor', music: 'Musica',
      market: 'Mercato', workshop: 'Workshop', sports: 'Sport', showMore: '+{count} altri', showLess: 'Meno',
    },
    chatbot: {
      headerTitle: 'Chiedi a Valsamaki', headerSubtitle: 'Guida IA alla Creta autentica',
      loading: 'Caricamento…', guestTitle: 'Chatta con la tua guida IA di Creta',
      guestSubtitle: 'Accedi per chiedere di produttori locali, cibo ed esperienze.',
      guestSignIn: 'Accedi per chattare', openAriaLabel: 'Apri guida IA',
      promptTitle: 'Chiedimi qualsiasi cosa sulla Creta',
      quickSuggestion1: 'Migliori aziende olearie?', quickSuggestion2: 'Mercati locali questa settimana?',
      quickSuggestion3: 'Ricette tradizionali cretesi',
    },
    dashboard: {
      mapView: 'Mappa', mapSubtitle: 'Trova esperienze vicino a te',
      localProducts: 'Prodotti locali', localProductsSubtitle: 'Scopri le loro proprietà naturali e benefici',
      basedOnInterest: 'Basato sul tuo interesse per {interests}',
      dietHighlighted: 'Opzioni {diet} in evidenza',
      interestLocalFood: 'cucina locale', interestOliveOil: "olio d'oliva", interestHiking: 'escursionismo',
      interestHistory: 'storia', interestWellness: 'benessere', interestWine: 'vino',
      vegFriendly: 'adatto ai vegetariani', plantBased: 'a base vegetale',
      seafoodInclusive: 'con frutti di mare', glutenFree: 'senza glutine',
    },
  },
  nl: {
    explore: {
      priceAny: 'Elke prijs', priceFree: 'Gratis', priceUnder30: 'Onder €30', priceUnder60: 'Onder €60',
      distanceAny: 'Elke afstand', filterSortDefault: 'Standaard', filterSortRated: 'Best beoordeeld',
      filterSortPrice: 'Prijs ↑', filterSortNearest: 'Dichtst bij', aiSuggestions: 'AI-suggesties',
      priceLabel: 'Prijs', distanceLabel: 'Afstand', sortBy: 'Sorteren op', clearFilters: 'Filters wissen',
      kmAway: 'km afstand', healthBenefits: 'Gezondheidsvoordelen', hours: 'Openingstijden',
      getDirections: 'Routebeschrijving', askValsamaki: 'Vraag Valsamaki',
      planYourVisit: 'Plan uw bezoek', buildItinerary: 'Maak uw persoonlijke Kreta-route', planNow: 'Plannen →',
    },
    events: {
      upTo: 'Tot', attendees: 'deelnemers', rsvp: 'Inschrijven', searchPlaceholder: 'Zoek evenementen...',
      noEventsFound: 'Geen evenementen gevonden voor "{search}".',
      noEventsSoon: 'Geen evenementen gevonden. Kom binnenkort terug!',
      all: 'Alle', culture: 'Cultuur', outdoor: 'Buiten', music: 'Muziek',
      market: 'Markt', workshop: 'Workshop', sports: 'Sport', showMore: '+{count} meer', showLess: 'Minder',
    },
    chatbot: {
      headerTitle: 'Vraag Valsamaki', headerSubtitle: 'AI-gids voor authentiek Kreta',
      loading: 'Laden…', guestTitle: 'Chat met uw Kreta AI-gids',
      guestSubtitle: 'Log in om te vragen over lokale producenten, eten en ervaringen.',
      guestSignIn: 'Inloggen om te chatten', openAriaLabel: 'AI-gids openen',
      promptTitle: 'Vraag me alles over Kreta',
      quickSuggestion1: 'Beste olijfolieboerderijen?', quickSuggestion2: 'Lokale markten deze week?',
      quickSuggestion3: 'Traditionele Kretenzische recepten',
    },
    dashboard: {
      mapView: 'Kaartweergave', mapSubtitle: 'Vind ervaringen bij u in de buurt',
      localProducts: 'Lokale producten', localProductsSubtitle: 'Ontdek hun natuurlijke eigenschappen en gezondheidsvoordelen',
      basedOnInterest: 'Gebaseerd op uw interesse in {interests}',
      dietHighlighted: '{diet} opties gemarkeerd',
      interestLocalFood: 'lokaal eten', interestOliveOil: 'olijfolie', interestHiking: 'wandelen',
      interestHistory: 'geschiedenis', interestWellness: 'wellness', interestWine: 'wijn',
      vegFriendly: 'vegetariervriendelijk', plantBased: 'plantaardig',
      seafoodInclusive: 'met zeevruchten', glutenFree: 'glutenvrij',
    },
  },
  pt: {
    explore: {
      priceAny: 'Qualquer preço', priceFree: 'Grátis', priceUnder30: 'Menos de €30', priceUnder60: 'Menos de €60',
      distanceAny: 'Qualquer distância', filterSortDefault: 'Padrão', filterSortRated: 'Melhor avaliados',
      filterSortPrice: 'Preço ↑', filterSortNearest: 'Mais próximo', aiSuggestions: 'Sugestões IA',
      priceLabel: 'Preço', distanceLabel: 'Distância', sortBy: 'Ordenar por', clearFilters: 'Limpar filtros',
      kmAway: 'km de distância', healthBenefits: 'Benefícios para a saúde', hours: 'Horários',
      getDirections: 'Como chegar', askValsamaki: 'Perguntar ao Valsamaki',
      planYourVisit: 'Planear a sua visita', buildItinerary: 'Crie o seu itinerário personalizado em Creta', planNow: 'Planear →',
    },
    events: {
      upTo: 'Até', attendees: 'participantes', rsvp: 'Inscrever-se', searchPlaceholder: 'Pesquisar eventos...',
      noEventsFound: 'Nenhum evento encontrado para "{search}".',
      noEventsSoon: 'Nenhum evento encontrado. Volte em breve!',
      all: 'Todos', culture: 'Cultura', outdoor: 'Exterior', music: 'Música',
      market: 'Mercado', workshop: 'Workshop', sports: 'Desporto', showMore: '+{count} mais', showLess: 'Menos',
    },
    chatbot: {
      headerTitle: 'Perguntar ao Valsamaki', headerSubtitle: 'Guia IA da Creta autêntica',
      loading: 'A carregar…', guestTitle: 'Converse com o seu guia IA de Creta',
      guestSubtitle: 'Inicie sessão para perguntar sobre produtores locais, comida e experiências.',
      guestSignIn: 'Iniciar sessão para conversar', openAriaLabel: 'Abrir guia IA',
      promptTitle: 'Pergunte-me qualquer coisa sobre Creta',
      quickSuggestion1: 'Melhores quintas de azeite?', quickSuggestion2: 'Mercados locais esta semana?',
      quickSuggestion3: 'Receitas tradicionais cretenses',
    },
    dashboard: {
      mapView: 'Ver mapa', mapSubtitle: 'Encontre experiências perto de si',
      localProducts: 'Produtos locais', localProductsSubtitle: 'Descubra as suas propriedades naturais e benefícios',
      basedOnInterest: 'Baseado no seu interesse em {interests}',
      dietHighlighted: 'Opções {diet} em destaque',
      interestLocalFood: 'comida local', interestOliveOil: 'azeite', interestHiking: 'caminhadas',
      interestHistory: 'história', interestWellness: 'bem-estar', interestWine: 'vinho',
      vegFriendly: 'amigo dos vegetarianos', plantBased: 'à base de plantas',
      seafoodInclusive: 'com frutos do mar', glutenFree: 'sem glúten',
    },
  },
  ru: {
    explore: {
      priceAny: 'Любая цена', priceFree: 'Бесплатно', priceUnder30: 'До €30', priceUnder60: 'До €60',
      distanceAny: 'Любое расстояние', filterSortDefault: 'По умолчанию', filterSortRated: 'Лучший рейтинг',
      filterSortPrice: 'Цена ↑', filterSortNearest: 'Ближайшие', aiSuggestions: 'Предложения ИИ',
      priceLabel: 'Цена', distanceLabel: 'Расстояние', sortBy: 'Сортировать по', clearFilters: 'Сбросить фильтры',
      kmAway: 'км от вас', healthBenefits: 'Польза для здоровья', hours: 'Часы работы',
      getDirections: 'Маршрут', askValsamaki: 'Спросить Вальсамаки',
      planYourVisit: 'Планировать посещение', buildItinerary: 'Создайте персональный маршрут по Криту', planNow: 'Планировать →',
    },
    events: {
      upTo: 'До', attendees: 'участников', rsvp: 'Записаться', searchPlaceholder: 'Поиск мероприятий...',
      noEventsFound: 'Мероприятия для "{search}" не найдены.',
      noEventsSoon: 'Мероприятия не найдены. Загляните позже!',
      all: 'Все', culture: 'Культура', outdoor: 'На природе', music: 'Музыка',
      market: 'Рынок', workshop: 'Мастер-класс', sports: 'Спорт', showMore: '+{count} ещё', showLess: 'Меньше',
    },
    chatbot: {
      headerTitle: 'Спросить Вальсамаки', headerSubtitle: 'ИИ-гид по аутентичному Криту',
      loading: 'Загрузка…', guestTitle: 'Пообщайтесь с вашим ИИ-гидом по Криту',
      guestSubtitle: 'Войдите, чтобы спросить о местных производителях, еде и впечатлениях.',
      guestSignIn: 'Войти для чата', openAriaLabel: 'Открыть ИИ-гид',
      promptTitle: 'Спросите меня о Крите',
      quickSuggestion1: 'Лучшие оливковые фермы?', quickSuggestion2: 'Местные рынки на этой неделе?',
      quickSuggestion3: 'Традиционные критские рецепты',
    },
    dashboard: {
      mapView: 'Карта', mapSubtitle: 'Найдите впечатления рядом',
      localProducts: 'Местные продукты', localProductsSubtitle: 'Откройте их природные свойства и пользу для здоровья',
      basedOnInterest: 'На основе вашего интереса к {interests}',
      dietHighlighted: 'Выделены варианты {diet}',
      interestLocalFood: 'местная еда', interestOliveOil: 'оливковое масло', interestHiking: 'пешие прогулки',
      interestHistory: 'история', interestWellness: 'оздоровление', interestWine: 'вино',
      vegFriendly: 'вегетарианские варианты', plantBased: 'растительное питание',
      seafoodInclusive: 'с морепродуктами', glutenFree: 'без глютена',
    },
  },
  zh: {
    explore: {
      priceAny: '任意价格', priceFree: '免费', priceUnder30: '€30以下', priceUnder60: '€60以下',
      distanceAny: '任意距离', filterSortDefault: '默认', filterSortRated: '评分最高',
      filterSortPrice: '价格 ↑', filterSortNearest: '最近', aiSuggestions: 'AI建议',
      priceLabel: '价格', distanceLabel: '距离', sortBy: '排序方式', clearFilters: '清除筛选',
      kmAway: '公里外', healthBenefits: '健康益处', hours: '营业时间',
      getDirections: '获取路线', askValsamaki: '询问Valsamaki',
      planYourVisit: '规划您的行程', buildItinerary: '创建您的个性化克里特行程', planNow: '规划 →',
    },
    events: {
      upTo: '最多', attendees: '名参与者', rsvp: '报名', searchPlaceholder: '搜索活动...',
      noEventsFound: '未找到"{search}"的相关活动。',
      noEventsSoon: '未找到活动，请稍后再来！',
      all: '全部', culture: '文化', outdoor: '户外', music: '音乐',
      market: '市集', workshop: '工作坊', sports: '体育', showMore: '+{count} 更多', showLess: '收起',
    },
    chatbot: {
      headerTitle: '询问Valsamaki', headerSubtitle: '克里特岛正宗体验AI导游',
      loading: '加载中…', guestTitle: '与您的克里特AI导游聊天',
      guestSubtitle: '登录后可询问当地生产商、美食和体验活动。',
      guestSignIn: '登录聊天', openAriaLabel: '打开AI导游',
      promptTitle: '问我任何关于克里特的事',
      quickSuggestion1: '最好的橄榄油农场？', quickSuggestion2: '本周当地市集？',
      quickSuggestion3: '传统克里特食谱',
    },
    dashboard: {
      mapView: '地图视图', mapSubtitle: '发现附近的体验活动',
      localProducts: '当地产品', localProductsSubtitle: '探索其天然特性和健康益处',
      basedOnInterest: '基于您对{interests}的兴趣',
      dietHighlighted: '{diet}选项已标注',
      interestLocalFood: '当地美食', interestOliveOil: '橄榄油', interestHiking: '徒步',
      interestHistory: '历史', interestWellness: '健康', interestWine: '葡萄酒',
      vegFriendly: '素食友好', plantBased: '植物基', seafoodInclusive: '含海鲜', glutenFree: '无麸质',
    },
  },
  ar: {
    explore: {
      priceAny: 'أي سعر', priceFree: 'مجاني', priceUnder30: 'أقل من €30', priceUnder60: 'أقل من €60',
      distanceAny: 'أي مسافة', filterSortDefault: 'افتراضي', filterSortRated: 'الأعلى تقييماً',
      filterSortPrice: 'السعر ↑', filterSortNearest: 'الأقرب', aiSuggestions: 'اقتراحات الذكاء الاصطناعي',
      priceLabel: 'السعر', distanceLabel: 'المسافة', sortBy: 'ترتيب حسب', clearFilters: 'مسح الفلاتر',
      kmAway: 'كم', healthBenefits: 'الفوائد الصحية', hours: 'ساعات العمل',
      getDirections: 'الاتجاهات', askValsamaki: 'اسأل فالساماكي',
      planYourVisit: 'خطط لزيارتك', buildItinerary: 'أنشئ برنامج رحلتك الشخصي في كريت', planNow: 'خطط ←',
    },
    events: {
      upTo: 'حتى', attendees: 'مشارك', rsvp: 'التسجيل', searchPlaceholder: 'البحث عن فعاليات...',
      noEventsFound: 'لم يتم العثور على فعاليات لـ"{search}".',
      noEventsSoon: 'لم يتم العثور على فعاليات. عد قريباً!',
      all: 'الكل', culture: 'ثقافة', outdoor: 'في الهواء الطلق', music: 'موسيقى',
      market: 'سوق', workshop: 'ورشة عمل', sports: 'رياضة', showMore: '+{count} المزيد', showLess: 'أقل',
    },
    chatbot: {
      headerTitle: 'اسأل فالساماكي', headerSubtitle: 'دليل الذكاء الاصطناعي لكريت الأصيلة',
      loading: 'جاري التحميل…', guestTitle: 'تحدث مع دليل كريت بالذكاء الاصطناعي',
      guestSubtitle: 'سجل الدخول للسؤال عن المنتجين المحليين والطعام والتجارب.',
      guestSignIn: 'تسجيل الدخول للمحادثة', openAriaLabel: 'فتح دليل الذكاء الاصطناعي',
      promptTitle: 'اسألني أي شيء عن كريت',
      quickSuggestion1: 'أفضل مزارع زيت الزيتون؟', quickSuggestion2: 'الأسواق المحلية هذا الأسبوع؟',
      quickSuggestion3: 'وصفات كريتية تقليدية',
    },
    dashboard: {
      mapView: 'عرض الخريطة', mapSubtitle: 'اعثر على تجارب بالقرب منك',
      localProducts: 'المنتجات المحلية', localProductsSubtitle: 'اكتشف خصائصها الطبيعية وفوائدها الصحية',
      basedOnInterest: 'بناءً على اهتمامك بـ {interests}',
      dietHighlighted: 'خيارات {diet} مميزة',
      interestLocalFood: 'الطعام المحلي', interestOliveOil: 'زيت الزيتون', interestHiking: 'المشي',
      interestHistory: 'التاريخ', interestWellness: 'العافية', interestWine: 'النبيذ',
      vegFriendly: 'مناسب للنباتيين', plantBased: 'نباتي', seafoodInclusive: 'مع المأكولات البحرية', glutenFree: 'خالٍ من الغلوتين',
    },
  },
};

const routeErrors = {
  el: 'Αδύνατος υπολογισμός διαδρομής — δοκιμάστε ξανά',
  de: 'Route konnte nicht berechnet werden — bitte erneut versuchen',
  es: 'No se pudo calcular la ruta — intente de nuevo',
  fr: "Impossible de calculer l'itinéraire — réessayez",
  it: 'Impossibile calcolare il percorso — riprova',
  nl: 'Route kon niet worden berekend — probeer opnieuw',
  pt: 'Não foi possível calcular a rota — tente novamente',
  ru: 'Не удалось рассчитать маршрут — попробуйте ещё раз',
  zh: '无法计算路线，请重试',
  ar: 'تعذّر حساب المسار — حاول مرة أخرى',
};

function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

const locales = ['el','de','es','fr','it','nl','pt','ru','zh','ar'];
for (const locale of locales) {
  const filePath = `messages/${locale}.json`;
  const raw = fs.readFileSync(filePath, 'utf8').replace(/^﻿/, '');
  const data = JSON.parse(raw);
  const newKeys = translations[locale];
  for (const ns of Object.keys(newKeys)) {
    data[ns] = deepMerge(data[ns] || {}, newKeys[ns]);
  }
  if (!data.map) data.map = {};
  data.map.routeError = routeErrors[locale];
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Updated ${locale}.json`);
}
console.log('Done!');
