# Pixel Quest - Plan Rozbudowy

## Faza 1: Bugfixy i poprawki (quick wins)

### 1.1 Fix obrotu postaci lewo/prawo
- Sprite gracza jest odwrócony - lewo pokazuje prawo i vice versa
- Poprawka w `drawPlayer()` - zamiana logiki rysowania ramion, oczu i broni dla left/right

### 1.2 Poprawka sklepów
- Sklep odświeża się po zakupie ale nie aktualizuje stanu złota w widoku
- Dodać potwierdzenie zakupu
- Pokazywać porównanie statystyk (aktualny vs nowy przedmiot)
- Wyróżnić przedmioty już posiadane
- Dodać możliwość sprzedaży przedmiotów (50% ceny)

---

## Faza 2: Nieskończony świat (procedural generation)

### 2.1 System chunków (jak Minecraft)
- Świat podzielony na chunki 20x20 kratek
- Chunki generowane proceduralnie z seeda (pozycja chunka = seed)
- Gracz może iść w nieskończoność w każdym kierunku
- Chunki poza ekranem usuwane z pamięci, ponownie generowane przy powrocie
- Kamera śledzi gracza bez granic

### 2.2 Biomy / typy terenu
- **Łąka** - trawa, kwiaty, ścieżki, łatwe potwory
- **Las** - gęste drzewa, średnie potwory
- **Bagno** - woda, mgła, trudniejsze potwory
- **Góry** - skały, jaskinie, ciężkie potwory
- **Pustkowia** - piasek, ruiny, elitarne potwory
- Biomy generowane przez Perlin Noise / Simplex Noise
- Płynne przejścia między biomami

### 2.3 Proceduralne miasta/wioski
- Generowane losowo co ~8-12 chunków (jak wioski w Minecraft)
- Template'y budynków (sklep, gospoda, kowal, apteka) losowo rozmieszczane
- Rozmiar wioski: mała (2-3 budynki) → duża (8-10 budynków)
- Każda wioska ma unikalne ceny (±20% bazowej ceny)
- NPC z losowymi imionami i dialogami
- Mury/ogrodzenia automatycznie generowane wokół wioski

### 2.4 Proceduralne dungeony
- Wejścia do jaskiń generowane losowo na mapie
- Wnętrze: labirynty generowane algorytmem (recursive backtracker)
- Pokoje z bossami, skrzyniami, pułapkami
- Rosnąca głębokość = rosnąca trudność

---

## Faza 3: Sinusoidalna trudność i nieskończony progres

### 3.1 System trudności
- Trudność = funkcja odległości od spawna
- `difficulty = baseLevel + sin(distance * 0.1) * amplitude`
- Im dalej od centrum, tym wyższy baseLevel, ale sinusoida tworzy "fale"
- Strefy łatwe → trudne → łatwe → BARDZO trudne → łatwe...
- Pozwala graczowi odpocząć między trudnymi strefami

### 3.2 Skalowanie potworów
- Każdy biom ma pulę potworów z zakresem poziomów
- Potwory skalowane do poziomu trudności strefy
- Nowe typy potworów odblokowywane z dystansem
- Elitarne potwory (złota ramka) - 3x staty, lepszy loot
- Mini-bossy w dungeon'ach

### 3.3 Nieskończony progres gracza
- Brak limitu poziomu
- Staty rosną logarytmicznie (nigdy za mocno)
- System prestige - po osiągnięciu pewnego poziomu reset z bonusem
- Coraz lepsze tropy ekwipunku: Common → Uncommon → Rare → Epic → Legendary → Mythic
- Losowe statystyki na broni/zbroi (jak Diablo)
- Gemstones/enchantmenty do socketowania

### 3.4 Dynamiczne sklepy
- Asortyment sklepu dopasowany do poziomu gracza i odległości od spawna
- Ceny rosną z dystansem ale jakość przedmiotów też
- Sklepy w dalszych wioskach mają lepszy loot

---

## Faza 4: Lepsza grafika 16-bit

### 4.1 Sprite'y z prawdziwą paletą 16-bit
- SNES-style paleta kolorów (ograniczona do 256 kolorów per sprite)
- Dithering na przejściach
- Każdy tile 16x16 pikseli rysowany szczegółowo (skalowany 2x do 32x32)
- Animowane tile'e (woda, trawa, kwiaty - 4 klatki)

### 4.2 Animacja postaci
- 4-klatkowa animacja chodzenia (idle, krok1, idle, krok2)
- Animacja ataku (zamach mieczem)
- Animacja otrzymywania obrażeń
- Cień pod postacią animowany

### 4.3 Efekty wizualne
- Particle system (iskry, liście, płatki śniegu per biom)
- Przejścia dzień/noc (gradient overlay + zmiana palety)
- Screen shake przy silnych atakach
- Floating damage numbers nad potworami
- Animowane przejścia między strefami

### 4.4 UI retro
- Pixel-art ramki okien dialogowych
- Animowane portrety potworów w walce (idle animation)
- Pasek szybkiego dostępu na dole (hotbar)
- Pixel-art ikony przedmiotów

---

## Faza 5: Rozszerzony gameplay

### 5.1 System questów
- Prości NPC w wioskach dają zadania ("Zabij 5 goblinów", "Znajdź artefakt")
- Nagrody: złoto, XP, unikalne przedmioty
- Quest tracker w UI

### 5.2 System craftingu
- Potwory dropują materiały (skóra, kości, kryształy)
- Crafting broni/zbroi z materiałów
- Receptury znajdowane w skrzyniach

### 5.3 Companion system
- Możliwość "zatrudnienia" towarzysza w mieście
- Towarzysz walczy obok gracza
- Różne klasy: wojownik, łucznik, mag

---

## Kolejność implementacji

| Priorytet | Zadanie | Złożoność |
|-----------|---------|-----------|
| 1 | Fix obrotu postaci | Mała |
| 2 | Poprawka sklepów | Mała |
| 3 | Lepsza grafika 16-bit (sprite'y, animacje) | Średnia |
| 4 | System chunków + nieskończony świat | Duża |
| 5 | Proceduralne biomy (Perlin Noise) | Duża |
| 6 | Sinusoidalna trudność + skalowanie | Średnia |
| 7 | Proceduralne wioski | Duża |
| 8 | Nieskończony progres + loot system | Średnia |
| 9 | Proceduralne dungeony | Duża |
| 10 | Efekty wizualne + dzień/noc | Średnia |
| 11 | System questów | Średnia |
| 12 | Crafting + companiony | Średnia |
