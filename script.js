const APP_VERSION = "v121-test05";
alert("SCRIPT : " + APP_VERSION);
const APP_VERSION_DATE = "20/08/2026 14:05";

/* ==========================================================
   VERSION SCRIPT
   ========================================================== */

window.HOTEL_SCRIPT_BUILD = 001;
const $=id=>document.getElementById(id);

/* ==========================================================
   SECURITE BOUTON PARAMETRES
   ========================================================== */

const manageBtnSafe =
  document.getElementById("manageBtn");

const hotelSettingsMenuSafe =
  document.getElementById("hotelSettingsMenu");

if(
  manageBtnSafe &&
  hotelSettingsMenuSafe
){
  manageBtnSafe.addEventListener(
    "click",
    () => {
      hotelSettingsMenuSafe.hidden = false;
    }
  );
}

function afficherVersionChargeeHotel() {

  const texteVersion =
    `À JOUR ${String(APP_VERSION).toUpperCase()}`;

  const appVersion =
    document.getElementById("appVersion");

  if(appVersion){
    appVersion.textContent = texteVersion;
  }

  const hotelHomeVersion =
    document.getElementById("hotelHomeVersion");

  if(hotelHomeVersion){
    hotelHomeVersion.textContent = texteVersion;
  }
}

const LS_H="hotelCustom",LS_HDEL="hotelDeleted",LS_P="hotelProfil",LS_D="hotelDest";
const LS_A="hotelAppearance";
const LS_AGENTS="hotelAgentsLocal";
const load=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
let custom=load(LS_H), deleted=load(LS_HDEL), profil=load(LS_P,{}), dest=load(LS_D,{});
let appearance=load(LS_A,{});
function chargerAgentsHotelAvecRecuperation(){

  const clesPossibles = [
    LS_AGENTS,
    "hotelAgents",
    "hotel_agents",
    "agentsHotel",
    "agents_hotel",
    "agentsLocal",
    "agents_local",
    "agents"
  ];

  let noms = [];

  function ajouterValeurs(valeur){

    if(!valeur) return;

    let donnees = valeur;

    if(typeof valeur === "string"){

      try{
        donnees = JSON.parse(valeur);
      }catch{
        return;
      }
    }

    if(Array.isArray(donnees)){

      donnees.forEach(item=>{

        let nom = "";

        if(typeof item === "string"){
          nom = item;
        }
        else if(
          item &&
          typeof item === "object"
        ){
          nom =
            item.nom ||
            item.name ||
            "";
        }

        nom =
          String(nom || "")
            .trim()
            .replace(/\s+/g," ");

        if(
          nom &&
          !noms.some(
            x =>
              x.toLocaleUpperCase("fr-FR") ===
              nom.toLocaleUpperCase("fr-FR")
          )
        ){
          noms.push(nom);
        }
      });
    }
  }

  /*
    1. Clés connues des anciennes versions.
  */
  clesPossibles.forEach(cle=>{

    try{
      ajouterValeurs(
        localStorage.getItem(cle)
      );
    }catch{}
  });

  /*
    2. Secours :
       parcourir les autres clés locales et récupérer
       uniquement les tableaux ressemblant clairement
       à une liste d'agents.
  */
  try{

    for(
      let i=0;
      i<localStorage.length;
      i++
    ){

      const cle =
        localStorage.key(i) || "";

      if(
        !/agent/i.test(cle)
      ){
        continue;
      }

      ajouterValeurs(
        localStorage.getItem(cle)
      );
    }

  }catch{}

  noms.sort(
    (a,b)=>
      a.localeCompare(
        b,
        "fr"
      )
  );

  /*
    On consolide immédiatement dans la clé actuelle.
  */
  try{
    localStorage.setItem(
      LS_AGENTS,
      JSON.stringify(noms)
    );
  }catch{}

  return noms;
}

let hotelAgents =
  chargerAgentsHotelAvecRecuperation();

/* ==========================================================
   v68 - AGENTS LOCAUX
   ========================================================== */

function normaliserAgentHotel(nom){
  return String(nom || "")
    .trim()
    .replace(/\s+/g," ");
}

function nettoyerNomAgentImporteHotel(valeur){

  let nom =
    String(valeur || "")
      .replace(/^\uFEFF/,"")
      .trim();

  if(!nom) return "";

  /*
    Si CSV avec plusieurs colonnes :
    première colonne = nom.
  */
  if(nom.includes(";")){
    nom =
      nom.split(";")[0].trim();
  }else if(nom.includes(",")){
    nom =
      nom.split(",")[0].trim();
  }

  nom =
    nom.replace(/^["']|["']$/g,"").trim();

  /*
    Ignorer les en-têtes classiques.
  */
  const n = norm(nom);

  if(
    n === "NOM" ||
    n === "AGENT" ||
    n === "AGENTS" ||
    n === "NOM AGENT" ||
    n === "NOM DE L AGENT" ||
    n === "NOM DE L'AGENT"
  ){
    return "";
  }

  return normaliserAgentHotel(nom);
}

async function importerAgentsDepuisFichierHotel(fichier){

  const statut =
    document.getElementById(
      "importAgentsStatus"
    );

  if(!fichier){
    return;
  }

  try{

    const texte =
      await fichier.text();

    let noms = [];

    const estJson =
      fichier.name
        .toLowerCase()
        .endsWith(".json") ||
      String(fichier.type || "")
        .toLowerCase()
        .includes("json");

    if(estJson){

      const donnees =
        JSON.parse(texte);

      /*
        Formats acceptés :
        [
          {"nom":"POIRIER", ...},
          {"nom":"DUPONT", ...}
        ]

        ou :
        {
          "agents":[
            {"nom":"POIRIER", ...}
          ]
        }

        ou un objet agent unique.
        Seul le champ "nom" est importé.
        Matricule, téléphone, email, actif, etc.
        ne sont PAS enregistrés dans l'application Hôtel.
      */
      let agentsJson = [];

      if(Array.isArray(donnees)){
        agentsJson = donnees;
      }
      else if(
        donnees &&
        Array.isArray(donnees.agents)
      ){
        agentsJson = donnees.agents;
      }
      else if(
        donnees &&
        typeof donnees === "object"
      ){
        agentsJson = [donnees];
      }

      noms =
        agentsJson
          .map(agent=>{

            if(
              typeof agent === "string"
            ){
              return normaliserAgentHotel(
                agent
              );
            }

            if(
              agent &&
              typeof agent === "object"
            ){
              return normaliserAgentHotel(
                agent.nom
              );
            }

            return "";
          })
          .filter(Boolean);

    }else{

      noms =
        texte
          .split(/\r?\n/)
          .map(
            nettoyerNomAgentImporteHotel
          )
          .filter(Boolean);
    }

    if(!noms.length){
      throw new Error(
        "Aucun nom d’agent trouvé dans le fichier."
      );
    }

    let ajoutes = 0;
    let doublons = 0;

    noms.forEach(nom=>{

      const existe =
        hotelAgents.some(
          x=>norm(x)===norm(nom)
        );

      if(existe){
        doublons++;
        return;
      }

      /*
        IMPORTANT :
        on ne conserve QUE le nom.
      */
      hotelAgents.push(nom);
      ajoutes++;
    });

    hotelAgents.sort(
      (a,b)=>
        a.localeCompare(
          b,
          "fr"
        )
    );

    save(
      LS_AGENTS,
      hotelAgents
    );

    renderHotelAgentsAdmin();
    renderModificationAgents();
const listeProfil =
  document.getElementById("profilAgentsList");

if(listeProfil){
  listeProfil.hidden = true;
}
    if(statut){

      statut.className =
        "import-agents-status ok";

      statut.textContent =
        `${ajoutes} agent${ajoutes>1?"s":""} importé${ajoutes>1?"s":""}` +
        (doublons
          ? ` • ${doublons} doublon${doublons>1?"s":""} ignoré${doublons>1?"s":""}`
          : "");
    }

  }catch(err){

    if(statut){

      statut.className =
        "import-agents-status error";

      statut.textContent =
        "Impossible d’importer ce fichier JSON.";
    }

    console.log(
      "Import agents :",
      err
    );
  }
}

function renderHotelAgentsAdmin(afficherTout = false){

  const cont =
    document.getElementById(
      "agentsAdminList"
    );

  const input =
    document.getElementById(
      "agentNom"
    );

  if(!cont) return;

  const recherche =
    input
      ? normaliserAgentHotel(
          input.value
        ).toLocaleUpperCase("fr-FR")
      : "";

  /*
    Rien saisi :
    la liste reste totalement cachée.
  */
 if(!recherche && !afficherTout){

  cont.innerHTML = "";
  cont.hidden = true;
  return;
}

const resultats =
  hotelAgents
    .map((nom,index)=>({
      nom,
      index
    }))
    .filter(item =>
      afficherTout ||
      String(item.nom)
        .toLocaleUpperCase("fr-FR")
        .includes(recherche)
    );

  cont.hidden = false;

  if(!resultats.length){

    cont.innerHTML =
      '<div class="agent-search-empty">Aucun agent trouvé.</div>';

    return;
  }

  cont.innerHTML =
    resultats
      .map(item=>`
        <div class="agent-admin-row agent-search-row">
          <strong class="agent-search-name">${item.nom}</strong>

          <button
            type="button"
            class="agent-trash-btn"
            data-delete-agent="${item.index}"
            aria-label="Supprimer ${item.nom.replace(/"/g,"&quot;")}"
            title="Supprimer"
          >
            🗑️
          </button>
        </div>
      `)
      .join("");

  cont
    .querySelectorAll(
      "[data-delete-agent]"
    )
    .forEach(btn=>{

      btn.onclick=()=>{

        const i =
          Number(
            btn.dataset.deleteAgent
          );

        const nom =
          hotelAgents[i] || "";

        if(
          !confirm(
            "Supprimer " +
            nom +
            " ?"
          )
        ){
          return;
        }

        hotelAgents.splice(i,1);

        save(
          LS_AGENTS,
          hotelAgents
        );

        renderHotelAgentsAdmin(true);
        renderModificationAgents();
      };
    });
}

let selectedHotelAgents = [];
let draftHotelAgents = [];
let agentsPickerContext = "";

function texteCompteurAgentsHotel(n){
  return `${n} sélectionné${n>1?"s":""}`;
}

function actualiserCompteursAgentsHotel(){

  const normal =
    document.getElementById("normalAgentsCount");

  const mod =
    document.getElementById("modAgentsCount");

  const texte =
    texteCompteurAgentsHotel(
      selectedHotelAgents.length
    );

  if(normal){
    normal.textContent = texte;
  }

  if(mod){
    mod.textContent = texte;
  }
}

function renderModificationAgents(){
  actualiserCompteursAgentsHotel();
}

function agentsModificationSelectionnes(){
  return [...selectedHotelAgents];
}

function renderAgentsPickerHotel(){

  const list =
    document.getElementById("agentsPickerList");

  const search =
    document.getElementById("agentsPickerSearch");

  if(!list) return;

  const q =
    search
      ? normaliserAgentHotel(search.value)
          .toLocaleUpperCase("fr-FR")
      : "";

  const results =
    hotelAgents.filter(nom =>
      !q ||
      String(nom)
        .toLocaleUpperCase("fr-FR")
        .includes(q)
    );

  if(!results.length){
    list.innerHTML =
      '<div class="hotel-agents-picker-empty">Aucun agent trouvé.</div>';
    return;
  }

  list.innerHTML =
    results.map(nom=>{

      const checked =
        draftHotelAgents.includes(nom)
          ? "checked"
          : "";

      return `
        <label class="hotel-agents-picker-row">
          <input
            type="checkbox"
            class="hotel-agent-picker-check"
            value="${nom.replace(/"/g,"&quot;")}"
            ${checked}
          >
          <span>${nom}</span>
        </label>
      `;
    }).join("");

  list
    .querySelectorAll(".hotel-agent-picker-check")
    .forEach(check=>{

      check.addEventListener("change",()=>{

        const nom = check.value;

        if(check.checked){

          if(!draftHotelAgents.includes(nom)){
            draftHotelAgents.push(nom);
          }

        }else{

          draftHotelAgents =
            draftHotelAgents.filter(
              x=>x!==nom
            );
        }
      });
    });
}

function ouvrirSelectionAgentsHotel(contexte){

  agentsPickerContext = contexte || "";

  draftHotelAgents =
    [...selectedHotelAgents];

  const overlay =
    document.getElementById("hotelAgentsPicker");

  const search =
    document.getElementById("agentsPickerSearch");

  if(search){
    search.value = "";
  }

  renderAgentsPickerHotel();

  if(overlay){
    overlay.hidden = false;
  }
}

function fermerSelectionAgentsHotel(){

  const overlay =
    document.getElementById("hotelAgentsPicker");

  if(overlay){
    overlay.hidden = true;
  }

  draftHotelAgents = [];
  agentsPickerContext = "";
}

function validerSelectionAgentsHotel(){

  selectedHotelAgents =
    [...draftHotelAgents];

  actualiserCompteursAgentsHotel();
  fermerSelectionAgentsHotel();
}

/* ==========================================================
   DATES ARRIVEE / DEPART
   - le départ est automatiquement le lendemain de l'arrivée
   - le jour d'arrivée et les jours précédents sont interdits
     dans le calendrier de départ
   - l'utilisateur peut choisir n'importe quelle date ultérieure
   ========================================================== */

function lendemainISO(dateISO){

  if(!dateISO) return "";

  const parties = dateISO.split("-").map(Number);

  const d = new Date(
    parties[0],
    parties[1] - 1,
    parties[2]
  );

  d.setDate(d.getDate() + 1);

  const annee = d.getFullYear();
  const mois = String(d.getMonth() + 1).padStart(2,"0");
  const jour = String(d.getDate()).padStart(2,"0");

  return `${annee}-${mois}-${jour}`;
}

function reglerDepartDepuisArrivee(){

  const arrivee = $("arrivee").value;

  if(!arrivee){
    $("depart").min = "";
    return;
  }

  const premierDepart = lendemainISO(arrivee);

  // Dans le calendrier Départ, la première date possible
  // est le lendemain de l'arrivée.
  $("depart").min = premierDepart;

  // Chaque nouvelle date d'arrivée présélectionne
  // automatiquement le lendemain.
  $("depart").value = premierDepart;
}

$("arrivee").addEventListener(
  "change",
  reglerDepartDepuisArrivee
);

$("arrivee").addEventListener(
  "input",
  reglerDepartDepuisArrivee
);

$("depart").addEventListener("change",()=>{

  const arrivee = $("arrivee").value;

  if(!arrivee) return;

  const minimum = lendemainISO(arrivee);

  if(
    $("depart").value &&
    $("depart").value < minimum
  ){
    $("depart").value = minimum;
  }
});


/* ==========================================================
   DATE DEPART : BLOQUER ARRIVEE + DATES ANTERIEURES
   ========================================================== */

function actualiserMinimumDepart() {

  const arrivee = $("arrivee").value;

  if (!arrivee) {
    $("depart").min = "";
    return;
  }

  $("depart").min = lendemainISO(arrivee);
}

$("depart").addEventListener(
  "focus",
  actualiserMinimumDepart
);

$("depart").addEventListener(
  "click",
  actualiserMinimumDepart
);



let pdj=true;
let stays=[];
let dateDepartMemorisee="";
const norm=s=>(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toUpperCase();
const key=x=>norm(x.ville+"|"+x.hotel);
const allHotels=()=>[...BASE_HOTELS,...custom].filter(x=>!deleted.includes(key(x)));
function villes(){return [...new Set(allHotels().map(x=>x.ville))].sort((a,b)=>a.localeCompare(b,"fr"))}

function hotelsPourVilleHotel(ville){
  const v=norm(ville);
  return allHotels()
    .filter(x=>norm(x.ville)===v)
    .sort((a,b)=>a.hotel.localeCompare(b.hotel,"fr"));
}

function remplirSelectHotelPourVille(villeId,hotelId){

  const ville =
    document.getElementById(villeId);

  const hotel =
    document.getElementById(hotelId);

  if(!ville || !hotel) return;

  const list =
    hotelsPourVilleHotel(ville.value);


  /* ==========================================
     HOTEL PERSONNALISE :
     modHotel + newHotel
     ========================================== */

  if(
    hotelId === "modHotel" ||
    hotelId === "newHotel"
  ){

    const results =
      document.getElementById(
        hotelId + "Results"
      );

    hotel.value = "";

    if(!results) return;


    results.innerHTML =
      list.map(x => `
        <button
          type="button"
          class="search-result"
          data-hotel="${x.hotel.replace(/"/g,"&quot;")}"
        >
          ${x.hotel}
        </button>
      `).join("");


    results.hidden = true;


    results
      .querySelectorAll("[data-hotel]")
      .forEach(btn => {

        btn.onclick = () => {

          hotel.value =
            btn.dataset.hotel;

          results.hidden = true;

        };

      });


    return;
  }


  /* ==========================================
     ANCIENS SELECTS
     ========================================== */

  hotel.innerHTML =
    '<option value="">Choisir un hébergement...</option>' +
    list.map(x =>
      `<option value="${x.hotel.replace(/"/g,"&quot;")}">${x.hotel}</option>`
    ).join("");

}

function installerRechercheVilleHotel(villeId,resultsId,hotelId){

  const input = document.getElementById(villeId);
  const results = document.getElementById(resultsId);
  const hotel = document.getElementById(hotelId);
  const hotelResults = document.getElementById(hotelId + "Results");

  if(!input || !results) return;


  function afficher(){

    const q = norm(input.value);
    let list = villes();

    if(q){
      list = list.filter(v =>
        norm(v).includes(q)
      );
    }

    list = list.slice(0,10);

    if(!list.length){
      results.innerHTML =
        '<div class="search-empty">Aucune ville trouvée</div>';
      results.hidden = false;
      return;
    }

    results.innerHTML = list.map(v => `
      <button
        type="button"
        class="search-result"
        data-ville="${v.replace(/"/g,"&quot;")}"
      >
        ${v}
      </button>
    `).join("");

    results.hidden = false;

    results
      .querySelectorAll(".search-result")
      .forEach(btn => {

        btn.onclick = () => {

          input.value = btn.dataset.ville;
          results.hidden = true;

          if(hotel && hotelResults){
            hotel.value = "";
            hotelResults.hidden = true;
          }

          remplirSelectHotelPourVille(
            villeId,
            hotelId
          );
        };

      });
  }


  input.addEventListener("input", () => {

    afficher();

    if(hotel && hotelResults){
      hotel.value = "";
      hotelResults.hidden = true;
    }

    remplirSelectHotelPourVille(
      villeId,
      hotelId
    );
  });


  input.addEventListener(
    "focus",
    afficher
  );


  input.addEventListener("blur", () => {

    setTimeout(() => {
      results.hidden = true;
    },150);

  });


  /* HOTEL */

  if(hotel && hotelResults){

    hotel.onclick = () => {

      if(!input.value.trim()){
        return;
      }

      remplirSelectHotelPourVille(
        villeId,
        hotelId
      );

      hotelResults.hidden = false;

      hotelResults
        .querySelectorAll(".search-result")
        .forEach(btn => {

          btn.onclick = () => {

            hotel.value =
              btn.dataset.hotel ||
              btn.textContent.trim();

            hotelResults.hidden = true;
          };

        });
    };
  }
}

const villeResults = $("villeResults");

function showVilleResults(){
  const q = norm($("ville").value);
  let list = villes();

  if(q){
    list = list.filter(v => norm(v).includes(q));
  }

  list = list.slice(0, 10);

  if(!list.length){
    villeResults.innerHTML =
      '<div class="search-empty">Aucune ville trouvée</div>';
    villeResults.hidden = false;
    return;
  }

  villeResults.innerHTML = list.map(v => `
    <button
      type="button"
      class="search-result"
      data-ville="${v.replace(/"/g, "&quot;")}"
    >${v}</button>
  `).join("");

  villeResults.hidden = false;

  villeResults.querySelectorAll(".search-result").forEach(btn => {
    btn.addEventListener("mousedown", e => {
      e.preventDefault();
      $("ville").value = btn.dataset.ville;
      villeResults.hidden = true;
      refreshHotels();
    });
  });
}
function refreshVilles(){
  // La liste est maintenant générée à la demande dans le menu personnalisé.
}
function refreshHotels(){

  const ville = $("ville").value.trim();
  const hotel = $("hotel");
  const results = $("hotelResults");

  if(!hotel || !results){
    return;
  }

  hotel.value = "";
  hotel.textContent = "Choisir un hébergement...";

  results.innerHTML = "";
  results.hidden = true;

  if(!ville){
    return;
  }

  const list =
    allHotels()
      .filter(x =>
        norm(x.ville) === norm(ville)
      )
      .sort((a,b) =>
        a.hotel.localeCompare(b.hotel,"fr")
      );

  results.innerHTML =
    list.map(x => `
      <button
        type="button"
        class="search-result"
        data-hotel="${x.hotel.replace(/"/g,"&quot;")}"
      >
        ${x.hotel}
      </button>
    `).join("");

  results
    .querySelectorAll("[data-hotel]")
    .forEach(btn => {

      btn.onclick = () => {

        hotel.value = btn.dataset.hotel;
        hotel.textContent = btn.dataset.hotel;

        results.hidden = true;
      };

    });
}
function ouvrirListeHotelPrincipale(){

  const hotel = $("hotel");
  const results = $("hotelResults");

  if(!hotel || !results){
    return;
  }

  if(!$("ville").value.trim()){
    return;
  }

  refreshHotels();

  results.hidden = false;
}


/* OUVERTURE LISTE HOTEL */
$("hotel").addEventListener("click", event => {

  event.preventDefault();

  ouvrirListeHotelPrincipale();

});
$("ville").addEventListener("input",()=>{
  showVilleResults();
  refreshHotels();
});

$("ville").addEventListener("focus",showVilleResults);

$("ville").addEventListener("blur",()=>{
  setTimeout(()=>{
    villeResults.hidden = true;
  },150);
});
installerRechercheVilleHotel("modVille","modVilleResults","modHotel");
installerRechercheVilleHotel("newVille","newVilleResults","newHotel");

$("pdjOui").onclick=()=>{pdj=true;$("pdjOui").classList.add("active");$("pdjNon").classList.remove("active")};
$("pdjNon").onclick=()=>{pdj=false;$("pdjNon").classList.add("active");$("pdjOui").classList.remove("active")};
const fr=d=>d?new Date(d+"T12:00:00").toLocaleDateString("fr-FR"):"";
function nights(){
 const a=new Date($("arrivee").value+"T12:00:00"),d=new Date($("depart").value+"T12:00:00");
 return Math.round((d-a)/86400000);
}

function currentStay(){
  return {
    arrivee: $("arrivee").value,
    heureArrivee: $("heureArrivee").value,
    depart: $("depart").value,
    heureDepart: $("heureDepart").value,
    ville: $("ville").value.trim(),
    hotel: $("hotel").value,
    pdj: pdj
  };
}

function stayNights(stay){
  if(!stay.arrivee || !stay.depart) return 0;
  const a=new Date(stay.arrivee+"T12:00:00");
  const d=new Date(stay.depart+"T12:00:00");
  return Math.round((d-a)/86400000);
}

function validateStay(stay){
  if(!stay.arrivee || !stay.heureArrivee || !stay.depart || !stay.ville || !stay.hotel){
    alert("Complétez la ville, l’hôtel, l’arrivée, l’heure et le départ.");
    return false;
  }

  const n=stayNights(stay);

  if(n < 1){
    alert("La date de départ doit être après la date d’arrivée.");
    return false;
  }

  return true;
}

function clearStayForm(){
  $("arrivee").value = dateDepartMemorisee || "";
  $("heureArrivee").value="";
  $("depart").value="";
  $("depart").min="";
  $("heureDepart").value="";
  $("ville").value="";
  $("hotel").value = "";
$("hotel").textContent = "Choisir un hébergement...";

  pdj=true;
  $("pdjOui").classList.add("active");
  $("pdjNon").classList.remove("active");
}

function renderStays(){

  $("staysCard").hidden = stays.length === 0;

if($("staysCount")){
  $("staysCount").textContent =
    stays.length +
    (stays.length > 1 ? " hôtels" : " hôtel");
}

  if(!stays.length){
    $("staysList").innerHTML="";
    return;
  }

  $("staysList").innerHTML = stays.map((s,i)=>{
    const n=stayNights(s);

    return `
      <div class="stay-compact">

        <div class="stay-compact-nights">
          <div class="stay-compact-number">${n}</div>
          <div class="stay-compact-label">${n>1?"NUITÉES":"NUITÉE"}</div>
        </div>

        <div class="stay-compact-content">
          <div class="stay-compact-title">
            ${s.ville} — ${s.hotel}
          </div>

          <div class="stay-compact-line">
            Arrivée :
            <strong>${fr(s.arrivee)} à ${s.heureArrivee}</strong>
            <br>
            Départ :
            <strong>${fr(s.depart)} à ${s.heureDepart || "--:--"}</strong>
          </div>

          <div class="stay-compact-line">
            Petit-déjeuner :
            <strong>${s.pdj ? "OUI" : "NON"}</strong>
          </div>
        </div>

        <button
          type="button"
          class="stay-compact-delete"
          data-remove-stay="${i}"
          aria-label="Supprimer cet hébergement"
        >
          🗑
        </button>

      </div>
    `;
  }).join("");

  $("staysList")
    .querySelectorAll("[data-remove-stay]")
    .forEach(btn=>{
      btn.addEventListener("click",()=>{
        const i=Number(btn.dataset.removeStay);
        stays.splice(i,1);
        renderStays();
      });
    });
}

function preparerRecapDepuisSejours(){

  if(!stays.length){
    alert("Ajoutez au moins un hébergement avec le bouton +.");
    return false;
  }

  window.__recapStays = [...stays];

  $("recap").innerHTML = `
    <div class="recap-row">
      <span>Agent(s)</span>
      <strong>${texteAgentsPourMailHotel()||"Non renseigné"}</strong>
    </div>

    ${stays.map((s,i)=>{
      const n=stayNights(s);

      return `
        <div class="recap-stay">
          <div class="recap-stay-title">
            Hébergement ${i+1} —
            <span class="nights">${n} NUIT${n>1?"S":""}</span>
          </div>

          <div class="recap-row">
            <span>Ville</span>
            <strong>${s.ville}</strong>
          </div>

          <div class="recap-row">
            <span>Hôtel</span>
            <strong>${s.hotel}</strong>
          </div>

          <div class="recap-row">
            <span>Arrivée</span>
            <strong>${fr(s.arrivee)} à ${s.heureArrivee}</strong>
          </div>

          <div class="recap-row">
            <span>Départ</span>
            <strong>${fr(s.depart)}${s.heureDepart?" à "+s.heureDepart:""}</strong>
          </div>

          <div class="recap-row">
            <span>Petit-déjeuner</span>
            <strong>${s.pdj?"OUI":"NON"}</strong>
          </div>
        </div>
      `;
    }).join("")}
  `;

  $("recapCard").hidden=false;
  $("recapCard").scrollIntoView({
    behavior:"smooth",
    block:"start"
  });

  return true;
}

$("addStay").onclick=()=>{
  const s=currentStay();

  if(!validateStay(s)) return;

  stays.push(s);

  // La date de départ devient automatiquement
  // la date d'arrivée du prochain hébergement.
  dateDepartMemorisee = s.depart;

  renderStays();
  clearStayForm();

  $("form").scrollIntoView({
    behavior:"smooth",
    block:"start"
  });
};

$("createMailBtn").onclick=()=>{
  if(!stays.length){
    alert("Ajoutez au moins un hébergement.");
    return;
  }

  window.__recapStays = [...stays];
  dateDepartMemorisee = "";

  // Le bouton vert crée directement le mail.
  creerMailDirect();
};

$("reset").onclick=()=>{

  // Efface uniquement le cadre de saisie du haut.
  // Les hébergements déjà ajoutés restent dans la demande.
  $("ville").value="";
 $("hotel").value = "";
$("hotel").textContent = "Choisir un hébergement...";
  $("arrivee").value="";
  $("heureArrivee").value="";
  $("depart").value="";
  $("heureDepart").value="";

  // On oublie aussi la date mémorisée du dernier départ.
  dateDepartMemorisee="";

  pdj=true;
  $("pdjOui").classList.add("active");
  $("pdjNon").classList.remove("active");
};
function agentsPourMailHotel(){

  const agents = [];

  if(profil.nom){
    agents.push(profil.nom);
  }

  selectedHotelAgents.forEach(nom => {
    if(
      nom &&
      !agents.some(
        x => norm(x) === norm(nom)
      )
    ){
      agents.push(nom);
    }
  });

  return agents;
}
function texteAgentsPourMailHotel(){

  const agents =
    agentsPourMailHotel();

  return agents.length
    ? agents.join(", ")
    : "";
}

function buildEmailHtml(list){

  const aujourdhui =
    new Date().toLocaleDateString("fr-FR");

  const rows = list.map(s=>{
    const n = stayNights(s);

    return `
      <tr>
        <td style="border:1px solid #555;padding:12px 8px;text-align:center;
                   color:#e11d48;font-weight:800;">
          <div style="font-size:22px;line-height:1;">${n}</div>
          <div style="font-size:12px;margin-top:4px;">
            ${n>1 ? "NUITÉES" : "NUITÉE"}
          </div>
        </td>

        <td style="border:1px solid #555;padding:12px 8px;text-align:center;
                   font-weight:800;color:#111827;">
          ${s.ville}
        </td>

        <td style="border:1px solid #555;padding:12px 8px;text-align:center;">
          ${s.hotel}
        </td>

        <td style="border:1px solid #555;padding:12px 8px;text-align:center;">
          ${fr(s.arrivee)}
        </td>

        <td style="border:1px solid #555;padding:12px 8px;text-align:center;">
          ${s.heureArrivee}
        </td>

        <td style="border:1px solid #555;padding:12px 8px;text-align:center;">
          ${fr(s.depart)}
        </td>

        <td style="border:1px solid #555;padding:12px 8px;text-align:center;">
          ${s.heureDepart || "--:--"}
        </td>

        <td style="border:1px solid #555;padding:12px 8px;text-align:center;
                   font-weight:800;">
          ${s.pdj ? "OUI" : "NON"}
        </td>
      </tr>
    `;
  }).join("");

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#111827;
                max-width:1000px;margin:0 auto;">
      <h1 style="text-align:center;font-size:26px;margin:0 0 24px;">
        DEMANDE D’HÉBERGEMENT
      </h1>

   <p style="margin:0 0 8px;">
  Agent : ${profil.nom || "Agent"}
</p>

      <p style="margin:0 0 20px;">
        <strong>Demande faite le :</strong> ${aujourdhui}
      </p>

      <div style="border-top:1px solid #444;margin-bottom:18px;"></div>

      <table cellpadding="0" cellspacing="0"
             style="border-collapse:collapse;width:100%;font-size:13px;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="border:1px solid #555;padding:10px 6px;">NUITÉES</th>
            <th style="border:1px solid #555;padding:10px 6px;">VILLE</th>
            <th style="border:1px solid #555;padding:10px 6px;">HÔTEL</th>
            <th style="border:1px solid #555;padding:10px 6px;">ARRIVÉE</th>
            <th style="border:1px solid #555;padding:10px 6px;">HEURE<br>ARRIVÉE</th>
            <th style="border:1px solid #555;padding:10px 6px;">DÉPART</th>
            <th style="border:1px solid #555;padding:10px 6px;">HEURE<br>DÉPART</th>
            <th style="border:1px solid #555;padding:10px 6px;">PETIT-DÉJEUNER</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <p style="margin-top:22px;">
        Merci d’effectuer les réservations selon ces informations.
      </p>

      <p>Cordialement.</p>

      <p style="margin-top:26px;">
        <strong>${profil.nom || ""}</strong>
      </p>
    </div>
  `;
}

function buildEmailText(list){

  const aujourdhui =
    new Date().toLocaleDateString("fr-FR");

  const lines = [
    "DEMANDE D’HÉBERGEMENT",
    "",
    `Agent(s) : ${texteAgentsPourMailHotel()}`,
    `Demande faite le : ${aujourdhui}`,
    ""
  ];

  list.forEach((s,i)=>{
    const n = stayNights(s);

    lines.push(
      `${n} ${n>1 ? "NUITÉES" : "NUITÉE"} À ${s.ville}`,
      s.hotel,
      `Arrivée : ${fr(s.arrivee)} à ${s.heureArrivee}`,
      `Départ : ${fr(s.depart)} à ${s.heureDepart || "--:--"}`,
      `Petit-déjeuner : ${s.pdj ? "OUI" : "NON"}`,
      ""
    );
  });

  lines.push(
    "Merci d’effectuer les réservations selon ces informations.",
    "",
    "Cordialement.",
    "",
    profil.nom || ""
  );

  return lines.join("\r\n");
}

async function copyRichEmail(html, text){

  try {

    if(
      navigator.clipboard &&
      window.ClipboardItem
    ){
      const item = new ClipboardItem({
        "text/html": new Blob(
          [html],
          {type:"text/html"}
        ),

        "text/plain": new Blob(
          [text],
          {type:"text/plain"}
        )
      });

      await navigator.clipboard.write([item]);
      return true;
    }

    await navigator.clipboard.writeText(text);
    return true;

  } catch(err){
    return false;
  }
}


/* ==========================================================
   v42 - SEMAINES ISO POUR LE MAIL
   ========================================================== */

function numeroSemaineISO(dateISO) {

  if (!dateISO) return null;

  const p = dateISO.split("-").map(Number);

  const date = new Date(
    Date.UTC(
      p[0],
      p[1] - 1,
      p[2]
    )
  );

  // Jeudi de la semaine ISO
  const jour = date.getUTCDay() || 7;

  date.setUTCDate(
    date.getUTCDate() + 4 - jour
  );

  const debutAnnee =
    new Date(
      Date.UTC(
        date.getUTCFullYear(),
        0,
        1
      )
    );

  return Math.ceil(
    (
      (
        date - debutAnnee
      ) / 86400000 + 1
    ) / 7
  );
}

function semainesDesSejours(list) {

  const semaines = new Set();

  list.forEach(s => {

    if (!s.arrivee || !s.depart) return;

    const debut =
      new Date(s.arrivee + "T12:00:00");

    const fin =
      new Date(s.depart + "T12:00:00");

    const d =
      new Date(debut);

    while (d <= fin) {

      const iso =
        [
          d.getFullYear(),
          String(
            d.getMonth() + 1
          ).padStart(2, "0"),
          String(
            d.getDate()
          ).padStart(2, "0")
        ].join("-");

      const sem =
        numeroSemaineISO(iso);

      if (sem !== null) {
        semaines.add(sem);
      }

      d.setDate(
        d.getDate() + 1
      );
    }
  });

  return [...semaines]
    .sort((a, b) => a - b);
}

function texteSemaines(list) {

  const semaines =
    semainesDesSejours(list);

  if (!semaines.length) {
    return "";
  }

  return semaines.join("/");
}

function creerMailDirect(){

  const list =
    window.__recapStays ||
    stays ||
    [];

  if(!list.length){
    alert(
      "Aucun hébergement à envoyer."
    );
    return;
  }

  const nomAgent =
    (profil.nom || "Agent").trim();

  const semaines =
    texteSemaines(list);

  const sujet =
    `DEMANDE S${semaines} Mr ${nomAgent}`;

  const lignes = [];

  lignes.push("Bonjour,");
  lignes.push("");

  lignes.push(
    `Ci-joint ma demande d’hébergements pour la S.${semaines}`
  );

  lignes.push("");

 lignes.push(
  `Agent : ${nomAgent}`
);

lignes.push(
  "────────────────────────"
);

list.forEach((s, i) => {

  const n =
    stayNights(s);

  lignes.push(
    `${s.ville} — ${s.hotel}`
  );

    lignes.push(
      `${n} ${n > 1 ? "nuitées" : "nuitée"}`
    );

    lignes.push(
      `Arrivée : ${fr(s.arrivee)} à ${s.heureArrivee}`
    );

    lignes.push(
      `Départ : ${fr(s.depart)} à ${s.heureDepart || "--:--"}`
    );

    lignes.push(
      `Petit-déjeuner : ${s.pdj ? "OUI" : "NON"}`
    );

    if (i < list.length - 1) {
      lignes.push(
        "────────────────────────"
      );
    }
  });

  lignes.push("");
  lignes.push("Cordialement.");
  lignes.push(nomAgent);

  const corps =
    lignes.join("\r\n");

  const to =
    dest.email || "";

  const outlook =
    `ms-outlook://compose?to=${encodeURIComponent(to)}` +
    `&subject=${encodeURIComponent(sujet)}` +
    `&body=${encodeURIComponent(corps)}`;

  const mailto =
    `mailto:${encodeURIComponent(to)}` +
    `?subject=${encodeURIComponent(sujet)}` +
    `&body=${encodeURIComponent(corps)}`;

  dateDepartMemorisee = "";

  let hidden = false;

  document.addEventListener(
    "visibilitychange",
    () => {
      if(document.hidden) {
        hidden = true;
      }
    },
    { once:true }
  );

  const estAndroid =
    /Android/i.test(navigator.userAgent);

  if (estAndroid) {
    location.href = mailto;
    return;
  }

  location.href = outlook;

  setTimeout(() => {
    if(!hidden){
      location.href = mailto;
    }
  }, 1200);
}

$("manageBtn").onclick=()=>{
  ouvrirMenuParametresHotel();
};

$("closeManage").onclick=()=>{
  $("manage").hidden=true;
};

function fillSettings(){ $("profilNom").value=profil.nom||"";$("destNom").value=dest.nom||"";$("destMail").value=dest.email||""}

if($("addAgent")){
  $("addAgent").onclick=()=>{

    const nom=
      normaliserAgentHotel(
        $("agentNom").value
      );

    if(!nom){
      alert("Saisissez le nom de l’agent.");
      return;
    }

    if(
      hotelAgents.some(
        x=>norm(x)===norm(nom)
      )
    ){
      alert("Cet agent est déjà enregistré.");
      return;
    }

    hotelAgents.push(nom);

    hotelAgents.sort(
      (a,b)=>a.localeCompare(b,"fr")
    );

    save(
      LS_AGENTS,
      hotelAgents
    );

    $("agentNom").value="";

    renderHotelAgentsAdmin();
    renderModificationAgents();
  };
}

if($("clearAgent")){
  $("clearAgent").onclick=()=>{
    $("agentNom").value="";
  };
}

if($("importAgentsBtn")){

  $("importAgentsBtn").onclick=()=>{

    const input=
      $("importAgentsFile");

    if(!input) return;

    /*
      Permet de réimporter le même fichier
      deux fois de suite si nécessaire.
    */
    input.value="";
    input.click();
  };
}

if($("importAgentsFile")){

  $("importAgentsFile").onchange=
    async event=>{

      const fichier=
        event.target.files &&
        event.target.files[0];

      if(!fichier) return;

      await importerAgentsDepuisFichierHotel(
        fichier
      );
    };
}

$("saveProfil").onclick=()=>{

  const nom =
    $("profilNom").value.trim();

  const destNom =
    $("destNom").value.trim();

  const destMail =
    $("destMail").value.trim();

  if(!nom){
    alert("Choisissez votre nom.");
    return;
  }

  if(!destMail){
    alert("Renseignez l’adresse e-mail du service logement.");
    return;
  }

  profil = {
    nom: nom
  };

  dest = {
    nom: destNom,
    email: destMail
  };

  save(
    LS_P,
    profil
  );

  save(
    LS_D,
    dest
  );

  alert(
    "Profil et réservation enregistrés."
  );
};


/* ==========================================================
   HOTELS - AJOUTER
   ========================================================== */

if($("addHotel")){

  $("addHotel").onclick = () => {

    const ville =
      $("adminVille").value.trim();

    const hotel =
      $("adminHotel").value.trim();

    if(!ville){
      alert("Renseignez une ville.");
      return;
    }

    if(!hotel){
      alert("Renseignez un hôtel.");
      return;
    }

    const existe =
      allHotels().some(x =>
        norm(x.ville) === norm(ville) &&
        norm(x.hotel) === norm(hotel)
      );

    if(existe){
      alert("Cet hôtel existe déjà pour cette ville.");
      return;
    }

    custom.push({
      ville: ville,
      hotel: hotel
    });

    save(
      LS_H,
      custom
    );

    $("adminHotel").value = "";

    alert("Hôtel ajouté.");

    refreshVilles();
  };
}

/* ==========================================================
   HOTELS - VOIR / MASQUER + FILTRER LA LISTE
   ========================================================== */

const toggleHotelsList =
  document.getElementById("toggleHotelsList");

const adminVilleFiltre =
  document.getElementById("adminVille");


function afficherListeHotelsAdmin(){

  const cont =
    document.getElementById("adminHotelsFound");

  const liste =
    document.getElementById("adminHotelsList");

  if(!cont || !liste){
    return;
  }

  const recherche =
    norm(
      adminVilleFiltre
        ? adminVilleFiltre.value
        : ""
    );

  const hotels =
    allHotels()
      .filter(x => {

        if(!recherche){
          return true;
        }

        return (
          norm(x.ville).includes(recherche) ||
          norm(x.hotel).includes(recherche)
        );

      })
      .slice()
      .sort((a,b) => {

        const ville =
          a.ville.localeCompare(
            b.ville,
            "fr"
          );

        if(ville !== 0){
          return ville;
        }

        return a.hotel.localeCompare(
          b.hotel,
          "fr"
        );
      });


  if(!hotels.length){

    liste.innerHTML =
      '<div class="search-empty">Aucun hôtel trouvé</div>';

  }else{

    liste.innerHTML =
      hotels.map(x => `
        <div class="admin-hotel-row">

          <div class="admin-hotel-row-name">
            <strong>${x.ville}</strong><br>
            ${x.hotel}
          </div>

        </div>
      `).join("");

  }

  cont.hidden = false;
}


if(toggleHotelsList){

  toggleHotelsList.onclick = () => {

    const cont =
      document.getElementById("adminHotelsFound");

    if(!cont){
      return;
    }

    if(!cont.hidden){

      cont.hidden = true;

      toggleHotelsList.textContent =
        "👁 Voir les hôtels";

    }else{

      afficherListeHotelsAdmin();

      toggleHotelsList.textContent =
        "Masquer les hôtels";
    }
  };
}


if(adminVilleFiltre){

  adminVilleFiltre.addEventListener(
    "input",
    () => {

      const cont =
        document.getElementById("adminHotelsFound");

      if(
        !cont ||
        cont.hidden
      ){
        return;
      }

      afficherListeHotelsAdmin();
    }
  );
}


if(toggleHotelsList){

  toggleHotelsList.onclick = () => {

    const cont =
      document.getElementById("adminHotelsFound");

    if(!cont){
      return;
    }

    if(!cont.hidden){

      cont.hidden = true;

      toggleHotelsList.textContent =
        "👁 Voir les hôtels";

    }else{

      afficherListeHotelsAdmin();

      toggleHotelsList.textContent =
        "Masquer les hôtels";
    }
  };
}


if(adminVilleFiltre){

  adminVilleFiltre.addEventListener(
    "input",
    () => {

      const cont =
        document.getElementById("adminHotelsFound");

      if(
        !cont ||
        cont.hidden
      ){
        return;
      }

      afficherListeHotelsAdmin();
    }
  );
}

$("cancelHotel").onclick=()=>{

  $("adminVille").value = "";
  $("adminHotel").value = "";

  adminVilleResults.hidden = true;
  adminHotelsFound.hidden = true;
  adminHotelsList.innerHTML = "";
};


/* ==========================================================
   APPARENCE
   ========================================================== */
const closeAppearance =
  document.getElementById("closeAppearance");

if(closeAppearance){

  closeAppearance.onclick = () => {

    document.getElementById("appearance").hidden = true;
    document.getElementById("manage").hidden = true;

  };

}
const appearanceDefaults = {
  primary: "#111827",
  mail: "#079447",
  nights: "#dc2626",
  background: "#f3f4f6",
  card: "#ffffff",
  field: "#ffffff",
  cardText: "#111827",
  theme: "classic"
};
const themePresets = {
  classic: {
    primary: "#111827",
    mail: "#079447",
    nights: "#dc2626",
    background: "#f3f4f6",
    card: "#ffffff"
  },

  blue: {
    primary: "#0b63d8",
    mail: "#0b63d8",
    nights: "#dc2626",
    background: "#eef5ff",
    card: "#ffffff"
  },

  green: {
    primary: "#047857",
    mail: "#079447",
    nights: "#dc2626",
    background: "#eefbf5",
    card: "#ffffff"
  },

orange: {
  primary: "#c2410c",
  mail: "#ea580c",
  nights: "#dc2626",
  background: "#fff7ed",
  card: "#ffffff",
  field: "#ffedd5"
},

  red: {
    primary: "#b91c1c",
    mail: "#b91c1c",
    nights: "#dc2626",
    background: "#fff1f2",
    card: "#ffffff"
  },

  dark: {
    primary: "#3b82f6",
    mail: "#16a34a",
    nights: "#f87171",
    background: "#111827",
    card: "#1f2937"
  }
};


/* ==========================================================
   v29 - SYNCHRONISATION DU MODE SOMBRE
   ========================================================== */
function synchroniserThemeHotel() {

  const nomTheme =
    (appearance && appearance.theme
      ? String(appearance.theme)
      : ""
    ).toLowerCase();

  document.body.classList.toggle(
    "theme-dark",
    nomTheme === "dark" ||
    nomTheme === "sombre"
  );

  document.body.classList.toggle(
    "theme-orange",
    nomTheme === "orange"
  );
}

document.addEventListener("DOMContentLoaded", synchroniserThemeHotel);

function applyAppearance(values){

  const a = {
    ...appearanceDefaults,
    ...values
  };

  document.documentElement.style.setProperty(
    "--app-primary",
    a.primary
  );

  document.documentElement.style.setProperty(
    "--app-mail",
    a.mail
  );

  document.documentElement.style.setProperty(
    "--app-nights",
    a.nights
  );

  document.documentElement.style.setProperty(
    "--app-background",
    a.background
  );

  document.documentElement.style.setProperty(
    "--app-card",
    a.card
  );
document.documentElement.style.setProperty(
  "--app-field",
  a.field || "#ffffff"
);
   /* FOND DES CHAMPS SELON LE THEME */
const couleurChamp =
  a.field || a.card || "#ffffff";

[
  "ville",
  "hotel",
  "arrivee",
  "heureArrivee",
  "depart",
  "heureDepart"
].forEach(id => {

  const champ =
    document.getElementById(id);

  if(champ){
    champ.style.setProperty(
      "background",
      couleurChamp,
      "important"
    );

    champ.style.setProperty(
      "background-color",
      couleurChamp,
      "important"
    );
  }

});
  $("colorPrimary").value = a.primary;
  $("colorMail").value = a.mail;
  $("colorNights").value = a.nights;
  $("colorBackground").value = a.background;
  $("colorCard").value = a.card;

   /* POLICE DES CADRES */
if($("fontCards")){
  $("fontCards").value =
    a.fontCards || "system-ui";
}

 
  document.querySelectorAll(".theme-choice").forEach(btn=>{
    btn.classList.toggle(
      "active",
      btn.dataset.theme === a.theme
    );
  });

  setTimeout(synchroniserThemeHotel, 0);
}

document.querySelectorAll(".theme-choice").forEach(btn=>{

  btn.addEventListener("click",()=>{

    const name = btn.dataset.theme;
    const preset = themePresets[name];

    if(!preset) return;

    appearance = {
      ...preset,
      theme: name
    };

    save(LS_A,appearance);
    applyAppearance(appearance);
  });
});

$("saveAppearance").onclick=()=>{

appearance = {
  primary: $("colorPrimary").value,
  mail: $("colorMail").value,
  nights: $("colorNights").value,
  background: $("colorBackground").value,
  card: $("colorCard").value,
  theme: "custom"
};

  save(LS_A,appearance);
  applyAppearance(appearance);

  alert("Couleurs et police enregistrées.");
};

$("resetAppearance").onclick=()=>{

  appearance = {
    ...appearanceDefaults
  };

  save(LS_A,appearance);
  applyAppearance(appearance);

  alert("Couleurs et police réinitialisées.");
};

applyAppearance(appearance);






if($("modeNouvelle")){
  $("modeNouvelle").onclick=()=>
    afficherModeDemandeHotel("nouvelle");
}

if($("modeModification")){
  $("modeModification").onclick=()=>
    afficherModeDemandeHotel("modification");
}

if($("modActionAnnuler")){
  $("modActionAnnuler").onclick=()=>{
    const details =
      document.getElementById("modificationDetailsZone");

    if(details){
      details.hidden = true;
    }

    alert("Fenêtre d'annulation à ajouter à l'étape suivante.");
  };
}

if($("modActionRemplacer")){

  $("modActionRemplacer").onclick=()=>{

    const ville =
      document.getElementById("modVille");

    const hotel =
      document.getElementById("modHotel");

    if(
      !ville ||
      !hotel ||
      !ville.value.trim() ||
      !hotel.value.trim()
    ){
      alert(
        "Choisissez d'abord la ville et l'hôtel à modifier."
      );

      return;
    }

    afficherActionModificationHotel("remplacer");

    const popup =
      document.getElementById(
        "modificationDetailsZone"
      );

    if(popup){
      popup.hidden = false;
    }

  };

}

if($("closeModificationPopup")){

  $("closeModificationPopup").onclick=()=>{

    const popup =
      document.getElementById(
        "modificationDetailsZone"
      );

    if(popup){
      popup.hidden = true;
    }

  };

}
if($("newPdjOui")){
  $("newPdjOui").onclick=()=>{
    newPdjHotel=true;
    $("newPdjOui").classList.add("active");
    $("newPdjNon").classList.remove("active");
  };
}

if($("newPdjNon")){
  $("newPdjNon").onclick=()=>{
    newPdjHotel=false;
    $("newPdjNon").classList.add("active");
    $("newPdjOui").classList.remove("active");
  };
}

if($("createModificationMail")){
  $("createModificationMail").onclick=
    construireMailModificationHotel;
}

renderHotelAgentsAdmin();
renderModificationAgents();

refreshVilles();fillSettings();renderStays();


/* ==========================================================
   v104 - MISE A JOUR SIMPLE ET UNIQUE
   ========================================================== */

let derniereVersionDisponible = "";

function numeroVersionHotel(v){
  const n = parseInt(
    String(v || "").replace(/\D/g, ""),
    10
  );
  return Number.isFinite(n) ? n : 0;
}

function afficherVersionChargeeHotel(){
  const el = document.getElementById("appVersion");
  if(el){
    el.textContent = `À JOUR ${APP_VERSION.toUpperCase()}`;
  }
}

function masquerIndicateurMiseAJourHotel(){
  derniereVersionDisponible = "";

  const badge = document.getElementById("settingsUpdateBadge");
  const card = document.getElementById("settingsUpdateCard");
  const popup = document.getElementById("hotelPopupUpdateCard");

  if(badge){
    badge.hidden = true;
    badge.classList.remove("badge-update-visible");
  }

  if(card) card.hidden = true;
  if(popup) popup.hidden = true;
}

function afficherIndicateurMiseAJourHotel(version){
  derniereVersionDisponible = String(version || "").trim();

  const badge = document.getElementById("settingsUpdateBadge");
  const card = document.getElementById("settingsUpdateCard");
  const popup = document.getElementById("hotelPopupUpdateCard");
  const text = document.getElementById("settingsUpdateText");
  const popupText = document.getElementById("hotelPopupUpdateText");

  if(badge){
    badge.hidden = false;
    badge.classList.add("badge-update-visible");
  }

  if(card) card.hidden = false;
  if(popup) popup.hidden = false;

  const message = `Version ${derniereVersionDisponible} disponible`;

  if(text) text.textContent = message;
  if(popupText) popupText.textContent = message;
}

async function verifierMiseAJourHotel(){
  try{
    const url = new URL("./version.json", window.location.href);
    url.searchParams.set("_", Date.now().toString());

    const response = await fetch(url.href, { cache: "no-store" });
    if(!response.ok) return;

    const info = await response.json();

    const serveur = numeroVersionHotel(info.version);
    const chargee = numeroVersionHotel(APP_VERSION);

    if(serveur > chargee){
      afficherIndicateurMiseAJourHotel(info.version);
    }else{
      masquerIndicateurMiseAJourHotel();
    }
  }catch(err){
    console.log("Contrôle mise à jour :", err);
  }
}

async function appliquerMiseAJourHotel(){
  const cible =
    String(
      derniereVersionDisponible || ""
    ).trim();

  masquerIndicateurMiseAJourHotel();

  const boutons = [
    document.getElementById("settingsUpdateBtn"),
    document.getElementById("hotelPopupUpdateBtn")
  ].filter(Boolean);

  boutons.forEach(btn => {
    btn.disabled = true;
    btn.textContent = "Mise à jour en cours…";
  });

  const url = new URL(
    window.location.origin + window.location.pathname
  );

  url.searchParams.set(
    "maj",
    cible || Date.now().toString()
  );

  url.searchParams.set(
    "_",
    Date.now().toString()
  );

  window.location.replace(url.href);
}

function installerControleMiseAJourHotel(){
  afficherVersionChargeeHotel();
  masquerIndicateurMiseAJourHotel();

  const btn = document.getElementById("settingsUpdateBtn");
  const popupBtn = document.getElementById("hotelPopupUpdateBtn");

  if(btn) btn.onclick = appliquerMiseAJourHotel;
  if(popupBtn) popupBtn.onclick = appliquerMiseAJourHotel;

  setTimeout(verifierMiseAJourHotel, 1500);

  setInterval(() => {
    if(!document.hidden){
      verifierMiseAJourHotel();
    }
  }, 300000);
}

if(document.readyState === "loading"){
  document.addEventListener(
    "DOMContentLoaded",
    installerControleMiseAJourHotel,
    { once: true }
  );
}else{
  installerControleMiseAJourHotel();
}


/* ==========================================================
   v68 - MODIFICATION / ANNULATION
   ========================================================== */

let modeDemandeHotel="nouvelle";
let modActionHotel="annuler";
let newPdjHotel=true;

function afficherModeDemandeHotel(mode){

  modeDemandeHotel=mode;

  const normal=
    document.getElementById("normalRequestZone");

  const modification=
    document.getElementById("modificationRequestZone");

  const btnNew=
    document.getElementById("modeNouvelle");

  const btnMod=
    document.getElementById("modeModification");

  if(normal){
    normal.hidden =
      mode!=="nouvelle";
  }

  if(modification){
    modification.hidden =
      mode!=="modification";
  }

  if(btnNew){
    btnNew.classList.toggle(
      "active",
      mode==="nouvelle"
    );
  }

  if(btnMod){
    btnMod.classList.toggle(
      "active",
      mode==="modification"
    );
  }

  if(mode==="modification"){
    renderModificationAgents();
  }
}

function afficherActionModificationHotel(action){

  modActionHotel = action;

  const annuler =
    document.getElementById("modActionAnnuler");

  const remplacer =
    document.getElementById("modActionRemplacer");

  const zone =
    document.getElementById("replacementZone");

  if(annuler){
    annuler.classList.toggle(
      "active",
      action === "annuler"
    );
  }

  if(remplacer){
    remplacer.classList.toggle(
      "active",
      action === "remplacer"
    );
  }

  if(zone){
    zone.hidden =
      action !== "remplacer";
  }
}

function texteDateHotelISO(v){
  if(!v) return "";
  const [y,m,d]=v.split("-");
  return `${d}/${m}/${y}`;
}

function construireMailModificationHotel(){

 const agents=
  agentsPourMailHotel();

  if(!agents.length){
    alert(
      "Sélectionnez au moins un agent concerné."
    );
    return;
  }

  const ville=
    $("modVille").value.trim();

  const hotel=
    $("modHotel").value.trim();

  const arrivee=
    $("modArrivee").value;

  const depart=
    $("modDepart").value;

if(!ville || !hotel){
  alert(
    "Renseignez la ville et l’hôtel à modifier."
  );
  return;
}

  const nomAgent=
    profil.nom || "Agent";

  const lignes=[];

  lignes.push("Bonjour,");
  lignes.push("");

  if(modActionHotel==="annuler"){
    lignes.push(
      "Merci d’annuler l’hébergement suivant."
    );
  }else{
    lignes.push(
      "Suite à une modification de service, merci d’annuler l’hébergement suivant et de réserver le nouvel hébergement indiqué ci-dessous."
    );
  }

  lignes.push("");
  lignes.push(
    `AGENTS CONCERNÉS : ${agents.length}`
  );

  agents.forEach(
    (a,i)=>
      lignes.push(`${i+1}. ${a}`)
  );

  lignes.push("");
  lignes.push("HÉBERGEMENT À ANNULER");
  lignes.push(`${ville.toUpperCase()} — ${hotel.toUpperCase()}`);
  lignes.push(
    `Arrivée : ${texteDateHotelISO(arrivee)} à ${$("modHeureArrivee").value || "--:--"}`
  );
  lignes.push(
    `Départ : ${texteDateHotelISO(depart)} à ${$("modHeureDepart").value || "--:--"}`
  );

  if(modActionHotel==="remplacer"){

    const newVille=
      $("newVille").value.trim();

    const newHotel=
      $("newHotel").value.trim();

    const newArrivee=
      $("newArrivee").value;

    const newDepart=
      $("newDepart").value;

    if(
      !newVille ||
      !newHotel ||
      !newArrivee ||
      !newDepart
    ){
      alert(
        "Renseignez complètement le nouvel hébergement."
      );
      return;
    }

    lignes.push("");
    lignes.push(
      "NOUVEL HÉBERGEMENT À RÉSERVER"
    );
    lignes.push(
      `${newVille.toUpperCase()} — ${newHotel.toUpperCase()}`
    );
    lignes.push(
      `Arrivée : ${texteDateHotelISO(newArrivee)} à ${$("newHeureArrivee").value || "--:--"}`
    );
    lignes.push(
      `Départ : ${texteDateHotelISO(newDepart)} à ${$("newHeureDepart").value || "--:--"}`
    );
    lignes.push(
      `Petit-déjeuner : ${newPdjHotel ? "OUI" : "NON"}`
    );
  }

  lignes.push("");
  lignes.push("Cordialement.");
  lignes.push(nomAgent);

  const sujet=
    modActionHotel==="annuler"
      ? `Annulation hébergement - ${nomAgent}`
      : `Modification hébergement - ${nomAgent}`;

  const to=
    dest.email || "";

  const corps=
    lignes.join("\r\n");

  const outlook=
    `ms-outlook://compose?to=${encodeURIComponent(to)}`+
    `&subject=${encodeURIComponent(sujet)}`+
    `&body=${encodeURIComponent(corps)}`;

  const mailto=
    `mailto:${encodeURIComponent(to)}`+
    `?subject=${encodeURIComponent(sujet)}`+
    `&body=${encodeURIComponent(corps)}`;

  const estAndroid=
    /Android/i.test(navigator.userAgent);

  if(estAndroid){
    location.href=mailto;
    return;
  }

  let hidden=false;

  document.addEventListener(
    "visibilitychange",
    ()=>{
      if(document.hidden){
        hidden=true;
      }
    },
    {once:true}
  );

  location.href=outlook;

  setTimeout(()=>{
    if(!hidden){
      location.href=mailto;
    }
  },1200);
}

/* ==========================================================
   APERCU HTML OUTLOOK CONSERVE
   ========================================================== */

function ouvrirApercuMailHtmlOutlook(list) {

  const htmlMail =
    buildEmailHtml(list);

  const sujet =
    `Demande d'hébergement - ${profil.nom || "Agent"} - ${fr(list[0].arrivee)}`;

  const to =
    dest.email || "";

  const page =
    window.open("", "_blank");

  if (!page) {
    alert(
      "Le navigateur a bloqué la fenêtre d’aperçu."
    );
    return;
  }

  page.document.open();

  page.document.write(`
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport"
      content="width=device-width,initial-scale=1">

<title>Aperçu mail Outlook</title>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 24px;
  background: #f3f4f6;
  font-family: Arial, Helvetica, sans-serif;
  color: #111827;
}

.toolbar {
  position: sticky;
  top: 0;
  z-index: 20;

  display: grid;
  grid-template-columns: minmax(0,1fr) minmax(0,1fr) 44px;
  gap: 10px;
  align-items: center;

  margin: -24px -24px 20px;
  padding: 14px 24px;

  background: #ffffff;
  border-bottom: 1px solid #d1d5db;
}

.toolbar button {
  min-height: 44px;
  padding: 10px 16px;

  border: 0;
  border-radius: 10px;

  font: inherit;
  font-weight: 800;

  cursor: pointer;
}

#copyRenderedBtn {
  background: #111827;
  color: #ffffff;
}

#openOutlookBtn {
  background: #2563eb;
  color: #ffffff;
}
#closePreviewBtn {
  width: 44px !important;
  height: 44px !important;
  min-width: 44px !important;

  margin: 0 !important;
  padding: 0 !important;

  border: 0 !important;
  border-radius: 50% !important;

  background: #e5e7eb !important;
  color: #111827 !important;

  font-size: 28px !important;
  font-weight: 800 !important;
  line-height: 1 !important;
}
.help {
  grid-column: 1 / -1;
  width: 100%;
  margin: 0;

  color: #667085;
  font-size: 13px;
}

#mailRendered {
  max-width: 1100px;
  margin: 0 auto;

  padding: 26px;

  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 12px;
}

@media (max-width: 700px) {

  body {
    padding: 12px;
  }

  .toolbar {
    margin: -12px -12px 14px;
    padding: 10px 12px;
  }

  #mailRendered {
    padding: 14px;
    overflow-x: auto;
  }
}
</style>
</head>

<body>

<div class="toolbar">

  <button
    type="button"
    id="copyRenderedBtn"
  >
    Copier la présentation
  </button>

  <button
    type="button"
    id="openOutlookBtn"
  >
    Ouvrir Outlook
  </button>
<button
  type="button"
  id="closePreviewBtn"
  aria-label="Fermer"
>
  ×
</button>
  <p class="help">
    1. Copier la présentation
    &nbsp;→&nbsp;
    2. Ouvrir Outlook
    &nbsp;→&nbsp;
    3. Coller dans le corps du message.
  </p>

</div>

<div id="mailRendered">
  ${htmlMail}
</div>

<script>
(function(){
const closePreviewBtn =
  document.getElementById("closePreviewBtn");

if(closePreviewBtn){
  closePreviewBtn.onclick = function(){
    window.close();
  };
}
  const sujet =
    ${JSON.stringify(sujet)};

  const to =
    ${JSON.stringify(to)};

  document
    .getElementById(
      "copyRenderedBtn"
    )
    .addEventListener(
      "click",
      function(){

        const zone =
          document.getElementById(
            "mailRendered"
          );

        const range =
          document.createRange();

        range.selectNodeContents(
          zone
        );

        const selection =
          window.getSelection();

        selection.removeAllRanges();
        selection.addRange(range);

        let ok = false;

        try {
          ok =
            document.execCommand(
              "copy"
            );
        } catch (e) {
          ok = false;
        }

        selection.removeAllRanges();

        if (ok) {
          alert(
            "Présentation copiée. Ouvrez Outlook puis collez dans le corps du mail."
          );
        } else {
          alert(
            "Copie automatique impossible. Sélectionnez le tableau manuellement puis copiez-le."
          );
        }
      }
    );

  document
    .getElementById(
      "openOutlookBtn"
    )
    .addEventListener(
      "click",
      function(){

        const outlook =
          "ms-outlook://compose?to=" +
          encodeURIComponent(to) +
          "&subject=" +
          encodeURIComponent(sujet);

        const mailto =
          "mailto:" +
          encodeURIComponent(to) +
          "?subject=" +
          encodeURIComponent(sujet);

        let hidden = false;

        document.addEventListener(
          "visibilitychange",
          function(){
            if (
              document.hidden
            ) {
              hidden = true;
            }
          },
          { once:true }
        );

        location.href =
          outlook;

        setTimeout(
          function(){
            if (
              !hidden
            ) {
              location.href =
                mailto;
            }
          },
          1200
        );
      }
    );

})();
<\/script>

</body>
</html>
  `);

  page.document.close();
}

$("previewHtmlMailBtn").onclick = () => {

  if (!stays.length) {

    alert(
      "Ajoutez au moins un hébergement."
    );

    return;
  }

  ouvrirApercuMailHtmlOutlook(
    [...stays]
  );
};


/* ==========================================================
   v78 - PARAMETRES HOTEL
   Meme principe que l'application Taxi
   ========================================================== */

const hotelSettingsMenu =
  document.getElementById(
    "hotelSettingsMenu"
  );

const hotelQuickProfil =
  document.getElementById(
    "hotelQuickProfil"
  );



const hotelQuickHotels =
  document.getElementById(
    "hotelQuickHotels"
  );

const hotelQuickAppearance =
  document.getElementById(
    "hotelQuickAppearance"
  );

const hotelQuickCancel =
  document.getElementById(
    "hotelQuickCancel"
  );

function ouvrirMenuParametresHotel(){

  hotelSettingsMenu.hidden = false;
}

function fermerMenuParametresHotel(){

  hotelSettingsMenu.hidden = true;
}

function ouvrirAdministrationHotelSur(cible){

  fermerMenuParametresHotel();

  const manage =
    document.getElementById("manage");

  if(!manage){
    return;
  }

  manage.hidden = false;

  const titres = {
    profilAgents:"Profil & Agents",
    hotels:"Hôtels",
    appearance:"Apparence"
  };

  const manageTitle =
    document.getElementById("manageTitle");

  if(manageTitle){
    manageTitle.textContent =
      titres[cible] || "Paramètres";
  }

  const profil =
    document.getElementById("profil");

  const hotels =
    document.getElementById("hotels");

  const appearance =
    document.getElementById("appearance");

  if(profil){
    profil.hidden =
      cible !== "profilAgents";
  }

  if(hotels){
    hotels.hidden =
      cible !== "hotels";
  }

  if(appearance){
    appearance.hidden =
      cible !== "appearance";
  }

  if(
    cible === "profilAgents" &&
    typeof renderHotelAgentsAdmin === "function"
  ){
    renderHotelAgentsAdmin();
  }

  manage.scrollIntoView({
    behavior:"smooth",
    block:"start"
  });
}
/* ==========================================================
   BOUTONS POPUP PARAMETRES
   ========================================================== */

hotelQuickProfil.addEventListener(
  "click",
  () => {
    ouvrirAdministrationHotelSur(
      "profilAgents"
    );
  }
);

hotelQuickHotels.addEventListener(
  "click",
  () => {
    ouvrirAdministrationHotelSur(
      "hotels"
    );
  }
);

hotelQuickAppearance.addEventListener(
  "click",
  () => {
    ouvrirAdministrationHotelSur(
      "appearance"
    );
  }
);

hotelQuickCancel.addEventListener(
  "click",
  fermerMenuParametresHotel
);

hotelSettingsMenu.addEventListener(
  "click",
  event => {

    if(
      event.target ===
      hotelSettingsMenu
    ){
      fermerMenuParametresHotel();
    }
  }
);
/* ==========================================================
   ACCUEIL HOTEL - 3 CHOIX
   ========================================================== */

function afficherAccueilHotel(){

  const accueil =
    document.getElementById("hotelHomeMenu");

  const nouvelle =
    document.getElementById("normalRequestZone");

  const modification =
    document.getElementById("modificationRequestZone");

  const details =
    document.getElementById("modificationDetailsZone");

  if(accueil){
    accueil.hidden = false;
  }

  if(nouvelle){
    nouvelle.hidden = true;
  }

  if(modification){
    modification.hidden = true;
  }

  if(details){
    details.hidden = true;
  }
}


function ouvrirNouvelleDemandeHotel(){

  const popup =
    document.getElementById("newRequestPopup");

  const normal =
    document.getElementById("normalRequestZone");

  if(normal){
    normal.hidden = false;
  }

  if(popup){
    popup.hidden = false;
  }
}

function fermerNouvelleDemandeHotel(){

  const popup =
    document.getElementById("newRequestPopup");

  if(popup){
    popup.hidden = true;
  }
}

function ouvrirModificationHotel(){

  const accueil =
    document.getElementById("hotelHomeMenu");

  if(accueil){
    accueil.hidden = true;
  }

  afficherModeDemandeHotel("modification");
  afficherActionModificationHotel("remplacer");
}



if($("homeNewRequest")){
  $("homeNewRequest").onclick =
    ouvrirNouvelleDemandeHotel;
}

if($("closeNewRequestPopup")){
  $("closeNewRequestPopup").onclick =
    fermerNouvelleDemandeHotel;
}
if($("homeCancelRequest")){
  $("homeCancelRequest").onclick = () => {
    alert("Annulation à venir");
  };
}

if($("homeModifyRequest")){
  $("homeModifyRequest").onclick =
    ouvrirModificationHotel;
}

/* ==========================================================
   v80 - INITIALISATION APRES DECLARATION DES VARIABLES
   ========================================================== */

afficherAccueilHotel();


/* ==========================================================
   v83 - RECHERCHE D'UN AGENT
   ========================================================== */
function initialiserRechercheAgentHotel(){

  const input =
    document.getElementById(
      "agentNom"
    );

  if(!input){
    return;
  }

 input.addEventListener(
  "input",
  () => {
    renderHotelAgentsAdmin(false);
  }
);
}

if(document.readyState === "loading"){

  document.addEventListener(
    "DOMContentLoaded",
    initialiserRechercheAgentHotel,
    {once:true}
  );

}else{

  initialiserRechercheAgentHotel();
}


/* ==========================================================
   v87 - POPUP SELECTION AGENTS
   ========================================================== */
function initialiserSelectionAgentsHotel(){

  const normalBtn =
    document.getElementById("chooseNormalAgents");

  const modBtn =
    document.getElementById("chooseModAgents");

  const closeBtn =
    document.getElementById("closeAgentsPicker");

  const cancelBtn =
    document.getElementById("cancelAgentsPicker");

  const validateBtn =
    document.getElementById("validateAgentsPicker");

  const search =
    document.getElementById("agentsPickerSearch");

  const overlay =
    document.getElementById("hotelAgentsPicker");

  if(normalBtn){
    normalBtn.addEventListener(
      "click",
      ()=>ouvrirSelectionAgentsHotel("normal")
    );
  }

  if(modBtn){
    modBtn.addEventListener(
      "click",
      ()=>ouvrirSelectionAgentsHotel("modification")
    );
  }

  if(closeBtn){
    closeBtn.addEventListener(
      "click",
      fermerSelectionAgentsHotel
    );
  }

  if(cancelBtn){
    cancelBtn.addEventListener(
      "click",
      fermerSelectionAgentsHotel
    );
  }

  if(validateBtn){
    validateBtn.addEventListener(
      "click",
      validerSelectionAgentsHotel
    );
  }

  if(search){
    search.addEventListener(
      "input",
      renderAgentsPickerHotel
    );
  }

  if(overlay){
    overlay.addEventListener(
      "click",
      event=>{
        if(event.target===overlay){
          fermerSelectionAgentsHotel();
        }
      }
    );
  }

  actualiserCompteursAgentsHotel();
}

if(document.readyState==="loading"){

  document.addEventListener(
    "DOMContentLoaded",
    initialiserSelectionAgentsHotel,
    {once:true}
  );

}else{

  initialiserSelectionAgentsHotel();
}


/* ==========================================================
   v93 - RECUPERATION ET CONSOLIDATION DES AGENTS LOCAUX
   ========================================================== */
function resynchroniserAgentsHotelApresChargement(){

  hotelAgents =
    chargerAgentsHotelAvecRecuperation();

  if(
    Array.isArray(
      selectedHotelAgents
    )
  ){
    selectedHotelAgents =
      selectedHotelAgents.filter(
        nom =>
          hotelAgents.includes(nom)
      );
  }

  if(
    typeof renderHotelAgentsAdmin ===
      "function"
  ){
    renderHotelAgentsAdmin();
  }

  if(
    typeof renderModificationAgents ===
      "function"
  ){
    renderModificationAgents();
  }

  if(
    typeof actualiserCompteursAgentsHotel ===
      "function"
  ){
    actualiserCompteursAgentsHotel();
  }
}

if(document.readyState==="loading"){

  document.addEventListener(
    "DOMContentLoaded",
    resynchroniserAgentsHotelApresChargement,
    {once:true}
  );

}else{

  resynchroniserAgentsHotelApresChargement();
}


/* ==========================================================
   V110 - NETTOYAGE ANCIENS CACHES / SERVICE WORKERS
   La détection de mise à jour reste active via version.json.
   ========================================================== */
async function nettoyerAncienCacheHotel(){
  try{
    if("serviceWorker" in navigator){
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        regs.map(reg => reg.unregister())
      );
    }
  }catch(err){
    console.log("Nettoyage Service Worker :", err);
  }

  try{
    if("caches" in window){
      const noms = await caches.keys();
      await Promise.all(
        noms.map(nom => caches.delete(nom))
      );
    }
  }catch(err){
    console.log("Nettoyage caches :", err);
  }
}

if(document.readyState === "loading"){
  document.addEventListener(
    "DOMContentLoaded",
    nettoyerAncienCacheHotel,
    { once:true }
  );
}else{
  nettoyerAncienCacheHotel();
}


/* ==========================================================
   V120 - Petit-déjeuner Modification / Annulation
   ========================================================== */
function installerPetitDejeunerModificationV120(){
  const oui = document.getElementById("modBreakfastYes");
  const non = document.getElementById("modBreakfastNo");

  if(!oui || !non) return;

  function choisir(valeur){
    oui.classList.toggle("active", valeur === "OUI");
    non.classList.toggle("active", valeur === "NON");

    try{
      sessionStorage.setItem(
        "hotel_modification_petit_dejeuner",
        valeur
      );
    }catch(e){}
  }

  oui.onclick = () => choisir("OUI");
  non.onclick = () => choisir("NON");

  let valeur = "OUI";
  try{
    valeur =
      sessionStorage.getItem(
        "hotel_modification_petit_dejeuner"
      ) || "OUI";
  }catch(e){}

  choisir(valeur);
}

if(document.readyState === "loading"){
  document.addEventListener(
    "DOMContentLoaded",
    installerPetitDejeunerModificationV120,
    {once:true}
  );
}else{
  installerPetitDejeunerModificationV120();
}

function actualiserListeProfilAgents(afficherTout = false){
hotelAgents =
  chargerAgentsHotelAvecRecuperation();
  const liste =
    document.getElementById("profilAgentsList");

  const input =
    document.getElementById("profilNom");

  if(!liste || !input){
    return;
  }

  const recherche =
    normaliserAgentHotel(input.value)
      .toLocaleUpperCase("fr-FR");

  let agents =
    hotelAgents.slice();

  /* Quand on clique dans Profil :
     on affiche TOUS les agents */
  if(!afficherTout && recherche){

    agents =
      agents.filter(nom =>
        String(nom)
          .toLocaleUpperCase("fr-FR")
          .includes(recherche)
      );
  }

  agents.sort(
    (a,b)=>a.localeCompare(b,"fr")
  );

  if(!agents.length){

    liste.innerHTML =
      '<div class="search-empty">Aucun agent trouvé</div>';

    liste.hidden = false;
    return;
  }

  liste.innerHTML =
    agents.map(nom=>`
      <button
        type="button"
        class="search-result"
        data-agent="${nom.replace(/"/g,"&quot;")}"
      >
        ${nom}
      </button>
    `).join("");

  liste.hidden = false;

  liste
    .querySelectorAll("[data-agent]")
    .forEach(btn=>{

      btn.onclick = ()=>{

        input.value =
          btn.dataset.agent;

        liste.hidden = true;
      };

    });
}


/* ==========================================================
   PROFIL - LISTE DES AGENTS
   ========================================================== */

const profilNomInput =
  document.getElementById("profilNom");

if(profilNomInput){

  /* Clic dans le champ = liste complète */
profilNomInput.addEventListener(
  "click",
  ()=>{
    actualiserListeProfilAgents(true);
  }
);

  /* Quand on tape = filtrage */
  profilNomInput.addEventListener(
    "input",
    ()=>{
      actualiserListeProfilAgents(false);
    }
  );

  profilNomInput.addEventListener(
    "blur",
    ()=>{
      setTimeout(
        ()=>{
          const liste =
            document.getElementById("profilAgentsList");

          if(liste){
            liste.hidden = true;
          }
        },
        250
      );
    }
  );
}

/* ==========================================================
   PROFIL & AGENTS - AFFICHER / MASQUER LA LISTE
   ========================================================== */

const toggleAgentsList =
  document.getElementById("toggleAgentsList");

const agentsAdminListToggle =
  document.getElementById("agentsAdminList");

if(
  toggleAgentsList &&
  agentsAdminListToggle
){

  toggleAgentsList.addEventListener(
    "click",
    () => {

      if(agentsAdminListToggle.hidden){

        hotelAgents =
          chargerAgentsHotelAvecRecuperation();

        renderHotelAgentsAdmin(true);

        toggleAgentsList.textContent =
          "Masquer les agents";

      }else{

        agentsAdminListToggle.hidden = true;

        toggleAgentsList.textContent =
          "👥 Voir les agents";
      }
    }
  );

}
/* ==========================================================
   SUPPRIMER MON PROFIL
   ========================================================== */

const deleteProfil =
  document.getElementById("deleteProfil");

if(deleteProfil){

  deleteProfil.onclick = () => {

    if(
      !confirm(
        "Effacer le profil enregistré ?"
      )
    ){
      return;
    }

    profil = {};

    save(
      LS_P,
      profil
    );

    const champ =
      document.getElementById("profilNom");

    if(champ){
      champ.value = "";
    }
  };
}
/* ==========================================================
   RESERVATION - PETITES POUBELLES
   ========================================================== */

const clearDestNom =
  document.getElementById("clearDestNom");

if(clearDestNom){

  clearDestNom.onclick = () => {

    const champ =
      document.getElementById("destNom");

    if(champ){
      champ.value = "";
    }

    dest.nom = "";

    save(
      LS_D,
      dest
    );
  };
}


const clearDestMail =
  document.getElementById("clearDestMail");

if(clearDestMail){

  clearDestMail.onclick = () => {

    const champ =
      document.getElementById("destMail");

    if(champ){
      champ.value = "";
    }

    dest.email = "";

    save(
      LS_D,
      dest
    );
  };
}

/* ==========================================================
   POUBELLES PROFIL / RESERVATION
   ========================================================== */

/* MON PROFIL */
const btnDeleteProfil =
  document.getElementById("deleteProfil");

if(btnDeleteProfil){

  btnDeleteProfil.onclick = () => {

    const champ =
      document.getElementById("profilNom");

    if(champ){
      champ.value = "";
    }

    profil = {};
    save(LS_P, profil);
  };
}


/* SERVICE LOGEMENT */
const btnClearDestNom =
  document.getElementById("clearDestNom");

if(btnClearDestNom){

  btnClearDestNom.onclick = () => {

    const champ =
      document.getElementById("destNom");

    if(champ){
      champ.value = "";
    }

    dest.nom = "";
    save(LS_D, dest);
  };
}


/* ADRESSE E-MAIL */
const btnClearDestMail =
  document.getElementById("clearDestMail");

if(btnClearDestMail){

  btnClearDestMail.onclick = () => {

    const champ =
      document.getElementById("destMail");

    if(champ){
      champ.value = "";
    }

    dest.email = "";
    save(LS_D, dest);
  };
}
/* ==========================================================
   APPARENCE - OUVRIR / FERMER COULEURS PERSONNALISEES
   ========================================================== */

const toggleCustomColors =
  document.getElementById("toggleCustomColors");

const customColorsPanel =
  document.getElementById("customColorsPanel");

if(toggleCustomColors && customColorsPanel){

  toggleCustomColors.addEventListener(
    "click",
    () => {

      if(customColorsPanel.hasAttribute("hidden")){

        customColorsPanel.removeAttribute("hidden");

        toggleCustomColors.textContent =
          "🎨 Masquer les couleurs personnalisées";

      }else{

        customColorsPanel.setAttribute("hidden","");

        toggleCustomColors.textContent =
          "🎨 Couleurs personnalisées";
      }
    }
  );
}
