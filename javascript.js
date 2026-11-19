(function(){
'use strict';

/* PURE:START */
const MAX_LEVEL = 25, SETBACK = 5, TOL_START = 10, TOL_END = 4;
/* Összesített eltérés mód: ennyi szorzódott eltérésnél lépünk vissza */
const ACC_LIMIT = 20, LOG_LIMIT = Math.log10(ACC_LIMIT);

const QUESTIONS = [
  // Magyarország
  {q:"Hány lakosa van Magyarországnak?",a:9600000,u:"fő",e:"Kb. 9,5–9,6 millióan élnek Magyarországon (KSH)."},
  {q:"Hány lakosa van Budapestnek?",a:1690000,u:"fő",e:"Budapest népessége kb. 1,7 millió fő, az ország lakosságának nagyjából ötöde."},
  {q:"Hány négyzetkilométer Magyarország területe?",a:93030,u:"km²",e:"Az ország területe 93 030 km², nagyjából egy 300 × 300 km-es négyzetnek felel meg."},
  {q:"Hány négyzetkilométer a Balaton vízfelülete?",a:592,u:"km²",e:"A Balaton felülete kb. 592 km², hossza kb. 78 km, szélessége 1,5–14 km."},
  {q:"Hány liter víz van a Balatonban?",a:1.9e12,u:"liter",e:"Kb. 592 km² × 3,2 m átlagmélység ≈ 1,9 km³, vagyis kb. 1,9 ezer milliárd liter."},
  {q:"Hány kilométer hosszú a Duna magyarországi szakasza?",a:417,u:"km",e:"A Duna Rajkától a déli országhatárig 417 km-en folyik Magyarországon."},
  {q:"Hány települése van Magyarországnak?",a:3155,u:"db",e:"Magyarországon kb. 3155 település van, többségük kis falu. Budapest egy településnek számít."},
  {q:"Hány méter magas a Kékes, Magyarország legmagasabb csúcsa?",a:1014,u:"m",e:"A Mátrában álló Kékes 1014 m magas."},
  {q:"Hány méter hosszú a Széchenyi Lánchíd?",a:380,u:"m",e:"A Lánchíd teljes hossza 380 m, a középső nyílása 202 m."},
  {q:"Hány helyiség van az Országházban?",a:691,u:"db",e:"Az Országházban 691 helyiség található."},
  {q:"Hány néző fér be a Puskás Arénába?",a:67215,u:"fő",e:"A Puskás Aréna befogadóképessége 67 215 néző."},
  {q:"Hány lakosa van Debrecennek?",a:200000,u:"fő",e:"Debrecen az ország második legnagyobb városa, kb. 200 ezer lakossal."},
  {q:"Hány méter magas az Országház kupolája?",a:96,u:"m",e:"A kupola 96 m magas, ugyanennyi, mint a Szent István-bazilikáé."},
  {q:"Hány terawattórát fogyaszt Magyarország villamos energiából egy évben?",a:43,u:"TWh",e:"Az éves hazai villamosenergia-fogyasztás kb. 43 TWh."},
  {q:"Hány kilométer Budapestről Bécsbe autóval, az M1-esen?",a:243,u:"km",e:"A távolság kb. 240–245 km."},

  // Világ és földrajz
  {q:"Hány ember él a Földön?",a:8.3e9,u:"fő",e:"A Föld lakossága 2026-ban kb. 8,3 milliárd fő."},
  {q:"Hány lakosa van Indiának?",a:1.46e9,u:"fő",e:"India lakossága kb. 1,46 milliárd, 2023 óta ő a világ legnépesebb országa."},
  {q:"Hány lakosa van az Egyesült Államoknak?",a:3.4e8,u:"fő",e:"Az USA lakossága kb. 340 millió fő."},
  {q:"Hány lakosa van Nagy-Tokiónak, az agglomerációval együtt?",a:3.5e7,u:"fő",e:"A számítási módszertől függően 33–37 millió fő, ezzel a világ egyik legnagyobb agglomerációja."},
  {q:"Hány négyzetkilométer Oroszország területe?",a:1.71e7,u:"km²",e:"Oroszország 17,1 millió km², a Föld szárazföldjeinek kb. 11%-a."},
  {q:"Hány négyzetkilométer a Szahara területe?",a:9.2e6,u:"km²",e:"A Szahara kb. 9,2 millió km², nagyjából akkora, mint az Egyesült Államok."},
  {q:"Hány négyzetkilométer a Föld teljes felszíne?",a:5.1e8,u:"km²",e:"A Föld felszíne 510 millió km², ennek kb. 71%-a óceán."},
  {q:"Hány méter magas a Mount Everest?",a:8849,u:"m",e:"Az Everest 8849 m magas (a 2020-as közös kínai–nepáli mérés szerint)."},
  {q:"Hány méter mély a Mariana-árok legmélyebb pontja?",a:10935,u:"m",e:"A Challenger-mélység kb. 10 900–11 000 m mélyen van, az Everest simán elférne benne."},
  {q:"Hány méter mély a Bajkál-tó legmélyebb pontja?",a:1642,u:"m",e:"A Bajkál 1642 m mély, a világ legmélyebb tava."},
  {q:"Hány szigetből áll Indonézia?",a:17000,u:"db",e:"Indonézia kb. 17 ezer szigetből áll."},
  {q:"Hány kilométer hosszú a Duna a teljes hosszában?",a:2850,u:"km",e:"A Duna kb. 2850 km hosszú, és 10 országon folyik át."},
  {q:"Hány kilométer hosszú a Transzszibériai vasútvonal Moszkvától Vlagyivosztokig?",a:9289,u:"km",e:"A vonal 9289 km hosszú, és 7 időzónát szel át."},
  {q:"Hány élő nyelvet beszélnek a világon?",a:7100,u:"nyelv",e:"Az Ethnologue szerint kb. 7100 élő nyelv van."},
  {q:"Hány tagállama van az ENSZ-nek?",a:193,u:"db",e:"Az ENSZ-nek 193 tagállama van."},
  {q:"Hány köbkilométer víz van a világtengerekben?",a:1.335e9,u:"km³",e:"A világtengerek kb. 1,335 milliárd km³ vizet tartalmaznak."},

  // Űr
  {q:"Hány kilométerre van a Hold a Földtől?",a:384400,u:"km",e:"Átlagosan 384 400 km; a fény ezt kb. 1,3 másodperc alatt teszi meg."},
  {q:"Hány kilométerre van a Nap a Földtől?",a:1.496e8,u:"km",e:"Átlagosan 149,6 millió km, ez 1 csillagászati egység."},
  {q:"Hány kilométert tesz meg a fény egy másodperc alatt?",a:299792,u:"km",e:"A fény 299 792 km-t tesz meg másodpercenként, vagyis egy másodperc alatt 7,5-ször kerülné meg a Földet."},
  {q:"Hány kilométer a Nap átmérője?",a:1392700,u:"km",e:"A Nap átmérője kb. 1,39 millió km, nagyjából 109 Föld átmérője."},
  {q:"Hány Föld férne el a Napban térfogat szerint?",a:1.3e6,u:"db",e:"A Nap térfogata kb. 1,3 millió Földét tenné ki."},
  {q:"Hány földi napig tart egy marsi év?",a:687,u:"nap",e:"A Mars 687 földi nap alatt kerüli meg a Napot."},
  {q:"Hány km/h sebességgel kering a Nemzetközi Űrállomás?",a:27600,u:"km/h",e:"Az ISS kb. 7,66 km/s, azaz 27 600 km/h sebességgel kering, és kb. 92 perc alatt kerüli meg a Földet."},
  {q:"Hány csillag van a Tejútrendszerben?",a:2e11,u:"db",e:"A becslések 100 és 400 milliárd közöttiek."},
  {q:"Hány kilométerre van a Földtől a Voyager 1 űrszonda 2026 novemberében?",a:2.59e10,u:"km",e:"A szonda ekkor éri el az 1 fénynapnyi távolságot, ez kb. 25,9 milliárd km."},
  {q:"Hány kilométer a Hold átmérője?",a:3474,u:"km",e:"A Hold átmérője 3474 km, a Földének kb. 27%-a."},
  {q:"Hány percig tart, mire a Nap fénye eléri a Földet?",a:8.3,u:"perc",e:"A fény kb. 8 perc 20 másodperc alatt ér ide."},
  {q:"Hány nap telik el két telihold között?",a:29.5,u:"nap",e:"Egy holdhónap átlagosan 29,5 nap."},

  // Idő és történelem
  {q:"Hány éves az univerzum?",a:1.38e10,u:"év",e:"Az Ősrobbanás óta kb. 13,8 milliárd év telt el."},
  {q:"Hány éves a Föld?",a:4.54e9,u:"év",e:"A Föld kora kb. 4,54 milliárd év."},
  {q:"Hány évvel ezelőtt halt ki a nagy dinoszauruszok többsége?",a:6.6e7,u:"év",e:"Kb. 66 millió éve, a Chicxulub-becsapódás idején."},
  {q:"Hány éves a gízai Nagy Piramis?",a:4600,u:"év",e:"A piramis i. e. 2560 körül épült, tehát kb. 4600 éves."},
  {q:"Hány évvel ezelőtt jelent meg a Homo sapiens?",a:300000,u:"év",e:"A legkorábbi Homo sapiens-leletek kb. 300 ezer évesek (Dzsebel Irhud, Marokkó)."},
  {q:"Hány ember született a Földön az emberiség története során?",a:1.17e11,u:"fő",e:"A becslések szerint kb. 117 milliárd ember élt valaha."},
  {q:"Hány másodperc van egy évben?",a:31536000,u:"másodperc",e:"365 × 24 × 60 × 60 = 31 536 000 másodperc."},
  {q:"Hány évig tart egymilliárd másodperc?",a:31.7,u:"év",e:"10⁹ másodperc ÷ 31,5 millió másodperc/év ≈ 31,7 év."},
  {q:"Hány napig tart egymillió másodperc?",a:11.6,u:"nap",e:"10⁶ másodperc ÷ 86 400 másodperc/nap ≈ 11,6 nap."},

  // Emberi test
  {q:"Hány csontból áll egy felnőtt ember váza?",a:206,u:"db",e:"A felnőtt csontváz 206 csontból áll, az újszülötteké kb. 300."},
  {q:"Hány liter vér kering egy felnőtt emberben?",a:5,u:"liter",e:"Egy felnőttben kb. 4,5–5,5 liter vér van."},
  {q:"Hány idegsejt (neuron) van az emberi agyban?",a:8.6e10,u:"db",e:"Kb. 86 milliárd."},
  {q:"Hány sejt alkot egy felnőtt emberi testet?",a:3e13,u:"db",e:"Kb. 30 billió (3 × 10¹³) saját sejtünk van."},
  {q:"Hányszor ver a szív egy nap alatt?",a:100000,u:"ütés",e:"Kb. 70 ütés/perc × 1440 perc ≈ 100 ezer ütés naponta."},
  {q:"Hányszor veszünk levegőt egy nap alatt?",a:20000,u:"légvétel",e:"Kb. 14 légvétel/perc × 1440 perc ≈ 20 ezer naponta."},
  {q:"Hány hajszál nő egy ember fején?",a:100000,u:"db",e:"A fejbőrön kb. 100–150 ezer hajszál van."},
  {q:"Hány méter hosszú egyetlen emberi sejt magjában a kitekert DNS?",a:2,u:"m",e:"Egyetlen sejtmag DNS-e kitekerve kb. 2 méter."},
  {q:"Hány liter víz van egy 70 kg-os felnőttben?",a:42,u:"liter",e:"A testtömeg kb. 60%-a víz: 0,6 × 70 kg = 42 liter."},
  {q:"Hány négyzetméter egy felnőtt ember bőrfelülete?",a:1.8,u:"m²",e:"Kb. 1,6–2 m²."},
  {q:"Hány évet alszik át egy 80 évig élő ember?",a:25,u:"év",e:"Napi 7–8 óra alvással kb. 23–27 év telik alvással."},
  {q:"Hány kilogramm egy felnőtt ember agya?",a:1.4,u:"kg",e:"Az emberi agy átlagosan kb. 1,4 kg."},
  {q:"Hány liter vért pumpál át a szív egy nap alatt?",a:7200,u:"liter",e:"Kb. 5 liter/perc × 1440 perc ≈ 7200 liter."},

  // Állatvilág és természet
  {q:"Hány kilogramm egy felnőtt kék bálna?",a:120000,u:"kg",e:"Egy felnőtt kék bálna 100–150 tonna."},
  {q:"Hány km/h sebességre gyorsul a gepárd?",a:110,u:"km/h",e:"Rövid hajszában kb. 100–120 km/h."},
  {q:"Hány állatfajt írtak le eddig a tudósok?",a:1.5e6,u:"faj",e:"Kb. 1,5–2 millió leírt állatfaj van, ennek többsége rovar."},
  {q:"Hány fa nő a Földön?",a:3.04e12,u:"db",e:"Egy 2015-ös becslés kb. 3 billió fát számolt."},
  {q:"Hány hangya él a Földön?",a:2e16,u:"db",e:"Egy 2022-es becslés kb. 20 billiárd (2 × 10¹⁶) hangyát jósol."},
  {q:"Hány csirke él egyszerre a Földön?",a:2.6e10,u:"db",e:"Kb. 26 milliárd csirke él egyszerre, az emberek számának háromszorosa."},
  {q:"Hány tojást tojik egy tojótyúk egy év alatt?",a:300,u:"db",e:"Egy modern tojóhibrid évente 290–320 tojást rak."},
  {q:"Hány méh él egy erős méhcsaládban nyáron?",a:50000,u:"db",e:"Nyáron 40–60 ezer dolgozó méh él egy kaptárban."},
  {q:"Hány km/h sebességgel zuhan a vándorsólyom?",a:320,u:"km/h",e:"Zuhanórepülésben 320 km/h körüli sebességet ér el."},
  {q:"Hány méter magas a világ legmagasabb ismert fája, a Hyperion?",a:116,u:"m",e:"A Hyperion nevű parti mamutfenyő 115,9 m magas."},

  // Technológia és gazdaság
  {q:"Hány e-mailt küldenek a világon naponta?",a:3.5e11,u:"db",e:"Kb. 350 milliárd e-mail megy el naponta, a spamet is beleértve."},
  {q:"Hány ember használ internetet a világon?",a:6e9,u:"fő",e:"Az ITU szerint kb. 6 milliárd ember van online."},
  {q:"Hány gépjármű van forgalomban a világon?",a:1.5e9,u:"db",e:"Kb. 1,5 milliárd."},
  {q:"Hány cikket tartalmaz az angol nyelvű Wikipédia?",a:7.1e6,u:"cikk",e:"Az angol Wikipédia kb. 7 millió cikkből áll."},
  {q:"Hány repülőjárat indul a világon naponta?",a:100000,u:"járat",e:"Naponta kb. 100 ezer járat száll fel."},
  {q:"Hány csésze kávét isznak meg a világon naponta?",a:2.25e9,u:"csésze",e:"A Nemzetközi Kávészervezet becslése szerint kb. 2,25 milliárd."},
  {q:"Hány tonna acélt gyártanak a világon évente?",a:1.9e9,u:"tonna",e:"A világ éves acéltermelése kb. 1,9 milliárd tonna."},
  {q:"Hány tonna műanyagot gyártanak a világon évente?",a:4e8,u:"tonna",e:"Kb. 400 millió tonnát."},
  {q:"Hány tonna aranyat bányásztak ki eddig az emberiség története során?",a:216000,u:"tonna",e:"Kb. 216–220 ezer tonnát; ez egy kb. 22 méter élű kockába férne."},
  {q:"Hány tonna élelmiszer kerül a szemétbe a világon évente?",a:1.05e9,u:"tonna",e:"Az ENSZ környezetvédelmi programja (UNEP) szerint kb. 1,05 milliárd tonna."},
  {q:"Hány liter víz kell egy kilogramm marhahús előállításához?",a:15400,u:"liter",e:"A teljes vízlábnyom kb. 15 400 liter kilogrammonként."},
  {q:"Hány liter víz kell egyetlen csésze kávéhoz a termesztéstől a főzésig?",a:140,u:"liter",e:"Kb. 140 liter, a víz nagy része a kávécserje termesztésére megy el."},
  {q:"Milyen magas lenne egymilliárd egymásra rakott A4-es papírlap?",a:100,u:"km",e:"Egy A4-es lap kb. 0,1 mm vastag: 10⁹ × 0,1 mm = 100 km."},
  {q:"Hány szóból áll az angol nyelvű Harry Potter és a bölcsek köve?",a:77000,u:"szó",e:"Kb. 77 ezer szóból."},
  {q:"Hány látogatót fogadott a Louvre 2024-ben?",a:8.7e6,u:"fő",e:"A Louvre 2024-ben kb. 8,7 millió látogatót fogadott."},

  // Sport
  {q:"Hány négyzetméter egy nemzetközi mérkőzésekre alkalmas futballpálya?",a:7140,u:"m²",e:"A tipikus nemzetközi pályaméret 105 × 68 m = 7140 m²."},
  {q:"Hány liter víz fér egy olimpiai méretű úszómedencébe?",a:2.5e6,u:"liter",e:"50 m × 25 m × 2 m = 2500 m³ = 2,5 millió liter."},
  {q:"Hány kilométer hosszú egy Tour de France átlagos útvonala?",a:3400,u:"km",e:"A táv évente 3300–3500 km körül van."},
  {q:"Hány lépésből fut le egy ember egy maratont?",a:48000,u:"lépés",e:"42 195 m ÷ kb. 0,9 m lépéshossz ≈ 47–50 ezer lépés."},

  // Építmények és rekordok
  {q:"Hány méter magas az Eiffel-torony az antennával együtt?",a:330,u:"m",e:"Az Eiffel-torony 330 m magas."},
  {q:"Hány méter magas a Burdzs Kalifa?",a:828,u:"m",e:"A dubaji Burdzs Kalifa 828 m, a világ legmagasabb épülete."},
  {q:"Hány kilométer hosszú a Gotthárd-bázisalagút?",a:57,u:"km",e:"57,1 km, ez a világ leghosszabb vasúti alagútja."},
  {q:"Hány kilométer hosszú a La Manche alatti Csatorna-alagút?",a:50,u:"km",e:"Kb. 50,5 km, ebből kb. 38 km a tenger alatt fut."},
  {q:"Hány kilométer hosszú a Panama-csatorna?",a:82,u:"km",e:"A csatorna kb. 82 km hosszú."},
  {q:"Hány különböző állása lehet egy 3 × 3-as Rubik-kockának?",a:4.3252e19,u:"állás",e:"43 252 003 274 489 856 000, azaz kb. 4,3 × 10¹⁹ állás."},

  // ===== 2. csomag: újabb 100 kérdés =====
  // Magyarország
  {q:"Hány képviselője van az Országgyűlésnek?",a:199,u:"fő",e:"Az Országgyűlésnek 199 tagja van."},
  {q:"Hány vármegye van Magyarországon, Budapest nélkül?",a:19,u:"db",e:"Magyarországon 19 vármegye (korábbi nevén megye) van, Budapest külön közigazgatási egység."},
  {q:"Hány kilométer hosszú a Tisza magyarországi szakasza?",a:597,u:"km",e:"A Tisza 597 km-en át folyik Magyarországon; a teljes hossza kb. 966 km."},
  {q:"Hány négyzetkilométer Budapest területe?",a:525,u:"km²",e:"Budapest területe kb. 525 km², ez Magyarország területének alig több mint fél százaléka."},
  {q:"Hány méter magas a Gellért-hegy a tengerszint felett?",a:235,u:"m",e:"A Gellért-hegy 235 m magas a tengerszint felett, a Duna szintje felett kb. 140 m."},
  {q:"Hány lakosa van Szegednek?",a:157000,u:"fő",e:"Szeged lélekszáma kb. 155–160 ezer fő, ezzel az ország harmadik legnagyobb városa."},
  {q:"Hány négyzetkilométer a Velencei-tó vízfelülete?",a:25,u:"km²",e:"A Velencei-tó felülete kb. 25 km², átlagosan alig másfél méter mély."},
  {q:"Hány kilométer Budapestről Debrecenbe autóval, az M3-as és az M35-ös autópályán?",a:230,u:"km",e:"Az út kb. 220–235 km hosszú."},
  {q:"Hány ember beszéli anyanyelveként a magyart a világon?",a:1.3e7,u:"fő",e:"Kb. 13 millió ember, a határon túli magyarokat is beleértve."},
  {q:"Hány kilométer hosszú a budapesti metróhálózat az M1, M2, M3 és M4 vonalakkal együtt?",a:39,u:"km",e:"M1 ≈ 4,4 km + M2 ≈ 10,3 km + M3 ≈ 16,5 km + M4 ≈ 7,4 km, összesen kb. 39 km."},

  // Világ és földrajz
  {q:"Hány négyzetkilométer Kanada területe?",a:9.98e6,u:"km²",e:"Kanada kb. 9,98 millió km², területre a világ második legnagyobb országa."},
  {q:"Hány négyzetkilométer Ausztrália területe?",a:7.69e6,u:"km²",e:"Ausztrália területe kb. 7,69 millió km²."},
  {q:"Hány négyzetkilométer a Vatikán területe?",a:0.44,u:"km²",e:"A Vatikán kb. 0,44 km², a világ legkisebb önálló állama."},
  {q:"Hány kilométer hosszú a Nílus?",a:6650,u:"km",e:"A Nílus kb. 6650 km hosszú; az Amazonas hosszáról vita van, de a Nílust szokás a leghosszabbnak tekinteni."},
  {q:"Hány kilométer hosszú a Kínai Nagy Fal az összes szakaszát számolva?",a:21196,u:"km",e:"A 2012-es kínai felmérés szerint 21 196 km, az összes korszak falszakaszait együtt számolva."},
  {q:"Hány lakosa van Kínának?",a:1.41e9,u:"fő",e:"Kína lakossága kb. 1,41 milliárd fő."},
  {q:"Hány lakosa van Brazíliának?",a:2.1e8,u:"fő",e:"A 2022-es népszámlálás szerint 203 millió, a becslések szerint ma kb. 210–213 millió."},
  {q:"Hány lakosa van Nigériának?",a:2.3e8,u:"fő",e:"Nigéria lakossága kb. 230 millió fő, Afrika legnépesebb országa."},
  {q:"Hány lakosa van Izlandnak?",a:3.9e5,u:"fő",e:"Izlandon kb. 390 ezren élnek, nagyjából kétszer annyian, mint Debrecenben."},
  {q:"Hány olyan ország van a világon, amelynek nincs tengerpartja?",a:44,u:"db",e:"44 tengerparttal nem rendelkező ország van, köztük Magyarország is."},
  {q:"Hány méter magas az Angel-vízesés, a világ legmagasabb vízesése?",a:979,u:"m",e:"A venezuelai Angel-vízesés 979 m magas, a legnagyobb megszakítatlan esése kb. 807 m."},
  {q:"Hány négyzetkilométer a Kaszpi-tenger felülete?",a:3.71e5,u:"km²",e:"A Kaszpi-tenger kb. 371 ezer km², a világ legnagyobb tava (közel négyszer akkora, mint Magyarország)."},
  {q:"Hány méterrel van a tengerszint alatt a Holt-tenger partja?",a:430,u:"m",e:"A part kb. 430 m-rel a tengerszint alatt van, a Föld legmélyebben fekvő szárazföldi területe; a vízszint évente kb. 1 m-t süllyed."},

  // Űr és fizika
  {q:"Hány kilométer a Föld sugara?",a:6371,u:"km",e:"A Föld átlagos sugara 6371 km."},
  {q:"Hány kilogramm a Föld tömege?",a:5.97e24,u:"kg",e:"A Föld tömege kb. 5,97 × 10²⁴ kg."},
  {q:"Hány kilométer a Jupiter egyenlítői átmérője?",a:142984,u:"km",e:"A Jupiter átmérője kb. 143 ezer km, vagyis kb. 11 Földet lehetne sorba rakni az Egyenlítője mentén."},
  {q:"Hány kilométerre van a Naprendszerhez legközelebbi csillag, a Proxima Centauri?",a:4.0e13,u:"km",e:"Kb. 4,24 fényév, ez kb. 40 ezer milliárd km."},
  {q:"Hány fényév a Tejútrendszer átmérője?",a:1e5,u:"fényév",e:"A Tejútrendszer korongja kb. 100 ezer fényév átmérőjű."},
  {q:"Hány km/h sebességgel forog az Egyenlítő a Föld tengelye körül?",a:1670,u:"km/h",e:"40 075 km kerület ÷ 24 óra ≈ 1670 km/h."},
  {q:"Hány km/s sebességgel kering a Föld a Nap körül?",a:29.8,u:"km/s",e:"A Föld pályasebessége átlagosan kb. 29,8 km/s, ez több mint 107 ezer km/h."},
  {q:"Hány földi évig tart a Neptunusz egy keringése a Nap körül?",a:165,u:"év",e:"A Neptunusz kb. 165 év alatt kerüli meg a Napot."},
  {q:"Hány ember sétált eddig a Hold felszínén?",a:12,u:"fő",e:"Az Apollo-program 1969 és 1972 között 12 embert juttatott a Hold felszínére."},
  {q:"Hány kelvin a Nap felszínének hőmérséklete?",a:5772,u:"K",e:"A Nap felszíne kb. 5772 K, ez kb. 5500 °C."},

  // Történelem (2026-ból számolva)
  {q:"Hány éve pusztította el a Vezúv Pompejit (2026-ban számolva)?",a:1947,u:"év",e:"A kitörés i. sz. 79-ben volt, tehát kb. 1947 éve."},
  {q:"Hány éve koronázták királlyá Szent Istvánt (2026-ban számolva)?",a:1026,u:"év",e:"A koronázás 1000 karácsonyán vagy 1001 elején volt, tehát kb. 1025–1026 éve."},
  {q:"Hány éve nyomtatta Gutenberg a 42 soros Bibliát (2026-ban számolva)?",a:571,u:"év",e:"A Gutenberg-biblia kb. 1455-ben készült el, tehát kb. 571 éve."},
  {q:"Hány éve lépett az első ember a Holdra (2026-ban számolva)?",a:57,u:"év",e:"Neil Armstrong 1969. július 21-én lépett a Hold felszínére, tehát kb. 57 éve."},
  {q:"Hány éve ért véget a második világháború (2026-ban számolva)?",a:81,u:"év",e:"A háború 1945-ben ért véget, tehát kb. 81 éve."},
  {q:"Hány éve halt meg Tutanhamon fáraó (2026-ban számolva)?",a:3349,u:"év",e:"Tutanhamon i. e. 1323 körül halt meg, tehát kb. 3350 éve."},
  {q:"Hány éve haltak ki a Wrangel-szigeten élő utolsó gyapjas mamutok (2026-ban számolva)?",a:4000,u:"év",e:"Az utolsó ismert mamutok kb. 4000 éve haltak ki."},

  // Emberi test
  {q:"Hány foga van egy felnőtt embernek bölcsességfogakkal együtt?",a:32,u:"db",e:"A teljes felnőtt fogazat 32 fogból áll."},
  {q:"Hány vázizma van az emberi testnek?",a:640,u:"db",e:"Kb. 600–650 vázizmot szoktak számolni."},
  {q:"Hány liter a felnőtt ember teljes tüdőkapacitása?",a:6,u:"liter",e:"A teljes tüdőkapacitás kb. 5–6 liter, egy nyugodt légvétellel viszont csak kb. fél litert cserélünk."},
  {q:"Hányszor pislog egy ember naponta?",a:15000,u:"pislogás",e:"Percenként kb. 15–20 pislogás × kb. 16 ébren töltött óra ≈ 15–19 ezer."},
  {q:"Hány vörösvérsejt van egyetlen köbmilliméternyi vérben?",a:5e6,u:"db",e:"Kb. 4,5–6 millió, így egy vércseppben több százmillió van."},
  {q:"Hányszor ver a szív egy 80 évig élő ember élete során?",a:2.9e9,u:"ütés",e:"Napi kb. 100 ezer ütés × 365 × 80 ≈ 2,9 milliárd."},
  {q:"Hány baktériumsejt él egy felnőtt ember testében?",a:3.8e13,u:"db",e:"Kb. 38 billió, nagyjából annyi, mint amennyi saját sejtünk van."},
  {q:"Hány csontból áll egyetlen emberi kéz a csuklóval együtt?",a:27,u:"db",e:"8 kéztőcsont + 5 záprócsont + 14 ujjpercsont = 27."},
  {q:"Hány kilokalória egy átlagos felnőtt napi energiaigénye?",a:2200,u:"kcal",e:"Nőknek kb. 2000, férfiaknak kb. 2500 kcal a megszokott érték."},

  // Természet
  {q:"Hány kilogramm egy kifejlett hím afrikai elefánt?",a:6000,u:"kg",e:"A kifejlett bika kb. 5–6 tonna."},
  {q:"Hány kilométert repül egy sarki csér évente a vonulása során?",a:7e4,u:"km",e:"Grönlandtól az Antarktiszig és vissza kb. 70 ezer km-t tesz meg évente."},
  {q:"Hány gramm a méhkolibri tömege, a világ legkisebb madáráé?",a:2,u:"g",e:"A kubai méhkolibri kb. 2 grammos."},
  {q:"Hány méter hosszú egy kifejlett kék bálna?",a:27,u:"m",e:"Jellemzően 24–27 m, a legnagyobb példányok elérik a 30 métert."},
  {q:"Hány méter magas egy kifejlett hím zsiráf?",a:5,u:"m",e:"A hím zsiráf 4,5–5,5 m magas."},
  {q:"Hány liter tejet ad egy intenzív tartású tejelő tehén évente?",a:9000,u:"liter",e:"A modern tejelő fajták évente kb. 8–10 ezer litert adnak."},
  {q:"Hány köbkilométer jég van az Antarktiszon?",a:2.65e7,u:"km³",e:"Az antarktiszi jégtakaró kb. 26,5 millió km³, ez a Föld édesvízkészletének nagy része."},
  {q:"Hány négyzetkilométer az Amazonas-medence esőerdeje?",a:5.5e6,u:"km²",e:"Az esőerdő kb. 5,5–6 millió km², nagyjából 60-szor Magyarország területe."},
  {q:"Hány ppm a szén-dioxid koncentrációja a Föld légkörében 2026-ban?",a:428,u:"ppm",e:"Kb. 425–430 ppm, az iparosodás előtti kb. 280 ppm-hez képest."},
  {q:"Hány méter per másodperc a hang sebessége levegőben 20 °C-on?",a:343,u:"m/s",e:"A hang kb. 343 m/s-mal terjed, ez kb. 1235 km/h."},

  // Technológia és gazdaság
  {q:"Hány terawattórányi villamos energiát termel a világ évente?",a:3e4,u:"TWh",e:"Kb. 30 ezer TWh, ez Magyarország éves fogyasztásának kb. 700-szorosa."},
  {q:"Hány tonna szén-dioxidot bocsát ki a világ évente fosszilis tüzelőanyagok elégetéséből?",a:3.7e10,u:"tonna",e:"Kb. 37 milliárd tonna évente."},
  {q:"Hány hordó kőolajat termel a világ naponta?",a:1e8,u:"hordó",e:"Kb. 100 millió hordót, hordónként 159 liter."},
  {q:"Hány tonna búzát termelnek a világon évente?",a:7.9e8,u:"tonna",e:"Kb. 790 millió tonnát."},
  {q:"Hány tonna cementet gyártanak a világon évente?",a:4.1e9,u:"tonna",e:"Kb. 4,1 milliárd tonnát."},
  {q:"Hány új személyautót és könnyű haszongépjárművet adnak el a világon évente?",a:9e7,u:"db",e:"Kb. 90 millió járművet."},
  {q:"Hány okostelefont szállítanak ki a gyártók világszerte évente?",a:1.2e9,u:"db",e:"Kb. 1,2 milliárd készüléket."},
  {q:"Hány kilométer tenger alatti internetkábel fut az óceánok alatt?",a:1.4e6,u:"km",e:"Kb. 1,4 millió km, ez a Hold és a Föld közötti távolság kb. 3,6-szorosa."},
  {q:"Hány dollár a világ éves bruttó hazai terméke (GDP-je) folyó árfolyamon?",a:1.1e14,u:"USD",e:"Kb. 110 ezer milliárd (110 billió) dollár."},
  {q:"Hány bitcoin létezhet összesen, a protokoll szerinti maximum?",a:2.1e7,u:"db",e:"A Bitcoin-protokoll 21 millió darabban maximalizálja a készletet."},
  {q:"Hány órányi videót töltenek fel a YouTube-ra percenként?",a:500,u:"óra",e:"A YouTube közlése szerint kb. 500 óra videó kerül fel percenként."},
  {q:"Hány műanyag palackot vásárolnak meg a világon percenként?",a:1e6,u:"db",e:"Kb. 1 millió palackot percenként (kb. 17 ezret másodpercenként)."},
  {q:"Hány tonna kávét termelnek a világon évente?",a:1.05e7,u:"tonna",e:"Kb. 10–10,5 millió tonna."},
  {q:"Hány tonna cukrot termelnek a világon évente?",a:1.8e8,u:"tonna",e:"Kb. 180 millió tonna."},

  // Sport és kultúra
  {q:"Hány néző fér be a londoni Wembley Stadionba?",a:90000,u:"fő",e:"A Wembley befogadóképessége 90 ezer fő."},
  {q:"Hány gólt lőttek a 2022-es katari labdarúgó-világbajnokságon összesen?",a:172,u:"gól",e:"64 mérkőzésen 172 gólt lőttek, meccsenként átlagosan 2,69."},
  {q:"Hány billentyűje van egy szabványos zongorának?",a:88,u:"db",e:"52 fehér és 36 fekete billentyű, összesen 88."},
  {q:"Hány négyzetméter egy szabványos (FIBA) kosárlabdapálya?",a:420,u:"m²",e:"28 m × 15 m = 420 m²."},
  {q:"Hány négyzetméter egy teniszpálya páros mérkőzésen?",a:261,u:"m²",e:"23,77 m × 10,97 m ≈ 261 m²."},
  {q:"Hány gramm egy teniszlabda?",a:58,u:"g",e:"A szabályok szerint 56,0–59,4 g, tehát kb. 58 g."},

  // Építmények
  {q:"Hány méter magas a New York-i Szabadság-szobor a talapzattal együtt?",a:93,u:"m",e:"A talapzattal együtt kb. 93 m, maga a szobor kb. 46 m."},
  {q:"Hány méter magas az Empire State Building az antennával együtt?",a:443,u:"m",e:"Az antennával együtt 443 m, a tetőszint 381 m."},
  {q:"Hány méter magas a torontói CN Tower?",a:553,u:"m",e:"A CN Tower 553 m magas."},
  {q:"Hány méter hosszú a Golden Gate híd?",a:2737,u:"m",e:"A híd teljes hossza kb. 2737 m, a főnyílása 1280 m."},
  {q:"Hány kőtömbből épült a gízai Nagy Piramis?",a:2.3e6,u:"db",e:"Kb. 2,3 millió kőtömbből."},
  {q:"Hány méter magas volt eredetileg a gízai Nagy Piramis?",a:147,u:"m",e:"Eredetileg kb. 146,6 m magas volt, mára a csúcs elkopása miatt kb. 138 m."},
  {q:"Hány szobája van a londoni Buckingham-palotának?",a:775,u:"db",e:"A palotának 775 szobája van."},
  {q:"Hány kilométer hosszú a Szuezi-csatorna?",a:193,u:"km",e:"A Szuezi-csatorna kb. 193 km hosszú."},
  {q:"Hány kilométer hosszú a világ leghosszabb hídja, a kínai Danyang–Kunshan nagyhíd?",a:165,u:"km",e:"A vasúti viadukt kb. 164,8 km hosszú."},
  {q:"Hány méter magas a Hoover-gát?",a:221,u:"m",e:"A Hoover-gát 221 m magas."},
  {q:"Hány méter magas a tokiói Skytree?",a:634,u:"m",e:"A Tokyo Skytree 634 m magas."},

  // Hétköznapi becslések
  {q:"Hány liter vizet használ el egy magyar lakos a háztartásában naponta?",a:100,u:"liter",e:"Kb. 90–100 liter fejenként és naponta."},
  {q:"Hány liter vizet igényel egyetlen pamutpóló elkészítése?",a:2700,u:"liter",e:"A WWF becslése szerint kb. 2700 liter."},
  {q:"Hány lépést tesz meg egy ember az élete során?",a:2e8,u:"lépés",e:"Napi kb. 7000 lépés × 365 nap × 80 év ≈ 200 millió."},
  {q:"Hány kilométert gyalogol le egy ember az élete során?",a:1.5e5,u:"km",e:"Napi kb. 5 km × 29 200 nap ≈ 150 ezer km, ez a Föld kerületének kb. 3,7-szerese."},
  {q:"Hány kilogramm települési hulladékot termel egy EU-s lakos évente?",a:500,u:"kg",e:"Az Eurostat szerint kb. 500 kg fejenként (2022-ben 513 kg)."},
  {q:"Hány milliméter csapadék esik Magyarországon átlagosan egy év alatt?",a:600,u:"mm",e:"Az országos éves átlag kb. 550–650 mm."},
  {q:"Hány óra napsütés jut Budapestre évente?",a:2000,u:"óra",e:"Budapesten évente kb. 1900–2100 napsütéses óra van."},
  {q:"Hány liter víz fér egy átlagos fürdőkádba színültig töltve?",a:150,u:"liter",e:"Egy átlagos kád kb. 150–200 literes."},
  {q:"Hány utas fér egy Airbus A380-ba tipikus háromosztályos elrendezésben?",a:525,u:"fő",e:"Tipikusan 500–550 fő, az egyosztályos változatban elvileg több mint 800."},
  {q:"Hány liter üzemanyag fér egy Boeing 747-400 tartályaiba?",a:2.2e5,u:"liter",e:"A tartályok kapacitása kb. 216 840 liter."}
];

/* A megengedett eltérés (szorzó) szintenként szigorodik: TOL_START → TOL_END */
function tolFactor(level){
  const a = Math.log10(TOL_START), b = Math.log10(TOL_END);
  return Math.pow(10, a - (a - b) * (level - 1) / (MAX_LEVEL - 1));
}

function fmtDec(n, maxFrac){
  return n.toLocaleString('en-US', {maximumFractionDigits: maxFrac})
          .replace(/,/g, '\u00a0').replace('.', ',');
}
function fmtNum(n){
  const a = Math.abs(n);
  if(a >= 1e15 || a < 1e-3){
    let exp = Math.floor(Math.log10(a));
    let mant = Math.round(n / Math.pow(10, exp) * 100) / 100;
    if(Math.abs(mant) >= 10){ mant /= 10; exp++; }
    return fmtDec(mant, 2) + ' × 10<sup>' + exp + '</sup>';
  }
  return fmtDec(n, a >= 1000 ? 0 : a >= 100 ? 1 : a >= 10 ? 2 : 3);
}
function fmtFactor(r){
  if(r < 10) return fmtDec(r, 2);
  if(r < 100) return fmtDec(r, 1);
  if(r < 1e6) return fmtDec(r, 0);
  return fmtNum(r);
}
/* Az összesített eltérés kijelzése: a határ alatt sosem kerekítünk fel a határig (pl. 19,99 ≠ 20). */
function fmtAcc(v, reached){
  return fmtDec(reached ? v : Math.floor(v * 100) / 100, 2);
}
function wordsFor(n){
  const big = [[1e21,'trilliárd'],[1e18,'trillió'],[1e15,'billiárd'],[1e12,'billió'],[1e9,'milliárd'],[1e6,'millió']];
  for(const [u, name] of big){
    if(n >= u){ const v = n / u; return fmtDec(v, v >= 100 ? 0 : v >= 10 ? 1 : 2) + ' ' + name; }
  }
  if(n >= 1e4){ const v = n / 1e3; return fmtDec(v, v >= 100 ? 0 : v >= 10 ? 1 : 2) + ' ezer'; }
  return '';
}

function parseNumberPart(t){
  t = t.replace(/[\s']/g, '');
  if(!t || !/^[\d.,]+$/.test(t)) return NaN;
  const hasDot = t.includes('.'), hasComma = t.includes(',');
  if(hasDot && hasComma){
    if(t.lastIndexOf(',') > t.lastIndexOf('.')) t = t.replace(/\./g, '').replace(',', '.');
    else t = t.replace(/,/g, '');
  } else if(hasComma){
    const p = t.split(',');
    t = p.length > 2 ? p.join('') : p[0] + '.' + p[1];
  } else if(hasDot){
    const p = t.split('.');
    if(p.length > 2 || (p[1].length === 3 && p[0].length >= 1 && p[0].length <= 3 && p[0] !== '0')) t = p.join('');
  }
  return /^\d*\.?\d+$|^\d+\.?$/.test(t) ? parseFloat(t) : NaN;
}

function parseGuess(raw){
  const s = String(raw == null ? '' : raw).toLowerCase().replace(/[\u00a0\u202f]/g, ' ').trim();
  if(!s) return {empty: true};
  const MSG = 'Írj be egy pozitív számot, pl. 2 500 000, 2,5 millió.';
  const done = v => {
    if(!isFinite(v) || v <= 0) return {error: MSG};
    if(v > 1e30) return {error: 'Ez a szám túl nagy.'};
    if(v < 1e-9) return {error: 'Ez a szám túl kicsi.'};
    return {value: v};
  };
  let m;
  if((m = s.match(/^(?:([\d.,\s']+?)\s*[x×*]\s*)?10\s*\^\s*(-?\d+)$/))){
    const c = m[1] ? parseNumberPart(m[1]) : 1;
    return done(c * Math.pow(10, parseInt(m[2], 10)));
  }
  if((m = s.match(/^([\d.,\s']+?)\s*e\s*([+-]?\d+)$/))){
    return done(parseNumberPart(m[1]) * Math.pow(10, parseInt(m[2], 10)));
  }
  if((m = s.match(/^([\d.,\s']+?)\s*(ezer|k|millió|millio|mill|mió|mrd|milliárd|milliard|md|billió|billio)\.?$/))){
    const mult = {'ezer':1e3,'k':1e3,'millió':1e6,'millio':1e6,'mill':1e6,'mió':1e6,'mrd':1e9,'milliárd':1e9,'milliard':1e9,'md':1e9,'billió':1e12,'billio':1e12}[m[2]];
    return done(parseNumberPart(m[1]) * mult);
  }
  if(/^[\d.,\s']+$/.test(s)) return done(parseNumberPart(s));
  return {error: MSG};
}

function evaluate(guess, answer, level){
  const logErr = Math.abs(Math.log10(guess / answer));
  const logTol = Math.log10(tolFactor(level));
  return {logErr: logErr, logTol: logTol, ratio: Math.pow(10, logErr), pass: logErr <= logTol + 1e-9, over: guess > answer};
}

/* Összesített eltérés: a hibás tippek eltérései szorzódnak (a logaritmusaik összeadódnak).
   Ha az összeg eléri a határt, a számláló nullázódik. A "total" mindig az elért összeg (log10). */
function accumulate(accSum, ratio, limit){
  const total = accSum + ratio;
  const reached = total >= limit - 1e-9;
  return {accSum: reached ? 0 : total, total: total, reached: reached};
}

function shuffle(a, rnd){
  rnd = rnd || Math.random;
  const r = a.slice();
  for(let i = r.length - 1; i > 0; i--){
    const j = Math.floor(rnd() * (i + 1));
    const t = r[i]; r[i] = r[j]; r[j] = t;
  }
  return r;
}

/* Kérdéspakli: egy kérdés egy körben csak egyszer jön elő. Visszalépéskor a maradék újrakeveredik. */
function createDeck(total, rnd){
  const all = Array.from({length: total}, (_, i) => i);
  const seen = new Set();
  let pile = shuffle(all, rnd), last = -1, recycled = 0;
  return {
    draw(){
      if(pile.length === 0){
        recycled++; seen.clear();
        pile = shuffle(all.filter(i => i !== last), rnd);
      }
      const i = pile.pop(); seen.add(i); last = i;
      return i;
    },
    reshuffle(){ pile = shuffle(pile, rnd); },
    resetAll(){
      seen.clear();
      pile = shuffle(all.filter(i => i !== last), rnd);
      if(last >= 0) pile.unshift(last); /* az utoljára látott kérdés kerül a pakli aljára */
    },
    get seenCount(){ return seen.size; },
    get recycled(){ return recycled; }

  };
}
/* PURE:END */

/* ---------- DOM ---------- */
const $ = (s, r) => (r || document).querySelector(s);
const screens = {start: $('#screen-start'), game: $('#screen-game'), win: $('#screen-win')};
const el = {
  hud: $('#hud'), lvl: $('#hud-level'), back: $('#hud-back'), restart: $('#btn-restart'), home: $('#btn-home'),
  ladder: $('#ladder'), tbSeen: $('#tb-seen'), tbTol: $('#tb-tol'),
  accbar: $('#accbar'), accVal: $('#acc-val'), accFill: $('#acc-fill'), accTrack: $('#acc-track'), accNote: $('#acc-note'),
  q: $('#q-text'), ask: $('#ask'), form: $('#guess-form'), input: $('#guess'), unit: $('#q-unit'),
  preview: $('#preview'), range: $('#range-note'), chips: $('#chips'), result: $('#result'), toast: $('#toast')
};
const modeInputs = document.querySelectorAll('input[name="mode"]');
const REDUCE = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const HINT = 'Pl. 2 500 000, 2,5 millió';

function makeStore(key){
  return {
    get(){ try{ return JSON.parse(localStorage.getItem(key)) || {}; }catch(e){ return {}; } },
    set(v){ try{ localStorage.setItem(key, JSON.stringify(v)); }catch(e){} }
  };
}
/* Játékmódonként külön rekord. A klasszikus mód a régi kulcsot használja, így a meglévő mentés megmarad. */
const MODES = {
  classic: {name: 'Klasszikus', store: makeStore('fermigg.v1')},
  acc: {name: 'Összesített eltérés', store: makeStore('fermigg.v1.acc')}
};
const MODE_KEY = 'fermigg.mode';

let g = null;
let toastTimer = null;

function selectedMode(){
  for(const i of modeInputs) if(i.checked) return i.value;
  return 'classic';
}

function show(name){
  Object.keys(screens).forEach(k => { screens[k].hidden = (k !== name); });
  el.hud.hidden = (name !== 'game');
  window.scrollTo(0, 0);
}
function toast(msg){
  el.toast.textContent = msg; el.toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.toast.hidden = true; }, 4200);
}

function newGame(mode){
  g = {mode: mode, level: 1, setbacks: 0, tips: 0, logSum: 0, accSum: 0, deck: createDeck(QUESTIONS.length),
       q: null, phase: 'ask', won: false};
}

function stepBack(){
  g.level = Math.max(1, g.level - SETBACK);
  g.setbacks++;
  if(g.setbacks % 8 === 0){
    g.deck.resetAll();
    toast('Nyolcadik visszalépés: újra mind a ' + QUESTIONS.length + ' kérdés elérhető.');
  } else {
    g.deck.reshuffle();
  }
}

function buildLadder(){
  let html = '';
  for(let i = 1; i <= MAX_LEVEL; i++){
    html += '<li class="rung' + (i % 5 === 0 ? ' five' : '') + '" data-l="' + i + '"><b>' + i + '</b><i></i></li>';
  }
  el.ladder.innerHTML = html;
}
function updateLadder(prev){
  const rungs = el.ladder.children;
  for(let i = 0; i < rungs.length; i++){
    const n = i + 1, r = rungs[i];
    r.classList.toggle('done', g.won ? true : n < g.level);
    r.classList.toggle('cur', !g.won && n === g.level);
    if(!g.won && n === g.level) r.setAttribute('aria-current', 'step'); else r.removeAttribute('aria-current');
    const falling = prev != null && prev > g.level && n >= g.level && n < prev;
    r.lastElementChild.style.transitionDelay = falling ? ((prev - 1 - n) * 70) + 'ms' : '0ms';
  }
}
function updateHUD(){
  el.lvl.textContent = g.won ? MAX_LEVEL : g.level;
  el.back.textContent = g.setbacks;
}

/* Összesített eltérés mérő: a sáv logaritmikus, mert az eltérések is szorzódnak. */
function updateAcc(){
  const on = g.mode === 'acc';
  el.accbar.hidden = !on;
  if(!on) return;
  const v = g.accSum;
  const pct = Math.max(0, Math.min(100, v / ACC_LIMIT * 100));
  const txt = '×' + fmtAcc(v, false) + ' / ×' + ACC_LIMIT;
  el.accVal.textContent = txt;
  el.accFill.style.width = pct.toFixed(1) + '%';
  el.accTrack.setAttribute('aria-valuenow', String(Math.round(pct)));
  el.accTrack.setAttribute('aria-valuetext', txt);
  el.accbar.classList.toggle('warn', pct >= 66);
}

function nextQuestion(){
  const before = g.deck.recycled;
  const idx = g.deck.draw();
  if(g.deck.recycled > before) toast('Elfogytak az új kérdések, ezért újrakeverjük a paklit.');
  g.q = QUESTIONS[idx];
  g.phase = 'ask';
  const tol = tolFactor(g.level);
  el.tbSeen.textContent = g.deck.seenCount + ' / ' + QUESTIONS.length;
  el.tbTol.innerHTML = '×' + fmtFactor(tol);
  el.range.innerHTML = 'Elfogadott tipp: a valós érték ÷' + fmtFactor(tol) + ' és ×' + fmtFactor(tol) + ' közötti tartományban.';
  el.q.textContent = g.q.q;
  el.unit.textContent = g.q.u;
  el.input.value = '';
  el.input.removeAttribute('aria-invalid');
  el.preview.textContent = HINT;
  el.result.hidden = true; el.result.innerHTML = '';
  el.ask.hidden = false;
  updateHUD();
  updateAcc();
  window.scrollTo({top: 0, behavior: 'auto'});
  setTimeout(() => { try{ el.input.focus({preventScroll: true}); }catch(e){ el.input.focus(); } }, 30);
}

function updatePreview(){
  const p = parseGuess(el.input.value);
  if(p.empty){ el.preview.textContent = HINT; el.input.removeAttribute('aria-invalid'); return; }
  if(p.error){ el.preview.innerHTML = '<span class="err">' + p.error + '</span>'; el.input.setAttribute('aria-invalid', 'true'); return; }
  el.input.removeAttribute('aria-invalid');
  const w = wordsFor(p.value);
  el.preview.innerHTML = '= <b>' + fmtNum(p.value) + '</b> ' + g.q.u + (w ? ' (≈ ' + w + ')' : '');
}

function plotHTML(guess, answer, logTol, pass){
  const c = Math.log10(answer), lg = Math.log10(guess);
  let W = Math.max(1.3, logTol * 1.5, Math.abs(lg - c) + 0.45);
  W = Math.min(W, 8);
  const lo = c - W, hi = c + W, span = hi - lo;
  const pos = l => (l - lo) / span * 100;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const d0 = Math.floor(lo), d1 = Math.ceil(hi), decades = d1 - d0 + 1;
  const step = Math.max(1, Math.ceil(decades / 6));
  let grid = '';
  for(let d = d0; d <= d1; d++){
    for(let k = 1; k <= 9; k++){
      const l = d + Math.log10(k);
      if(l < lo || l > hi) continue;
      const left = pos(l).toFixed(3) + '%';
      if(k === 1){
        grid += '<span class="gl major" style="left:' + left + '"></span>';
        if((d - d0) % step === 0) grid += '<span class="gl-label" style="left:' + left + '">' + fmtNum(Math.pow(10, d)) + '</span>';
      } else if(decades <= 5){
        grid += '<span class="gl" style="left:' + left + '"></span>';
      }
    }
  }
  const bl = clamp(pos(c - logTol), 0, 100), br = clamp(pos(c + logTol), 0, 100);
  const gp = clamp(pos(lg), 3, 97);
  const sideG = gp > 70 ? 'l' : 'r';
  return '<div class="plot" role="img" aria-label="Logaritmikus skála: a tipped és a valós érték helyzete">' + grid +
    '<span class="axis"></span>' +
    '<span class="band" style="left:' + bl.toFixed(3) + '%;width:' + (br - bl).toFixed(3) + '%"></span>' +
    '<div class="pt ans" style="left:50%"><i></i><em class="lbl r">valódi</em></div>' +
    '<div class="pt gus" style="left:' + gp.toFixed(3) + '%"><i></i><em class="lbl ' + sideG + '">tipped</em></div>' +
    '</div>' +
    '<ul class="legend"><li><i class="sw band"></i>elfogadott sáv</li><li><i class="sw gus"></i>a tipped</li><li><i class="sw ans"></i>valódi érték</li></ul>';
}

/* r.outcome: 'pass' (jó tipp) | 'miss' (hibás, de nincs visszalépés: csak az összesített módban) | 'back' (visszalépés) */
function resultHTML(r){
  const ev = r.ev, q = g.q, u = q.u, accMode = g.mode === 'acc';
  const tol = tolFactor(r.from);
  const accLimitTxt = '×' + ACC_LIMIT;
  const accNow = r.accTotal ? '×' + fmtAcc(r.accTotal, r.outcome === 'back') : '';
  let title, sub, cls, mark;
  if(r.outcome === 'pass'){
    cls = 'pass'; mark = '✓';
    title = ev.ratio <= 1.25 ? 'Telitalálat!' : 'Jó becslés';
    sub = g.won ? 'Átjutottál a 25. szinten.' : 'Továbbjutsz a ' + r.to + '. szintre.';
  } else {
    title = ev.over ? 'Túl sokat tippeltél' : 'Túl keveset tippeltél';
    if(r.outcome === 'miss'){
      cls = 'warn'; mark = '!';
      sub = 'Nem léptél vissza, a ' + r.from + '. szinten maradsz. Az összesített eltérés: ' + accNow + ' (határ: ' + accLimitTxt + ').';
    } else {
      cls = 'fail'; mark = '✕';
      const move = r.from === r.to
        ? 'Az 1. szinten maradsz.'
        : 'Visszalépsz ' + SETBACK + ' szintet: ' + r.from + '. szint → ' + r.to + '. szint.';
      sub = (accMode
          ? 'Az összesített eltérés elérte a ' + accNow + '-et (határ: ' + accLimitTxt + '). ' + move + ''
          : move)
    }
  }
  const dir = ev.over ? 'túl sok' : 'túl kevés';
       const exact = ev.ratio < 1e6 ? fmtAcc(ev.ratio, false) : fmtFactor(ev.ratio);
  const diff = ev.logErr < 1e-9 ? 'pontosan eltaláltad'
             : accMode ? '×' + exact + ' eltérés, ' + dir
             : fmtFactor(ev.ratio) + '-szeres eltérés, ' + dir;
  const wa = wordsFor(q.a), wg = wordsFor(r.guess);
  const btn = g.won ? 'Eredmény megtekintése' : 'Következő kérdés';
  let accSmall = '';
  if(accMode){
    accSmall = r.outcome === 'back'
      ? '<small>összesítés: nullázva</small>'
      : '<small>összesen: ' + accNow + ' / ' + accLimitTxt + '</small>';
  }
  return '<div class="verdict ' + cls + '"><span class="mark" aria-hidden="true">' + mark + '</span>' +
    '<div><h3>' + title + '</h3><p>' + sub + '</p></div></div>' +
    plotHTML(r.guess, q.a, ev.logTol, ev.pass) +
    '<div class="readout">' +
      '<div><span>A tipped</span><b>' + fmtNum(r.guess) + ' ' + u + '</b>' + (wg ? '<small>≈ ' + wg + '</small>' : '') + '</div>' +
      '<div><span>Valódi érték (kb.)</span><b>' + fmtNum(q.a) + ' ' + u + '</b>' + (wa ? '<small>≈ ' + wa + '</small>' : '') + '</div>' +
      '<div><span>Eltérés</span><b>' + diff + '</b><small>megengedett: ×' + fmtFactor(tol) + '</small>' + accSmall + '</div>' +
    '</div>' +
    '<p class="why">' + q.e + '</p>' +
    '<div class="actions"><button class="btn primary" id="btn-next" type="button">' + btn + '</button></div>';
}

function submitGuess(e){
  e.preventDefault();
  if(!g || g.phase !== 'ask') return;
  const p = parseGuess(el.input.value);
  if(p.empty || p.error){
    el.preview.innerHTML = '<span class="err">' + (p.error || 'Írj be egy számot a tipphez.') + '</span>';
    el.input.setAttribute('aria-invalid', 'true');
    el.input.focus();
    return;
  }
  g.phase = 'result';
  const from = g.level;
  const ev = evaluate(p.value, g.q.a, from);
  g.tips++; g.logSum += ev.logErr;

  let outcome;
  let accTotal = g.accSum;
  let reached = false;
  if(g.mode === 'acc'){
    const a = accumulate(g.accSum, ev.logErr < 1e-9 ? 0 : ev.ratio, ACC_LIMIT);
    g.accSum = a.accSum;
    accTotal = a.total;
    reached = a.reached;
  }
  if(reached){
    stepBack(); outcome = 'back';
  } else if(ev.pass){
    outcome = 'pass';
    if(from === MAX_LEVEL) g.won = true; else g.level++;
    const st = MODES[g.mode].store, b = st.get();
    b.maxLevel = Math.max(b.maxLevel || 1, g.won ? MAX_LEVEL : g.level);
    st.set(b);
  } else if(g.mode === 'acc'){
    outcome = 'miss';
  } else {
    stepBack();
    outcome = 'back';
  }

  updateHUD();
  updateAcc();
  updateLadder(from);
  el.ask.hidden = true;
  el.result.innerHTML = resultHTML({ev: ev, guess: p.value, from: from, to: g.level, outcome: outcome, accTotal: g.mode === 'acc' ? accTotal : 0});
  el.result.hidden = false;
  const nb = $('#btn-next');
  if(nb) nb.focus({preventScroll: true});
  el.result.scrollIntoView({block: 'nearest', behavior: REDUCE ? 'auto' : 'smooth'});
}

function showWin(){
  const avg = Math.pow(10, g.logSum / Math.max(1, g.tips));
  const rank = avg <= 2 ? 'Fermi-mester' : avg <= 3 ? 'Nagyságrend-vadász' : avg <= 4.5 ? 'Gyakorló becslő' : 'Kezdő kalibrátor';
  $('#win-rank').textContent = rank;
  $('#win-tips').textContent = g.tips;
  $('#win-back').textContent = g.setbacks;
  $('#win-avg').textContent = '×' + fmtDec(avg, 2);
  const st = MODES[g.mode].store, b = st.get();
  let note = '';
  if(b.bestTips && g.tips < b.bestTips) note = 'Új rekord: ez volt eddig a legkevesebb tipped a győzelemhez.';
  if(!b.bestTips || g.tips < b.bestTips) b.bestTips = g.tips;
  b.maxLevel = MAX_LEVEL; b.wins = (b.wins || 0) + 1;
  st.set(b);
  $('#win-note').textContent = note;
  g.shareText = 'fermi.gg (' + MODES[g.mode].name + '): ' + MAX_LEVEL + '/' + MAX_LEVEL + ' szint, ' + g.tips +
    ' tipp, ' + g.setbacks + ' visszalépés, átlagos eltérés ×' + fmtDec(avg, 2) + ' (' + rank + ')';
  show('win');
  $('#win-title').focus();
}

function startGame(mode){
  newGame(mode || selectedMode());
  show('game');
  updateLadder(null);
  nextQuestion();
}

function renderStart(){
  const mode = selectedMode();
  $('#mode-desc-classic').textContent = 'Minden hibás tipp ' + SETBACK + ' szintet visszadob.';
  $('#mode-desc-acc').textContent = 'A hibás tippek eltérése halmozódik, csak ' + ACC_LIMIT + '-szoros összeg esetén lépsz vissza.';
  el.accNote.textContent = 'A hibás tippek eltérései összeadódnak. ×' + ACC_LIMIT + '-nál ' + SETBACK +
    ' szintet lépsz vissza.';

  $('#rule-pass').textContent = 'A tipped akkor jó, ha a valós érték tizede és tízszerese közé esik. Ez szintenként szűkül: a ' +
    MAX_LEVEL + '. szinten már csak a ' + TOL_END + '-ed része és ' + TOL_END + '-szerese között.';
  $('#rule-fail').textContent = mode === 'acc'
    ? 'Ha kívül esel a folyamatosan szűkülő hibahatáron, a szinted nem változik, de a tipped eltérése hozzáadódik az összesített eltéréshez. Ha ez eléri a ×' +
      ACC_LIMIT + '-at, ' + SETBACK + ' szintet lépsz vissza. A jó tipp nem növeli az összesítést.'
    : 'Ha kívül esel a folyamatosan szűkülő hibahatáron, ' + SETBACK + ' szintet lépsz vissza.';

  const b = MODES[mode].store.get();
  const line = $('#best-line');
  if(b.maxLevel){
    line.hidden = false;
    line.textContent = 'Legmagasabb szinted: ' + b.maxLevel + (b.bestTips ? ' · legkevesebb tipp a győzelemhez: ' + b.bestTips : '');
  } else { line.hidden = true; }
}

/* Kétlépéses megerősítés: az első kattintás „élesít”, a második végrehajt (3 mp-ig). */
function armButton(btn, armLabel, action){
  const label = btn.textContent;
  let timer = null;
  btn.addEventListener('click', () => {
    if(btn.dataset.arm){
      clearTimeout(timer); delete btn.dataset.arm; btn.textContent = label;
      action();
    } else {
      btn.dataset.arm = '1'; btn.textContent = armLabel;
      timer = setTimeout(() => { delete btn.dataset.arm; btn.textContent = label; }, 3000);
    }
  });
}

function goHome(){
  renderStart();
  show('start');
}

/* ---------- események ---------- */
el.form.addEventListener('submit', submitGuess);
el.input.addEventListener('input', updatePreview);
el.chips.addEventListener('click', e => {
  const btn = e.target.closest('button[data-w]');
  if(!btn) return;
  const base = el.input.value.replace(/\s*[a-záéíóöőúüű]+\.?\s*$/i, '').trim();
  if(base) el.input.value = base + ' ' + btn.dataset.w;
  el.input.focus();
  updatePreview();
});
el.result.addEventListener('click', e => {
  if(!e.target.closest('#btn-next')) return;
  if(g.won) showWin(); else nextQuestion();
});
modeInputs.forEach(i => i.addEventListener('change', () => {
  try{ localStorage.setItem(MODE_KEY, selectedMode()); }catch(e){}
  renderStart();
}));
$('#btn-start').addEventListener('click', () => startGame(selectedMode()));
$('#btn-again').addEventListener('click', () => { renderStart(); startGame(g.mode); });
$('#btn-menu').addEventListener('click', goHome);
armButton(el.restart, 'Biztos?', () => startGame(g.mode));
armButton(el.home, 'Biztos?', goHome);

const copyBtn = $('#btn-copy');
copyBtn.addEventListener('click', async () => {
  try{
    await navigator.clipboard.writeText(g.shareText || 'fermi.gg');
    copyBtn.textContent = 'Átmásolva';
  }catch(e){
    copyBtn.textContent = 'A másolás nem sikerült';
  }
  setTimeout(() => { copyBtn.textContent = 'Eredmény másolása'; }, 2200);
});

/* ---------- indulás ---------- */
try{
  const saved = localStorage.getItem(MODE_KEY);
  if(saved && MODES[saved]) modeInputs.forEach(i => { i.checked = (i.value === saved); });
}catch(e){}
buildLadder();
renderStart();
show('start');
})();
