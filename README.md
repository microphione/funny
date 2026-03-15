# Pixel Quest - 16-bit RPG

Przeglądarkowa gra RPG 2D w stylu retro 16-bit z nieskończonym proceduralnie generowanym światem.

## Jak uruchomić

### Sposób 1 - Podwójne kliknięcie
Otwórz plik `index.html` w przeglądarce (Chrome, Firefox, Edge).

### Sposób 2 - Z terminala
```bash
xdg-open index.html        # Linux
open index.html             # Mac
```

### Sposób 3 - Lokalny serwer
```bash
python3 -m http.server 8000
```
Otwórz `http://localhost:8000`.

### Sposób 4 - GitHub Pages
Włącz Pages w Settings → branch `main` → otwórz `https://<user>.github.io/funny/`

## Sterowanie (Desktop)

| Klawisz | Akcja |
|---------|-------|
| `W A S D` / Strzałki | Ruch (1 kratka) |
| `SPACJA` | Interakcja |
| `I` | Ekwipunek |
| `ESC` | Zamknij okno |

### W walce
`A` Atak | `S` Umiejętność | `D` Mikstura | `F` Ucieczka

## Sterowanie (Mobile)
- **D-pad** (lewy dolny) - ruch
- **ACT** - interakcja
- **INV** - ekwipunek
- W walce: przyciski ATK/SKL/POT/RUN

## Świat

Nieskończony, proceduralnie generowany świat z biomami:
- **Równiny** - trawa, kwiaty, łatwe potwory
- **Mroczny Las** - gęste drzewa, średni wrogowie
- **Bagno** - woda, mgła, trudni wrogowie
- **Góry** - skały, ciężkie potwory
- **Pustkowia** - piasek, kaktusy, elitarni wrogowie

Wioski generowane co ~8-10 chunków ze sklepami i gospodami.

## Trudność

Sinusoidalny poziom trudności - im dalej od spawnu, tym trudniej, ale z falami łatwiejszych i trudniejszych stref.

## Gra offline

Zapisuje się automatycznie do localStorage.
