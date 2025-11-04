# 🚀 Schnellstart-Anleitung für lokale Installation

Diese Anleitung führt dich Schritt für Schritt durch die Installation der App auf deinem Computer.

## 📋 Was du brauchst

1. **Node.js** (Version 18+) - zum Ausführen der App
2. **Ein Code-Editor** wie VS Code (optional, aber empfohlen)
3. **Ein Supabase-Account** (kostenlos)

---

## 1️⃣ Node.js installieren

### Windows:
1. Gehe zu [nodejs.org](https://nodejs.org/)
2. Lade die "LTS"-Version herunter (empfohlen)
3. Führe den Installer aus und folge den Anweisungen
4. Öffne die **Eingabeaufforderung** (cmd) und teste:
   ```
   node --version
   ```
   Du solltest eine Versionsnummer sehen, z.B. `v20.11.0`

### Mac:
1. Gehe zu [nodejs.org](https://nodejs.org/)
2. Lade die "LTS"-Version herunter
3. Installiere das Paket
4. Öffne das **Terminal** und teste:
   ```
   node --version
   ```

### Linux:
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Nach Installation testen:
node --version
```

---

## 2️⃣ Projekt herunterladen & öffnen

1. **Lade** den kompletten Projektordner herunter
2. **Entpacke** die ZIP-Datei
3. **Öffne ein Terminal/Eingabeaufforderung** im Projektordner:
   
   **Windows:**
   - Halte `Shift` gedrückt und klicke mit rechts in den Ordner
   - Wähle "PowerShell-Fenster hier öffnen" oder "Eingabeaufforderung hier öffnen"
   
   **Mac:**
   - Rechtsklick auf den Ordner → "Dienste" → "Neues Terminal beim Ordner"
   
   **Oder:** Navigiere im Terminal:
   ```bash
   cd Pfad/zum/Projektordner
   ```

---

## 3️⃣ Supabase einrichten (Backend)

### Supabase-Projekt erstellen:

1. Gehe zu [supabase.com](https://supabase.com) und **registriere dich** (kostenlos)
2. Klicke auf **"New Project"**
3. Wähle:
   - **Organization:** Erstelle eine neue (z.B. "Meine Apps")
   - **Project Name:** z.B. "disposable-camera"
   - **Database Password:** Erstelle ein sicheres Passwort (speichere es!)
   - **Region:** Wähle eine Region nahe bei dir (z.B. "Frankfurt")
   - Klicke auf **"Create new project"**
4. Warte ca. 1-2 Minuten bis das Projekt bereit ist

### API-Keys kopieren:

1. Gehe in deinem Supabase-Projekt zu **"Settings"** (links unten)
2. Klicke auf **"API"**
3. Hier findest du:
   - **Project URL** (sieht aus wie: `https://abcdefgh.supabase.co`)
   - **anon/public key** (ein langer String)

### Edge Function deployen:

Die App benötigt eine Server-Function in Supabase. So richtest du sie ein:

1. **Installiere die Supabase CLI:**
   
   **Windows (PowerShell):**
   ```powershell
   npm install -g supabase
   ```
   
   **Mac/Linux:**
   ```bash
   npm install -g supabase
   ```

2. **Login bei Supabase:**
   ```bash
   supabase login
   ```
   Es öffnet sich ein Browser-Fenster → Bestätige den Login

3. **Verlinke dein Projekt:**
   ```bash
   supabase link --project-ref DEIN-PROJEKT-REF
   ```
   
   **Wo finde ich die Project Ref?**
   - In deinem Supabase-Dashboard unter "Settings" → "General"
   - Oder: Aus deiner Project URL: `https://[PROJEKT-REF].supabase.co`

4. **Deploye die Server-Function:**
   ```bash
   supabase functions deploy server
   ```
   
   Warte bis du siehst: ✅ "Deployed function server"

---

## 4️⃣ Umgebungsvariablen konfigurieren

1. Im Projektordner findest du die Datei **`.env.example`**
2. **Kopiere** diese Datei und benenne die Kopie in **`.env`** um
3. **Öffne** die `.env` Datei mit einem Texteditor
4. **Trage** deine Supabase-Werte ein:

```env
VITE_SUPABASE_URL=https://deinprojekt.supabase.co
VITE_SUPABASE_ANON_KEY=dein-langer-anon-key-hier
```

**Wichtig:** Ersetze die Werte mit deinen echten Werten aus Schritt 3!

5. **Speichere** die Datei

---

## 5️⃣ Dependencies installieren

Im Terminal (im Projektordner):

```bash
npm install
```

Dies installiert alle benötigten Pakete. Dauert ca. 1-2 Minuten.

**Hinweis:** Ignoriere Warnungen wie "deprecated" - das ist normal.

---

## 6️⃣ App starten! 🎉

```bash
npm run dev
```

Du solltest folgendes sehen:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

Die App öffnet sich automatisch in deinem Browser unter `http://localhost:3000`

**Falls sich der Browser nicht öffnet:** Öffne manuell `http://localhost:3000`

---

## 🎯 App testen

### Auf dem Desktop:
1. Öffne `http://localhost:3000` im Browser
2. Du siehst die Startseite mit 3 Buttons

### Auf dem Handy (im gleichen WLAN):
1. Finde deine Computer-IP-Adresse:
   
   **Windows:**
   ```
   ipconfig
   ```
   Suche nach "IPv4-Adresse" (z.B. `192.168.1.5`)
   
   **Mac/Linux:**
   ```
   ifconfig
   ```
   Suche nach "inet" (z.B. `192.168.1.5`)

2. Auf dem Handy im Browser öffnen:
   ```
   http://DEINE-IP:3000
   ```
   z.B. `http://192.168.1.5:3000`

3. **Wichtig für Kamera-Zugriff:**
   - Auf dem Handy funktioniert die Kamera nur über HTTPS
   - Für lokales Testen kannst du ngrok verwenden (siehe unten)

---

## 📱 Kamera auf dem Handy testen (HTTPS erforderlich)

Die Kamera-API benötigt HTTPS. Für lokales Testen nutze **ngrok**:

1. **Installiere ngrok:**
   - Gehe zu [ngrok.com](https://ngrok.com) und registriere dich
   - Lade ngrok herunter und installiere es

2. **Starte ngrok:**
   ```bash
   ngrok http 3000
   ```

3. **Nutze die HTTPS-URL:**
   Du bekommst eine URL wie: `https://abc123.ngrok.io`
   Diese kannst du auf deinem Handy öffnen!

---

## 🛑 App stoppen

Drücke im Terminal:
```
Strg + C
```

---

## 🔧 Häufige Probleme

### "npm: command not found"
→ Node.js wurde nicht richtig installiert. Wiederhole Schritt 1.

### "Port 3000 is already in use"
→ Ein anderer Prozess nutzt den Port. Entweder:
- Stoppe die andere App
- Oder ändere den Port in `vite.config.ts`: `port: 3001`

### Kamera funktioniert nicht
→ Auf dem Handy benötigst du HTTPS (nutze ngrok, siehe oben)
→ Stelle sicher, dass du Kamera-Berechtigungen erlaubt hast

### Backend-Fehler / "Event erstellen" funktioniert nicht
→ Prüfe:
1. Hast du die Edge Function deployed? (Schritt 3)
2. Sind die `.env` Werte korrekt? (Schritt 4)
3. Öffne die Browser-Console (F12) und schau nach Fehlermeldungen

### "Cannot find module" Fehler
→ Dependencies erneut installieren:
```bash
rm -rf node_modules
npm install
```

---

## 📚 Weitere Befehle

```bash
# Development-Server starten
npm run dev

# Production-Build erstellen
npm run build

# Production-Build lokal testen
npm run preview
```

---

## 🆘 Hilfe bekommen

Falls etwas nicht funktioniert:

1. **Browser-Console öffnen** (F12) und nach Fehlern schauen
2. **Terminal-Output** lesen - oft stehen dort hilfreiche Hinweise
3. Prüfe die **README.md** für ausführlichere Informationen
4. Schau in die **Supabase-Logs** (Dashboard → "Logs")

---

## ✅ Erfolg!

Wenn alles funktioniert, solltest du:
- ✅ Die App im Browser sehen
- ✅ Events erstellen können
- ✅ QR-Codes generieren können
- ✅ Die Kamera nutzen können (mit HTTPS)
- ✅ Fotos hochladen und ansehen können

Viel Spaß mit deiner Event-Fotoalben-App! 📸🎉
