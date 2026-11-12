import type { Lang } from "./config";

/**
 * French — the default language. Kept deliberately simple: short sentences,
 * plain words, jargon only when it IS the lesson (subnet, dB…).
 */
const fr = {
  meta: {
    home: {
      title: "NetLab — Boîte à outils télécoms & réseaux",
      description:
        "Calculatrice IP, formules télécoms et quiz de révision — un site simple pour réviser les réseaux, en français.",
    },
    subnet: {
      title: "Calculatrice IP",
      description:
        "Adresse réseau, broadcast, plage d'hôtes, masque et vue binaire — tout se calcule en direct, avec le découpage en sous-réseaux.",
    },
    formulas: {
      title: "Formules télécoms",
      description:
        "Huit calculateurs simples : dB, dBm, Shannon, SNR, affaiblissement, bilan de liaison, Nyquist et temps de transfert. La formule est toujours affichée.",
    },
    quiz: {
      title: "Quiz de révision",
      description:
        "Dix questions par série, avec une explication après chaque réponse. Les scores sont sauvegardés si vous êtes connecté.",
    },
    blog: {
      title: "Notes de cours",
      description:
        "Des articles courts pour réviser : OSI, sous-réseaux, VLAN, Shannon et 5G — filtrez par thème ou cherchez.",
    },
    notFound: {
      title: "Page introuvable",
    },
  },

  nav: {
    subnet: "Calculatrice",
    formulas: "Formules",
    quiz: "Quiz",
    blog: "Blog",
    signIn: "Connexion",
    admin: "admin",
    signOut: "Se déconnecter",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    langLabel: "Langue",
  },

  hero: {
    eyebrow: "télécoms & réseaux · révision",
    titleA: "Comprendre le réseau,",
    titlePre: "des",
    titleAccent1: "bits",
    titleMid: "aux",
    titleAccent2: "ondes",
    sub: "Des calculateurs simples, des formules prêtes à l'emploi et des quiz pour réviser — pensés pour les étudiants en télécommunications.",
    ctaPrimary: "Ouvrir la calculatrice",
    ctaSecondary: "S'entraîner au quiz",
  },

  home: {
    toolsEyebrow: "les outils",
    toolsTitle: "Trois outils, un objectif : réussir",
    allFormulas: "toutes les formules",
    latestEyebrow: "derniers articles",
    latestTitle: "Nouveautés du blog",
    allArticles: "tous les articles",
    emptyTitle: "Le blog attend son premier article",
    emptySubBefore: "Publiez-en un depuis le ",
    emptySubLink: "panneau admin",
    emptySubAfter: ".",
  },

  tools: [
    {
      href: "/subnet",
      title: "Calculatrice IP",
      description:
        "Adresse réseau, broadcast, plage d'hôtes, masques, vue binaire — et découpage en N sous-réseaux.",
      glyph: "/24",
    },
    {
      href: "/formulas",
      title: "Formules télécoms",
      description:
        "Huit calculateurs : dB, dBm, Shannon, SNR, affaiblissement, bilan de liaison, Nyquist et plus.",
      glyph: "dB",
    },
    {
      href: "/quiz",
      title: "Quiz d'entraînement",
      description:
        "Questions générées à l'infini plus une banque de théorie — une explication après chaque réponse.",
      glyph: "?",
    },
    {
      href: "/blog",
      title: "Notes de cours",
      description:
        "Des articles courts sur OSI, le routage, le sans-fil et la 5G — écrits pour réviser, pas pour endormir.",
      glyph: "§",
    },
  ],

  footer: {
    tagline: "télécom · réseaux · révisions",
    madeFor: "fait pour les étudiants ·",
  },

  categories: {
    OSI: "OSI",
    Routing: "Routage",
    Wireless: "Sans-fil",
    Fiber: "Fibre",
    "5G": "5G",
    Security: "Sécurité",
  } as Record<string, string>,

  read: "lire",
  open: "ouvrir",
  allArticles: "tous les articles",
  backToBlog: "retour au blog",
  draft: "brouillon",

  subnet: {
    eyebrow: "outil 01 — ipv4",
    title: "Calculatrice IP",
    intro:
      "Entrez une IP et un préfixe ou un masque — les résultats se mettent à jour pendant que vous tapez. Les bits sont colorés : ",
    introCyan: "cyan",
    introMid: " pour la partie réseau, ",
    introGray: "gris",
    introEnd: " pour la partie hôte.",
    ipAddress: "Adresse IPv4",
    prefixOrMask: "Préfixe ou masque",
    liveHint: "en direct — se met à jour en tapant · /31 et /32 gérés selon la RFC",
    network: "réseau",
    broadcast: "broadcast",
    firstHost: "premier hôte",
    lastHost: "dernier hôte",
    mask: "masque",
    wildcard: "wildcard",
    usableHosts: "hôtes utilisables",
    totalAddresses: "adresses au total",
    ipClass: "classe d'IP",
    splitTitle: "Découper en N sous-réseaux",
    splitIntro: "Découpe ",
    splitIntroEnd:
      " en empruntant le plus petit nombre de bits possible.",
    splitN: "N sous-réseaux",
    splitBtn: "découper",
    splitSummary: " bits empruntés · ",
    splitPossible: " possibles",
    splitShowing: " (affichage des premiers ",
    splitShowingEnd: ")",
    splitCap: "tableau limité à {n} lignes — le calcul est le même pour le reste",
    colNetwork: "réseau",
    colRange: "plage",
    colBroadcast: "broadcast",
    colHosts: "hôtes",
    bitsNetwork: "réseau ({n} bits)",
    bitsHost: "hôte ({n} bits)",
    binaryAria: "Représentation binaire de {ip} : les {n} premiers bits sont la partie réseau",
    copyValue: "Copier la valeur de {label}",
  },

  formulas: {
    eyebrow: "outil 02 — rf & liens",
    title: "Formules télécoms",
    intro:
      "Chaque calculateur affiche la formule exacte qu'il résout. Les résultats se mettent à jour en direct — tapez, n cliquez pas.",
    tabsAria: "Calculateurs de formules",
    dbTitle: "Décibels",
    dbmTitle: "dBm ↔ mW",
    shannonTitle: "Shannon",
    snrTitle: "SNR",
    fsplTitle: "Affaiblissement en espace libre",
    budgetTitle: "Bilan de liaison",
    nyquistTitle: "Nyquist",
    attenTitle: "Affaiblissement linéique",
    transferTitle: "Temps de transfert",
    // dB card
    toggleDbToRatio: "dB → rapport",
    toggleRatioToDb: "rapport → dB",
    togglePower: "puissance 10·log",
    toggleAmplitude: "amplitude 20·log",
    fieldDb: "dB",
    fieldLinearRatio: "rapport linéaire",
    resultRatio: "rapport",
    ratioPositive: "le rapport doit être positif — le dB est une échelle logarithmique",
    fieldPowerDbm: "puissance en dBm",
    fieldPowerMw: "puissance en mW",
    powerPositive: "la puissance doit être supérieure à 0 mW",
    // Shannon
    fieldBandwidth: "bande passante B",
    fieldSnr: "SNR",
    unitLinear: "linéaire",
    resultCapacity: "débit max C",
    resultBandwidth: "bande utilisée",
    shannonNote:
      "Un SNR en dB est converti automatiquement : linéaire = 10^(dB/10). Shannon est le plafond théorique — les vrais systèmes y consacrent une partie au codage et aux surplus.",
    // SNR
    snrFromPowers: "à partir de deux puissances",
    snrRatioToggle: "rapport ↔ dB",
    fieldSignalPower: "puissance du signal (dBm)",
    fieldNoisePower: "puissance du bruit (dBm)",
    snrLinearPositive: "le SNR linéaire doit être positif",
    // FSPL
    fieldDistance: "distance",
    fieldFrequency: "fréquence",
    resultFspl: "affaiblissement en espace libre",
    fsplNote:
      "Vue idéale en espace libre, sans obstacle. Chaque doublement de distance ou de fréquence ajoute ~6 dB — c'est pourquoi les cellules mmWave restent petites.",
    // Link budget
    fieldTxPower: "puissance émission (dBm)",
    fieldTxGain: "gain antenne émission (dBi)",
    fieldRxGain: "gain antenne réception (dBi)",
    fieldLosses: "pertes totales (dB)",
    fieldSensitivity: "sensibilité réception (dBm)",
    resultReceived: "puissance reçue",
    resultMargin: "marge de liaison",
    budgetOk: "la liaison passe avec {n} dB de marge",
    budgetFail: "la liaison échoue — il manque {n} dB",
    budgetEmpty: "remplissez tous les champs pour évaluer la liaison",
    // Nyquist
    fieldLevels: "niveaux de symbole M",
    resultNyquist: "débit max (sans bruit)",
    nyquistNote:
      "M = nombre de niveaux distincts par symbole (2 = binaire). Il faut M ≥ 2. En examen, prenez le plus petit des deux débits (Nyquist et Shannon).",
    nyquistMin: "M doit valoir au moins 2",
    // Attenuation
    fieldRate: "coefficient α",
    fieldLength: "longueur",
    fieldInputPower: "puissance d'entrée (dBm, optionnel)",
    resultLoss: "perte totale",
    resultOutputPower: "puissance de sortie",
    attenNote:
      "Valeurs typiques : fibre monomode ≈ 0,2 dB/km · multimode ≈ 3 dB/km · cuivre CAT6 ≈ 20 dB/100 m à 100 MHz.",
    // Transfer
    fieldFileSize: "taille du fichier",
    fieldLinkSpeed: "débit de la liaison",
    resultTransfer: "temps de transfert",
    transferNote:
      "Tailles en décimal (1 Mo = 10⁶ octets). L'unité de débit bascule entre bits et octets par seconde — le piège classique d'examen.",
  },

  quiz: {
    eyebrow: "outil 03 — révision d'examen",
    title: "Quiz",
    intro:
      "Dix questions par série. Chaque réponse arrive avec son explication — se tromper, c'est apprendre.",
    modesAria: "Choisir un mode",
    modes: [
      {
        id: "subnetting" as const,
        title: "Drill de sous-réseaux",
        description:
          "Générées à l'infini : broadcast, réseau, plage d'hôtes, comptages et wildcards.",
        glyph: "/27",
      },
      {
        id: "theory" as const,
        title: "Banque de théorie",
        description:
          "QCM issus de la base de questions : OSI, TCP/IP, routage, Wi-Fi, 5G.",
        glyph: "OSI",
      },
      {
        id: "mixed" as const,
        title: "Série mixte",
        description:
          "Moitié sous-réseaux, moitié théorie — le plus proche d'un vrai examen.",
        glyph: "MIX",
      },
    ],
    loading: "préparation des questions…",
    loadError:
      "Impossible de joindre la banque de questions — vérifiez la configuration Supabase puis réessayez.",
    question: "question",
    score: "score",
    difficulty: "niveau {n}/3",
    seeResults: "voir les résultats",
    nextQuestion: "question suivante",
    runComplete: "série terminée · {mode}",
    greatScore: "Tour bien claire — vous êtes prêt pour l'examen.",
    goodScore: "Bon signal. Encore une série et ce sera automatique.",
    lowScore: "Repartez des explications ci-dessous, puis refaites une série.",
    saved: "score enregistré dans votre historique",
    saving: "enregistrement…",
    guestBefore: "les scores ne sont enregistrés que si vous êtes connecté — ",
    guestLink: "se connecter",
    saveError: "enregistrement impossible — réessayez après votre prochaine série",
    missed: "Ratées ({n})",
    youPicked: "vous aviez choisi {a}",
    runAgain: "refaire une série",
    changeMode: "changer de mode",
    explanation: "explication",
    loginNext: "/quiz",
  },

  login: {
    signinTitle: "Content de vous revoir",
    signupTitle: "Créer un compte",
    signinSub: "Connectez-vous pour sauvegarder vos scores de quiz.",
    signupSub: "Un compte sauvegarde vos scores de quiz.",
    signinTab: "se connecter",
    signupTab: "s'inscrire",
    email: "e-mail",
    password: "mot de passe",
    confirmPassword: "confirmer le mot de passe",
    signinBtn: "se connecter",
    signupBtn: "créer le compte",
    mismatch: "Les mots de passe ne correspondent pas.",
    confirmFirst:
      "Confirmez d'abord votre e-mail — le lien est dans votre boîte de réception.",
    badCredentials: "E-mail ou mot de passe incorrect.",
    createdNotice:
      "Compte créé — suivez le lien de confirmation dans votre boîte mail, puis connectez-vous.",
    passwordOnly: "comptes e-mail + mot de passe ·",
    backHome: "retour à l'accueil",
  },

  notFound: {
    eyebrow: "404 · route introuvable",
    title: "Cette page a quitté le réseau",
    sub: "Cette adresse ne mène à rien. Vérifiez le lien, ou revenez vers une page connue.",
    backHome: "Retour à l'accueil",
    browse: "Voir les articles",
  },
};

export type Dict = typeof fr;

export const dictionaries: Record<Lang, Dict> = {
  fr,
  en: {
    meta: {
      home: {
        title: "NetLab — Telecom & Networking Toolkit",
        description:
          "Subnet calculator, telecom formula solvers, and networking quizzes — a simple study site, in French or English.",
      },
      subnet: {
        title: "IPv4 Subnet Calculator",
        description:
          "Network address, broadcast, host range, mask and binary view — computed live, with a subnet splitter.",
      },
      formulas: {
        title: "Telecom Formula Solvers",
        description:
          "Eight simple calculators: dB, dBm, Shannon, SNR, path loss, link budget, Nyquist and transfer time. The formula is always shown.",
      },
      quiz: {
        title: "Networking Quiz",
        description:
          "Ten questions per run, with an explanation after every answer. Scores are saved when you sign in.",
      },
      blog: {
        title: "Field Notes",
        description:
          "Short, exam-focused articles on the OSI model, subnetting, VLANs, Shannon capacity and 5G.",
      },
      notFound: { title: "Page not found" },
    },

    nav: {
      subnet: "Subnet",
      formulas: "Formulas",
      quiz: "Quiz",
      blog: "Blog",
      signIn: "Sign in",
      admin: "admin",
      signOut: "Sign out",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      langLabel: "Language",
    },

    hero: {
      eyebrow: "telecom & networking · study",
      titleA: "Master the network,",
      titlePre: "from",
      titleAccent1: "bits",
      titleMid: "to",
      titleAccent2: "beams",
      sub: "Simple calculators, ready-to-use formulas, and exam drills — a study toolkit built for telecommunications students.",
      ctaPrimary: "Open subnet calculator",
      ctaSecondary: "Practice subnetting",
    },

    home: {
      toolsEyebrow: "tools",
      toolsTitle: "Three tools, one goal: pass",
      allFormulas: "all formulas",
      latestEyebrow: "latest notes",
      latestTitle: "Fresh from the blog",
      allArticles: "all articles",
      emptyTitle: "The blog is waiting for its first post",
      emptySubBefore: "Publish one from the ",
      emptySubLink: "admin panel",
      emptySubAfter: ".",
    },

    tools: [
      {
        href: "/subnet",
        title: "Subnet calculator",
        description:
          "Network, broadcast, host range, masks, binary view — and split any block into N subnets.",
        glyph: "/24",
      },
      {
        href: "/formulas",
        title: "Formula solvers",
        description:
          "Eight live calculators: dB, dBm, Shannon, SNR, path loss, link budget, Nyquist and more.",
        glyph: "dB",
      },
      {
        href: "/quiz",
        title: "Quiz drill",
        description:
          "Generated subnetting questions plus a theory bank — explanations after every answer.",
        glyph: "?",
      },
      {
        href: "/blog",
        title: "Field notes",
        description:
          "Short articles on OSI, routing, wireless and 5G — written for exam prep, not manuals.",
        glyph: "§",
      },
    ],

    footer: {
      tagline: "telecom · networking · study toolkit",
      madeFor: "built for students ·",
    },

    categories: {
      OSI: "OSI",
      Routing: "Routing",
      Wireless: "Wireless",
      Fiber: "Fiber",
      "5G": "5G",
      Security: "Security",
    } as Record<string, string>,

    read: "read",
    open: "open",
    allArticles: "all articles",
    backToBlog: "back to the blog",
    draft: "draft",

    subnet: {
      eyebrow: "tool 01 — ipv4",
      title: "Subnet calculator",
      intro:
        "Enter an IP and a prefix or mask — results update as you type. Bits are colored by role: ",
      introCyan: "cyan",
      introMid: " for the network part, ",
      introGray: "gray",
      introEnd: " for the host part.",
      ipAddress: "IPv4 address",
      prefixOrMask: "Prefix or mask",
      liveHint: "live — updates as you type · /31 and /32 handled per RFC",
      network: "network",
      broadcast: "broadcast",
      firstHost: "first host",
      lastHost: "last host",
      mask: "mask",
      wildcard: "wildcard",
      usableHosts: "usable hosts",
      totalAddresses: "total addresses",
      ipClass: "ip class",
      splitTitle: "Split into N subnets",
      splitIntro: "Divides ",
      splitIntroEnd:
        " — borrowing the smallest number of bits that fits.",
      splitN: "N subnets",
      splitBtn: "split",
      splitSummary: " borrowed bits · ",
      splitPossible: " possible",
      splitShowing: " (showing first ",
      splitShowingEnd: ")",
      splitCap: "table capped at {n} rows — the math is the same for the rest",
      colNetwork: "network",
      colRange: "range",
      colBroadcast: "broadcast",
      colHosts: "hosts",
      bitsNetwork: "network ({n} bits)",
      bitsHost: "host ({n} bits)",
      binaryAria:
        "Binary representation of {ip}: first {n} bits are the network part",
      copyValue: "Copy {label} value",
    },

    formulas: {
      eyebrow: "tool 02 — rf & links",
      title: "Formula solvers",
      intro:
        "Every calculator shows the exact formula it solves. Results update live — type, don't click.",
      tabsAria: "Formula calculators",
      dbTitle: "Decibels",
      dbmTitle: "dBm ↔ mW",
      shannonTitle: "Shannon",
      snrTitle: "SNR",
      fsplTitle: "Free-space path loss",
      budgetTitle: "Link budget",
      nyquistTitle: "Nyquist",
      attenTitle: "Attenuation",
      transferTitle: "Transfer time",
      toggleDbToRatio: "dB → ratio",
      toggleRatioToDb: "ratio → dB",
      togglePower: "power 10·log",
      toggleAmplitude: "amplitude 20·log",
      fieldDb: "dB",
      fieldLinearRatio: "linear ratio",
      resultRatio: "ratio",
      ratioPositive: "ratio must be positive — dB is a log scale",
      fieldPowerDbm: "power in dBm",
      fieldPowerMw: "power in mW",
      powerPositive: "power must be greater than 0 mW",
      fieldBandwidth: "bandwidth B",
      fieldSnr: "SNR",
      unitLinear: "linear",
      resultCapacity: "max data rate C",
      resultBandwidth: "bandwidth used",
      shannonNote:
        "SNR in dB is converted internally: linear = 10^(dB/10). Shannon is the theoretical ceiling — real systems spend part of it on coding and overhead.",
      snrFromPowers: "from two powers",
      snrRatioToggle: "ratio ↔ dB",
      fieldSignalPower: "signal power (dBm)",
      fieldNoisePower: "noise power (dBm)",
      snrLinearPositive: "linear SNR must be positive",
      fieldDistance: "distance",
      fieldFrequency: "frequency",
      resultFspl: "free-space path loss",
      fsplNote:
        "Ideal line-of-sight in free space. Each doubling of distance or frequency adds ~6 dB — the reason mmWave cells stay small.",
      fieldTxPower: "tx power (dBm)",
      fieldTxGain: "tx antenna gain (dBi)",
      fieldRxGain: "rx antenna gain (dBi)",
      fieldLosses: "total losses (dB)",
      fieldSensitivity: "rx sensitivity (dBm)",
      resultReceived: "received power",
      resultMargin: "link margin",
      budgetOk: "link closes with {n} dB of headroom",
      budgetFail: "link fails — short by {n} dB",
      budgetEmpty: "fill every field to evaluate the link",
      fieldLevels: "symbol levels M",
      resultNyquist: "max bit rate (noiseless)",
      nyquistNote:
        "M = distinct symbol levels per symbol (2 = binary). Needs M ≥ 2. On an exam, take the smaller of Nyquist and Shannon.",
      nyquistMin: "M must be at least 2 levels",
      fieldRate: "attenuation rate α",
      fieldLength: "length",
      fieldInputPower: "input power (dBm, optional)",
      resultLoss: "total loss",
      resultOutputPower: "output power",
      attenNote:
        "Typical α: single-mode fiber ≈ 0.2 dB/km · multimode ≈ 3 dB/km · CAT6 copper ≈ 20 dB/100m at 100 MHz.",
      fieldFileSize: "file size",
      fieldLinkSpeed: "link speed",
      resultTransfer: "transfer time",
      transferNote:
        "Sizes are decimal (MB = 10⁶ bytes). Speed unit switches between bits and bytes per second — the classic exam trap.",
    },

    quiz: {
      eyebrow: "tool 03 — exam drill",
      title: "Quiz",
      intro:
        "Ten questions per run. Every answer comes with an explanation — wrong ones are the point.",
      modesAria: "Pick a mode",
      modes: [
        {
          id: "subnetting" as const,
          title: "Subnetting drill",
          description:
            "Endlessly generated: broadcast, network, host range, counts and wildcards.",
          glyph: "/27",
        },
        {
          id: "theory" as const,
          title: "Theory bank",
          description:
            "Multiple-choice from the question database: OSI, TCP/IP, routing, Wi-Fi, 5G.",
          glyph: "OSI",
        },
        {
          id: "mixed" as const,
          title: "Mixed run",
          description:
            "Half subnetting, half theory — closest to the real exam.",
          glyph: "MIX",
        },
      ],
      loading: "preparing questions…",
      loadError:
        "Couldn't reach the question bank — check the Supabase setup and try again.",
      question: "question",
      score: "score",
      difficulty: "difficulty {n}/3",
      seeResults: "see results",
      nextQuestion: "next question",
      runComplete: "run complete · {mode}",
      greatScore: "Tower status: clear — that's exam-ready.",
      goodScore: "Solid signal. One more drill and it's automatic.",
      lowScore: "Rebuild from the explanations below, then run it again.",
      saved: "score saved to your history",
      saving: "saving…",
      guestBefore: "scores are saved only when signed in — ",
      guestLink: "sign in",
      saveError: "couldn't save the score — try again after your next run",
      missed: "Missed ({n})",
      youPicked: "you picked {a}",
      runAgain: "run again",
      changeMode: "change mode",
      explanation: "explanation",
      loginNext: "/quiz",
    },

    login: {
      signinTitle: "Welcome back",
      signupTitle: "Create an account",
      signinSub: "Sign in to save your quiz scores.",
      signupSub: "An account saves your quiz scores.",
      signinTab: "sign in",
      signupTab: "sign up",
      email: "email",
      password: "password",
      confirmPassword: "confirm password",
      signinBtn: "sign in",
      signupBtn: "create account",
      mismatch: "Passwords don't match.",
      confirmFirst:
        "Confirm your email first — check your inbox for the link.",
      badCredentials: "Wrong email or password.",
      createdNotice:
        "Account created — follow the confirmation link in your inbox, then sign in.",
      passwordOnly: "password-only accounts ·",
      backHome: "back home",
    },

    notFound: {
      eyebrow: "404 · route not found",
      title: "This page dropped off the network",
      sub: "The address doesn't resolve to anything. Check the link, or head back to a known-good route.",
      backHome: "Back home",
      browse: "Browse articles",
    },
  },
};

export function getDict(lang: Lang): Dict {
  return dictionaries[lang];
}
