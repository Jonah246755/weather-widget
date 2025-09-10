# weather-app
 weather app Jonah de Jong

Weather Widget

Een weer-widget gebouwd in Vue 3 en TypeScript die de Tomorrow.io Weather API gebruikt om actuele weersinformatie en een 5-daagse voorspelling weer te geven.  
De widget is ontworpen als een compacte, telefoon-achtige UI die eenvoudig te integreren is op een website.

---

 Installatie & gebruik

1. repository clonen
   git clone https://github.com/jouw-gebruikersnaam/weather-widget.git
   cd weather-widget

2. dependencies installeren
npm install

3 environment variabelen instellen
   maak een .env bestand in de project root
TOMMOROW_API_KEY= hierjeapikey

4 proxy-server starten (om API-key veilig te houden):

npm run dev:server

5 frontend starten

npm run dev

6 klik en opent in browser

Keuzes & onderbouwing
Framework

Vue 3 + TypeScript: gekozen omdat Vue lichtgewicht is, een duidelijke componentstructuur biedt en goede ondersteuning heeft voor state management. TypeScript geeft extra typeveiligheid.

Architectuur

Pinia Store voor state management (huidige weer, forecast, loading states).

API-laag (src/api/) die via een kleine Node.js proxy (server/server.js) de Tomorrow.io API aanspreekt.
Dit voorkomt dat de API-key in de frontend zichtbaar is.

API-aanpak

Tomorrow.io Timelines API gebruikt met current, 1h en 1d timesteps.

Icons komen uit de meegeleverde icons/ map en worden gemapt via weatherCode + dag/nacht.

Tooling

Vite: snelle bundler voor Vue-projecten.

TypeScript: type checks en betere ontwikkelervaring.


