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
    'nav.toggleTheme': 'Przełącz tryb dzień/noc',
    'hero.badge': 'Już wkrótce',
    'hero.title': 'NATURIDE',
    'hero.subtitle': 'Inteligentna nawigacja rowerowa',
    'hero.description':
      'Naturide to inteligentna nawigacja rowerowa stworzona przez rowerzystów dla rowerzystów. Wyróżnia się płynnością i szybkością działania oraz przemyślanym interfejsem',
    'hero.cta.notify': 'Powiadom mnie o premierze',
    'hero.cta.features': 'Zobacz funkcje',
    'hero.stats.offline': 'Mapy',
    'hero.stats.offlineDesc': 'Aktualne mapy wektorowe',
    'hero.stats.gpx': 'GPX',
    'hero.stats.gpxDesc': 'Import i eksport',
    'hero.stats.osm': 'OSM',
    'hero.stats.osmDesc': 'Dane z OpenStreetMap',
    'features.title': 'Co potrafi Naturide',
    'features.subtitle': 'Funkcje, które przydadzą się na każdej trasie',
    'features.navigation.title': 'Nawigacja Offline',
    'features.navigation.desc':
      'Prowadzenie po trasie bezpośrednio z planera lub pliku GPX. Po zjeździe z trasy algorytm szybko tworzy łącznik, by użytkownik mógł sprawnie wrócić na trasę nawet gdy nie ma internetu',
    'features.offline.title': 'Mapy oparte o dane OpenStreetMap',
    'features.offline.desc':
      'Precyzyjne mapy wektorowe w trybie dziennym i nocnym dostępne jednym kliknięciem.',
    'features.planner.title': 'Planner tras Offline',
    'features.planner.desc':
      'Wyznaczaj trasy z punktami pośrednimi bez internetu.',
    'features.tracking.title': 'Nagrywanie trasy',
    'features.tracking.desc':
      'Nagrywaj przejazd z adaptacyjną dokładnością GPS do 1m podczas pokonywania zakrętu. Profil wysokości, dystans, czas - wszystko automatycznie.',
    'screens.title': 'Zobacz aplikację',
    'screens.subtitle': 'Dzień, noc, przyjazny interfejs - wszystko czego potrzebujesz w trasie i przy planowaniu w fotelu',
    'screens.alt1': 'Widok mapy z zaplanowaną trasą rowerową przez północną Polskę - tryb dzienny',
    'screens.alt2': 'Widok mapy w trybie nocnym - czytelny kontrast po zmroku',
    'screens.alt3': 'Szczegóły nawigacji z profilem wysokości, dystansem i czasem',
    'screens.alt4': 'Planner tras z informacją o dystansie, czasie i podjazdach',
    'comingsoon.title': 'Premiera już wkrótce',
    'comingsoon.desc':
      'Pracujemy nad pierwszą wersją. Zostaw email, a damy Ci znać, gdy aplikacja trafi do sklepów.',
    'comingsoon.placeholder': 'Twój adres email',
    'comingsoon.submit': 'Powiadom mnie',
    'comingsoon.privacy': 'Bez spamu.',
    'comingsoon.consent':
      'Wyrażam zgodę na przetwarzanie mojego adresu email w celu powiadomienia o premierze zgodnie z',
    'comingsoon.privacyPolicy': 'polityką prywatności',
    'comingsoon.success': 'Gotowe! Damy Ci znać, gdy Naturide pojawi się w sklepach.',
    'comingsoon.removeHint': 'Wycofaj zgodę',
    'remove.title': 'Usuń swoje dane',
    'remove.subtitle':
      'Jeśli chcesz wycofać zgodę i usunąć swój adres email z naszej listy powiadomień, wypełnij formularz poniżej.',
    'remove.label.email': 'Twój adres email',
    'remove.submit': 'Usuń moje dane',
    'remove.confirm':
      'Potwierdzam, że chcę usunąć swój adres email z listy powiadomień zgodnie z',
    'remove.privacy':
      'Twój email zostanie usunięty z naszej listy w ciągu 7 dni roboczych.',
    'remove.success': 'Gotowe! Twój adres email został usunięty z naszej listy powiadomień.',
    'remove.removePolicy': 'polityką prywatności',
    'footer.removeData': 'Usuń dane',
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
    'meta.title': 'Naturide - inteligentna nawigacja rowerowa',
    'meta.description':
      'Naturide to inteligentna nawigacja rowerowa tworzona przez rowerzystów. Aktualne mapy wektorowe, GPX i OpenStreetMap. Premiera wkrótce.',
  },
  en: {
    'nav.features': 'Features',
    'nav.screens': 'Screenshots',
    'nav.faq': 'FAQ',
    'nav.contact': 'Contact',
    'nav.toggleTheme': 'Toggle day/night mode',
    'hero.badge': 'Coming soon',
    'hero.title': 'Naturide',
    'hero.subtitle': 'Smart bike navigation',
    'hero.description':
      'Naturide is intelligent bike navigation, made by cyclists for cyclists. It stands out with fluid, fast performance and a thoughtfully designed interface.',
    'hero.cta.notify': 'Notify me at launch',
    'hero.cta.features': 'See features',
    'hero.stats.offline': 'Maps',
    'hero.stats.offlineDesc': 'Always up-to-date',
    'hero.stats.gpx': 'GPX',
    'hero.stats.gpxDesc': 'Import and export',
    'hero.stats.osm': 'OSM',
    'hero.stats.osmDesc': 'OpenStreetMap data',
    'features.title': 'What Naturide does',
    'features.subtitle': 'Things you will use on every ride',
    'features.navigation.title': 'Bike navigation',
    'features.navigation.desc':
      'Turn-by-turn guidance along planned routes and imported GPX files.',
    'features.offline.title': 'Maps powered by OpenStreetMap',
    'features.offline.desc':
      'Precise vector maps in day and night mode, just one tap away.',
    'features.planner.title': 'Route planner',
    'features.planner.desc':
      'Plan routes with waypoints, export to GPX, share with friends.',
    'features.tracking.title': 'Ride tracking',
    'features.tracking.desc':
      'Record your ride with adaptive GPS accuracy up to 1 m on tight turns. Elevation profile, distance, time - all automatic.',
    'screens.title': 'See the app',
    'screens.subtitle': 'Day or night, friendly interface - everything you need on the road and while planning one',
    'screens.alt1': 'Map view with a recorded bike route across northern Poland - day mode',
    'screens.alt2': 'Map view in night mode - readable contrast after dark',
    'screens.alt3': 'Navigation details with speed and distance profile',
    'screens.alt4': 'Route planner showing distance, time and elevation',
    'comingsoon.title': 'Launching soon',
    'comingsoon.desc':
      'We are working on the first version. Leave your email and we will let you know when the app hits the stores.',
    'comingsoon.placeholder': 'Your email address',
    'comingsoon.submit': 'Notify me',
    'comingsoon.privacy': 'No spam.',
    'comingsoon.consent':
      'I agree to the processing of my email address for launch notifications according to the',
    'comingsoon.privacyPolicy': 'privacy policy',
    'comingsoon.success': 'Done! We will let you know when Naturide lands in the stores.',
    'comingsoon.removeHint': 'Withdraw consent',
    'remove.title': 'Remove your data',
    'remove.subtitle':
      'If you want to withdraw your consent and remove your email from our notification list, fill in the form below.',
    'remove.label.email': 'Your email address',
    'remove.submit': 'Remove my data',
    'remove.confirm':
      'I confirm that I want to remove my email address from the notification list according to the',
    'remove.privacy':
      'Your email will be removed from our list within 7 business days.',
    'remove.success': 'Done! Your email address has been removed from our notification list.',
    'remove.removePolicy': 'privacy policy',
    'footer.removeData': 'Remove data',
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
    'meta.title': 'Naturide - smart bike navigation',
    'meta.description':
      'Naturide is smart bike navigation, built by cyclists for cyclists. Always up-to-date vector maps, GPX import and export, and OpenStreetMap data. Launching soon.',
  },
} as const;

export type UIKey = keyof (typeof ui)['pl'];

export function t(lang: Lang, key: UIKey): string {
  return ui[lang][key] ?? ui[defaultLang][key] ?? key;
}
