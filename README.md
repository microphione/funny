# Pixel Quest - 16-bit RPG

Przeglądarkowa gra RPG 2D w stylu retro 16-bit. Chodzisz po kratkach, zabijasz potworki, kupujesz ekwipunek.

## Jak uruchomić

### Sposób 1 - Podwójne kliknięcie
Otwórz plik `index.html` w przeglądarce (Chrome, Firefox, Edge).

### Sposób 2 - Z terminala (Linux/Mac)
```bash
xdg-open index.html        # Linux
open index.html             # Mac
```

### Sposób 3 - Lokalny serwer (opcjonalnie)
```bash
# Python 3
python3 -m http.server 8000

# Node.js
npx serve .
```
Potem otwórz `http://localhost:8000` w przeglądarce.

## Sterowanie

| Klawisz | Akcja |
|---------|-------|
| `W A S D` / Strzałki | Ruch (1 kratka) |
| `SPACJA` | Interakcja (sklep, tablica, skrzynia) |
| `I` | Ekwipunek |
| `ESC` | Zamknij okno |

### W walce

| Klawisz | Akcja |
|---------|-------|
| `A` | Atak |
| `S` | Umiejętność (1.8x dmg, może chybić) |
| `D` | Użyj mikstury |
| `F` | Ucieczka |

## Mapa

- **Miasto Eldoria** (centrum) - sklepy, gospoda, studnia
- **Mroczny Las** (północ) - gobliny, wilki, pająki, orki
- **Jaskinia Cieni** (wschód) - szkielety, zombie, golemy, demony

## Gra offline

Gra zapisuje się automatycznie do localStorage. Działa bez internetu po pierwszym załadowaniu.
