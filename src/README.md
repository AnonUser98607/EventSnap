# 📸 Disposable Camera - Social Event Fotoalben App

Eine mobile-first Event-Fotoalben-App mit QR-Codes, Apple Dark Mode Design und Glasmorphismus-Effekten.

## ✨ Features

- 📱 Mobile-first Design mit Apple Dark Mode & Farbverläufen
- 📷 Live-Kamera mit 4:3-Format (keine Galerie-Uploads)
- 🔍 QR-Code Scanner zum Event-Beitritt
- 🖼️ Automatische Bildoptimierung (1080p, JPEG)
- ⏱️ Automatisches Event-Ablaufen (bis zu 30 Tage)
- 📦 ZIP-Download aller Event-Fotos
- 🍪 Cookie-basiertes Tracking (kein Nutzer-Login nötig)

## 🚀 Installation & Start

### Voraussetzungen

- **Node.js** (Version 18 oder höher) - [Download hier](https://nodejs.org/)
- **npm** oder **yarn** (kommt mit Node.js)
- Ein **Supabase-Account** (kostenlos) - [Registrieren hier](https://supabase.com)

### Schritt 1: Code herunterladen

Lade den kompletten Projektordner herunter und entpacke ihn.

### Schritt 2: Dependencies installieren

Öffne ein Terminal/Kommandozeile im Projektordner und führe aus:

```bash
npm install
```

### Schritt 3: Supabase-Projekt einrichten

1. **Erstelle ein kostenloses Supabase-Projekt:**
   - Gehe zu [supabase.com](https://supabase.com)
   - Klicke auf "Start your project"
   - Erstelle ein neues Projekt

2. **Hole deine API-Credentials:**
   - Gehe in deinem Supabase-Dashboard zu "Settings" → "API"
   - Kopiere die **Project URL** und den **anon/public key**

3. **Erstelle eine `.env` Datei:**
   - Kopiere die Datei `.env.example` und benenne sie in `.env` um
   - Trage deine Supabase-Credentials ein:
   ```
   VITE_SUPABASE_URL=https://deinprojekt.supabase.co
   VITE_SUPABASE_ANON_KEY=dein-anon-key-hier
   ```

4. **Richte die Datenbank ein:**
   - Gehe im Supabase-Dashboard zu "Database" → "Tables"
   - Die KV-Store Tabelle wird automatisch vom Backend erstellt

5. **Deploye die Edge Function (optional für lokales Testen):**
   
   Installiere die Supabase CLI:
   ```bash
   npm install -g supabase
   ```
   
   Login bei Supabase:
   ```bash
   supabase login
   ```
   
   Link dein Projekt:
   ```bash
   supabase link --project-ref dein-projekt-ref
   ```
   
   Deploye die Functions:
   ```bash
   supabase functions deploy server
   ```

### Schritt 4: App starten

```bash
npm run dev
```

Die App öffnet sich automatisch in deinem Browser unter `http://localhost:3000`

## 🛠️ Verfügbare Befehle

```bash
npm run dev      # Startet den Development-Server
npm run build    # Erstellt eine Production-Build
npm run preview  # Zeigt die Production-Build lokal an
```

## 📱 App nutzen

1. **Event erstellen:** Klicke auf "Event erstellen", gib die Details ein und lade den QR-Code herunter
2. **Event beitreten:** Scanne einen Event-QR-Code mit deinem Handy
3. **Fotos aufnehmen:** Nutze die integrierte Kamera (nur Live-Aufnahmen)
4. **Galerie ansehen:** Sieh alle Event-Fotos in Echtzeit
5. **ZIP Download:** Lade alle Fotos als ZIP-Datei herunter

## 🔧 Troubleshooting

### Die App startet nicht
- Stelle sicher, dass Node.js installiert ist: `node --version`
- Lösche `node_modules` und installiere neu: `rm -rf node_modules && npm install`

### Kamera funktioniert nicht
- Die App benötigt HTTPS oder localhost für Kamera-Zugriff
- Erlaube Kamera-Berechtigungen in deinem Browser

### Backend-Fehler
- Prüfe deine `.env` Datei auf korrekte Supabase-Credentials
- Stelle sicher, dass die Edge Function deployed ist
- Prüfe die Browser-Console auf Fehlermeldungen

### QR-Scanner funktioniert nicht
- Teste auf einem echten Mobilgerät (nicht Desktop)
- Erlaube Kamera-Berechtigungen

## 🏗️ Technologie-Stack

- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool & Dev Server
- **Tailwind CSS 4** - Styling mit Glasmorphismus
- **Supabase** - Backend (Database, Storage, Edge Functions)
- **html5-qrcode** - QR-Code Scanner
- **qrcode** - QR-Code Generator
- **JSZip** - ZIP-Erstellung
