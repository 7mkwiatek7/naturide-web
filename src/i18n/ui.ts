export const languages = {
  pl: 'Polski',
  en: 'English',
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = 'pl';

export const ui = {
  pl: {
    'nav.features': 'Funkcje',
    'nav.screens': 'Zrzuty ekranu',
    'nav.faq': 'FAQ',
    'nav.contact': 'Kontakt',
    'hero.badge': 'Już wkrótce',
    'hero.title': 'NATURIDE',
    'hero.subtitle': 'Inteligentna nawigacja rowerowa',
    'hero.description':
      'Naturide to inteligentna nawigacja rowerowa stworzona przez rowerzystów dla rowerzystów. Wyróżnia się płynnością i szybkością działania oraz przemyślanym interfejsem',
    'hero.cta.notify': 'Powiadom mnie o premierze',
    'hero.cta.features': 'Zobacz funkcje',
    'hero.stats.offline': 'Offline',
    'hero.stats.offlineDesc': 'Mapy bez zasięgu',
    'hero.stats.gpx': 'GPX',
    'hero.stats.gpxDesc': 'Import i eksport',
    'hero.stats.osm': 'OSM',
    'hero.stats.osmDesc': 'Dane z OpenStreetMap',
    'features.title': 'Co potrafi Naturide',
    'features.subtitle': 'Funkcje, które przydadzą się na każdej trasie',
    'features.navigation.title': 'Nawigacja',
    'features.navigation.desc':
      'Prowadzenie po trasie bezpośrednio z planera lub pliku GPX. Po zjeździe z trasy algorytm szybko tworzy łącznik, by użytkownik mógł sprawnie wrócić na trasę.',
    'features.offline.title': 'Mapy oparte o dane OpenStreetMap',
    'features.offline.desc':
      'Precyzyjne mapy wektorowe w trybie dziennym i nocnym dostępne jednym kliknięciem.',
    'features.planner.title': 'Planner tras',
    'features.offline.routeDesc':
      'Wyznaczaj trasy z punktami pośrednimi, eksportuj do GPX, udostępniaj znajomym.',
    'features.tracking.title': 'Nagrywanie trasy',
    'features.tracking.desc':
      'Nagrywaj przejazd z adaptacyjną dokładnością GPS do 1m podczas pokonywania zakrętu. Profil wysokości, dystans, czas - wszystko automatycznie.',
    'screens.title': 'Zobacz aplikację',
    'screens.subtitle': 'Dzień, noc, planowanie - wszystko czego potrzebujesz w trasie',
    'screens.alt1': 'Widok mapy z zaplanowaną trasą rowerową przez północną Polskę - tryb dzienny',
    'screens.alt2': 'Widok mapy w trybie nocnym - czytelny kontrast po zmroku',
    'screens.alt3': 'Szczegóły nawigacji z profilem wysokości, dystansem i czasem',
    'screens.alt4': 'Planner tras z informacją o dystansie, czasie i podjazdach',
    'comingsoon.title': 'Premiera już wkrótce',
    'comingsoon.desc':
      'Pracujemy nad pierwszą wersją. Zostaw email, a damy Ci znać, gdy aplikacja trafi do sklepów.',
    'comingsoon.placeholder': 'Twój adres email',
    'comingsoon.submit': 'Powiadom mnie',
    'comingsoon.privacy': 'Bez spamu. Możesz się wypisać w dowolnej chwili.',
    'comingsoon.success': 'Gotowe! Damy Ci znać, gdy Naturide pojawi się w sklepach.',
    'faq.title': 'Często pytania',
    'faq.subtitle': 'Jeśli czegoś tu brakuje, napisz do nas',
    'faq.q1': 'Kiedy aplikacja będzie dostępna?',
    'faq.a1': 'Pracujemy nad pierwszą wersją. Zapisz się na listę powiadomień, a poinformujemy Cię, gdy tylko Naturide pojawi się w App Store i Google Play.',
    'faq.q2': 'Czy aplikacja będzie darmowa?',
    'faq.a2': 'Tak, podstawowa wersja będzie darmowa. Planujemy też wersję premium z zaawansowanymi funkcjami, ale szczegóły ogłosimy bliżej premiery.',
    'faq.q3': 'Czy mogę używać Naturide offline?',
    'faq.a3': 'Oczywiście - to jedna z kluczowych funkcji. Pobierasz wybrany region mapy przed wyjazdem i nawigujesz bez zasięgu.',
    'faq.q4': 'Na jakich urządzeniach działa Naturide?',
    'faq.a4': 'Startujemy z iOS i Androidem. Wersja na inne platformy pojawi się w przyszłości, jeśli będzie zainteresowanie.',
    'faq.q5': 'Czy mogę importować własne trasy?',
    'faq.a5': 'Tak, obsługujemy import i eksport plików GPX. Możesz wczytać trasę z innej aplikacji, strony albo od znajomego.',
    'contact.title': 'Kontakt',
    'contact.desc': 'Pytania, pomysły, zgłoszenia błędów - pisz śmiało.',
    'contact.email': 'Email',
    'contact.facebook': 'Facebook',
    'footer.privacy': 'Polityka prywatności',
    'footer.copyright': '© {year} Naturide. Wszystkie prawa zastrzeżone.',
    'meta.title': 'Naturide - nawigacja rowerowa i planner tras offline',
    'meta.description':
      'Naturide to aplikacja mobilna dla rowerzystów. Nawigacja, mapy offline, planowanie tras z OpenStreetMap. Premiera wkrótce.',
  },
  en: {
    'nav.features': 'Features',
    'nav.screens': 'Screenshots',
    'nav.faq': 'FAQ',
    'nav.contact': 'Contact',
    'hero.badge': 'Coming soon',
    'hero.title': 'Naturide',
    'hero.subtitle': 'Bike navigation and offline route planner',
    'hero.description':
      'Plan bike routes on a map, navigate without signal, export GPX. A mobile app for cyclists who ride farther than their carrier coverage.',
    'hero.cta.notify': 'Notify me at launch',
    'hero.cta.features': 'See features',
    'hero.stats.offline': 'Offline',
    'hero.stats.offlineDesc': 'Maps without signal',
    'hero.stats.gpx': 'GPX',
    'hero.stats.gpxDesc': 'Import and export',
    'hero.stats.osm': 'OSM',
    'hero.stats.osmDesc': 'OpenStreetMap data',
    'features.title': 'What Naturide does',
    'features.subtitle': 'Things you will use on every ride',
    'features.navigation.title': 'Bike navigation',
    'features.navigation.desc':
      'Turn-by-turn guidance with distance and elevation. OpenStreetMap data rendered in MapLibre GL.',
    'features.offline.title': 'Offline maps',
    'features.offline.desc':
      'Download a region before you leave and navigate without signal. Your routes work where your phone says "no service".',
    'features.planner.title': 'Route planner',
    'features.offline.routeDesc':
      'Plan routes with waypoints, export to GPX, share with friends.',
    'features.tracking.title': 'Ride tracking',
    'features.tracking.desc':
      'Record your ride with GPS accuracy up to 2 m. Elevation profile, distance, time - all automatic.',
    'screens.title': 'See the app',
    'screens.subtitle': 'Day, night, planning - everything you need on the road',
    'screens.alt1': 'Map view with a recorded bike route across northern Poland - day mode',
    'screens.alt2': 'Map view in night mode - readable contrast after dark',
    'screens.alt3': 'Navigation details with speed and distance profile',
    'screens.alt4': 'Route planner showing distance, time and elevation',
    'comingsoon.title': 'Launching soon',
    'comingsoon.desc':
      'We are working on the first version. Leave your email and we will let you know when the app hits the stores.',
    'comingsoon.placeholder': 'Your email address',
    'comingsoon.submit': 'Notify me',
    'comingsoon.privacy': 'No spam. Unsubscribe anytime.',
    'comingsoon.success': 'Done! We will let you know when Naturide lands in the stores.',
    'faq.title': 'Frequently asked',
    'faq.subtitle': 'If something is missing here, just write to us',
    'faq.q1': 'When will the app be available?',
    'faq.a1': 'We are working on the first version. Subscribe to the notification list and we will tell you as soon as Naturide appears in the App Store and Google Play.',
    'faq.q2': 'Will the app be free?',
    'faq.a2': 'Yes, the basic version will be free. We are also planning a premium version with advanced features, but we will announce the details closer to launch.',
    'faq.q3': 'Can I use Naturide offline?',
    'faq.a3': 'Of course - this is one of the key features. Download the region of your choice before you leave and navigate without signal.',
    'faq.q4': 'Which devices does Naturide support?',
    'faq.a4': 'We are launching on iOS and Android. Other platforms may appear in the future if there is interest.',
    'faq.q5': 'Can I import my own routes?',
    'faq.a5': 'Yes, we support GPX import and export. You can load a route from another app, a website, or a friend.',
    'contact.title': 'Contact',
    'contact.desc': 'Questions, ideas, bug reports - feel free to write.',
    'contact.email': 'Email',
    'contact.facebook': 'Facebook',
    'footer.privacy': 'Privacy policy',
    'footer.copyright': '© {year} Naturide. All rights reserved.',
    'meta.title': 'Naturide - bike navigation and offline route planner',
    'meta.description':
      'Naturide is a mobile app for cyclists. Navigation, offline maps, route planning with OpenStreetMap. Launching soon.',
  },
} as const;

export type UIKey = keyof (typeof ui)['pl'];

export function t(lang: Lang, key: UIKey): string {
  return ui[lang][key] ?? ui[defaultLang][key] ?? key;
}
