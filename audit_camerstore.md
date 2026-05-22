# 🔍 Audit Complet — CamerStore E-commerce

> **Date :** 22 Mai 2026  
> **Projet :** `r:\Projects\Ecommerce\camerstore`  
> **Stack :** Next.js 16 (App Router) + Prisma + PostgreSQL + TailwindCSS 4  

---

## 📊 Verdict Global

| Catégorie | Note | Verdict |
|---|---|---|
| **Architecture & Structure** | ⭐⭐⭐⭐ | Très solide |
| **Stratégie Meta Ads / Pixel** | ⭐⭐⭐⭐⭐ | Excellente (hybride Pixel + CAPI) |
| **Sécurité** | ⭐⭐☆☆☆ | **Problèmes critiques** |
| **CRO (Conversion Rate Optimization)** | ⭐⭐⭐⭐ | Bon (urgence, friction, preuve sociale) |
| **Back-Office / CRM** | ⭐⭐⭐⭐ | Complet et fonctionnel |
| **SEO** | ⭐⭐☆☆☆ | Insuffisant |
| **Performance** | ⭐⭐⭐☆☆ | Correct mais optimisable |
| **Qualité Code** | ⭐⭐⭐☆☆ | Bon mais certains patterns à corriger |

---

## ✅ CE QUI EST TRÈS BIEN FAIT

### 1. Stratégie Meta Ads — L'arme secrète ⭐⭐⭐⭐⭐

> [!TIP]
> **C'est la meilleure partie du projet.** La logique hybride Pixel + CAPI est exactement ce qu'il faut pour le COD.

- **Frontend (Pixel)** : `ViewContent` au chargement de la page produit + `InitiateCheckout` à la soumission du formulaire → Parfait, ça dit à Meta "cette personne est intéressée" sans mentir.
- **Backend (CAPI)** : L'événement `Purchase` est envoyé UNIQUEMENT quand le closer confirme la commande au téléphone (`orderStatus.ts` → `sendPurchaseEvent` déclenchée seulement sur `CONFIRMED`).
- **Résultat** : L'algorithme de Meta ne reçoit que des vrais acheteurs → Meilleure optimisation du budget pub → Moins de "plaisantins".

**Hachage SHA256 des données personnelles** (nom, téléphone, ville) avant envoi à l'API CAPI → Conforme aux exigences de Meta.

### 2. Architecture COD intelligente ⭐⭐⭐⭐

- **Friction psychologique** : Message d'avertissement rouge ("NE COMMANDEZ PAS SI VOUS N'ÊTES PAS PRÊT"), case d'engagement → Filtre les curieux.
- **Fake urgency** (stock aléatoire, countdown, popup "quelqu'un a acheté") → Classique e-commerce mais efficace.
- **Formulaire direct** (pas de panier complexe) → Réduit le taux d'abandon.
- **Upsell post-commande** → Augmente le panier moyen sans frictionner la première conversion.

### 3. Back-Office / CRM ⭐⭐⭐⭐

- **Dashboard Admin** avec KPIs réels (CA encaissé, leads, commandes), graphiques Recharts, filtres par période.
- **CRM Commandes** avec filtres (statut, date, produit, recherche texte), vue mobile + desktop.
- **RBAC** : Admin voit tout, Closer ne voit que les commandes → Bien séparé.
- **Gestion complète** : Produits (CRUD + upload images + média description), catégories, avis, équipe, livraisons.
- **Notifications email** automatiques (nouvelle commande, identifiants closer).

### 4. Design & UX ⭐⭐⭐⭐

- Design professionnel avec palette cohérente (Navy + Lime Green + Red).
- Responsive mobile-first → Crucial pour le marché camerounais (90%+ mobile).
- Animations CTA (`animate-heartbeat` sur le bouton Commander).
- Sticky bottom CTA sur mobile.

---

## 🔴 PROBLÈMES CRITIQUES À CORRIGER

### 1. 🚨 SÉCURITÉ — Le middleware n'est PAS actif !

> [!CAUTION]
> **C'est le bug le plus grave du projet.** Le fichier `proxy.ts` existe mais il n'est PAS nommé `middleware.ts` et n'est PAS au bon endroit.

**Situation actuelle :**
- Le fichier [proxy.ts](file:///r:/Projects/Ecommerce/camerstore/src/proxy.ts) contient la logique RBAC parfaite.
- **MAIS** Next.js attend un fichier nommé `middleware.ts` à la racine de `src/` (soit `src/middleware.ts`).
- **Résultat** : La protection des routes admin n'est assurée QUE par le `layout.tsx` admin (vérification `getSession()` côté serveur), mais **pas au niveau du middleware HTTP**.

**Impact :**
- Le RBAC des Closers ne fonctionne probablement pas au niveau middleware (un closer pourrait accéder à `/admin/products` s'il tape l'URL directement, car la sidebar le cache visuellement mais le middleware ne bloque pas).
- La double protection (middleware + layout) est manquante.

**Fix :** Renommer `src/proxy.ts` → `src/middleware.ts`.

### 2. 🚨 SECRET JWT en dur dans le code

> [!CAUTION]
> Dans [auth.ts](file:///r:/Projects/Ecommerce/camerstore/src/lib/auth.ts#L4), la clé secrète JWT a un fallback en dur :

```typescript
const secretKey = process.env.JWT_SECRET || "camerstore-super-secret-key-change-in-production";
```

- La variable `JWT_SECRET` **n'est pas définie** dans le `.env`.
- En production, le fallback sera utilisé → N'importe qui connaissant ce secret peut forger des tokens d'authentification admin.
- **Fix :** Ajouter `JWT_SECRET` dans `.env` avec une vraie clé aléatoire de 64+ caractères.

### 3. 🚨 Credentials exposés dans le `.env`

> [!WARNING]
> Le fichier `.env` contient en clair :
> - Le mot de passe d'application Gmail (`wyjz hjnj vvvm kqqv`)
> - Le token CAPI Facebook (`EAAeU0p...`)
> 
> Si ce fichier est versionné (vérifie que `.env` est dans le `.gitignore`), ces credentials doivent être considérés comme compromis et rotés immédiatement.

### 4. 🚨 Produit créé automatiquement en production !

> [!CAUTION]
> Dans [product/[id]/page.tsx](file:///r:/Projects/Ecommerce/camerstore/src/app/product/%5Bid%5D/page.tsx#L14-L26), si un produit n'existe pas, il est **créé automatiquement** avec des données fictives :

```typescript
if (!product) {
    product = await prisma.product.create({
        data: { id: resolvedParams.id, title: "Montre Connectée Premium 2026", ... }
    });
}
```

- **En production**, n'importe qui peut créer des produits fictifs en visitant `/product/nimportequoi`.
- **Fix :** Remplacer par un `notFound()` (déjà importé mais pas utilisé).

### 5. 🚨 Aucune validation des entrées dans `createOrder`

> [!WARNING]
> Dans [order.ts](file:///r:/Projects/Ecommerce/camerstore/src/app/actions/order.ts), aucune validation :
> - Pas de vérification du format téléphone (un bot peut envoyer "aaaa")
> - Pas de vérification que `customerName` n'est pas vide
> - Pas de rate limiting → Un bot peut spammer 10,000 commandes/minute
> - Pas de honeypot anti-bot

---

## 🟡 PROBLÈMES MODÉRÉS

### 6. ⚠️ `updateOrderStatusAction` dans `delivery.ts` ne déclenche PAS le CAPI

> [!IMPORTANT]
> Il existe **deux fonctions** pour changer le statut d'une commande :
> - `updateOrderStatus` dans [orderStatus.ts](file:///r:/Projects/Ecommerce/camerstore/src/app/actions/orderStatus.ts) → **Déclenche** la CAPI Facebook ✅
> - `updateOrderStatusAction` dans [delivery.ts](file:///r:/Projects/Ecommerce/camerstore/src/app/actions/delivery.ts#L34-L46) → **Ne déclenche PAS** la CAPI ❌
> 
> Si le closer change le statut depuis la page Livraisons, l'événement `Purchase` ne sera jamais envoyé à Facebook → **Data manquante** pour l'optimisation Meta.

### 7. ⚠️ La quantité n'est pas prise en compte dans la commande

Le formulaire permet de choisir une quantité (1, 2, 3...) et l'affiche côté client, mais :
- `createOrder` calcule `totalPrice = product.sellingPrice` (pas × quantity)
- Le `totalPrice` envoyé à Facebook CAPI est aussi faux si quantity > 1
- Le champ `quantity` n'existe même pas dans le schéma Prisma `Order`

### 8. ⚠️ SEO quasi inexistant

- **Pas de `<meta>` dynamique** sur les pages produit (pas de `generateMetadata`)
- **Pas d'Open Graph** / Twitter Cards → Le partage sur Facebook/WhatsApp ne montre ni image ni description
- `lang="en"` dans le layout alors que le site est en français → Devrait être `lang="fr"`
- **Pas de `sitemap.xml`** ni `robots.txt`
- Pas de structured data (JSON-LD `Product`) → Google ne sait pas que c'est un produit

### 9. ⚠️ Pas de `noscript` pour le Pixel Facebook

Le composant [FacebookPixel.tsx](file:///r:/Projects/Ecommerce/camerstore/src/components/FacebookPixel.tsx) n'a pas de fallback `<noscript>` avec le pixel image → Perte de données de tracking pour les navigateurs sans JS (rare mais recommandé par Meta).

### 10. ⚠️ Statuts incohérents entre les fichiers

- `schema.prisma` définit : `NEW_LEAD, PENDING_CALL, CONFIRMED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED`
- `OrderStatusSelect.tsx` utilise : `NEW_LEAD, REFUSED_CALL, CONFIRMED, DELIVERED, CANCELLED`
- Le CRM Orders page filtre par : `REFUSED_CALL` (qui n'existe pas dans le schéma)
- `PENDING_CALL` et `OUT_FOR_DELIVERY` du schéma ne sont plus utilisés nulle part

### 11. ⚠️ `NEXT_PUBLIC_APP_URL` non défini

Dans les emails (`mail.ts`), le lien vers le backoffice utilise :
```typescript
${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}
```
En production, les emails afficheront `http://localhost:3000/admin/orders` → lien mort.

### 12. ⚠️ Upload d'images sans validation

- Aucune vérification du type MIME (on peut uploader un `.exe`)
- Aucune limite de taille de fichier
- Pas de redimensionnement/compression → Les images lourdes ralentiront le site mobile

---

## 🟢 AMÉLIORATIONS RECOMMANDÉES (pour les Meta Ads)

### Pour attirer des VRAIS clients et non des plaisantins :

| Action | Impact sur les Meta Ads |
|---|---|
| **Ajouter l'event_id** pour la déduplication Pixel ↔ CAPI | Empêche le double-comptage des événements (Meta le recommande fortement) |
| **Ajouter le `fbp` (cookie `_fbp`)** et le `fbc` (paramètre URL `fbclid`) dans les données CAPI | Permet à Meta de matcher le visiteur du Pixel avec l'événement CAPI côté serveur → **Meilleur matching = meilleure optimisation** |
| **Ajouter l'Open Graph** avec image du produit | Quand le produit est partagé sur Facebook/WhatsApp, l'image s'affiche → Meilleur CTR sur les partages organiques |
| **Ajouter un honeypot anti-bot** dans le formulaire | Empêche les bots de spammer des fausses commandes → Données plus propres |
| **Validation stricte du téléphone** (format camerounais 6XXXXXXXX) | Filtre les faux numéros dès la soumission → Moins de leads mort-nés |
| **Ajouter `external_id`** dans les user_data CAPI | Permet le cross-device tracking → Meta peut mieux identifier les utilisateurs |
| **Envoyer l'IP du client et le User-Agent** dans la CAPI | Améliore le Event Match Quality Score de Meta (actuellement probablement < 5/10) |

---

## 📁 Structure du Projet (Résumé)

```
camerstore/
├── prisma/schema.prisma          ← 4 modèles (User, Product, Order, Review, Category)
├── src/
│   ├── app/
│   │   ├── page.tsx              ← Homepage (produits vedettes)
│   │   ├── product/[id]/         ← Landing page produit (haute conversion)
│   │   │   ├── ProductClient.tsx ← Formulaire COD, urgence, avis
│   │   │   └── upsell/page.tsx   ← Cross-sell post-commande
│   │   ├── produits/page.tsx     ← Catalogue produits
│   │   ├── contact/page.tsx      ← Formulaire contact + event Lead
│   │   ├── login/page.tsx        ← Auth back-office
│   │   ├── admin/
│   │   │   ├── page.tsx          ← Dashboard KPIs + graphiques
│   │   │   ├── orders/           ← CRM commandes (avec OrderStatusSelect)
│   │   │   ├── products/         ← CRUD produits
│   │   │   ├── categories/       ← Gestion catégories
│   │   │   ├── reviews/          ← Gestion avis clients
│   │   │   ├── deliveries/       ← Planning livraisons
│   │   │   └── users/            ← Gestion équipe (admin/closers)
│   │   └── actions/              ← 10 Server Actions
│   ├── components/
│   │   ├── FacebookPixel.tsx     ← Pixel + fonctions utilitaires
│   │   ├── FrontNavbar.tsx       ← Navigation responsive
│   │   └── FrontFooter.tsx       ← Footer
│   ├── lib/
│   │   ├── auth.ts               ← JWT (jose)
│   │   ├── facebookCapi.ts       ← Meta Conversions API
│   │   ├── mail.ts               ← Notifications email (nodemailer)
│   │   └── prisma.ts             ← Singleton Prisma
│   └── proxy.ts                  ← ⚠️ MIDDLEWARE NON ACTIF (mauvais nom)
```

---

## 🎯 Priorité des corrections

| Priorité | Action | Fichier(s) |
|---|---|---|
| 🔴 P0 | Renommer `proxy.ts` → `middleware.ts` | `src/proxy.ts` |
| 🔴 P0 | Ajouter `JWT_SECRET` dans `.env` | `.env` + `lib/auth.ts` |
| 🔴 P0 | Remplacer la création auto de produit par `notFound()` | `product/[id]/page.tsx` |
| 🔴 P0 | Ajouter validation + rate limiting sur `createOrder` | `actions/order.ts` |
| 🟡 P1 | Unifier les changements de statut (CAPI dans delivery.ts) | `actions/delivery.ts` |
| 🟡 P1 | Ajouter `event_id` + `fbp`/`fbc` dans la CAPI | `lib/facebookCapi.ts` |
| 🟡 P1 | Fixer le lang="fr" + ajouter Open Graph + generateMetadata | `layout.tsx` + pages |
| 🟡 P1 | Synchroniser les statuts avec le schéma Prisma | `schema.prisma` + composants |
| 🟢 P2 | Ajouter noscript Pixel, validation upload, quantity dans Order | Multiples fichiers |
| 🟢 P2 | SEO (sitemap, robots.txt, JSON-LD Product) | Nouveaux fichiers |

---

> [!NOTE]
> **En résumé** : Le projet est **bien conçu dans sa logique métier** (surtout la stratégie Meta Ads hybride Pixel/CAPI qui est la pièce maîtresse). Le CRM/back-office est complet et fonctionnel. Les **problèmes principaux sont la sécurité** (middleware non actif, JWT secret en dur, pas de validation) et le **SEO quasi absent**. Avec les corrections P0 + P1, ce projet sera prêt pour le déploiement production.
