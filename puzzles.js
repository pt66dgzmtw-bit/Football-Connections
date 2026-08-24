/* Back Four — puzzle bank
 *
 * Each puzzle has a visible THEME and four GROUPS. Difficulty is a ladder,
 * mapped to a competition (index 0 = easiest connection, 3 = hardest):
 *   0 = League Cup        (green)
 *   1 = FA Cup            (red)
 *   2 = Premier League    (purple)
 *   3 = Champions League  (blue)  ← usually the "trap" group
 *
 * The difficulty comes from OVERLAP TRAPS: some tiles could truthfully be
 * argued into a second group, but only one full 4x4 assignment works.
 * `traps` lists every EXTRA truthful membership beyond a tile's own group,
 * as [tileText, groupIndex]. tools/solve.py uses it to prove each puzzle has
 * exactly one valid solution. The game itself ignores `traps`.
 *
 * groups[] are listed in difficulty order, so a group's index === its tier.
 */
const PUZZLES = [
  {
    id: 1, name: "San Siro", theme: "San Siro",
    groups: [
      { tier: 0, name: "Inter's 2010 treble side", items: ["MILITO", "SNEIJDER", "ETO'O", "ZANETTI"] },
      { tier: 1, name: "Milan's 2007 CL winning side", items: ["KAKÁ", "GATTUSO", "NESTA", "MALDINI"] },
      { tier: 2, name: "Managed a Milan club", items: ["MOURINHO", "CAPELLO", "CONTE", "ANCELOTTI"] },
      { tier: 3, name: "Played for both Milan clubs", items: ["RONALDO", "IBRAHIMOVIĆ", "PIRLO", "SEEDORF"] }
    ],
    traps: [["PIRLO", 1], ["SEEDORF", 1]]
  },
  {
    id: 2, name: "The Manchester Derby", theme: "Manchester",
    groups: [
      { tier: 0, name: "City's 2023 treble side", items: ["HAALAND", "RODRI", "STONES", "GREALISH"] },
      { tier: 1, name: "United's 2008 CL winning side", items: ["VIDIĆ", "FERDINAND", "HARGREAVES", "CARRICK"] },
      { tier: 2, name: "Managed Manchester United", items: ["MOYES", "VAN GAAL", "TEN HAG", "RANGNICK"] },
      { tier: 3, name: "Played for both Manchester clubs", items: ["TÉVEZ", "ANDY COLE", "DENIS LAW", "SCHMEICHEL"] }
    ],
    traps: [["TÉVEZ", 1]]
  },
  {
    id: 3, name: "North London", theme: "North London",
    groups: [
      { tier: 0, name: "Arsenal's Invincibles", items: ["HENRY", "VIEIRA", "PIRÈS", "LJUNGBERG"] },
      { tier: 1, name: "Tottenham's modern stars", items: ["KANE", "SON", "MODRIĆ", "BALE"] },
      { tier: 2, name: "Managed Arsenal", items: ["WENGER", "EMERY", "ARTETA", "RIOCH"] },
      { tier: 3, name: "Played for Arsenal and Spurs", items: ["CAMPBELL", "ADEBAYOR", "GALLAS", "BENTLEY"] }
    ],
    traps: [["CAMPBELL", 0]]
  },
  {
    id: 4, name: "Merseyside", theme: "Merseyside",
    groups: [
      { tier: 0, name: "Everton academy products", items: ["ROONEY", "BARKLEY", "HIBBERT", "OSMAN"] },
      { tier: 1, name: "Liverpool's Istanbul 2005 side", items: ["GERRARD", "CARRAGHER", "ALONSO", "RIISE"] },
      { tier: 2, name: "Managed Liverpool", items: ["BENÍTEZ", "HOULLIER", "KLOPP", "DALGLISH"] },
      { tier: 3, name: "Played for both Merseyside clubs", items: ["BEARDSLEY", "BARMBY", "ABEL XAVIER", "ABLETT"] }
    ],
    traps: []
  },
  {
    id: 5, name: "El Clásico", theme: "El Clásico",
    groups: [
      { tier: 0, name: "La Masia graduates", items: ["MESSI", "XAVI", "INIESTA", "BUSQUETS"] },
      { tier: 1, name: "Real's Galáctico era", items: ["ZIDANE", "RAÚL", "BECKHAM", "ROBERTO CARLOS"] },
      { tier: 2, name: "Managed Barcelona", items: ["CRUYFF", "RIJKAARD", "GUARDIOLA", "SETIÉN"] },
      { tier: 3, name: "Played for Barça and Real", items: ["FIGO", "LUÍS ENRIQUE", "LAUDRUP", "SCHUSTER"] }
    ],
    traps: [["FIGO", 1], ["LUÍS ENRIQUE", 2]]
  },
  {
    id: 6, name: "Les Bleus", theme: "France",
    groups: [
      { tier: 0, name: "France's 2018 World Cup winners", items: ["MBAPPÉ", "POGBA", "KANTÉ", "VARANE"] },
      { tier: 1, name: "France's 1998 World Cup winners", items: ["THURAM", "DESAILLY", "PETIT", "KAREMBEU"] },
      { tier: 2, name: "French Ballon d'Or winners", items: ["PLATINI", "PAPIN", "ZIDANE", "BENZEMA"] },
      { tier: 3, name: "Managed France", items: ["JACQUET", "DOMENECH", "BLANC", "DESCHAMPS"] }
    ],
    traps: [["DESCHAMPS", 1], ["BLANC", 1], ["ZIDANE", 1]]
  },
  {
    id: 7, name: "Azzurri", theme: "Italy",
    groups: [
      { tier: 0, name: "Italy's 2006 World Cup winners", items: ["BUFFON", "TOTTI", "MATERAZZI", "PIRLO"] },
      { tier: 1, name: "Italy's 1982 World Cup winners", items: ["ZOFF", "GENTILE", "TARDELLI", "ROSSI"] },
      { tier: 2, name: "Managed Italy", items: ["LIPPI", "PRANDELLI", "MANCINI", "CONTE"] },
      { tier: 3, name: "Italian Ballon d'Or winners", items: ["SÍVORI", "RIVERA", "BAGGIO", "CANNAVARO"] }
    ],
    traps: [["CANNAVARO", 0], ["ROSSI", 3]]
  },
  {
    id: 8, name: "Die Mannschaft", theme: "Germany",
    groups: [
      { tier: 0, name: "Germany's 2014 World Cup winners", items: ["NEUER", "MÜLLER", "KROOS", "ÖZIL"] },
      { tier: 1, name: "Germany's 1990 World Cup winners", items: ["BREHME", "KLINSMANN", "VÖLLER", "LITTBARSKI"] },
      { tier: 2, name: "Managed Germany", items: ["VOGTS", "LÖW", "FLICK", "NAGELSMANN"] },
      { tier: 3, name: "German Ballon d'Or winners", items: ["BECKENBAUER", "RUMMENIGGE", "SAMMER", "MATTHÄUS"] }
    ],
    traps: [["KLINSMANN", 2], ["VÖLLER", 2], ["MATTHÄUS", 1]]
  },
  {
    id: 9, name: "La Albiceleste", theme: "Argentina",
    groups: [
      { tier: 0, name: "Argentina's 2022 World Cup winners", items: ["MESSI", "DI MARÍA", "E. MARTÍNEZ", "J. ÁLVAREZ"] },
      { tier: 1, name: "Argentina's 1986 World Cup winners", items: ["MARADONA", "BURRUCHAGA", "VALDANO", "RUGGERI"] },
      { tier: 2, name: "Managed Argentina", items: ["BILARDO", "PEKERMAN", "SABELLA", "SCALONI"] },
      { tier: 3, name: "Argentines who played for Barcelona", items: ["RIQUELME", "SAVIOLA", "MASCHERANO", "AGÜERO"] }
    ],
    traps: [["MESSI", 3], ["MARADONA", 3]]
  },
  {
    id: 10, name: "A Seleção", theme: "Brazil",
    groups: [
      { tier: 0, name: "Brazil's 2002 World Cup winners", items: ["RONALDO", "RIVALDO", "RONALDINHO", "CAFU"] },
      { tier: 1, name: "Brazil's 1994 World Cup winners", items: ["ROMÁRIO", "BEBETO", "TAFFAREL", "BRANCO"] },
      { tier: 2, name: "Managed Brazil", items: ["SCOLARI", "TITE", "ZAGALLO", "DUNGA"] },
      { tier: 3, name: "Brazilians who played for Barcelona", items: ["NEYMAR", "DANI ALVES", "COUTINHO", "PAULINHO"] }
    ],
    traps: [["RONALDO", 3], ["RIVALDO", 3], ["RONALDINHO", 3], ["ROMÁRIO", 3], ["CAFU", 1], ["DUNGA", 1]]
  },
  {
    id: 11, name: "The Treble", theme: "Treble winners",
    groups: [
      { tier: 0, name: "Man Utd's 1999 treble side", items: ["SCHMEICHEL", "KEANE", "YORKE", "SHERINGHAM"] },
      { tier: 1, name: "Bayern's 2013 treble side", items: ["RIBÉRY", "ROBBEN", "MÜLLER", "NEUER"] },
      { tier: 2, name: "Inter's 2010 treble side", items: ["MILITO", "SNEIJDER", "ZANETTI", "MAICON"] },
      { tier: 3, name: "Barcelona's 2009 treble side", items: ["PUYOL", "INIESTA", "ETO'O", "HENRY"] }
    ],
    traps: [["ETO'O", 2]]
  },
  {
    id: 12, name: "Premier League Pioneers", theme: "PL title winners",
    groups: [
      { tier: 0, name: "Man Utd's 1993 title side", items: ["CANTONA", "HUGHES", "INCE", "GIGGS"] },
      { tier: 1, name: "Blackburn's 1995 title side", items: ["SHEARER", "SUTTON", "LE SAUX", "HENDRY"] },
      { tier: 2, name: "Arsenal's Invincibles", items: ["BERGKAMP", "VIEIRA", "PIRÈS", "LJUNGBERG"] },
      { tier: 3, name: "Leicester's 2016 title side", items: ["VARDY", "MAHREZ", "DRINKWATER", "SCHMEICHEL"] }
    ],
    traps: []
  },
  {
    id: 13, name: "Der Klassiker", theme: "Bayern v Dortmund",
    groups: [
      { tier: 0, name: "Dortmund's 1997 CL winning side", items: ["RIEDLE", "MÖLLER", "SAMMER", "KOHLER"] },
      { tier: 1, name: "Bayern's 2013 CL winning side", items: ["ROBBEN", "RIBÉRY", "LAHM", "SCHWEINSTEIGER"] },
      { tier: 2, name: "Managed Bayern Munich", items: ["HEYNCKES", "GUARDIOLA", "ANCELOTTI", "NAGELSMANN"] },
      { tier: 3, name: "Played for Bayern and Dortmund", items: ["LEWANDOWSKI", "GÖTZE", "HUMMELS", "RODE"] }
    ],
    traps: []
  },
  {
    id: 14, name: "The Madrid Derby", theme: "Madrid",
    groups: [
      { tier: 0, name: "Atlético under Simeone", items: ["GRIEZMANN", "KOKE", "GODÍN", "OBLAK"] },
      { tier: 1, name: "Real's Champions League core", items: ["RAMOS", "MODRIĆ", "BENZEMA", "KROOS"] },
      { tier: 2, name: "Managed Real Madrid", items: ["ZIDANE", "MOURINHO", "ANCELOTTI", "DEL BOSQUE"] },
      { tier: 3, name: "Played for Real and Atlético", items: ["HUGO SÁNCHEZ", "MORATA", "COURTOIS", "THEO HERNÁNDEZ"] }
    ],
    traps: [["MORATA", 0], ["COURTOIS", 1]]
  },
  {
    id: 15, name: "Derby d'Italia", theme: "Juventus v Inter",
    groups: [
      { tier: 0, name: "Juventus' Calciopoli-era stars", items: ["DEL PIERO", "NEDVĚD", "BUFFON", "TREZEGUET"] },
      { tier: 1, name: "Inter's 2010 treble side", items: ["MILITO", "SNEIJDER", "ZANETTI", "CAMBIASSO"] },
      { tier: 2, name: "Managed Juventus", items: ["LIPPI", "CONTE", "ALLEGRI", "SARRI"] },
      { tier: 3, name: "Played for Juventus and Inter", items: ["VIEIRA", "IBRAHIMOVIĆ", "R. BAGGIO", "VIERI"] }
    ],
    traps: []
  },
  {
    id: 16, name: "Oranje", theme: "Netherlands",
    groups: [
      { tier: 0, name: "Total Football (1974)", items: ["CRUYFF", "NEESKENS", "KROL", "REP"] },
      { tier: 1, name: "Euro '88 winners", items: ["GULLIT", "VAN BASTEN", "RIJKAARD", "VAN BREUKELEN"] },
      { tier: 2, name: "Managed the Netherlands", items: ["HIDDINK", "VAN GAAL", "ADVOCAAT", "KOEMAN"] },
      { tier: 3, name: "Modern Oranje", items: ["VAN DIJK", "DE JONG", "DEPAY", "GAKPO"] }
    ],
    traps: [["KOEMAN", 1]]
  },
  {
    id: 17, name: "Three Lions", theme: "England",
    groups: [
      { tier: 0, name: "England's 1966 winners", items: ["MOORE", "HURST", "B. CHARLTON", "BANKS"] },
      { tier: 1, name: "The 'Golden Generation'", items: ["GERRARD", "LAMPARD", "BECKHAM", "ROONEY"] },
      { tier: 2, name: "Managed England", items: ["VENABLES", "SOUTHGATE", "HODGSON", "ERIKSSON"] },
      { tier: 3, name: "England's Euro 2020 side", items: ["KANE", "STERLING", "SAKA", "RICE"] }
    ],
    traps: []
  },
  {
    id: 18, name: "Kings of Europe", theme: "Champions League",
    groups: [
      { tier: 0, name: "Bayern's 2020 winning side", items: ["NEUER", "KIMMICH", "LEWANDOWSKI", "GNABRY"] },
      { tier: 1, name: "Liverpool's 2019 winning side", items: ["VAN DIJK", "SALAH", "FIRMINO", "ALISSON"] },
      { tier: 2, name: "Real's 2016–18 core", items: ["RAMOS", "MODRIĆ", "MARCELO", "BENZEMA"] },
      { tier: 3, name: "Played for Real and Liverpool", items: ["OWEN", "XABI ALONSO", "MCMANAMAN", "ARBELOA"] }
    ],
    traps: []
  },
  {
    id: 19, name: "As Quinas", theme: "Portugal",
    groups: [
      { tier: 0, name: "Portugal's Euro 2016 winners", items: ["RONALDO", "PEPE", "NANI", "QUARESMA"] },
      { tier: 1, name: "The 'Golden Generation'", items: ["FIGO", "RUI COSTA", "DECO", "PAULETA"] },
      { tier: 2, name: "Managed Portugal", items: ["SCOLARI", "QUEIROZ", "F. SANTOS", "R. MARTÍNEZ"] },
      { tier: 3, name: "Porto's 2004 CL winning side", items: ["R. CARVALHO", "DERLEI", "MANICHE", "COSTINHA"] }
    ],
    traps: [["DECO", 3]]
  },
  {
    id: 20, name: "AFCON Legends", theme: "African football",
    groups: [
      { tier: 0, name: "Nigeria's Super Eagles", items: ["OKOCHA", "KANU", "YEKINI", "FINIDI"] },
      { tier: 1, name: "Cameroon greats", items: ["ETO'O", "MILLA", "MBOMA", "R. SONG"] },
      { tier: 2, name: "Ivory Coast's golden generation", items: ["DROGBA", "KOLO TOURÉ", "YAYA TOURÉ", "GERVINHO"] },
      { tier: 3, name: "North African stars", items: ["SALAH", "MAHREZ", "ZIYECH", "HADJI"] }
    ],
    traps: []
  },
  {
    id: 21, name: "Number Nines", theme: "Great strikers",
    groups: [
      { tier: 0, name: "Arsenal strikers", items: ["HENRY", "WRIGHT", "BERGKAMP", "ADEBAYOR"] },
      { tier: 1, name: "Chelsea strikers", items: ["DROGBA", "HASSELBAINK", "ZOLA", "DIEGO COSTA"] },
      { tier: 2, name: "Newcastle strikers", items: ["SHEARER", "LES FERDINAND", "ANDY COLE", "OWEN"] },
      { tier: 3, name: "Liverpool strikers", items: ["FOWLER", "TORRES", "SUÁREZ", "RUSH"] }
    ],
    traps: [["OWEN", 3], ["TORRES", 1]]
  },
  {
    id: 22, name: "The London Derby", theme: "London clubs",
    groups: [
      { tier: 0, name: "Chelsea's 2012 CL winning side", items: ["LAMPARD", "TERRY", "DROGBA", "ČECH"] },
      { tier: 1, name: "Arsenal's Invincibles", items: ["HENRY", "VIEIRA", "BERGKAMP", "PIRÈS"] },
      { tier: 2, name: "Tottenham talismen", items: ["KANE", "BALE", "MODRIĆ", "LEDLEY KING"] },
      { tier: 3, name: "Played for two London rivals", items: ["ASHLEY COLE", "SOL CAMPBELL", "ADEBAYOR", "WILLIAN"] }
    ],
    traps: [["ASHLEY COLE", 1], ["SOL CAMPBELL", 1]]
  },
  {
    id: 23, name: "Calcio", theme: "Serie A giants",
    groups: [
      { tier: 0, name: "Roma legends", items: ["TOTTI", "DE ROSSI", "BATISTUTA", "CANDELA"] },
      { tier: 1, name: "Napoli legends", items: ["MARADONA", "CAVANI", "HAMŠÍK", "INSIGNE"] },
      { tier: 2, name: "Juventus legends", items: ["DEL PIERO", "BUFFON", "NEDVĚD", "VIALLI"] },
      { tier: 3, name: "Played for Juve and another giant", items: ["HIGUAÍN", "IBRAHIMOVIĆ", "ZAMBROTTA", "VIERI"] }
    ],
    traps: [["HIGUAÍN", 1], ["NEDVĚD", 3]]
  },
  {
    id: 24, name: "Show Me the Money", theme: "Big transfers",
    groups: [
      { tier: 0, name: "Real's Galácticos", items: ["ZIDANE", "RONALDO", "BECKHAM", "FIGO"] },
      { tier: 1, name: "British transfer records", items: ["SHEARER", "R. FERDINAND", "TORRES", "POGBA"] },
      { tier: 2, name: "PSG's Qatari-era stars", items: ["MESSI", "DI MARÍA", "VERRATTI", "MARQUINHOS"] },
      { tier: 3, name: "£100m+ transfer fees", items: ["NEYMAR", "MBAPPÉ", "GRIEZMANN", "JOÃO FÉLIX"] }
    ],
    traps: [["NEYMAR", 2], ["MBAPPÉ", 2]]
  },
  {
    id: 25, name: "Fortresses", theme: "Famous grounds",
    groups: [
      { tier: 0, name: "English grounds", items: ["ANFIELD", "OLD TRAFFORD", "EMIRATES", "ETIHAD"] },
      { tier: 1, name: "Spanish grounds", items: ["BERNABÉU", "CAMP NOU", "MESTALLA", "METROPOLITANO"] },
      { tier: 2, name: "Italian grounds", items: ["SAN SIRO", "OLIMPICO", "MARADONA", "ALLIANZ STADIUM"] },
      { tier: 3, name: "National stadiums", items: ["WEMBLEY", "HAMPDEN", "MARACANÃ", "AZTECA"] }
    ],
    traps: []
  },
  {
    id: 26, name: "Selhurst Park", theme: "Crystal Palace",
    groups: [
      { tier: 0, name: "Palace academy graduates", items: ["ZAHA", "WAN-BISSAKA", "CLYNE", "MOSES"] },
      { tier: 1, name: "Palace's 1990 FA Cup final side", items: ["IAN WRIGHT", "MARK BRIGHT", "GEOFF THOMAS", "MARTYN"] },
      { tier: 2, name: "Palace's 2016 FA Cup final side", items: ["HENNESSEY", "DANN", "BOLASIE", "PUNCHEON"] },
      { tier: 3, name: "Played for AND managed Palace", items: ["PARDEW", "FREEDMAN", "VENABLES", "LOMBARDO"] }
    ],
    traps: [["PARDEW", 1], ["ZAHA", 2]]
  },
  {
    id: 27, name: "Lionesses", theme: "Women's football",
    groups: [
      { tier: 0, name: "England's Euro 2022 winners", items: ["WILLIAMSON", "MEAD", "TOONE", "KELLY"] },
      { tier: 1, name: "USWNT greats", items: ["WAMBACH", "MIA HAMM", "LLOYD", "ALEX MORGAN"] },
      { tier: 2, name: "Managed England Women", items: ["HOPE POWELL", "SAMPSON", "NEVILLE", "WIEGMAN"] },
      { tier: 3, name: "Ballon d'Or Féminin winners", items: ["HEGERBERG", "PUTELLAS", "BONMATÍ", "RAPINOE"] }
    ],
    traps: [["RAPINOE", 1]]
  },
  {
    id: 28, name: "The North East", theme: "North East football",
    groups: [
      { tier: 0, name: "Newcastle number nines", items: ["SHEARER", "MILBURN", "LES FERDINAND", "MACDONALD"] },
      { tier: 1, name: "Sunderland favourites", items: ["KEVIN PHILLIPS", "NIALL QUINN", "ARCA", "DEFOE"] },
      { tier: 2, name: "Middlesbrough stars", items: ["JUNINHO", "RAVANELLI", "VIDUKA", "DOWNING"] },
      { tier: 3, name: "Played for two North East clubs", items: ["LEE CLARK", "CHOPRA", "WOODGATE", "BRAMBLE"] }
    ],
    traps: [["WOODGATE", 2], ["ARCA", 3]]
  },
  {
    id: 29, name: "The Armband", theme: "Captains",
    groups: [
      { tier: 0, name: "Premier League title-winning captains", items: ["TONY ADAMS", "ROY KEANE", "KOMPANY", "WES MORGAN"] },
      { tier: 1, name: "World Cup winning captains", items: ["CAFU", "CANNAVARO", "LAHM", "DESCHAMPS"] },
      { tier: 2, name: "Barcelona club captains", items: ["XAVI", "INIESTA", "BUSQUETS", "PUYOL"] },
      { tier: 3, name: "Lifted the Champions League as captain", items: ["GERRARD", "RAMOS", "MALDINI", "TERRY"] }
    ],
    traps: [["TERRY", 0], ["PUYOL", 3]]
  },
  {
    id: 30, name: "The Dugout", theme: "Great managers",
    groups: [
      { tier: 0, name: "Won the Premier League", items: ["FERGUSON", "RANIERI", "CONTE", "MANCINI"] },
      { tier: 1, name: "Won the Champions League", items: ["HEYNCKES", "DEL BOSQUE", "ZIDANE", "TUCHEL"] },
      { tier: 2, name: "Won the World Cup as manager", items: ["SCALONI", "LÖW", "JACQUET", "SCOLARI"] },
      { tier: 3, name: "Managed in England and Spain", items: ["MOURINHO", "PELLEGRINI", "BENÍTEZ", "EMERY"] }
    ],
    traps: [["MOURINHO", 0], ["BENÍTEZ", 1], ["DEL BOSQUE", 2]]
  },
  {
    id: 31, name: "The 2026/27 Map", theme: "Premier League 2026/27",
    groups: [
      { tier: 0, name: "London clubs", items: ["ARSENAL", "CHELSEA", "FULHAM", "BRENTFORD"] },
      { tier: 1, name: "North West clubs", items: ["LIVERPOOL", "EVERTON", "MAN CITY", "MAN UNITED"] },
      { tier: 2, name: "North East & Yorkshire", items: ["NEWCASTLE", "SUNDERLAND", "LEEDS", "HULL CITY"] },
      { tier: 3, name: "The Midlands & East", items: ["ASTON VILLA", "COVENTRY", "FOREST", "IPSWICH"] }
    ],
    traps: []
  },
  {
    id: 32, name: "Twenty Clubs", theme: "Premier League 2026/27",
    groups: [
      { tier: 0, name: "Promoted in the last two seasons", items: ["LEEDS", "SUNDERLAND", "COVENTRY", "IPSWICH"] },
      { tier: 1, name: "London clubs", items: ["SPURS", "PALACE", "FULHAM", "CHELSEA"] },
      { tier: 2, name: "Sponsor-named stadiums", items: ["BOURNEMOUTH", "BRIGHTON", "BRENTFORD", "ARSENAL"] },
      { tier: 3, name: "Won the European Cup", items: ["LIVERPOOL", "FOREST", "ASTON VILLA", "MAN UNITED"] }
    ],
    traps: [["ARSENAL", 1], ["BRENTFORD", 1], ["CHELSEA", 3], ["COVENTRY", 2]]
  }
];

if (typeof module !== "undefined") { module.exports = { PUZZLES }; }
