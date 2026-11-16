// Rangement automatique d'une saisie libre : course, événement, rappel ou lien.
// Aucune IA : des règles simples sur les dates, heures et mots-clés en français.

const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const sansAccent = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");

const JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const MOIS = ["janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "decembre"];
const MOIS_RE = "(janv(?:ier)?|fevr?(?:ier)?|mars|avr(?:il)?|mai|juin|juil(?:let)?|aout|sept(?:embre)?|oct(?:obre)?|nov(?:embre)?|dec(?:embre)?)\\.?";

const MOTS_RAPPEL = /\b(avant|payer|paye|regler|signer|rendre|rapporter|ramener|inscrire|inscription|renouveler|resilier|appeler|rappeler|penser a|pense a|envoyer|deposer|prendre rdv|prendre rendez-vous|reserver|commander|verifier|changer|vacciner|vermifuge|collier|declarer|imprimer|preparer|faire)\b/;
const MOTS_EVENT = /\b(rdv|rendez-vous|rendez vous|reunion|anniversaire|anniv|diner|dejeuner|repas|soiree|sortie|spectacle|kermesse|fete|mariage|bapteme|match|cours|medecin|docteur|veto|veterinaire|dentiste|pediatre|orthodontiste|ophtalmo|kine|osteo|coiffeur|vaccin|visite|entretien|garage|controle technique|bebe sitter|baby-sitter|nounou|cinema|resto|restaurant)\b/;
const MOTS_COURSE = /^(acheter|racheter|achete|prendre|plus de|il manque|il n'y a plus de|manque|courses?\s*:)\s+/;
const MOTS_UNJOUR = /^(un jour|plus tard|quand on pourra)\s*:?\s+/;

// Prochaine date pour un jour de la semaine (aujourd'hui compris)
function prochainJour(base, jour, semaineProchaine) {
  const d = new Date(base);
  let delta = (jour - d.getDay() + 7) % 7;
  if (semaineProchaine && delta < 7) delta += delta === 0 ? 7 : 7;
  d.setDate(d.getDate() + delta);
  return d;
}

// Extrait la date et l'heure ; renvoie aussi le texte nettoyé
export function extraire(texte, maintenant = new Date()) {
  const base = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate());
  let t = " " + texte + " ";
  let n = sansAccent(t.toLowerCase());
  let date = null, heure = "";
  const retirer = (m) => {
    // retire le passage trouvé dans les deux versions du texte (mêmes positions)
    const i = m.index, l = m[0].length;
    t = t.slice(0, i) + " " + t.slice(i + l);
    n = n.slice(0, i) + " " + n.slice(i + l);
  };
  let m;

  // Heure : 17h, 17h30, 17 h 30, 17:30, à 9h
  if ((m = /\s(?:a\s+|vers\s+|des\s+)?([01]?\d|2[0-3])\s*(?:h|:)\s*([0-5]\d)?(?=[\s,.;!?)]|$)/.exec(n))) {
    heure = `${pad(Number(m[1]))}:${m[2] || "00"}`;
    retirer(m);
  } else if ((m = /\s(?:a\s+)?midi(?=[\s,.;!?]|$)/.exec(n))) { heure = "12:00"; retirer(m); }

  // Dates relatives
  if ((m = /\s(?:pour\s+|d'ici\s+)?aujourd'?hui\s/.exec(n)) || (m = /\sce soir\s/.exec(n))) { date = new Date(base); retirer(m); }
  else if ((m = /\sapres[- ]demain\s/.exec(n))) { date = new Date(base); date.setDate(date.getDate() + 2); retirer(m); }
  else if ((m = /\s(?:pour\s+)?demain(?:\s+(?:matin|soir|midi|apres-midi))?\s/.exec(n))) { date = new Date(base); date.setDate(date.getDate() + 1); retirer(m); }
  else if ((m = /\sdans\s+(\d+|un|une|deux|trois|quatre|quinze)\s+(jours?|semaines?|mois|ans?)\s/.exec(n))) {
    const mots = { un: 1, une: 1, deux: 2, trois: 3, quatre: 4, quinze: 15 };
    const k = mots[m[1]] || Number(m[1]);
    date = new Date(base);
    if (m[2].startsWith("jour")) date.setDate(date.getDate() + k);
    else if (m[2].startsWith("semaine")) date.setDate(date.getDate() + 7 * k);
    else if (m[2] === "mois") date.setMonth(date.getMonth() + k);
    else date.setFullYear(date.getFullYear() + k);
    retirer(m);
  }
  else if ((m = /\s(?:la\s+)?semaine prochaine\s/.exec(n))) { date = prochainJour(base, 1, true); retirer(m); }
  // 12/03, 12/03/2027, 12-03-27
  else if ((m = /\s(?:le\s+)?(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2,4}))?\s/.exec(n))) {
    const j = Number(m[1]), mo = Number(m[2]) - 1;
    let y = m[3] ? Number(m[3]) : base.getFullYear();
    if (y < 100) y += 2000;
    if (j >= 1 && j <= 31 && mo >= 0 && mo <= 11) {
      date = new Date(y, mo, j);
      if (!m[3] && date < base) date.setFullYear(y + 1);
      retirer(m);
    }
  }
  // 12 mars, lundi 12 mars, le 1er décembre
  if (!date && (m = new RegExp("\\s(?:(?:le|lun\\.?|lundi|mar\\.?|mardi|mer\\.?|mercredi|jeu\\.?|jeudi|ven\\.?|vendredi|sam\\.?|samedi|dim\\.?|dimanche)\\s+)?(\\d{1,2})(?:er)?\\s+" + MOIS_RE + "(?:\\s+(\\d{4}))?\\s").exec(n))) {
    const j = Number(m[1]);
    const mo = MOIS.findIndex((x) => x.startsWith(m[2].replace(/\.$/, "").slice(0, 3)));
    let y = m[3] ? Number(m[3]) : base.getFullYear();
    if (mo >= 0 && j >= 1 && j <= 31) {
      date = new Date(y, mo, j);
      if (!m[3] && date < base) date.setFullYear(y + 1);
      retirer(m);
    }
  }
  // samedi, mardi prochain, ce vendredi
  if (!date && (m = /\s(?:ce\s+|le\s+)?(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)(\s+prochain)?(?:\s+(?:matin|soir|midi|apres-midi))?\s/.exec(n))) {
    date = prochainJour(base, JOURS.indexOf(m[1]), !!m[2]);
    retirer(m);
  }
  // le 14 (jour du mois seul)
  if (!date && (m = /\sle\s+(\d{1,2})(?:er)?\s/.exec(n))) {
    const j = Number(m[1]);
    if (j >= 1 && j <= 31) {
      date = new Date(base.getFullYear(), base.getMonth(), j);
      if (date < base) date = new Date(base.getFullYear(), base.getMonth() + 1, j);
      retirer(m);
    }
  }
  return { date: date ? iso(date) : "", heure, reste: t, resteN: n };
}

function nettoyer(s) {
  s = s.replace(/\s+/g, " ").replace(/\s+([,.;!?])/g, "$1").trim();
  s = s.replace(/^(?:[,.;:\-–]|le|la|les|a|à|pour|de|du)\s+/i, "").replace(/\s+(?:le|la|à|a|pour|de|du|avant|et)$/i, "").replace(/[,;:\-–]+$/, "").trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

// Classe une ligne. Renvoie un ou plusieurs éléments.
export function classer(ligne, maintenant = new Date()) {
  const brut = ligne.trim();
  if (!brut) return [];
  const url = brut.match(/https?:\/\/\S+/);
  if (url) {
    const titre = nettoyer(brut.replace(url[0], ""));
    return [{ type: "lien", url: url[0].replace(/[),.;]+$/, ""), titre, note: "" }];
  }
  const low = sansAccent(brut.toLowerCase());
  const unjour = MOTS_UNJOUR.exec(low);
  if (unjour) return [{ type: "course", liste: "unjour", titre: nettoyer(brut.slice(unjour[0].length)) }];
  const achat = MOTS_COURSE.exec(low);
  if (achat) {
    const reste = brut.slice(achat[0].length);
    return reste.split(/\s*(?:,|\bet\b|\+)\s*/).map(nettoyer).filter(Boolean).map((titre) => ({ type: "course", liste: "urgent", titre }));
  }

  const { date, heure, reste, resteN } = extraire(brut, maintenant);
  const avant = /\bavant\b/.test(low) || /\b(au plus tard|date limite|dernier delai)\b/.test(low);
  const estRappel = MOTS_RAPPEL.test(low);
  const estEvent = MOTS_EVENT.test(low);
  const titre = nettoyer(reste.replace(/\b(?:au plus tard|date limite|dernier délai|avant)\b/gi, " "));

  if (date || heure) {
    const d = date || iso(new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate()));
    if (avant || (estRappel && !estEvent && !heure)) return [{ type: "rappel", titre, date: d, heure, note: heure ? `à ${heure.replace(":", " h ")}` : "" }];
    return [{ type: "evenement", titre, date: d, heure }];
  }
  if (estRappel || estEvent) {
    return [{ type: "rappel", titre, date: iso(new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate())), heure: "" }];
  }
  // Par défaut : des courses. « lait, pain, œufs » donne trois articles.
  const parts = brut.split(/\s*[,;+]\s*/).map(nettoyer).filter(Boolean);
  if (parts.length > 1 && parts.every((p) => p.split(" ").length <= 4)) return parts.map((titre) => ({ type: "course", liste: "urgent", titre }));
  return [{ type: "course", liste: "urgent", titre: nettoyer(brut) }];
}

// Plusieurs lignes collées : chaque ligne est rangée séparément.
export function classerTout(texte, maintenant = new Date()) {
  return texte.split(/\n+/).flatMap((l) => classer(l, maintenant)).filter((e) => (e.titre || e.url));
}
