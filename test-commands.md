# 🧪 Command-Tests

## Verfügbare Commands:
- `/help` - Hilfe anzeigen ✅
- `/server-status` - Server-Status prüfen ✅  
- `/create-server` - Server erstellen ✅

## Wenn Commands nicht erscheinen:

### 1. Discord Client neu laden
- **Desktop**: Ctrl+R (Windows) oder Cmd+R (Mac)
- **Browser**: F5 oder Seite neu laden
- **Mobile**: App komplett schließen und neu öffnen

### 2. Commands manuell aufrufen
Auch wenn sie nicht in der Autocomplete-Liste stehen, können Sie sie direkt eingeben:
```
/help
/create-server
/server-status
```

### 3. Bot-Berechtigungen prüfen
- Bot braucht "Use Application Commands" Berechtigung
- Bot braucht "Send Messages" in dem Kanal
- Sie brauchen "Use Application Commands" Berechtigung

### 4. Server-spezifische Commands
Falls die Commands nicht global verfügbar sind:
```bash
node deploy-guild-commands.js
```

### 5. Discord Cache
- Warten Sie 1-2 Minuten nach Command-Registrierung
- Discord kann bis zu 1 Stunde für Command-Updates brauchen

## Debugging:
1. Prüfen ob Bot online ist (grüner Punkt)
2. Tippen Sie "/" und schauen Sie die Liste
3. Versuchen Sie Commands in verschiedenen Kanälen
4. Prüfen Sie Bot-Rollen und Berechtigungen