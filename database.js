const BASE_HOTELS = [
  {
    "hotel": "ORFEA",
    "ville": "ACHERES"
  },
  {
    "hotel": "APPART'CITY",
    "ville": "AGEN"
  },
  {
    "hotel": "ODALYS LES FLORIDAINES",
    "ville": "AIX EN PROVENCE"
  },
  {
    "hotel": "IBIS STYLES",
    "ville": "AIX LES BAINS"
  },
  {
    "hotel": "HOTEL DES DUCS",
    "ville": "ALENCON"
  },
  {
    "hotel": "ORFEA",
    "ville": "AMBERIEUX"
  },
  {
    "hotel": "IBIS BUDGET CENTRE GARE",
    "ville": "AMIENS"
  },
  {
    "hotel": "HÔTEL DE FRANCE GARE",
    "ville": "ANGERS"
  },
  {
    "hotel": "ORFEA",
    "ville": "ANGOULÊME"
  },
  {
    "hotel": "IBIS STYLES GARE",
    "ville": "ANNECY"
  },
  {
    "hotel": "APPART CITY CENTRE",
    "ville": "ANNEMASSE"
  },
  {
    "hotel": "SURE HÔTEL BY BEST WESTERN",
    "ville": "ARGENTAN"
  },
  {
    "hotel": "IBIS CENTRE GARE",
    "ville": "AULNOYE AYMERIES"
  },
  {
    "hotel": "HÔTEL LA THOMASSE",
    "ville": "AURILLAC"
  },
  {
    "hotel": "HÔTEL IBIS GARE",
    "ville": "AVIGNON"
  },
  {
    "hotel": "HÔTEL TERMINUS",
    "ville": "AX LES THERMES"
  },
  {
    "hotel": "HOTEL DE LA GARE",
    "ville": "BAR LE DUC"
  },
  {
    "hotel": "IBIS ROUGE CENTRE",
    "ville": "BAYONNE"
  },
  {
    "hotel": "ORFEA",
    "ville": "BELFORT"
  },
  {
    "hotel": "---",
    "ville": "BELLEGARDE"
  },
  {
    "hotel": "HÔTEL IBIS BUDJET GARE",
    "ville": "BESANCON"
  },
  {
    "hotel": "IMPERATOR",
    "ville": "BEZIERS"
  },
  {
    "hotel": "ORFEA",
    "ville": "BORDEAUX"
  },
  {
    "hotel": "HÔTEL TERMINUS",
    "ville": "BOURG EN BRESSE"
  },
  {
    "hotel": "ORFEA",
    "ville": "BREST"
  },
  {
    "hotel": "GRAND HÔTEL",
    "ville": "BRIVE"
  },
  {
    "hotel": "CAMPANILE GARE",
    "ville": "CAEN"
  },
  {
    "hotel": "HÔTEL METROPOL",
    "ville": "CALAIS"
  },
  {
    "hotel": "IBIS CENTRE",
    "ville": "CANNE LA BOCCA"
  },
  {
    "hotel": "HÔTEL DE PARIS",
    "ville": "CAPDENAC"
  },
  {
    "hotel": "ZENITUDE HÔTEL",
    "ville": "CARCASSONNE"
  },
  {
    "hotel": "ORFEA",
    "ville": "CERBERE"
  },
  {
    "hotel": "ORFEA",
    "ville": "CHALONS-EN-CHAMPAGNE"
  },
  {
    "hotel": "ORFEA",
    "ville": "CHAMBERY"
  },
  {
    "hotel": "B&B CENTRE CATHEDRALE",
    "ville": "CHARTRES"
  },
  {
    "hotel": "HOTEL TERMINUS REINE",
    "ville": "CHAUMONT"
  },
  {
    "hotel": "HÔTEL IBIS GARE",
    "ville": "CLERMONT FERRAND"
  },
  {
    "hotel": "IBIS STYLES CENTRE",
    "ville": "COLMAR"
  },
  {
    "hotel": "HÔTEL CONFLANS ASTER",
    "ville": "CONFLANS JARNY"
  },
  {
    "hotel": "IBIS",
    "ville": "CREIL"
  },
  {
    "hotel": "ORFEA",
    "ville": "CULMONT CHALINDREY"
  },
  {
    "hotel": "SOURCEO",
    "ville": "DAX"
  },
  {
    "hotel": "NOMAD",
    "ville": "DIJON"
  },
  {
    "hotel": "HÔTEL DE BRETAGNE",
    "ville": "DOL DE BRETAGNE"
  },
  {
    "hotel": "B&B CENTRE GARE",
    "ville": "DUNKERQUE"
  },
  {
    "hotel": "HOTEL KYRIAD CENTRE",
    "ville": "EPINAL"
  },
  {
    "hotel": "HÔTEL THE ORIGINAL ACCESS",
    "ville": "FOIX"
  },
  {
    "hotel": "HÔTEL DE LA PAIX",
    "ville": "FORGES LES EAUX"
  },
  {
    "hotel": "IBIS",
    "ville": "FOURMIES"
  },
  {
    "hotel": "HÔTEL GAPOTEL",
    "ville": "GAP"
  },
  {
    "hotel": "ORFEA",
    "ville": "HENDAYE"
  },
  {
    "hotel": "WINK HÔTEL",
    "ville": "JUVISY"
  },
  {
    "hotel": "CAMPANILE",
    "ville": "LA ROCHE SUR YON"
  },
  {
    "hotel": "B&B LA ROCHELLE CENTRE",
    "ville": "LA ROCHELLE"
  },
  {
    "hotel": "HOTEL IBIS",
    "ville": "LAON"
  },
  {
    "hotel": "ORFEA",
    "ville": "LAROCHE MIGENNNES"
  },
  {
    "hotel": "ORFEA",
    "ville": "LE BOURGET"
  },
  {
    "hotel": "IBIS ROUGE SARLAT",
    "ville": "LE BUISSON"
  },
  {
    "hotel": "HÔTEL NOMAD",
    "ville": "LE HAVRE"
  },
  {
    "hotel": "IBIS ROUGE GARE NORD",
    "ville": "LE MANS"
  },
  {
    "hotel": "GITE D'ICI ET LA",
    "ville": "LES LAUMES ALESIA"
  },
  {
    "hotel": "HÔTEL MERCURE",
    "ville": "LIBOURNE"
  },
  {
    "hotel": "APPART'CITY LA MADELEINE",
    "ville": "LILLE"
  },
  {
    "hotel": "HÔTEL ATRIUM",
    "ville": "LIMOGES"
  },
  {
    "hotel": "HÔTEL DE LORRAINE",
    "ville": "LONGUYON"
  },
  {
    "hotel": "ORFEA PERRACHE",
    "ville": "LYON"
  },
  {
    "hotel": "HÔTEL BRIT",
    "ville": "MACON"
  },
  {
    "hotel": "BEL'ALP",
    "ville": "MANOSQUE"
  },
  {
    "hotel": "BRIT HOTEL",
    "ville": "MARJEVOLS"
  },
  {
    "hotel": "ORFEA",
    "ville": "MARSEILLE"
  },
  {
    "hotel": "IBIS ROUGE",
    "ville": "MELUN"
  },
  {
    "hotel": "ORFEA",
    "ville": "METZ"
  },
  {
    "hotel": "ORFEA",
    "ville": "MIRAMAS"
  },
  {
    "hotel": "HÔTEL DU COMMERCE",
    "ville": "MODANE"
  },
  {
    "hotel": "IBIS ROUGE",
    "ville": "MONTAUBAN"
  },
  {
    "hotel": "KYRIAD",
    "ville": "MONTCHANIN"
  },
  {
    "hotel": "KYRIAD ENZO ECLUSE",
    "ville": "MONTEREAU"
  },
  {
    "hotel": "HÔTEL DE L'UNIVERS",
    "ville": "MONTLUÇON"
  },
  {
    "hotel": "HOTEL DES 2 FORTS",
    "ville": "MOUCHARD"
  },
  {
    "hotel": "IBIS STYLES CENTRE GARE",
    "ville": "MULHOUSE"
  },
  {
    "hotel": "APPART'CITY NANCY",
    "ville": "NANCY"
  },
  {
    "hotel": "ORFEA",
    "ville": "NANTES"
  },
  {
    "hotel": "HÔTEL DU MIDI",
    "ville": "NARBONNE"
  },
  {
    "hotel": "INTER HOTEL GARE",
    "ville": "NEVERS"
  },
  {
    "hotel": "IBIS GARE CENTRE",
    "ville": "NICE"
  },
  {
    "hotel": "HÔTEL ESATITUDE",
    "ville": "NICE ST ROCH"
  },
  {
    "hotel": "ORFEA NIMES",
    "ville": "NIMES"
  },
  {
    "hotel": "IBIS STYLES",
    "ville": "NIORT"
  },
  {
    "hotel": "IBIS CENTRE GARE",
    "ville": "ORLEANS"
  },
  {
    "hotel": "HÔTEL CAMPANILE",
    "ville": "PANTIN"
  },
  {
    "hotel": "ORFEA",
    "ville": "PARIS AUSTERLITZ"
  },
  {
    "hotel": "ORFEA",
    "ville": "PARIS MAGENTA"
  },
  {
    "hotel": "ORFEA",
    "ville": "PARIS MONTPARNASSE"
  },
  {
    "hotel": "ORFEA",
    "ville": "PAU"
  },
  {
    "hotel": "HÔTEL CONFORT REGINA",
    "ville": "PERIGUEUX"
  },
  {
    "hotel": "APPARTCITY GARE",
    "ville": "PERPIGNAN"
  },
  {
    "hotel": "ORFEA",
    "ville": "QUIMPER"
  },
  {
    "hotel": "QUEEN SERENITY HOTEL",
    "ville": "REDON"
  },
  {
    "hotel": "RESIDHOME REIMS CENTRE",
    "ville": "REIMS"
  },
  {
    "hotel": "ORFEA",
    "ville": "RENNES"
  },
  {
    "hotel": "ORFEA",
    "ville": "ROANNE"
  },
  {
    "hotel": "ORFEA",
    "ville": "SAINT ETIENNE"
  },
  {
    "hotel": "HÔTEL DE FRANCE",
    "ville": "SAINTES"
  },
  {
    "hotel": "HOTEL DES 2 FORTS",
    "ville": "SALINS LES BAINS"
  },
  {
    "hotel": "IBIS STYLES",
    "ville": "SAUMUR"
  },
  {
    "hotel": "RELAIS DES DEUX RIVIERES",
    "ville": "SOTTEVILLE"
  },
  {
    "hotel": "IBIS STYLES GARE",
    "ville": "ST BRIEUC"
  },
  {
    "hotel": "MERCURE GARE",
    "ville": "ST MALO"
  },
  {
    "hotel": "ORFEA",
    "ville": "STRASBOURG"
  },
  {
    "hotel": "HÔTEL L'EUROPEEN",
    "ville": "TARBES"
  },
  {
    "hotel": "HÔTEL DU PARC",
    "ville": "THIONVILLE"
  },
  {
    "hotel": "HOTEL TALENCIA",
    "ville": "THOUARS"
  },
  {
    "hotel": "HÔTEL AMIRAUTE",
    "ville": "TOULON"
  },
  {
    "hotel": "ORFEA",
    "ville": "TOULOUSE"
  },
  {
    "hotel": "GRAND HÔTEL",
    "ville": "TOURS"
  },
  {
    "hotel": "BRITHOTEL",
    "ville": "TROYES"
  },
  {
    "hotel": "LOGIS HÔTEL LES GRAVADES",
    "ville": "USSEL"
  },
  {
    "hotel": "ORFEA",
    "ville": "VALENCE"
  },
  {
    "hotel": "LE GRAND HOTEL",
    "ville": "VALENCIENNES"
  },
  {
    "hotel": "VERSOTEL",
    "ville": "VERSAILLES"
  },
  {
    "hotel": "IBIS",
    "ville": "VERSAILLES CHANTIERS"
  },
  {
    "hotel": "HÔTEL MODERNE",
    "ville": "VEYNES DEVOLUY"
  },
  {
    "hotel": "IBIS STYLES VICHY",
    "ville": "VICHY"
  },
  {
    "hotel": "HÔTEL IBIS GARE",
    "ville": "VIENNE"
  },
  {
    "hotel": "ORFEA",
    "ville": "VIERZON"
  },
  {
    "hotel": "IBIS POMPADOUR",
    "ville": "VILLENEUVE ST GEORGES"
  }
];
