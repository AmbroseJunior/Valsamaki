// Adds missing translation keys to all non-English locale files
const fs = require('fs')
const path = require('path')

const MESSAGES_DIR = path.join(__dirname, '..', 'messages')

// Deep merge: target is mutated, source values are added only if key is missing
function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key] || typeof target[key] !== 'object') target[key] = {}
      deepMerge(target[key], source[key])
    } else if (!(key in target)) {
      target[key] = source[key]
    }
  }
  return target
}

const NEW_KEYS = {
  el: {
    nav: { likedExperiences: "Αγαπημένες Εμπειρίες" },
    common: {
      offlineBanner: "Είστε εκτός σύνδεσης — εμφάνιση αποθηκευμένου περιεχομένου",
      likedExperiences: "Αγαπημένες Εμπειρίες",
      exploreAll: "Εξερεύνηση όλων"
    },
    chatbot: {
      askAnything: "Ρωτήστε με οτιδήποτε για την Κρήτη",
      askSub: "Τοπικό φαγητό, παραγωγοί, ευεξία, εκδηλώσεις και η μεσογειακή διατροφή",
      errorResponse: "Συγγνώμη, δεν μπόρεσα να απαντήσω.",
      offlineError: "Είμαι προσωρινά εκτός σύνδεσης. Παρακαλώ δοκιμάστε ξανά.",
      inputPlaceholder: "Ρωτήστε για την Κρήτη…",
      suggestion1: "Ποια είναι τα καλύτερα ελαιώνες κοντά μου;",
      suggestion2: "Πείτε μου για την κρητική διατροφή και μακροζωία",
      suggestion3: "Ποιες εκδηλώσεις γίνονται αυτό το Σαββατοκύριακο;",
      suggestion4: "Προτείνετε ένα παραδοσιακό κρητικό εστιατόριο"
    },
    map: {
      modeComparison: "Σύγκριση τρόπων μεταφοράς",
      noCoords: "Δεν υπάρχουν συντεταγμένες — οι οδηγίες δεν είναι διαθέσιμες",
      fromYourLocation: "από την τοποθεσία σας",
      steps: "Βήματα",
      calories: "Θερμίδες",
      co2: "CO₂",
      co2Zero: "Μηδέν",
      estFare: "Εκτιμώμενο ναύλο",
      co2Saved: "CO₂ που εξοικονομήθηκε",
      accessible: "Προσβάσιμο",
      mostStops: "Περισσότερες στάσεις",
      fuelEst: "Εκτίμηση καυσίμου",
      parking: "Παρκάρισμα",
      parkingNote: "Σχεδιάστε εκ των προτέρων",
      experiences: "Εμπειρίες",
      sights: "Αξιοθέατα",
      viewDetails: "Προβολή λεπτομερειών"
    },
    plan: {
      title: "Σχεδιάστε την Κρητική Wellness Περιπέτειά σας",
      subtitle: "Πείτε μας τις προτιμήσεις σας — η ΤΝ δημιουργεί ένα εξατομικευμένο ημερολόγιο από πραγματικές τοπικές εμπειρίες.",
      badge: "Με Τεχνητή Νοημοσύνη",
      daysLabel: "Πόσες μέρες;",
      daysMin: "1 μέρα",
      daysMax: "7 μέρες",
      interestsLabel: "Τι σας ενδιαφέρει;",
      interestsPick: "(επιλέξτε οποιοδήποτε)",
      styleLabel: "Στυλ ταξιδιού",
      dietLabel: "Διατροφική προτίμηση",
      generating: "Δημιουργία του δρομολογίου σας…",
      generate: "Δημιουργία Δρομολογίου",
      day: "Ημέρα",
      morning: "Πρωί",
      afternoon: "Απόγευμα",
      evening: "Βράδυ",
      greekPhrase: "🗣️ Ελληνική Φράση του Ταξιδιού",
      packingTips: "🎒 Συμβουλές Αποσκευών",
      startOver: "Ξεκίνημα από την αρχή",
      shareTrip: "Κοινοποίηση Ταξιδιού",
      errorFormat: "Η ΤΝ επέστρεψε μη αναμενόμενη μορφή — πατήστε Δημιουργία ξανά.",
      interests: {
        food: "Τοπικό Φαγητό",
        olive_oil: "Ελαιόλαδο",
        hiking: "Πεζοπορία",
        history: "Ιστορία",
        wellness: "Ευεξία",
        markets: "Αγορές",
        sea: "Θαλάσσια Σπορ"
      },
      diets: {
        none: "Χωρίς προτίμηση",
        vegetarian: "Χορτοφάγος",
        vegan: "Βίγκαν",
        gluten_free: "Χωρίς γλουτένη",
        pescatarian: "Πεσκατάριος"
      },
      styles: {
        relaxed: "Χαλαρός",
        relaxedDesc: "Αργό ρυθμό, λιγότερες στάσεις",
        balanced: "Ισορροπημένος",
        balancedDesc: "Μείγμα δραστηριότητας και ανάπαυσης",
        active: "Ενεργός",
        activeDesc: "Γεμάτες μέρες",
        cultural: "Πολιτιστικός",
        culturalDesc: "Μουσεία, ιστορία, τέχνη"
      }
    },
    home: {
      hero: "Ανακαλύψτε την Αυθεντική Κρήτη",
      heroSub: "Τοπικοί παραγωγοί, ευεξία, πολιτισμός & η μεσογειακή διατροφή",
      mapView: "Προβολή Χάρτη",
      mapSub: "Βρείτε παραγωγούς κοντά σας",
      products: "Τοπικά Προϊόντα",
      productsSub: "Βιολογικά & παραδοσιακά",
      personalised: "Εξατομικευμένο για σας",
      quizTitle: "Κάντε το κρητικό wellness quiz",
      quizSub: "Εμπειρίες αντιστοιχισμένες από ΤΝ σε 2 λεπτά",
      startQuiz: "Έναρξη quiz →",
      nearYou: "Κοντά σας",
      viewMap: "Προβολή στο χάρτη",
      allExperiences: "Όλες οι Εμπειρίες",
      ctaTitle: "Γίνετε μέλος με 2.400+ εξερευνητές της Κρήτης",
      ctaSub: "Δημιουργήστε δωρεάν λογαριασμό για να αποθηκεύσετε αγαπημένα, να λάβετε προτάσεις ΤΝ και να ξεκλειδώσετε την πλήρη εμπειρία.",
      signUpFree: "Δωρεάν εγγραφή",
      signIn: "Σύνδεση",
      producerTitle: "Είστε κρητικός παραγωγός;",
      producerSub: "Συνδεθείτε με ντόπιους και τουρίστες. Καταχωρήστε τα προϊόντα και τις εμπειρίες σας.",
      listBusiness: "Καταχώρηση επιχείρησης",
      footer: "© 2026 Valsamaki — Συνδέοντας την Κρήτη, έναν παραγωγό τη φορά. 🫒",
      footerMedDiet: "Μεσογειακή Διατροφή",
      footerMap: "Χάρτης",
      footerExperiences: "Εμπειρίες"
    },
    languagePicker: {
      welcome: "Καλώς ήρθατε — Επιλέξτε γλώσσα",
      subtitle: "Καλώς ήρθες · Bienvenido · Bienvenue · Benvenuto",
      continue: "Συνέχεια χωρίς αλλαγή →"
    }
  },

  de: {
    nav: { likedExperiences: "Gelikte Erlebnisse" },
    common: {
      offlineBanner: "Sie sind offline — zwischengespeicherte Inhalte werden angezeigt",
      likedExperiences: "Gelikte Erlebnisse",
      exploreAll: "Alle entdecken"
    },
    chatbot: {
      askAnything: "Fragen Sie mich alles über Kreta",
      askSub: "Lokale Küche, Erzeuger, Wellness, Veranstaltungen und die mediterrane Ernährung",
      errorResponse: "Entschuldigung, ich konnte nicht antworten.",
      offlineError: "Ich bin vorübergehend offline. Bitte versuchen Sie es erneut.",
      inputPlaceholder: "Fragen Sie über Kreta…",
      suggestion1: "Was sind die besten Olivenölhöfe in meiner Nähe?",
      suggestion2: "Erzählen Sie mir über die kretische Ernährung und Langlebigkeit",
      suggestion3: "Welche Veranstaltungen finden dieses Wochenende statt?",
      suggestion4: "Empfehlen Sie ein traditionelles kretisches Restaurant"
    },
    map: {
      modeComparison: "Routenvergleich",
      noCoords: "Keine Kartenkoordinaten — Wegbeschreibung nicht verfügbar",
      fromYourLocation: "von Ihrem Standort",
      steps: "Schritte",
      calories: "Kalorien",
      co2: "CO₂",
      co2Zero: "Null",
      estFare: "Geschätzter Fahrpreis",
      co2Saved: "CO₂ gespart",
      accessible: "Barrierefrei",
      mostStops: "Meiste Haltestellen",
      fuelEst: "Kraftstoffschätzung",
      parking: "Parken",
      parkingNote: "Im Voraus planen",
      experiences: "Erlebnisse",
      sights: "Sehenswürdigkeiten",
      viewDetails: "Details anzeigen"
    },
    plan: {
      title: "Ihr kretisches Wellness-Abenteuer planen",
      subtitle: "Teilen Sie uns Ihre Vorlieben mit — unsere KI erstellt einen personalisierten Tagesplan aus echten lokalen Erlebnissen.",
      badge: "KI-gestützt",
      daysLabel: "Wie viele Tage?",
      daysMin: "1 Tag",
      daysMax: "7 Tage",
      interestsLabel: "Was interessiert Sie?",
      interestsPick: "(beliebig auswählen)",
      styleLabel: "Reisestil",
      dietLabel: "Ernährungsweise",
      generating: "Ihr Reiseplan wird erstellt…",
      generate: "Meinen Reiseplan erstellen",
      day: "Tag",
      morning: "Morgen",
      afternoon: "Nachmittag",
      evening: "Abend",
      greekPhrase: "🗣️ Griechischer Satz der Reise",
      packingTips: "🎒 Packtipps",
      startOver: "Neu beginnen",
      shareTrip: "Reise teilen",
      errorFormat: "KI hat unerwartetes Format zurückgegeben — tippen Sie erneut auf Generieren.",
      interests: {
        food: "Lokale Küche",
        olive_oil: "Olivenöl",
        hiking: "Wandern",
        history: "Geschichte",
        wellness: "Wellness",
        markets: "Märkte",
        sea: "Wassersport"
      },
      diets: {
        none: "Keine Präferenz",
        vegetarian: "Vegetarisch",
        vegan: "Vegan",
        gluten_free: "Glutenfrei",
        pescatarian: "Pescetarisch"
      },
      styles: {
        relaxed: "Entspannt",
        relaxedDesc: "Gemächliches Tempo, weniger Stopps",
        balanced: "Ausgewogen",
        balancedDesc: "Mix aus Aktivität & Ruhe",
        active: "Aktiv",
        activeDesc: "Tage vollgepackt",
        cultural: "Kulturell",
        culturalDesc: "Museen, Geschichte, Kunst"
      }
    },
    home: {
      hero: "Entdecken Sie das authentische Kreta",
      heroSub: "Lokale Erzeuger, Wellness, Kultur & die mediterrane Ernährung",
      mapView: "Kartenansicht",
      mapSub: "Erzeuger in Ihrer Nähe finden",
      products: "Lokale Produkte",
      productsSub: "Bio & traditionell",
      personalised: "Personalisiert für Sie",
      quizTitle: "Machen Sie das kretische Wellness-Quiz",
      quizSub: "KI-abgestimmte Erlebnisse in 2 Minuten",
      startQuiz: "Quiz starten →",
      nearYou: "In Ihrer Nähe",
      viewMap: "Auf Karte anzeigen",
      allExperiences: "Alle Erlebnisse",
      ctaTitle: "Treten Sie 2.400+ Kreta-Entdeckern bei",
      ctaSub: "Erstellen Sie ein kostenloses Konto, um Favoriten zu speichern, KI-Empfehlungen zu erhalten und die vollständige Erfahrung zu genießen.",
      signUpFree: "Kostenlos anmelden",
      signIn: "Anmelden",
      producerTitle: "Sind Sie ein kretischer Erzeuger?",
      producerSub: "Verbinden Sie sich mit Einheimischen und Touristen. Listen Sie Ihre Produkte und Erlebnisse auf.",
      listBusiness: "Betrieb eintragen",
      footer: "© 2026 Valsamaki — Kreta verbinden, ein Erzeuger nach dem anderen. 🫒",
      footerMedDiet: "Mediterrane Ernährung",
      footerMap: "Karte",
      footerExperiences: "Erlebnisse"
    },
    languagePicker: {
      welcome: "Willkommen — Wählen Sie Ihre Sprache",
      subtitle: "Καλώς ήρθες · Bienvenido · Bienvenue · Benvenuto",
      continue: "Ohne Änderung fortfahren →"
    }
  },

  es: {
    nav: { likedExperiences: "Experiencias Favoritas" },
    common: {
      offlineBanner: "Estás sin conexión — mostrando contenido en caché",
      likedExperiences: "Experiencias Favoritas",
      exploreAll: "Explorar todo"
    },
    chatbot: {
      askAnything: "Pregúntame cualquier cosa sobre Creta",
      askSub: "Comida local, productores, bienestar, eventos y la dieta mediterránea",
      errorResponse: "Lo siento, no pude responder.",
      offlineError: "Estoy temporalmente sin conexión. Por favor inténtalo de nuevo.",
      inputPlaceholder: "Pregunta sobre Creta…",
      suggestion1: "¿Cuáles son las mejores fincas de aceite de oliva cerca de mí?",
      suggestion2: "Cuéntame sobre la dieta cretense y la longevidad",
      suggestion3: "¿Qué eventos hay este fin de semana?",
      suggestion4: "Recomienda un restaurante cretense tradicional"
    },
    map: {
      modeComparison: "Comparación de modos",
      noCoords: "Sin coordenadas — indicaciones no disponibles",
      fromYourLocation: "desde tu ubicación",
      steps: "Pasos",
      calories: "Calorías",
      co2: "CO₂",
      co2Zero: "Cero",
      estFare: "Tarifa estimada",
      co2Saved: "CO₂ ahorrado",
      accessible: "Accesible",
      mostStops: "Más paradas",
      fuelEst: "Est. combustible",
      parking: "Estacionamiento",
      parkingNote: "Planifica con anticipación",
      experiences: "Experiencias",
      sights: "Lugares de interés",
      viewDetails: "Ver detalles"
    },
    plan: {
      title: "Planifica tu aventura de bienestar cretense",
      subtitle: "Cuéntanos tus preferencias — nuestra IA crea un itinerario personalizado día a día con experiencias locales reales.",
      badge: "Impulsado por IA",
      daysLabel: "¿Cuántos días?",
      daysMin: "1 día",
      daysMax: "7 días",
      interestsLabel: "¿Qué te interesa?",
      interestsPick: "(elige cualquiera)",
      styleLabel: "Estilo de viaje",
      dietLabel: "Preferencia dietética",
      generating: "Creando tu itinerario…",
      generate: "Generar mi itinerario",
      day: "Día",
      morning: "Mañana",
      afternoon: "Tarde",
      evening: "Noche",
      greekPhrase: "🗣️ Frase griega del viaje",
      packingTips: "🎒 Consejos de equipaje",
      startOver: "Empezar de nuevo",
      shareTrip: "Compartir viaje",
      errorFormat: "La IA devolvió un formato inesperado — toca Generar de nuevo.",
      interests: {
        food: "Comida Local",
        olive_oil: "Aceite de Oliva",
        hiking: "Senderismo",
        history: "Historia",
        wellness: "Bienestar",
        markets: "Mercados",
        sea: "Deportes Acuáticos"
      },
      diets: {
        none: "Sin preferencia",
        vegetarian: "Vegetariano",
        vegan: "Vegano",
        gluten_free: "Sin gluten",
        pescatarian: "Pescetariano"
      },
      styles: {
        relaxed: "Relajado",
        relaxedDesc: "Ritmo tranquilo, menos paradas",
        balanced: "Equilibrado",
        balancedDesc: "Mezcla de actividad y descanso",
        active: "Activo",
        activeDesc: "Días llenos de actividades",
        cultural: "Cultural",
        culturalDesc: "Museos, historia, arte"
      }
    },
    home: {
      hero: "Descubre la auténtica Creta",
      heroSub: "Productores locales, bienestar, cultura y la dieta mediterránea",
      mapView: "Vista del mapa",
      mapSub: "Encuentra productores cerca de ti",
      products: "Productos locales",
      productsSub: "Orgánico y tradicional",
      personalised: "Personalizado para ti",
      quizTitle: "Haz el quiz de bienestar cretense",
      quizSub: "Experiencias seleccionadas por IA en 2 minutos",
      startQuiz: "Iniciar quiz →",
      nearYou: "Cerca de ti",
      viewMap: "Ver en el mapa",
      allExperiences: "Todas las experiencias",
      ctaTitle: "Únete a más de 2.400 exploradores de Creta",
      ctaSub: "Crea una cuenta gratuita para guardar favoritos, obtener recomendaciones de IA y desbloquear la experiencia completa.",
      signUpFree: "Registrarse gratis",
      signIn: "Iniciar sesión",
      producerTitle: "¿Eres un productor cretense?",
      producerSub: "Conéctate con locales y turistas. Lista tus productos y experiencias.",
      listBusiness: "Listar tu negocio",
      footer: "© 2026 Valsamaki — Conectando Creta, un productor a la vez. 🫒",
      footerMedDiet: "Dieta Mediterránea",
      footerMap: "Mapa",
      footerExperiences: "Experiencias"
    },
    languagePicker: {
      welcome: "Bienvenido — Elige tu idioma",
      subtitle: "Καλώς ήρθες · Bienvenido · Bienvenue · Benvenuto",
      continue: "Continuar sin cambiar →"
    }
  },

  fr: {
    nav: { likedExperiences: "Expériences Aimées" },
    common: {
      offlineBanner: "Vous êtes hors ligne — affichage du contenu en cache",
      likedExperiences: "Expériences Aimées",
      exploreAll: "Tout explorer"
    },
    chatbot: {
      askAnything: "Posez-moi n'importe quelle question sur la Crète",
      askSub: "Nourriture locale, producteurs, bien-être, événements et le régime méditerranéen",
      errorResponse: "Désolé, je n'ai pas pu répondre.",
      offlineError: "Je suis temporairement hors ligne. Veuillez réessayer.",
      inputPlaceholder: "Posez une question sur la Crète…",
      suggestion1: "Quelles sont les meilleures fermes d'huile d'olive près de moi ?",
      suggestion2: "Parlez-moi du régime crétois et de la longévité",
      suggestion3: "Quels événements ont lieu ce week-end ?",
      suggestion4: "Recommandez un restaurant crétois traditionnel"
    },
    map: {
      modeComparison: "Comparaison des modes",
      noCoords: "Pas de coordonnées — itinéraire indisponible",
      fromYourLocation: "depuis votre position",
      steps: "Pas",
      calories: "Calories",
      co2: "CO₂",
      co2Zero: "Zéro",
      estFare: "Tarif estimé",
      co2Saved: "CO₂ économisé",
      accessible: "Accessible",
      mostStops: "Plus d'arrêts",
      fuelEst: "Est. carburant",
      parking: "Parking",
      parkingNote: "Planifiez à l'avance",
      experiences: "Expériences",
      sights: "Sites touristiques",
      viewDetails: "Voir les détails"
    },
    plan: {
      title: "Planifiez votre aventure bien-être crétoise",
      subtitle: "Dites-nous vos préférences — notre IA crée un itinéraire personnalisé jour par jour à partir d'expériences locales réelles.",
      badge: "Propulsé par l'IA",
      daysLabel: "Combien de jours ?",
      daysMin: "1 jour",
      daysMax: "7 jours",
      interestsLabel: "Qu'est-ce qui vous intéresse ?",
      interestsPick: "(choisissez n'importe lequel)",
      styleLabel: "Style de voyage",
      dietLabel: "Préférence alimentaire",
      generating: "Création de votre itinéraire…",
      generate: "Générer mon itinéraire",
      day: "Jour",
      morning: "Matin",
      afternoon: "Après-midi",
      evening: "Soir",
      greekPhrase: "🗣️ Phrase grecque du voyage",
      packingTips: "🎒 Conseils de bagages",
      startOver: "Recommencer",
      shareTrip: "Partager le voyage",
      errorFormat: "L'IA a renvoyé un format inattendu — appuyez à nouveau sur Générer.",
      interests: {
        food: "Cuisine Locale",
        olive_oil: "Huile d'Olive",
        hiking: "Randonnée",
        history: "Histoire",
        wellness: "Bien-être",
        markets: "Marchés",
        sea: "Sports Nautiques"
      },
      diets: {
        none: "Pas de préférence",
        vegetarian: "Végétarien",
        vegan: "Végan",
        gluten_free: "Sans gluten",
        pescatarian: "Pescétarien"
      },
      styles: {
        relaxed: "Détendu",
        relaxedDesc: "Rythme calme, moins d'arrêts",
        balanced: "Équilibré",
        balancedDesc: "Mélange d'activité et de repos",
        active: "Actif",
        activeDesc: "Journées bien remplies",
        cultural: "Culturel",
        culturalDesc: "Musées, histoire, art"
      }
    },
    home: {
      hero: "Découvrez la Crète authentique",
      heroSub: "Producteurs locaux, bien-être, culture et le régime méditerranéen",
      mapView: "Vue de la carte",
      mapSub: "Trouvez des producteurs près de vous",
      products: "Produits locaux",
      productsSub: "Bio et traditionnel",
      personalised: "Personnalisé pour vous",
      quizTitle: "Faites le quiz bien-être crétois",
      quizSub: "Expériences sélectionnées par IA en 2 minutes",
      startQuiz: "Démarrer le quiz →",
      nearYou: "Près de vous",
      viewMap: "Voir sur la carte",
      allExperiences: "Toutes les expériences",
      ctaTitle: "Rejoignez plus de 2 400 explorateurs de Crète",
      ctaSub: "Créez un compte gratuit pour sauvegarder vos favoris, obtenir des recommandations IA et profiter de l'expérience complète.",
      signUpFree: "S'inscrire gratuitement",
      signIn: "Se connecter",
      producerTitle: "Êtes-vous un producteur crétois ?",
      producerSub: "Connectez-vous avec les locaux et les touristes. Listez vos produits et expériences.",
      listBusiness: "Lister votre entreprise",
      footer: "© 2026 Valsamaki — Connecter la Crète, un producteur à la fois. 🫒",
      footerMedDiet: "Régime Méditerranéen",
      footerMap: "Carte",
      footerExperiences: "Expériences"
    },
    languagePicker: {
      welcome: "Bienvenue — Choisissez votre langue",
      subtitle: "Καλώς ήρθες · Bienvenido · Bienvenue · Benvenuto",
      continue: "Continuer sans changer →"
    }
  },

  it: {
    nav: { likedExperiences: "Esperienze Preferite" },
    common: {
      offlineBanner: "Sei offline — visualizzazione contenuti in cache",
      likedExperiences: "Esperienze Preferite",
      exploreAll: "Esplora tutto"
    },
    chatbot: {
      askAnything: "Chiedimi qualsiasi cosa sulla Creta",
      askSub: "Cibo locale, produttori, benessere, eventi e la dieta mediterranea",
      errorResponse: "Scusa, non sono riuscito a rispondere.",
      offlineError: "Sono temporaneamente offline. Per favore riprova.",
      inputPlaceholder: "Chiedi di Creta…",
      suggestion1: "Quali sono le migliori aziende olearie vicino a me?",
      suggestion2: "Parlami della dieta cretese e della longevità",
      suggestion3: "Quali eventi si svolgono questo fine settimana?",
      suggestion4: "Consiglia un ristorante cretese tradizionale"
    },
    map: {
      modeComparison: "Confronto modalità",
      noCoords: "Nessuna coordinata — indicazioni non disponibili",
      fromYourLocation: "dalla tua posizione",
      steps: "Passi",
      calories: "Calorie",
      co2: "CO₂",
      co2Zero: "Zero",
      estFare: "Tariffa stimata",
      co2Saved: "CO₂ risparmiata",
      accessible: "Accessibile",
      mostStops: "Più fermate",
      fuelEst: "Stima carburante",
      parking: "Parcheggio",
      parkingNote: "Pianifica in anticipo",
      experiences: "Esperienze",
      sights: "Attrazioni",
      viewDetails: "Vedi dettagli"
    },
    plan: {
      title: "Pianifica la tua avventura benessere cretese",
      subtitle: "Dicci le tue preferenze — la nostra IA crea un itinerario personalizzato giorno per giorno da esperienze locali reali.",
      badge: "Alimentato da IA",
      daysLabel: "Quanti giorni?",
      daysMin: "1 giorno",
      daysMax: "7 giorni",
      interestsLabel: "Cosa ti interessa?",
      interestsPick: "(scegli qualsiasi)",
      styleLabel: "Stile di viaggio",
      dietLabel: "Preferenza alimentare",
      generating: "Creazione del tuo itinerario…",
      generate: "Genera il mio itinerario",
      day: "Giorno",
      morning: "Mattina",
      afternoon: "Pomeriggio",
      evening: "Sera",
      greekPhrase: "🗣️ Frase greca del viaggio",
      packingTips: "🎒 Consigli per i bagagli",
      startOver: "Ricominciare",
      shareTrip: "Condividi viaggio",
      errorFormat: "L'IA ha restituito un formato inatteso — tocca di nuovo Genera.",
      interests: {
        food: "Cucina Locale",
        olive_oil: "Olio d'Oliva",
        hiking: "Trekking",
        history: "Storia",
        wellness: "Benessere",
        markets: "Mercati",
        sea: "Sport Acquatici"
      },
      diets: {
        none: "Nessuna preferenza",
        vegetarian: "Vegetariano",
        vegan: "Vegano",
        gluten_free: "Senza glutine",
        pescatarian: "Pescetariano"
      },
      styles: {
        relaxed: "Rilassato",
        relaxedDesc: "Ritmo tranquillo, meno fermate",
        balanced: "Equilibrato",
        balancedDesc: "Mix di attività e riposo",
        active: "Attivo",
        activeDesc: "Giornate piene",
        cultural: "Culturale",
        culturalDesc: "Musei, storia, arte"
      }
    },
    home: {
      hero: "Scopri la Creta autentica",
      heroSub: "Produttori locali, benessere, cultura e la dieta mediterranea",
      mapView: "Vista mappa",
      mapSub: "Trova produttori vicino a te",
      products: "Prodotti locali",
      productsSub: "Biologico e tradizionale",
      personalised: "Personalizzato per te",
      quizTitle: "Fai il quiz sul benessere cretese",
      quizSub: "Esperienze selezionate dall'IA in 2 minuti",
      startQuiz: "Inizia il quiz →",
      nearYou: "Vicino a te",
      viewMap: "Visualizza sulla mappa",
      allExperiences: "Tutte le esperienze",
      ctaTitle: "Unisciti a oltre 2.400 esploratori di Creta",
      ctaSub: "Crea un account gratuito per salvare i preferiti, ottenere raccomandazioni IA e sbloccare l'esperienza completa.",
      signUpFree: "Registrati gratis",
      signIn: "Accedi",
      producerTitle: "Sei un produttore cretese?",
      producerSub: "Connettiti con locali e turisti. Elenca i tuoi prodotti ed esperienze.",
      listBusiness: "Elenca la tua attività",
      footer: "© 2026 Valsamaki — Connettendo Creta, un produttore alla volta. 🫒",
      footerMedDiet: "Dieta Mediterranea",
      footerMap: "Mappa",
      footerExperiences: "Esperienze"
    },
    languagePicker: {
      welcome: "Benvenuto — Scegli la tua lingua",
      subtitle: "Καλώς ήρθες · Bienvenido · Bienvenue · Benvenuto",
      continue: "Continua senza modificare →"
    }
  },

  nl: {
    nav: { likedExperiences: "Favoriete Ervaringen" },
    common: {
      offlineBanner: "Je bent offline — gecachte inhoud wordt weergegeven",
      likedExperiences: "Favoriete Ervaringen",
      exploreAll: "Alles verkennen"
    },
    chatbot: {
      askAnything: "Vraag me alles over Kreta",
      askSub: "Lokaal eten, producenten, wellness, evenementen en het mediterrane dieet",
      errorResponse: "Sorry, ik kon niet reageren.",
      offlineError: "Ik ben tijdelijk offline. Probeer het opnieuw.",
      inputPlaceholder: "Vraag over Kreta…",
      suggestion1: "Wat zijn de beste olijfolieboerderijen bij mij in de buurt?",
      suggestion2: "Vertel me over het Kretenzische dieet en een lang leven",
      suggestion3: "Welke evenementen zijn er dit weekend?",
      suggestion4: "Aanbeveling voor een traditioneel Kretenzisch restaurant"
    },
    map: {
      modeComparison: "Modusvergelijking",
      noCoords: "Geen kaartcoördinaten — routebeschrijving niet beschikbaar",
      fromYourLocation: "vanaf uw locatie",
      steps: "Stappen",
      calories: "Calorieën",
      co2: "CO₂",
      co2Zero: "Nul",
      estFare: "Geschatte prijs",
      co2Saved: "CO₂ bespaard",
      accessible: "Toegankelijk",
      mostStops: "Meeste stops",
      fuelEst: "Brandstofschatting",
      parking: "Parkeren",
      parkingNote: "Plan vooruit",
      experiences: "Ervaringen",
      sights: "Bezienswaardigheden",
      viewDetails: "Details bekijken"
    },
    plan: {
      title: "Plan uw Kretenzisch wellnessavontuur",
      subtitle: "Vertel ons uw voorkeuren — onze AI maakt een gepersonaliseerd dag-voor-dag reisschema van echte lokale ervaringen.",
      badge: "AI-aangedreven",
      daysLabel: "Hoeveel dagen?",
      daysMin: "1 dag",
      daysMax: "7 dagen",
      interestsLabel: "Wat interesseert u?",
      interestsPick: "(kies een willekeurige)",
      styleLabel: "Reistijl",
      dietLabel: "Dieetvoorkeur",
      generating: "Uw reisschema wordt gemaakt…",
      generate: "Mijn reisschema genereren",
      day: "Dag",
      morning: "Ochtend",
      afternoon: "Middag",
      evening: "Avond",
      greekPhrase: "🗣️ Griekse zin van de reis",
      packingTips: "🎒 Paktips",
      startOver: "Opnieuw beginnen",
      shareTrip: "Reis delen",
      errorFormat: "AI heeft een onverwacht formaat geretourneerd — tik opnieuw op Genereren.",
      interests: {
        food: "Lokaal Eten",
        olive_oil: "Olijfolie",
        hiking: "Wandelen",
        history: "Geschiedenis",
        wellness: "Wellness",
        markets: "Markten",
        sea: "Watersport"
      },
      diets: {
        none: "Geen voorkeur",
        vegetarian: "Vegetarisch",
        vegan: "Veganistisch",
        gluten_free: "Glutenvrij",
        pescatarian: "Pescotarisch"
      },
      styles: {
        relaxed: "Ontspannen",
        relaxedDesc: "Rustig tempo, minder stops",
        balanced: "Uitgebalanceerd",
        balancedDesc: "Mix van activiteit en rust",
        active: "Actief",
        activeDesc: "Dagen vol activiteit",
        cultural: "Cultureel",
        culturalDesc: "Musea, geschiedenis, kunst"
      }
    },
    home: {
      hero: "Ontdek het authentieke Kreta",
      heroSub: "Lokale producenten, wellness, cultuur en het mediterrane dieet",
      mapView: "Kaartweergave",
      mapSub: "Vind producenten bij u in de buurt",
      products: "Lokale producten",
      productsSub: "Biologisch & traditioneel",
      personalised: "Gepersonaliseerd voor u",
      quizTitle: "Doe de Kretenzische wellnessquiz",
      quizSub: "AI-afgestemde ervaringen in 2 minuten",
      startQuiz: "Quiz starten →",
      nearYou: "In uw buurt",
      viewMap: "Bekijken op kaart",
      allExperiences: "Alle ervaringen",
      ctaTitle: "Sluit je aan bij 2.400+ Kreta-ontdekkers",
      ctaSub: "Maak een gratis account aan om favorieten op te slaan, AI-aanbevelingen te krijgen en de volledige ervaring te ontgrendelen.",
      signUpFree: "Gratis aanmelden",
      signIn: "Inloggen",
      producerTitle: "Bent u een Kretenzische producent?",
      producerSub: "Verbind u met locals en toeristen. Vermeld uw producten en ervaringen.",
      listBusiness: "Bedrijf vermelden",
      footer: "© 2026 Valsamaki — Kreta verbinden, één producent tegelijk. 🫒",
      footerMedDiet: "Mediterraan Dieet",
      footerMap: "Kaart",
      footerExperiences: "Ervaringen"
    },
    languagePicker: {
      welcome: "Welkom — Kies uw taal",
      subtitle: "Καλώς ήρθες · Bienvenido · Bienvenue · Benvenuto",
      continue: "Doorgaan zonder wijzigen →"
    }
  },

  pt: {
    nav: { likedExperiences: "Experiências Favoritas" },
    common: {
      offlineBanner: "Você está offline — exibindo conteúdo em cache",
      likedExperiences: "Experiências Favoritas",
      exploreAll: "Explorar tudo"
    },
    chatbot: {
      askAnything: "Pergunte-me qualquer coisa sobre Creta",
      askSub: "Comida local, produtores, bem-estar, eventos e a dieta mediterrânea",
      errorResponse: "Desculpe, não consegui responder.",
      offlineError: "Estou temporariamente offline. Por favor tente novamente.",
      inputPlaceholder: "Pergunte sobre Creta…",
      suggestion1: "Quais são as melhores fazendas de azeite perto de mim?",
      suggestion2: "Fale-me sobre a dieta cretense e a longevidade",
      suggestion3: "Que eventos estão acontecendo neste fim de semana?",
      suggestion4: "Recomende um restaurante cretense tradicional"
    },
    map: {
      modeComparison: "Comparação de modos",
      noCoords: "Sem coordenadas — direções indisponíveis",
      fromYourLocation: "da sua localização",
      steps: "Passos",
      calories: "Calorias",
      co2: "CO₂",
      co2Zero: "Zero",
      estFare: "Tarifa estimada",
      co2Saved: "CO₂ poupado",
      accessible: "Acessível",
      mostStops: "Mais paradas",
      fuelEst: "Est. combustível",
      parking: "Estacionamento",
      parkingNote: "Planeje com antecedência",
      experiences: "Experiências",
      sights: "Pontos turísticos",
      viewDetails: "Ver detalhes"
    },
    plan: {
      title: "Planeje sua aventura de bem-estar cretense",
      subtitle: "Conte-nos suas preferências — nossa IA cria um itinerário personalizado dia a dia com experiências locais reais.",
      badge: "Alimentado por IA",
      daysLabel: "Quantos dias?",
      daysMin: "1 dia",
      daysMax: "7 dias",
      interestsLabel: "O que te interessa?",
      interestsPick: "(escolha qualquer)",
      styleLabel: "Estilo de viagem",
      dietLabel: "Preferência alimentar",
      generating: "Criando seu itinerário…",
      generate: "Gerar meu itinerário",
      day: "Dia",
      morning: "Manhã",
      afternoon: "Tarde",
      evening: "Noite",
      greekPhrase: "🗣️ Frase grega da viagem",
      packingTips: "🎒 Dicas de bagagem",
      startOver: "Começar de novo",
      shareTrip: "Compartilhar viagem",
      errorFormat: "A IA retornou um formato inesperado — toque em Gerar novamente.",
      interests: {
        food: "Comida Local",
        olive_oil: "Azeite de Oliva",
        hiking: "Caminhada",
        history: "História",
        wellness: "Bem-estar",
        markets: "Mercados",
        sea: "Esportes Aquáticos"
      },
      diets: {
        none: "Sem preferência",
        vegetarian: "Vegetariano",
        vegan: "Vegano",
        gluten_free: "Sem glúten",
        pescatarian: "Pescetariano"
      },
      styles: {
        relaxed: "Relaxado",
        relaxedDesc: "Ritmo tranquilo, menos paradas",
        balanced: "Equilibrado",
        balancedDesc: "Mix de atividade e descanso",
        active: "Ativo",
        activeDesc: "Dias cheios de atividades",
        cultural: "Cultural",
        culturalDesc: "Museus, história, arte"
      }
    },
    home: {
      hero: "Descubra a Creta autêntica",
      heroSub: "Produtores locais, bem-estar, cultura e a dieta mediterrânea",
      mapView: "Vista do mapa",
      mapSub: "Encontre produtores perto de você",
      products: "Produtos locais",
      productsSub: "Orgânico e tradicional",
      personalised: "Personalizado para você",
      quizTitle: "Faça o quiz de bem-estar cretense",
      quizSub: "Experiências selecionadas por IA em 2 minutos",
      startQuiz: "Iniciar quiz →",
      nearYou: "Perto de você",
      viewMap: "Ver no mapa",
      allExperiences: "Todas as experiências",
      ctaTitle: "Junte-se a mais de 2.400 exploradores de Creta",
      ctaSub: "Crie uma conta gratuita para salvar favoritos, obter recomendações de IA e desbloquear a experiência completa.",
      signUpFree: "Cadastrar-se gratuitamente",
      signIn: "Entrar",
      producerTitle: "Você é um produtor cretense?",
      producerSub: "Conecte-se com locais e turistas. Liste seus produtos e experiências.",
      listBusiness: "Listar seu negócio",
      footer: "© 2026 Valsamaki — Conectando Creta, um produtor de cada vez. 🫒",
      footerMedDiet: "Dieta Mediterrânea",
      footerMap: "Mapa",
      footerExperiences: "Experiências"
    },
    languagePicker: {
      welcome: "Bem-vindo — Escolha seu idioma",
      subtitle: "Καλώς ήρθες · Bienvenido · Bienvenue · Benvenuto",
      continue: "Continuar sem alterar →"
    }
  },

  ru: {
    nav: { likedExperiences: "Понравившиеся впечатления" },
    common: {
      offlineBanner: "Вы не в сети — отображается кэшированный контент",
      likedExperiences: "Понравившиеся впечатления",
      exploreAll: "Исследовать всё"
    },
    chatbot: {
      askAnything: "Спросите меня что угодно о Крите",
      askSub: "Местная еда, производители, велнес, мероприятия и средиземноморская диета",
      errorResponse: "Извините, я не смог ответить.",
      offlineError: "Я временно не в сети. Пожалуйста, попробуйте снова.",
      inputPlaceholder: "Спросите о Крите…",
      suggestion1: "Какие лучшие фермы оливкового масла рядом со мной?",
      suggestion2: "Расскажите мне о критской диете и долголетии",
      suggestion3: "Какие мероприятия проходят на этих выходных?",
      suggestion4: "Порекомендуйте традиционный критский ресторан"
    },
    map: {
      modeComparison: "Сравнение режимов",
      noCoords: "Нет координат — маршрут недоступен",
      fromYourLocation: "от вашего местоположения",
      steps: "Шаги",
      calories: "Калории",
      co2: "CO₂",
      co2Zero: "Ноль",
      estFare: "Ориентировочная стоимость",
      co2Saved: "CO₂ сэкономлено",
      accessible: "Доступно",
      mostStops: "Больше остановок",
      fuelEst: "Оценка топлива",
      parking: "Парковка",
      parkingNote: "Планируйте заранее",
      experiences: "Впечатления",
      sights: "Достопримечательности",
      viewDetails: "Посмотреть детали"
    },
    plan: {
      title: "Спланируйте своё критское велнес-приключение",
      subtitle: "Расскажите нам о своих предпочтениях — наш ИИ создаст персонализированный маршрут по дням из реальных местных впечатлений.",
      badge: "На основе ИИ",
      daysLabel: "Сколько дней?",
      daysMin: "1 день",
      daysMax: "7 дней",
      interestsLabel: "Что вас интересует?",
      interestsPick: "(выберите любое)",
      styleLabel: "Стиль путешествия",
      dietLabel: "Диетические предпочтения",
      generating: "Создание вашего маршрута…",
      generate: "Создать мой маршрут",
      day: "День",
      morning: "Утро",
      afternoon: "День",
      evening: "Вечер",
      greekPhrase: "🗣️ Греческая фраза путешествия",
      packingTips: "🎒 Советы по упаковке",
      startOver: "Начать заново",
      shareTrip: "Поделиться поездкой",
      errorFormat: "ИИ вернул неожиданный формат — нажмите Создать ещё раз.",
      interests: {
        food: "Местная еда",
        olive_oil: "Оливковое масло",
        hiking: "Походы",
        history: "История",
        wellness: "Велнес",
        markets: "Рынки",
        sea: "Водный спорт"
      },
      diets: {
        none: "Без предпочтений",
        vegetarian: "Вегетарианец",
        vegan: "Веган",
        gluten_free: "Без глютена",
        pescatarian: "Пескетарианец"
      },
      styles: {
        relaxed: "Расслабленный",
        relaxedDesc: "Медленный темп, меньше остановок",
        balanced: "Сбалансированный",
        balancedDesc: "Сочетание активности и отдыха",
        active: "Активный",
        activeDesc: "Насыщенные дни",
        cultural: "Культурный",
        culturalDesc: "Музеи, история, искусство"
      }
    },
    home: {
      hero: "Откройте для себя настоящий Крит",
      heroSub: "Местные производители, велнес, культура и средиземноморская диета",
      mapView: "Вид карты",
      mapSub: "Найдите производителей рядом с вами",
      products: "Местные продукты",
      productsSub: "Органические и традиционные",
      personalised: "Персонализировано для вас",
      quizTitle: "Пройдите критский велнес-тест",
      quizSub: "Впечатления, подобранные ИИ за 2 минуты",
      startQuiz: "Начать тест →",
      nearYou: "Рядом с вами",
      viewMap: "Посмотреть на карте",
      allExperiences: "Все впечатления",
      ctaTitle: "Присоединитесь к 2 400+ исследователям Крита",
      ctaSub: "Создайте бесплатный аккаунт, чтобы сохранять избранное, получать рекомендации ИИ и разблокировать полный опыт.",
      signUpFree: "Зарегистрироваться бесплатно",
      signIn: "Войти",
      producerTitle: "Вы критский производитель?",
      producerSub: "Общайтесь с местными и туристами. Перечислите свои продукты и впечатления.",
      listBusiness: "Разместить бизнес",
      footer: "© 2026 Valsamaki — Соединяем Крит, одного производителя за раз. 🫒",
      footerMedDiet: "Средиземноморская диета",
      footerMap: "Карта",
      footerExperiences: "Впечатления"
    },
    languagePicker: {
      welcome: "Добро пожаловать — Выберите язык",
      subtitle: "Καλώς ήρθες · Bienvenido · Bienvenue · Benvenuto",
      continue: "Продолжить без изменений →"
    }
  },

  zh: {
    nav: { likedExperiences: "喜欢的体验" },
    common: {
      offlineBanner: "您已离线 — 正在显示缓存内容",
      likedExperiences: "喜欢的体验",
      exploreAll: "探索全部"
    },
    chatbot: {
      askAnything: "向我询问任何关于克里特岛的问题",
      askSub: "当地美食、生产商、健康、活动和地中海饮食",
      errorResponse: "抱歉，我无法回复。",
      offlineError: "我暂时离线了。请再试一次。",
      inputPlaceholder: "询问关于克里特岛…",
      suggestion1: "我附近最好的橄榄油农场在哪里？",
      suggestion2: "告诉我关于克里特岛饮食和长寿的信息",
      suggestion3: "这个周末有哪些活动？",
      suggestion4: "推荐一家传统的克里特岛餐厅"
    },
    map: {
      modeComparison: "模式比较",
      noCoords: "没有地图坐标 — 无法提供路线",
      fromYourLocation: "从您的位置",
      steps: "步数",
      calories: "卡路里",
      co2: "CO₂",
      co2Zero: "零",
      estFare: "预计票价",
      co2Saved: "节省的CO₂",
      accessible: "无障碍",
      mostStops: "最多站点",
      fuelEst: "燃油估算",
      parking: "停车",
      parkingNote: "提前计划",
      experiences: "体验",
      sights: "景点",
      viewDetails: "查看详情"
    },
    plan: {
      title: "规划您的克里特岛健康之旅",
      subtitle: "告诉我们您的偏好 — 我们的AI将根据真实的当地体验为您创建个性化的逐日行程。",
      badge: "AI驱动",
      daysLabel: "几天？",
      daysMin: "1天",
      daysMax: "7天",
      interestsLabel: "您对什么感兴趣？",
      interestsPick: "（任意选择）",
      styleLabel: "旅行风格",
      dietLabel: "饮食偏好",
      generating: "正在制定您的行程…",
      generate: "生成我的行程",
      day: "第",
      morning: "上午",
      afternoon: "下午",
      evening: "晚上",
      greekPhrase: "🗣️ 旅途中的希腊语短语",
      packingTips: "🎒 打包建议",
      startOver: "重新开始",
      shareTrip: "分享行程",
      errorFormat: "AI返回了意外格式 — 再次点击生成重试。",
      interests: {
        food: "当地美食",
        olive_oil: "橄榄油",
        hiking: "徒步",
        history: "历史",
        wellness: "健康",
        markets: "市场",
        sea: "水上运动"
      },
      diets: {
        none: "无偏好",
        vegetarian: "素食",
        vegan: "纯素",
        gluten_free: "无麸质",
        pescatarian: "素鱼食"
      },
      styles: {
        relaxed: "轻松",
        relaxedDesc: "悠闲节奏，停留较少",
        balanced: "均衡",
        balancedDesc: "活动与休息的结合",
        active: "活跃",
        activeDesc: "充实的每一天",
        cultural: "文化",
        culturalDesc: "博物馆、历史、艺术"
      }
    },
    home: {
      hero: "探索真实的克里特岛",
      heroSub: "当地生产商、健康、文化与地中海饮食",
      mapView: "地图视图",
      mapSub: "找到您附近的生产商",
      products: "本地产品",
      productsSub: "有机与传统",
      personalised: "为您个性化定制",
      quizTitle: "参加克里特岛健康测验",
      quizSub: "2分钟内获得AI匹配的体验",
      startQuiz: "开始测验 →",
      nearYou: "您附近",
      viewMap: "在地图上查看",
      allExperiences: "所有体验",
      ctaTitle: "加入2,400+克里特岛探索者",
      ctaSub: "创建免费账户以保存收藏、获取AI推荐并解锁完整体验。",
      signUpFree: "免费注册",
      signIn: "登录",
      producerTitle: "您是克里特岛的生产商吗？",
      producerSub: "与当地人和游客联系。列出您的产品和体验。",
      listBusiness: "列出您的业务",
      footer: "© 2026 Valsamaki — 连接克里特岛，一次一位生产商。 🫒",
      footerMedDiet: "地中海饮食",
      footerMap: "地图",
      footerExperiences: "体验"
    },
    languagePicker: {
      welcome: "欢迎 — 选择您的语言",
      subtitle: "Καλώς ήρθες · Bienvenido · Bienvenue · Benvenuto",
      continue: "不更改继续 →"
    }
  },

  ar: {
    nav: { likedExperiences: "التجارب المفضلة" },
    common: {
      offlineBanner: "أنت غير متصل — يتم عرض المحتوى المحفوظ",
      likedExperiences: "التجارب المفضلة",
      exploreAll: "استكشاف الكل"
    },
    chatbot: {
      askAnything: "اسألني أي شيء عن كريت",
      askSub: "الطعام المحلي والمنتجون والرفاهية والفعاليات والنظام الغذائي المتوسطي",
      errorResponse: "آسف، لم أتمكن من الرد.",
      offlineError: "أنا غير متصل مؤقتاً. يرجى المحاولة مرة أخرى.",
      inputPlaceholder: "اسأل عن كريت…",
      suggestion1: "ما هي أفضل مزارع زيت الزيتون بالقرب مني؟",
      suggestion2: "أخبرني عن النظام الغذائي الكريتي وطول العمر",
      suggestion3: "ما الفعاليات التي تجري هذا الأسبوع؟",
      suggestion4: "أوصِ بمطعم كريتي تقليدي"
    },
    map: {
      modeComparison: "مقارنة الأوضاع",
      noCoords: "لا توجد إحداثيات — الاتجاهات غير متوفرة",
      fromYourLocation: "من موقعك",
      steps: "خطوات",
      calories: "سعرات حرارية",
      co2: "ثاني أكسيد الكربون",
      co2Zero: "صفر",
      estFare: "الأجرة التقديرية",
      co2Saved: "ثاني أكسيد الكربون الموفر",
      accessible: "متاح",
      mostStops: "أكثر محطات",
      fuelEst: "تقدير الوقود",
      parking: "موقف السيارات",
      parkingNote: "خطط مسبقاً",
      experiences: "تجارب",
      sights: "معالم سياحية",
      viewDetails: "عرض التفاصيل"
    },
    plan: {
      title: "خطط لمغامرة العافية الكريتية",
      subtitle: "أخبرنا بتفضيلاتك — يبني الذكاء الاصطناعي برنامجاً يومياً مخصصاً من تجارب محلية حقيقية.",
      badge: "مدعوم بالذكاء الاصطناعي",
      daysLabel: "كم عدد الأيام؟",
      daysMin: "يوم واحد",
      daysMax: "٧ أيام",
      interestsLabel: "ما الذي يهمك؟",
      interestsPick: "(اختر أياً كان)",
      styleLabel: "أسلوب السفر",
      dietLabel: "التفضيل الغذائي",
      generating: "جاري إنشاء برنامجك السياحي…",
      generate: "إنشاء برنامجي السياحي",
      day: "اليوم",
      morning: "الصباح",
      afternoon: "بعد الظهر",
      evening: "المساء",
      greekPhrase: "🗣️ العبارة اليونانية للرحلة",
      packingTips: "🎒 نصائح التعبئة",
      startOver: "البدء من جديد",
      shareTrip: "مشاركة الرحلة",
      errorFormat: "أعاد الذكاء الاصطناعي تنسيقاً غير متوقع — انقر على إنشاء مرة أخرى.",
      interests: {
        food: "الطعام المحلي",
        olive_oil: "زيت الزيتون",
        hiking: "المشي لمسافات طويلة",
        history: "التاريخ",
        wellness: "العافية",
        markets: "الأسواق",
        sea: "الرياضات المائية"
      },
      diets: {
        none: "لا تفضيل",
        vegetarian: "نباتي",
        vegan: "نباتي صرف",
        gluten_free: "خالٍ من الغلوتين",
        pescatarian: "بيسكيتاري"
      },
      styles: {
        relaxed: "مريح",
        relaxedDesc: "وتيرة هادئة، توقفات أقل",
        balanced: "متوازن",
        balancedDesc: "مزيج من النشاط والراحة",
        active: "نشيط",
        activeDesc: "أيام مليئة",
        cultural: "ثقافي",
        culturalDesc: "متاحف وتاريخ وفن"
      }
    },
    home: {
      hero: "اكتشف كريت الأصيلة",
      heroSub: "المنتجون المحليون والعافية والثقافة والنظام الغذائي المتوسطي",
      mapView: "عرض الخريطة",
      mapSub: "ابحث عن المنتجين بالقرب منك",
      products: "المنتجات المحلية",
      productsSub: "عضوي وتقليدي",
      personalised: "مخصص لك",
      quizTitle: "خذ اختبار العافية الكريتي",
      quizSub: "تجارب مطابقة بالذكاء الاصطناعي في دقيقتين",
      startQuiz: "بدء الاختبار ←",
      nearYou: "بالقرب منك",
      viewMap: "عرض على الخريطة",
      allExperiences: "جميع التجارب",
      ctaTitle: "انضم إلى أكثر من 2,400 مستكشف لكريت",
      ctaSub: "أنشئ حساباً مجانياً لحفظ المفضلة والحصول على توصيات الذكاء الاصطناعي وفتح التجربة الكاملة.",
      signUpFree: "التسجيل مجاناً",
      signIn: "تسجيل الدخول",
      producerTitle: "هل أنت منتج كريتي؟",
      producerSub: "تواصل مع السكان المحليين والسياح. أدرج منتجاتك وتجاربك.",
      listBusiness: "إدراج عملك",
      footer: "© 2026 Valsamaki — ربط كريت، منتج واحد في كل مرة. 🫒",
      footerMedDiet: "النظام الغذائي المتوسطي",
      footerMap: "الخريطة",
      footerExperiences: "التجارب"
    },
    languagePicker: {
      welcome: "مرحباً — اختر لغتك",
      subtitle: "Καλώς ήρθες · Bienvenido · Bienvenue · Benvenuto",
      continue: "المتابعة بدون تغيير ←"
    }
  }
}

const locales = Object.keys(NEW_KEYS)
let updated = 0

for (const locale of locales) {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`)
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP: ${locale}.json not found`)
    continue
  }

  const raw = fs.readFileSync(filePath, 'utf8').replace(/^﻿/, '')
  const existing = JSON.parse(raw)
  deepMerge(existing, NEW_KEYS[locale])
  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2) + '\n', 'utf8')
  console.log(`✓ Updated ${locale}.json`)
  updated++
}

console.log(`\nDone — ${updated} files updated.`)
