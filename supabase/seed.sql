-- ═══════════════════════════════════════════════════════════════════
-- NetLab — données de départ (FR) : 5 articles + 20 questions
-- À exécuter APRÈS 0001_init.sql dans le SQL Editor de Supabase.
-- ⚠️  Ce fichier REMPLACE le contenu existant de posts et questions
--     (truncate + insert). À n'utiliser qu'au démarrage du site.
-- ═══════════════════════════════════════════════════════════════════

begin;

truncate table public.posts restart identity cascade;
truncate table public.questions restart identity cascade;

-- ───────────────────────────────────────────────────────────────────
-- ARTICLES
-- ───────────────────────────────────────────────────────────────────

insert into public.posts (title, slug, excerpt, content, category, published, created_at) values
(
  'Le modèle OSI, étage par étage',
  'modele-osi-etage-par-etage',
  $post$Les sept couches qu'on retient pour l'examen sont en vrai une liste de vérification pour trouver une panne. On descend les sept étages — avec des exemples concrets pour chacun.$post$,
  $post$## Pourquoi ce modèle existe

Avant le modèle OSI, chaque fabricant faisait les réseaux à sa manière. Le modèle découpe **toute** communication en sept couches indépendantes, pour pouvoir concevoir, comparer et — surtout — **dépanner** un étage à la fois.

> Retenir les couches, c'est facile. S'en servir pour localiser une panne, c'est la vraie compétence.

## Les sept couches, de haut en bas

| # | Couche | Ce qu'elle fait | Exemples du quotidien |
|---|--------|-----------------|----------------------|
| 7 | Application | Les données que l'utilisateur consomme | HTTP, DNS, SMTP, VoIP |
| 6 | Présentation | Format, encodage, chiffrement | TLS, JPEG, UTF-8 |
| 5 | Session | Ouvrir/fermer/synchroniser les dialogues | Sessions RPC, NetBIOS |
| 4 | Transport | Livraison fiable de bout en bout | TCP, UDP, ports |
| 3 | Réseau | Adressage logique + routage | IP, ICMP, routeurs |
| 2 | Liaison | Trames entre équipements directement reliés | Ethernet, MAC, commutateurs |
| 1 | Physique | Les bits sur un support | Câbles, radio, fibre, hubs |

## La lire comme un ascenseur de dépannage

Quand quelque casse, on remonte l'ascenseur du bas vers le haut :

1. **Physique** — le câble est branché ? La LED de lien est allumée ? (Sinon, on s'arrête là.)
2. **Liaison** — le commutateur voit-il votre adresse MAC ? Un VLAN différent ?
3. **Réseau** — avez-vous une IP ? Arrivez-vous à pinger la passerelle ?
4. **Transport** — le port est ouvert, ou bloqué par un pare-feu ?
5. **Application** — le service tourne-t-il et répond-il ?

Le piège classique en examen : *« le ping passe mais la page web ne s'ouvre pas »*. Le ping vit à la couche 3, HTTP à la couche 7 — donc le chemin réseau est bon et le problème est au-dessus du transport : service arrêté, mauvais port, ou une ACL.

## Où se place TCP/IP

Internet tourne sur le **modèle TCP/IP**, qui regroupe les couches OSI 5 à 7 en une seule couche Application. Mêmes idées, moins d'étages. Aux examens, on demande souvent de faire correspondre les deux — retenez : **OSI 5+6+7 ≈ Application TCP/IP**.

## À retenir

Les couches sont indépendantes : on peut remplacer Ethernet par le Wi-Fi (couches 1–2) sans toucher à TCP (couche 4). Cette indépendance explique pourquoi Internet évolue étage par étage — et pourquoi une vérification méthodique du bas vers le haut bat toujours les redémarrages au hasard.$post$,
  'OSI',
  true,
  now() - interval '9 days'
),
(
  'Le sous-réseau en 10 minutes : lire un CIDR',
  'lire-un-cidr-en-10-minutes',
  $post$192.168.1.0/24 n'est pas de la magie : un CIDR dit juste combien de bits sont figés. On apprend à calculer réseau, broadcast et plage d'hôtes de tête.$post$,
  $post$## Un CIDR, une seule information

`192.168.1.37/26` signifie : **les 26 premiers bits sont la partie réseau**, les 6 derniers sont la partie hôte. Tout le calcul des sous-réseaux découle de là.

## La taille du bloc, votre meilleur ami

Les bits d'hôte donnent la taille du bloc : `2^6 = 64` adresses par sous-réseau. Les blocs démarrent tous les 64 :

| Préfixe | Bits d'hôte | Taille du bloc | Adresses utilisables |
|---------|-------------|----------------|---------------------|
| /24 | 8 | 256 | 254 |
| /25 | 7 | 128 | 126 |
| /26 | 6 | 64 | 62 |
| /27 | 5 | 32 | 30 |
| /28 | 4 | 16 | 14 |
| /30 | 2 | 4 | 2 |

## La méthode en 3 étapes

Pour `192.168.1.37/26` :

1. **Taille du bloc** : 64 → les sous-réseaux sont 0, 64, 128, 192.
2. **Le bon bloc** : 37 est entre 0 et 63 → le réseau est `192.168.1.0`.
3. **Dedans** : broadcast = dernier du bloc = `192.168.1.63`. Premier hôte = `.1`, dernier hôte = `.62`.

```text
Réseau      : 192.168.1.0
1er hôte    : 192.168.1.1
Dernier     : 192.168.1.62
Broadcast   : 192.168.1.63
Masque      : 255.255.255.192
```

## Le masque, le même message autrement

`/26` et `255.255.255.192` disent la même chose. 192 = `11000000` : deux bits de plus que le dernier octet d'un /24. Pour passer d'un préfixe à un masque : les 8 premiers bits à 1 par octet complet, puis ce qui reste (26 − 24 = 2 → `10000000` + `01000000` = 128 + 64 = 192).

```cisco
Router(config)# interface gigabitEthernet 0/1
Router(config-if)# ip address 192.168.1.37 255.255.255.192
```

## Pourquoi on retire toujours 2

Dans un bloc, l'adresse **tout en zéro** est le réseau et l'adresse **tout en un** est le broadcast — aucune ne peut identifier une machine. D'où `utilisables = 2^(bits d'hôte) − 2`.

Exceptions à connaître : **/31** (lien point-à-point, RFC 3021 — les 2 adresses sont utilisables) et **/32** (une machine seule, comme une route d'hôte).

## Entraînez-vous

C'est un réflexe, pas un cours : ouvrez la [calculatrice IP](/subnet), cachez les résultats, devinez, vérifiez. Dix minutes par jour valent mieux qu'une heure la veille de l'examen.$post$,
  'Routing',
  true,
  now() - interval '7 days'
),
(
  'Les VLANs expliqués simplement',
  'les-vlans-expliques-simplement',
  $post$Un VLAN découpe un seul commutateur en plusieurs réseaux virtuels. À quoi ça sert, comment le configurer, et le fameux trunk.$post$,
  $post$## Le problème qu'ils règlent

Un commutateur normal diffuse tout le broadcast à tout le monde. 200 machines dans un bâtiment = 200 machines qui s'écoutent. Le VLAN (**V**irtual **LAN**) découpe le commutateur en plusieurs réseaux séparés : la compta d'un côté, les étudiants de l'autre, sans acheter de nouveau matériel.

## Ce qu'un VLAN change vraiment

| Sans VLAN | Avec VLANs |
|-----------|-----------|
| Un broadcast atteint tout le monde | Chaque VLAN a son domaine de broadcast |
| Tout le monde dans la même plage IP | Une plage IP par VLAN (10.1.x, 10.2.x…) |
| Sécurité = tout ou rien | On isole les groupes sensibles |
| Bouger un câble = tout re-planifier | On déplace un port vers un autre VLAN |

## La configuration, côté Cisco

```cisco
Switch(config)# vlan 10
Switch(config-vlan)# name COMPTA
Switch(config)# vlan 20
Switch(config-vlan)# name ETUDIANTS

Switch(config)# interface fastEthernet 0/5
Switch(config-if)# switchport mode access
Switch(config-if)# switchport access vlan 10
```

## Le trunk : faire passer plusieurs VLANs dans un câble

Entre deux commutateurs, un seul câble doit transporter le VLAN 10 **et** le VLAN 20. Solution : le port **trunk** ajoute une étiquette (tag 802.1Q) à chaque trame pour qu'on sache à quel VLAN elle appartient.

```cisco
Switch(config)# interface gigabitEthernet 0/1
Switch(config-if)# switchport mode trunk
Switch(config-if)# switchport trunk allowed vlan 10,20
```

## Pour parler entre VLANs, il faut un routeur

Deux VLANs = deux réseaux différents. Pour communiquer, il faut un équipement de couche 3 : un routeur (« router-on-a-stick ») ou un commutateur de couche 3 avec des interfaces virtuelles (SVI). C'est exactement le modèle OSI en action : la couche 2 sépare, la couche 3 relie — si l'administrateur l'autorise.

## Les pièges d'examen

1. **Deux ports sur le même VLAN mais pas le même commutateur** → il faut un trunk entre les deux.
2. **Native VLAN différente de part et d'autre d'un trunk** → trames mal étiquetées, panne intermittente.
3. **VLAN créé mais aucun port dedans** → il existe mais ne sert à rien.$post$,
  'Routing',
  true,
  now() - interval '5 days'
),
(
  'La formule de Shannon, enfin claire',
  'la-formule-de-shannon-enfin-claire',
  $post$C = B·log₂(1+SNR) : trois lettres qui fixent le débit maximum d'un canal bruité. D'où elle vient, comment la calculer, et les erreurs que les examinateurs attendent.$post$,
  $post$## Ce que dit la formule

Shannon répond à une seule question : **avec ce bruit, quel est le débit maximum théorique ?**

$$C = B \cdot \log_2(1 + SNR)$$

| Symbole | Signification | Unité |
|---------|---------------|-------|
| C | capacité du canal | bits/s |
| B | bande passante | Hz |
| SNR | rapport signal/bruit | **linéaire**, pas dB |

## Pourquoi le log₂

On découpe la plage de puissance reçue en `1 + SNR` niveaux séparables. Chaque symbole transporte alors `log₂(niveaux)` bits. Doubler la *puissance* rapporte bien moins que doubler le *débit* — c'est le log qui travaille.

## Exemple guidé

Canal Wi-Fi : `B = 20 MHz`, `SNR = 30 dB`.

1. On convertit le SNR : `30 dB → 10^(30/10) = 1000`.
2. `C = 20×10⁶ × log₂(1001) ≈ 20×10⁶ × 9,97 ≈ 199 Mbit/s`.

C'est le plafond théorique — les vrais protocoles 802.11 en dépensent une partie en surcoût de codage et retransmissions.

## Les trois leçons qui tombent en examen

1. **On ne met jamais un dB dans la formule.** On convertit d'abord : `SNR_linéaire = 10^(SNR_dB/10)`. Oublier la conversion est l'erreur n°1.
2. **La bande passante compte linéairement** — doublez `B`, doublez `C`. C'est pour ça que les opérateurs se battent pour le spectre.
3. **La puissance compte logarithmiquement** — passer de 20 dB à 23 dB de SNR (puissance doublée) n'ajoute que ~0,4 Mbit/s sur ce canal.

## Shannon vs Nyquist (le duo classique)

| | Shannon | Nyquist |
|---|---|---|
| Question | Débit max **avec bruit** | Débit max pour **M niveaux distincts** |
| Formule | `C = B·log₂(1+SNR)` | `C = 2·B·log₂(M)` |
| Ce qui limite | le bruit | les niveaux/symboles |

Un vrai système doit respecter **les deux** — on prend le plus petit des deux. Essayez les deux calculateurs côte à côte sur la [page formules](/formulas).$post$,
  'Wireless',
  true,
  now() - interval '3 days'
),
(
  'Comment fonctionnent vraiment les cellules 5G',
  'comment-fonctionnent-les-cellules-5g',
  $post$Massive MIMO, beamforming, network slicing, petites cellules : la physique et l'architecture derrière la diapositive marketing de la 5G.$post$,
  $post$## Trois chiffres définissent une génération

| | 4G LTE | 5G NR |
|---|---|---|
| Débit crête (théorique) | ~1 Gbit/s | 20 Gbit/s |
| Latence visée | ~30 ms | 1 ms (URLLC) |
| Densité de connexions | 10⁵/km² | 10⁶/km² |

Ces chiffres ne tombent pas du ciel : ils viennent de trois leviers concrets.

## 1. Le spectre : plus haut, plus large

La 5G utilise des bandes plus hautes — dont les ondes millimétriques (24–40 GHz). Une bande de 400 MHz offre bien plus de débit qu'une de 20 MHz. Contrepartie physique : **plus la fréquence monte, moins la porteuse va loin**. D'où les petites cellules : à 28 GHz, une antenne ne couvre qu'un quartier, pas une ville.

Règle à retenir (lien avec la [perte en espace libre](/formulas)) : doubler la fréquence coûte +6 dB de perte.

## 2. Massive MIMO et beamforming

Une antenne 4G classique : 2 à 4 éléments. Une antenne 5G massive MIMO : **64 à 256**. Avec autant d'éléments, l'antenne ne rayonne plus dans tous les directions : elle **forme un faisceau** dirigé vers chaque utilisateur (beamforming) — le signal va là où il doit aller, et le brouillage part ailleurs.

> Analogie : 4G = une ampoule qui éclaire toute la pièce. 5G beamforming = un spot qui suit chaque personne.

## 3. Le network slicing

Une même infrastructure physique, découpée en tranches virtuelles, chacune avec ses garanties :

| Tranche | Usage | Priorité |
|---------|-------|----------|
| eMBB | vidéo, grand public | débit |
| URLLC | voitures connectées, télémédecine | latence |
| mMTC | capteurs, IoT | densité |

Le slicing est en fait de la virtualisation de réseau — la même idée que les VLANs, poussée jusqu'au cœur du réseau mobile.

## Ce qu'il faut retenir pour l'examen

1. **Hautes fréquences = beaucoup de débit, peu de portée** → petites cellules denses.
2. **Massive MIMO** = beaucoup d'antennes → faisceaux dirigés, moins d'interférence.
3. **URLLC** = la promesse des 1 ms, réservée aux usages critiques.$post$,
  '5G',
  true,
  now() - interval '1 day'
);

-- ───────────────────────────────────────────────────────────────────
-- BANQUE DE QUESTIONS (20)
-- ───────────────────────────────────────────────────────────────────

insert into public.questions (question, options, correct_index, explanation, topic, difficulty) values
(
  'Combien de couches compte le modèle OSI ?',
  '["4","5","7","9"]'::jsonb,
  2,
  'Le modèle OSI compte 7 couches : physique, liaison, réseau, transport, session, présentation, application.',
  'OSI', 1
),
(
  'À quelle couche OSI appartient le protocole IP ?',
  '["Couche 2 — liaison","Couche 3 — réseau","Couche 4 — transport","Couche 7 — application"]'::jsonb,
  1,
  'IP gère l''adressage logique et le routage : c''est la couche 3 (réseau). TCP/UDP sont en couche 4.',
  'OSI', 1
),
(
  'TCP et UDP se trouvent à quelle couche du modèle OSI ?',
  '["Couche 1","Couche 2","Couche 3","Couche 4"]'::jsonb,
  3,
  'TCP et UDP travaillent à la couche 4 (transport) : TCP est fiable avec accusés de réception, UDP est rapide mais sans garantie.',
  'OSI', 1
),
(
  'Quelle couche utilise les adresses MAC ?',
  '["Physique","Liaison de données","Réseau","Transport"]'::jsonb,
  1,
  'Les adresses MAC identifient les cartes réseau sur le segment local : couche 2 (liaison de données).',
  'OSI', 1
),
(
  'Que mesure le ping (ICMP) ?',
  '["Le débit exact","L''aller-retour vers une machine et sa présence","Le nombre de sauts max","La taille du fichier"]'::jsonb,
  1,
  'ICMP echo mesure le temps aller-retour (latence) et vérifie que la machine répond. Il ne mesure pas le débit.',
  'OSI', 2
),
(
  'Combien d''adresses utilisables dans un /24 ?',
  '["256","255","254","128"]'::jsonb,
  2,
  'Un /24 = 256 adresses, moins le réseau et le broadcast = 254 utilisables.',
  'Sous-réseaux', 1
),
(
  '192.168.1.100/26 : quelle est l''adresse du réseau ?',
  '["192.168.1.0","192.168.1.64","192.168.1.96","192.168.1.100"]'::jsonb,
  1,
  'Un /26 = blocs de 64 : 0, 64, 128, 192. 100 est entre 64 et 127 → le réseau est 192.168.1.64.',
  'Sous-réseaux', 2
),
(
  'Quel masque correspond au préfixe /27 ?',
  '["255.255.255.0","255.255.255.128","255.255.255.192","255.255.255.224"]'::jsonb,
  3,
  '/27 = 27 bits à 1. Le 4e octet a 3 bits à 1 : 128+64+32 = 224 → 255.255.255.224.',
  'Sous-réseaux', 2
),
(
  'Dans un sous-réseau, l''adresse de broadcast est…',
  '["La première adresse du bloc","La dernière adresse du bloc","Toujours x.x.x.255","L''adresse du routeur"]'::jsonb,
  1,
  'Le broadcast est la dernière adresse du bloc (tous les bits d''hôte à 1). Ce n''est x.x.x.255 que si le bloc finit sur 255.',
  'Sous-réseaux', 2
),
(
  'Combien de sous-réseaux obtient-on en empruntant 3 bits ?',
  '["3","6","8","16"]'::jsonb,
  2,
  '2^3 = 8 sous-réseaux. Chaque bit emprunté double le nombre de sous-réseaux.',
  'Sous-réseaux', 1
),
(
  'Un lien point-à-point entre deux routeurs, quel préfixe choisir pour gaspiller le moins ?',
  '["/24","/30","/16","/28"]'::jsonb,
  1,
  'Un /30 offre 2 adresses utilisables : parfait pour 2 routeurs. La RFC 3021 autorise aussi /31 pour ce cas.',
  'Sous-réseaux', 2
),
(
  'Le wildcard mask d''un /26 (masque 255.255.255.192) est :',
  '["0.0.0.63","255.255.255.63","0.0.0.192","255.255.255.0"]'::jsonb,
  0,
  'Le wildcard est l''inverse du masque : 255.255.255.192 inversé = 0.0.0.63.',
  'Sous-réseaux', 3
),
(
  'À quoi sert un VLAN ?',
  '["Accélérer Internet","Découper un commutateur en réseaux virtuels isolés","Chiffrer le trafic","Remplacer le routeur"]'::jsonb,
  1,
  'Un VLAN segmente le domaine de broadcast et isole logiquement des groupes sur le même matériel.',
  'VLAN', 1
),
(
  'Deux machines sur le même VLAN mais des commutateurs différents : elles communiquent si…',
  '["Les commutateurs sont reliés par un port access","Les commutateurs sont reliés par un trunk","Un routeur redémarre","On change les MAC"]'::jsonb,
  1,
  'Le trunk (802.1Q) transporte les trames de plusieurs VLANs entre commutateurs, avec une étiquette par trame.',
  'VLAN', 2
),
(
  'Pour que deux VLANs différents communiquent, il faut :',
  '["Un hub","Un équipement de couche 3 (routeur ou commutateur L3)","Un câble plus long","Rien, ils se parlent déjà"]'::jsonb,
  1,
  'Chaque VLAN est un réseau couche 2 distinct. Le passage inter-VLAN exige du routage (couche 3).',
  'VLAN', 2
),
(
  '0 dB correspond à un rapport de puissance de :',
  '["0","0,1","1","10"]'::jsonb,
  2,
  'dB = 10·log₁₀(rapport). log₁₀(1) = 0 → un rapport de 1 (pas de gain, pas de perte) = 0 dB.',
  'Décibels', 1
),
(
  'Une perte de 3 dB signifie environ :',
  '["La moitié de la puissance","Le double de la puissance","Un dixième de la puissance","Aucune perte"]'::jsonb,
  0,
  '−3 dB = facteur 10^(−3/10) ≈ 0,5 : on perd la moitié de la puissance. +3 dB = doublement.',
  'Décibels', 2
),
(
  '30 dBm correspond à quelle puissance en mW ?',
  '["30 mW","100 mW","1 000 mW","10 000 mW"]'::jsonb,
  2,
  'P(mW) = 10^(dBm/10) = 10^3 = 1 000 mW = 1 W. Rappel utile : 30 dBm = 1 W, 0 dBm = 1 mW.',
  'Décibels', 2
),
(
  'La capacité de Shannon (C = B·log₂(1+SNR)) donne :',
  '["Le débit réel d''un réseau Wi-Fi","Le débit maximum théorique d''un canal bruité","La portée d''une antenne","Le nombre de machines connectables"]'::jsonb,
  1,
  'Shannon fixe un plafond théorique avec bruit. Les protocoles réels s''approchent du plafond sans l''atteindre.',
  'Shannon', 2
),
(
  'Pourquoi les cellules 5G en ondes millimétriques sont-elles petites ?',
  '["Pour économiser l''électricité","Parce que les hautes fréquences ont une faible portée","Parce que les antennes sont lourdes","Pour éviter les VLANs"]'::jsonb,
  1,
  'À haute fréquence, l''atténuation en espace libre augmente (≈ +6 dB par doublement) : la couverture rétrécit, d''où des petites cellules denses.',
  '5G', 2
);

commit;
