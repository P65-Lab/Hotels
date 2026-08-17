const APP_VERSION = "v120";
const APP_VERSION_DATE = "16/08/2026 10:15";

const $=id=>document.getElementById(id);

function afficherVersionChargeeHotel() {
  const el = document.getElementById("appVersion");
  if (!el) return;
  el.textContent = `À JOUR ${String(APP_VERSION).toUpperCase()}`;
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

setTimeout(
  actualiserListeProfilAgents,
  0
);

/* ==========================================================
   AGENTS LOCAUX
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

    actualiserListeProfilAgents();
    renderHotelAgentsAdmin();
    renderModificationAgents();

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


function renderHotelAgentsAdmin(){

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
  if(!recherche){

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

        renderHotelAgentsAdmin();
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


function agentsPourMailHotel(){

  if(selectedHotelAgents.length){
    return [...selectedHotelAgents];
  }

  return profil.nom
    ? [profil.nom]
    : [];
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

    const n =
      stayNights(s);

    return `
      <tr>

        <td
          style="
            border:1px solid #555;
            padding:12px 8px;
            text-align:center;
            color:#e11d48;
            font-weight:800;
          "
        >

          <div
            style="
              font-size:22px;
              line-height:1;
            "
          >
            ${n}
          </div>

          <div
            style="
              font-size:12px;
              margin-top:4px;
            "
          >
            ${n > 1 ? "NUITÉES" : "NUITÉE"}
          </div>

        </td>


        <td
          style="
            border:1px solid #555;
            padding:12px 8px;
            text-align:center;
            font-weight:800;
            color:#111827;
          "
        >
          ${s.ville}
        </td>


        <td
          style="
            border:1px solid #555;
            padding:12px 8px;
            text-align:center;
          "
        >
          ${s.hotel}
        </td>


        <td
          style="
            border:1px solid #555;
            padding:12px 8px;
            text-align:center;
          "
        >
          ${fr(s.arrivee)}
        </td>


        <td
          style="
            border:1px solid #555;
            padding:12px 8px;
            text-align:center;
          "
        >
          ${s.heureArrivee}
        </td>


        <td
          style="
            border:1px solid #555;
            padding:12px 8px;
            text-align:center;
          "
        >
          ${fr(s.depart)}
        </td>


        <td
          style="
            border:1px solid #555;
            padding:12px 8px;
            text-align:center;
          "
        >
          ${s.heureDepart || "--:--"}
        </td>


        <td
          style="
            border:1px solid #555;
            padding:12px 8px;
            text-align:center;
            font-weight:800;
          "
        >
          ${s.pdj ? "OUI" : "NON"}
        </td>

      </tr>
    `;

  }).join("");


  return `

    <div
      style="
        font-family:Arial,Helvetica,sans-serif;
        color:#111827;
        max-width:1000px;
        margin:0 auto;
      "
    >

      <h1
        style="
          text-align:center;
          font-size:26px;
          margin:0 0 24px;
        "
      >
        DEMANDE D’HÉBERGEMENT
      </h1>


      <p
        style="
          margin:0 0 8px;
        "
      >
        <strong>
          Agent(s) :
        </strong>

        ${texteAgentsPourMailHotel()}
      </p>


      <p
        style="
          margin:0 0 20px;
        "
      >
        <strong>
          Demande faite le :
        </strong>

        ${aujourdhui}
      </p>


      <div
        style="
          border-top:1px solid #444;
          margin-bottom:18px;
        "
      ></div>


      <table
        cellpadding="0"
        cellspacing="0"
        style="
          border-collapse:collapse;
          width:100%;
          font-size:13px;
        "
      >

        <thead>

          <tr
            style="
              background:#f3f4f6;
            "
          >

            <th
              style="
                border:1px solid #555;
                padding:10px 6px;
              "
            >
              NUITÉES
            </th>

            <th
              style="
                border:1px solid #555;
                padding:10px 6px;
              "
            >
              VILLE
            </th>

            <th
              style="
                border:1px solid #555;
                padding:10px 6px;
              "
            >
              HÔTEL
            </th>

            <th
              style="
                border:1px solid #555;
                padding:10px 6px;
              "
            >
              ARRIVÉE
            </th>

            <th
              style="
                border:1px solid #555;
                padding:10px 6px;
              "
            >
              HEURE
              <br>
              ARRIVÉE
            </th>

            <th
              style="
                border:1px solid #555;
                padding:10px 6px;
              "
            >
              DÉPART
            </th>

            <th
              style="
                border:1px solid #555;
                padding:10px 6px;
              "
            >
              HEURE
              <br>
              DÉPART
            </th>

            <th
              style="
                border:1px solid #555;
                padding:10px 6px;
              "
            >
              PETIT-DÉJEUNER
            </th>

          </tr>

        </thead>

        <tbody>
          ${rows}
        </tbody>

      </table>


      <p
        style="
          margin-top:22px;
        "
      >
        Merci d’effectuer les réservations selon ces informations.
      </p>


      <p>
        Cordialement.
      </p>


      <p
        style="
          margin-top:26px;
        "
      >
        <strong>
          ${profil.nom || ""}
        </strong>
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

    const n =
      stayNights(s);

    lines.push(

      `${n} ${n > 1 ? "NUITÉES" : "NUITÉE"} À ${s.ville}`,

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

  try{

    if(
      navigator.clipboard &&
      window.ClipboardItem
    ){

      const item =
        new ClipboardItem({

          "text/html":
            new Blob(
              [html],
              {
                type:"text/html"
              }
            ),

          "text/plain":
            new Blob(
              [text],
              {
                type:"text/plain"
              }
            )

        });


      await navigator.clipboard.write(
        [item]
      );

      return true;
    }


    await navigator.clipboard.writeText(
      text
    );

    return true;

  }catch(err){

    return false;

  }

}


/* ==========================================================
   SEMAINES ISO POUR LE MAIL
   ========================================================== */

function numeroSemaineISO(dateISO){

  if(!dateISO){
    return null;
  }


  const p =
    dateISO
      .split("-")
      .map(Number);


  const date =
    new Date(
      Date.UTC(
        p[0],
        p[1]-1,
        p[2]
      )
    );


  // Jeudi de la semaine ISO
  const jour =
    date.getUTCDay() || 7;


  date.setUTCDate(
    date.getUTCDate() +
    4 -
    jour
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
        date -
        debutAnnee
      ) /
      86400000 +
      1
    ) /
    7
  );

}


function semainesDesSejours(list){

  const semaines =
    new Set();


  list.forEach(s=>{

    if(
      !s.arrivee ||
      !s.depart
    ){
      return;
    }


    const debut =
      new Date(
        s.arrivee+
        "T12:00:00"
      );


    const fin =
      new Date(
        s.depart+
        "T12:00:00"
      );


    const d =
      new Date(debut);


    while(d <= fin){

      const iso = [

        d.getFullYear(),

        String(
          d.getMonth()+1
        ).padStart(
          2,
          "0"
        ),

        String(
          d.getDate()
        ).padStart(
          2,
          "0"
        )

      ].join("-");


      const sem =
        numeroSemaineISO(
          iso
        );


      if(sem !== null){

        semaines.add(
          sem
        );

      }


      d.setDate(
        d.getDate()+1
      );

    }

  });


  return [...semaines]
    .sort(
      (a,b)=>a-b
    );

}


function texteSemaines(list){

  const semaines =
    semainesDesSejours(
      list
    );


  if(!semaines.length){

    return "";

  }


  return semaines.join("/");

}


/* ==========================================================
   CREATION DU MAIL
   VERSION CORRIGEE
   ========================================================== */

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
    (
      $("profilNom")?.value ||
      profil.nom ||
      ""
    ).trim() ||
    "Agent";


  const semaines =
    texteSemaines(
      list
    );


  const sujet =
    `DEMANDE S${semaines} Mr ${nomAgent}`;


  const lignes = [];


  lignes.push(
    "Bonjour,"
  );


  lignes.push(
    ""
  );


  lignes.push(
    `Ci-joint ma demande d’hébergements pour la S.${semaines}`
  );


  lignes.push(
    ""
  );


  lignes.push(
    `Agent : ${nomAgent}`
  );


  lignes.push(
    "────────────────────────"
  );


  list.forEach(
    (s,i)=>{

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


      if(
        i <
        list.length-1
      ){

        lignes.push(
          "────────────────────────"
        );

      }

    }
  );


  lignes.push(
    ""
  );


  lignes.push(
    "Cordialement."
  );


  lignes.push(
    nomAgent
  );


  const corps =
    lignes.join(
      "\r\n"
    );


  const to =
    dest.email ||
    "";


  const mailto =
    `mailto:${encodeURIComponent(to)}` +
    `?subject=${encodeURIComponent(sujet)}` +
    `&body=${encodeURIComponent(corps)}`;


  // =========================================================
  // EFFACER LA DEMANDE EN COURS
  // =========================================================

  stays = [];

  window.__recapStays = [];

  dateDepartMemorisee = "";


  renderStays();

  clearStayForm();


  // =========================================================
  // OUVRIR LE MAIL
  // =========================================================

  location.href =
    mailto;

}


$("manageBtn").onclick=()=>{

  ouvrirMenuParametresHotel();

};


$("closeManage").onclick=()=>{

  $("manage").hidden=true;

};


function fillSettings(){

  $("profilNom").value =
    profil.nom ||
    "";

  $("destNom").value =
    dest.nom ||
    "";

  $("destMail").value =
    dest.email ||
    "";

}


if($("addAgent")){

  $("addAgent").onclick=()=>{

    const nom =
      normaliserAgentHotel(
        $("agentNom").value
      );


    if(!nom){

      alert(
        "Saisissez le nom de l’agent."
      );

      return;

    }


    if(
      hotelAgents.some(
        x=>
          norm(x) ===
          norm(nom)
      )
    ){

      alert(
        "Cet agent est déjà enregistré."
      );

      return;

    }


    hotelAgents.push(
      nom
    );


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

    const input =
      $("importAgentsFile");


    if(!input){
      return;
    }


    /*
      Permet de réimporter le même fichier
      deux fois de suite si nécessaire.
    */

    input.value="";

    input.click();

  };

}


if($("importAgentsFile")){

  $("importAgentsFile").onchange =
    async event=>{

      const fichier =
        event.target.files &&
        event.target.files[0];


      if(!fichier){
        return;
      }


      await importerAgentsDepuisFichierHotel(
        fichier
      );

    };

}


$("saveProfil").onclick=()=>{

  const nom =
    $("profilNom")
      .value
      .trim();


  if(!nom){

    alert(
      "Renseignez le nom de l’agent."
    );

    return;

  }


  profil = {
    nom:nom
  };


  save(
    LS_P,
    profil
  );


  alert(
    "Profil enregistré."
  );

};


$("cancelHotel").onclick=()=>{

  $("adminVille").value="";

  $("adminHotel").value="";


  adminVilleResults.hidden =
    true;


  adminHotelsFound.hidden =
    true;


  adminHotelsList.innerHTML =
    "";

};


$("saveDest").onclick=()=>{

  const nom =
    $("destNom")
      .value
      .trim();


  const email =
    $("destMail")
      .value
      .trim();


  if(!email){

    return alert(
      "Renseignez l’adresse e-mail."
    );

  }


  dest = {
    nom,
    email
  };


  save(
    LS_D,
    dest
  );


  alert(
    "Destinataire enregistré."
  );

};


$("cancelDest").onclick=()=>{

  $("destNom").value =
    dest.nom ||
    "";


  $("destMail").value =
    dest.email ||
    "";

};


$("deleteDest").onclick=()=>{

  if(!dest.email){

    return alert(
      "Aucun destinataire."
    );

  }


  if(
    confirm(
      "Supprimer le destinataire ?"
    )
  ){

    dest={};


    save(
      LS_D,
      dest
    );


    fillSettings();

  }

};


/* ==========================================================
   APPARENCE
   ========================================================== */

const appearanceDefaults = {

  primary:"#111827",

  mail:"#079447",

  nights:"#dc2626",

  background:"#f3f4f6",

  card:"#ffffff",

  theme:"classic"

};


const themePresets = {

  classic:{

    primary:"#111827",

    mail:"#079447",

    nights:"#dc2626",

    background:"#f3f4f6",

    card:"#ffffff"

  },


  blue:{

    primary:"#0b63d8",

    mail:"#0b63d8",

    nights:"#dc2626",

    background:"#eef5ff",

    card:"#ffffff"

  },


  green:{

    primary:"#047857",

    mail:"#079447",

    nights:"#dc2626",

    background:"#eefbf5",

    card:"#ffffff"

  },


  orange:{

    primary:"#c2410c",

    mail:"#ea580c",

    nights:"#dc2626",

    background:"#fff7ed",

    card:"#ffffff"

  },


  red:{

    primary:"#b91c1c",

    mail:"#b91c1c",

    nights:"#dc2626",

    background:"#fff1f2",

    card:"#ffffff"

  },


  dark:{

    primary:"#3b82f6",

    mail:"#16a34a",

    nights:"#f87171",

    background:"#111827",

    card:"#1f2937"

  }

};


/* ==========================================================
   SYNCHRONISATION DU MODE SOMBRE
   ========================================================== */

function synchroniserThemeHotel(){

  const nomTheme =

    (
      appearance &&
      appearance.theme
        ? String(
            appearance.theme
          )
        : ""
    ).toLowerCase();


  document.body.classList.toggle(

    "theme-dark",

    nomTheme === "dark" ||
    nomTheme === "sombre"

  );

}


document.addEventListener(

  "DOMContentLoaded",

  synchroniserThemeHotel

);


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


  $("colorPrimary").value =
    a.primary;


  $("colorMail").value =
    a.mail;


  $("colorNights").value =
    a.nights;


  $("colorBackground").value =
    a.background;


  $("colorCard").value =
    a.card;


  document
    .querySelectorAll(
      ".theme-choice"
    )
    .forEach(btn=>{

      btn.classList.toggle(

        "active",

        btn.dataset.theme ===
        a.theme

      );

    });


  setTimeout(

    synchroniserThemeHotel,

    0

  );

}
document.querySelectorAll(".theme-choice").forEach(btn=>{

  btn.addEventListener("click",()=>{

    const name =
      btn.dataset.theme;

    const preset =
      themePresets[name];

    if(!preset){
      return;
    }

    appearance = {
      ...preset,
      theme:name
    };

    save(
      LS_A,
      appearance
    );

    applyAppearance(
      appearance
    );

  });

});


$("saveAppearance").onclick=()=>{

  appearance = {

    primary:
      $("colorPrimary").value,

    mail:
      $("colorMail").value,

    nights:
      $("colorNights").value,

    background:
      $("colorBackground").value,

    card:
      $("colorCard").value,

    theme:
      "custom"

  };


  save(
    LS_A,
    appearance
  );


  applyAppearance(
    appearance
  );


  alert(
    "Couleurs enregistrées."
  );

};


$("resetAppearance").onclick=()=>{

  appearance = {
    ...appearanceDefaults
  };


  save(
    LS_A,
    appearance
  );


  applyAppearance(
    appearance
  );


  alert(
    "Couleurs réinitialisées."
  );

};


applyAppearance(
  appearance
);



if($("modeNouvelle")){

  $("modeNouvelle").onclick=()=>
    afficherModeDemandeHotel(
      "nouvelle"
    );

}


if($("modeModification")){

  $("modeModification").onclick=()=>
    afficherModeDemandeHotel(
      "modification"
    );

}


if($("modActionAnnuler")){

  $("modActionAnnuler").onclick=()=>
    afficherActionModificationHotel(
      "annuler"
    );

}


if($("modActionRemplacer")){

  $("modActionRemplacer").onclick=()=>
    afficherActionModificationHotel(
      "remplacer"
    );

}


if($("newPdjOui")){

  $("newPdjOui").onclick=()=>{

    newPdjHotel=true;

    $("newPdjOui")
      .classList.add(
        "active"
      );

    $("newPdjNon")
      .classList.remove(
        "active"
      );

  };

}


if($("newPdjNon")){

  $("newPdjNon").onclick=()=>{

    newPdjHotel=false;

    $("newPdjNon")
      .classList.add(
        "active"
      );

    $("newPdjOui")
      .classList.remove(
        "active"
      );

  };

}


if($("createModificationMail")){

  $("createModificationMail").onclick =
    construireMailModificationHotel;

}


renderHotelAgentsAdmin();

renderModificationAgents();

refreshVilles();

fillSettings();

renderStays();



/* ==========================================================
   MISE A JOUR SIMPLE ET UNIQUE
   ========================================================== */

let derniereVersionDisponible = "";


function numeroVersionHotel(v){

  const n =
    parseInt(
      String(v || "")
        .replace(
          /\D/g,
          ""
        ),
      10
    );


  return Number.isFinite(n)
    ? n
    : 0;

}


function afficherVersionChargeeHotel(){

  const el =
    document.getElementById(
      "appVersion"
    );


  if(el){

    el.textContent =
      `À JOUR ${APP_VERSION.toUpperCase()}`;

  }

}


function masquerIndicateurMiseAJourHotel(){

  derniereVersionDisponible = "";


  const badge =
    document.getElementById(
      "settingsUpdateBadge"
    );


  const card =
    document.getElementById(
      "settingsUpdateCard"
    );


  const popup =
    document.getElementById(
      "hotelPopupUpdateCard"
    );


  if(badge){

    badge.hidden=true;

    badge.classList.remove(
      "badge-update-visible"
    );

  }


  if(card){

    card.hidden=true;

  }


  if(popup){

    popup.hidden=true;

  }

}


function afficherIndicateurMiseAJourHotel(version){

  derniereVersionDisponible =
    String(
      version || ""
    ).trim();


  const badge =
    document.getElementById(
      "settingsUpdateBadge"
    );


  const card =
    document.getElementById(
      "settingsUpdateCard"
    );


  const popup =
    document.getElementById(
      "hotelPopupUpdateCard"
    );


  const text =
    document.getElementById(
      "settingsUpdateText"
    );


  const popupText =
    document.getElementById(
      "hotelPopupUpdateText"
    );


  if(badge){

    badge.hidden=false;

    badge.classList.add(
      "badge-update-visible"
    );

  }


  if(card){

    card.hidden=false;

  }


  if(popup){

    popup.hidden=false;

  }


  const message =
    `Version ${derniereVersionDisponible} disponible`;


  if(text){

    text.textContent =
      message;

  }


  if(popupText){

    popupText.textContent =
      message;

  }

}


async function verifierMiseAJourHotel(){

  try{

    const url =
      new URL(
        "./version.json",
        window.location.href
      );


    url.searchParams.set(
      "_",
      Date.now().toString()
    );


    const response =
      await fetch(
        url.href,
        {
          cache:"no-store"
        }
      );


    if(!response.ok){
      return;
    }


    const info =
      await response.json();


    const serveur =
      numeroVersionHotel(
        info.version
      );


    const chargee =
      numeroVersionHotel(
        APP_VERSION
      );


    if(
      serveur >
      chargee
    ){

      afficherIndicateurMiseAJourHotel(
        info.version
      );

    }else{

      masquerIndicateurMiseAJourHotel();

    }

  }catch(err){

    console.log(
      "Contrôle mise à jour :",
      err
    );

  }

}


async function appliquerMiseAJourHotel(){

  const cible =
    String(
      derniereVersionDisponible ||
      ""
    ).trim();


  masquerIndicateurMiseAJourHotel();


  const boutons = [

    document.getElementById(
      "settingsUpdateBtn"
    ),

    document.getElementById(
      "hotelPopupUpdateBtn"
    )

  ].filter(Boolean);


  boutons.forEach(btn=>{

    btn.disabled=true;

    btn.textContent =
      "Mise à jour en cours…";

  });


  const url =
    new URL(
      window.location.origin +
      window.location.pathname
    );


  url.searchParams.set(
    "maj",
    cible ||
    Date.now().toString()
  );


  url.searchParams.set(
    "_",
    Date.now().toString()
  );


  window.location.replace(
    url.href
  );

}


function installerControleMiseAJourHotel(){

  afficherVersionChargeeHotel();

  masquerIndicateurMiseAJourHotel();


  const btn =
    document.getElementById(
      "settingsUpdateBtn"
    );


  const popupBtn =
    document.getElementById(
      "hotelPopupUpdateBtn"
    );


  if(btn){

    btn.onclick =
      appliquerMiseAJourHotel;

  }


  if(popupBtn){

    popupBtn.onclick =
      appliquerMiseAJourHotel;

  }


  setTimeout(
    verifierMiseAJourHotel,
    1500
  );


  setInterval(
    ()=>{

      if(!document.hidden){

        verifierMiseAJourHotel();

      }

    },
    300000
  );

}


if(
  document.readyState ===
  "loading"
){

  document.addEventListener(

    "DOMContentLoaded",

    installerControleMiseAJourHotel,

    {
      once:true
    }

  );

}else{

  installerControleMiseAJourHotel();

}



/* ==========================================================
   MODIFICATION / ANNULATION
   ========================================================== */

let modeDemandeHotel =
  "nouvelle";

let modActionHotel =
  "annuler";

let newPdjHotel =
  true;


function afficherModeDemandeHotel(mode){

  modeDemandeHotel =
    mode;


  const normal =
    document.getElementById(
      "normalRequestZone"
    );


  const modification =
    document.getElementById(
      "modificationRequestZone"
    );


  const btnNew =
    document.getElementById(
      "modeNouvelle"
    );


  const btnMod =
    document.getElementById(
      "modeModification"
    );


  if(normal){

    normal.hidden =
      mode !==
      "nouvelle";

  }


  if(modification){

    modification.hidden =
      mode !==
      "modification";

  }


  if(btnNew){

    btnNew.classList.toggle(

      "active",

      mode ===
      "nouvelle"

    );

  }


  if(btnMod){

    btnMod.classList.toggle(

      "active",

      mode ===
      "modification"

    );

  }


  if(
    mode ===
    "modification"
  ){

    renderModificationAgents();

  }

}


function afficherActionModificationHotel(action){

  modActionHotel =
    action;


  const annuler =
    document.getElementById(
      "modActionAnnuler"
    );


  const remplacer =
    document.getElementById(
      "modActionRemplacer"
    );


  const zone =
    document.getElementById(
      "replacementZone"
    );


  if(annuler){

    annuler.classList.toggle(

      "active",

      action ===
      "annuler"

    );

  }


  if(remplacer){

    remplacer.classList.toggle(

      "active",

      action ===
      "remplacer"

    );

  }


  if(zone){

    zone.hidden =
      action !==
      "remplacer";

  }

}


function texteDateHotelISO(v){

  if(!v){
    return "";
  }


  const [
    y,
    m,
    d
  ] =
    v.split("-");


  return `${d}/${m}/${y}`;

}


function construireMailModificationHotel(){

  const agents =
    agentsModificationSelectionnes();


  if(!agents.length){

    alert(
      "Sélectionnez au moins un agent concerné."
    );

    return;

  }


  const ville =
    $("modVille")
      .value
      .trim();


  const hotel =
    $("modHotel")
      .value
      .trim();


  const arrivee =
    $("modArrivee")
      .value;


  const depart =
    $("modDepart")
      .value;


  if(
    !ville ||
    !hotel ||
    !arrivee ||
    !depart
  ){

    alert(
      "Renseignez la ville, l’hôtel, l’arrivée et le départ à modifier."
    );

    return;

  }


  const nomAgent =
    profil.nom ||
    "Agent";


  const lignes = [];


  lignes.push(
    "Bonjour,"
  );


  lignes.push(
    ""
  );


  if(
    modActionHotel ===
    "annuler"
  ){

    lignes.push(
      "Merci d’annuler l’hébergement suivant."
    );

  }else{

    lignes.push(
      "Suite à une modification de service, merci d’annuler l’hébergement suivant et de réserver le nouvel hébergement indiqué ci-dessous."
    );

  }


  lignes.push(
    ""
  );


  lignes.push(
    `AGENTS CONCERNÉS : ${agents.length}`
  );


  agents.forEach(
    (a,i)=>
      lignes.push(
        `${i+1}. ${a}`
      )
  );


  lignes.push(
    ""
  );


  lignes.push(
    "HÉBERGEMENT À ANNULER"
  );


  lignes.push(
    `${ville.toUpperCase()} — ${hotel.toUpperCase()}`
  );


  lignes.push(

    `Arrivée : ${texteDateHotelISO(arrivee)} à ${$("modHeureArrivee").value || "--:--"}`

  );


  lignes.push(

    `Départ : ${texteDateHotelISO(depart)} à ${$("modHeureDepart").value || "--:--"}`

  );


  if(
    modActionHotel ===
    "remplacer"
  ){

    const newVille =
      $("newVille")
        .value
        .trim();


    const newHotel =
      $("newHotel")
        .value
        .trim();


    const newArrivee =
      $("newArrivee")
        .value;


    const newDepart =
      $("newDepart")
        .value;


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


    lignes.push(
      ""
    );


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


  lignes.push(
    ""
  );


  lignes.push(
    "Cordialement."
  );


  lignes.push(
    nomAgent
  );


  const sujet =

    modActionHotel ===
    "annuler"

      ? `Annulation hébergement - ${nomAgent}`

      : `Modification hébergement - ${nomAgent}`;


  const to =
    dest.email ||
    "";


  const corps =
    lignes.join(
      "\r\n"
    );


  const outlook =

    `ms-outlook://compose?to=${encodeURIComponent(to)}` +

    `&subject=${encodeURIComponent(sujet)}` +

    `&body=${encodeURIComponent(corps)}`;


  const mailto =

    `mailto:${encodeURIComponent(to)}` +

    `?subject=${encodeURIComponent(sujet)}` +

    `&body=${encodeURIComponent(corps)}`;


  const estAndroid =
    /Android/i.test(
      navigator.userAgent
    );


  if(estAndroid){

    location.href =
      mailto;

    return;

  }


  let hidden =
    false;


  document.addEventListener(

    "visibilitychange",

    ()=>{

      if(document.hidden){

        hidden=true;

      }

    },

    {
      once:true
    }

  );


  location.href =
    outlook;


  setTimeout(

    ()=>{

      if(!hidden){

        location.href =
          mailto;

      }

    },

    1200

  );

}


/* ==========================================================
   APERCU HTML OUTLOOK CONSERVE
   ========================================================== */

function ouvrirApercuMailHtmlOutlook(list){

  const htmlMail =
    buildEmailHtml(
      list
    );


  const sujet =

    `Demande d'hébergement - ${profil.nom || "Agent"} - ${fr(list[0].arrivee)}`;


  const to =
    dest.email ||
    "";


  const page =
    window.open(
      "",
      "_blank"
    );


  if(!page){

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

<meta
  name="viewport"
  content="width=device-width,initial-scale=1"
>

<title>
  Aperçu mail Outlook
</title>

<style>

*{
  box-sizing:border-box;
}

body{
  margin:0;
  padding:24px;
  background:#f3f4f6;
  font-family:Arial,Helvetica,sans-serif;
  color:#111827;
}

.toolbar{
  position:sticky;
  top:0;
  z-index:20;

  display:flex;
  flex-wrap:wrap;
  gap:10px;

  margin:-24px -24px 20px;
  padding:14px 24px;

  background:#ffffff;
  border-bottom:1px solid #d1d5db;
}

.toolbar button{
  min-height:44px;
  padding:10px 16px;

  border:0;
  border-radius:10px;

  font:inherit;
  font-weight:800;

  cursor:pointer;
}

#copyRenderedBtn{
  background:#111827;
  color:#ffffff;
}

#openOutlookBtn{
  background:#2563eb;
  color:#ffffff;
}

.help{
  width:100%;
  margin:0;

  color:#667085;
  font-size:13px;
}

#mailRendered{
  max-width:1100px;
  margin:0 auto;

  padding:26px;

  background:#ffffff;
  border:1px solid #d1d5db;
  border-radius:12px;
}

@media(max-width:700px){

  body{
    padding:12px;
  }

  .toolbar{
    margin:-12px -12px 14px;
    padding:10px 12px;
  }

  #mailRendered{
    padding:14px;
    overflow-x:auto;
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
