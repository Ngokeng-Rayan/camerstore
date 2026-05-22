# Projet : Plateforme E-commerce "Cash on Delivery" Optimisée pour le Marché Africain (Cameroun)

## 1. Description du Problème Initial
Le modèle d'affaires consiste à acheter des produits localement (arbitrage) et à les revendre via des publicités Facebook avec paiement à la livraison (Cash on Delivery - COD). 
**Les problèmes rencontrés étaient les suivants :**
- L'utilisation de liens directs vers WhatsApp générait beaucoup de clics coûteux mais peu d'acheteurs sérieux (manque de friction psychologique).
- Si un client passe commande sur un site classique et que l'événement "Achat" est envoyé immédiatement au Pixel Facebook, l'algorithme est nourri avec de fausses données en cas de désistement lors de la confirmation téléphonique.
- Les solutions clés en main comme Shopify coûtent très cher à cause des abonnements mensuels pour chaque petite fonctionnalité d'optimisation (avis, urgence, upsell, etc.).

## 2. La Solution : Architecture & Stratégie
Création d'une plateforme sur mesure conçue spécifiquement pour le COD, remplaçant totalement Shopify.

### Choix Technologiques
*   **Framework** : Next.js (App Router) pour la rapidité extrême (crucial pour les connexions mobiles au Cameroun) et le rendu côté serveur (SEO & Performance).
*   **Base de Données** : PostgreSQL, gérée via un ORM (Prisma ou Drizzle) pour une gestion relationnelle robuste (Commandes, Utilisateurs, Produits).
*   **Style** : CSS Modules / Vanilla CSS (pour un contrôle total et des performances optimales sans surcharger le code).
*   **Authentification** : NextAuth.js (ou équivalent) pour gérer les sessions sécurisées du back-office.

## 3. Logique Métier & Flux de Données (Le "Funnel")

### A. Le Front-End (Ce que voit le client)
1.  **Trafic** : Le client clique sur une publicité Facebook et arrive sur la page produit (Landing Page).
2.  **Conversion (CRO)** : La page intègre nativement (sans plugins payants) :
    *   Preuve sociale (Avis photos intégrés depuis la base de données).
    *   Urgence/Rareté (Compte à rebours, jauge de stock).
3.  **Friction Positive (Le Formulaire)** : Pas de système de panier complexe. Le client remplit un formulaire direct (Nom, Téléphone, Ville, Quartier) avec une **case à cocher d'engagement psychologique** ("Je confirme avoir l'argent et être disponible...").
4.  **Upsell (Vente additionnelle)** : Après soumission, proposition d'un second produit avec réduction avant la page de remerciement.
5.  **Tracking Frontend** : Seul l'événement `Lead` (ou `Initiate Checkout`) est envoyé au Pixel Meta via le navigateur. **Aucun événement d'achat n'est déclenché ici.**

### B. Le Back-Office (Le Cerveau & Le CRM)
1.  **Réception du Lead** : La commande atterrit dans le CRM du back-office avec le statut `Nouveau Lead`.
2.  **Gestion des Rôles (RBAC)** :
    *   **Closer (Téléconseiller)** : Se connecte, ne voit que les commandes. Clique sur le lien WhatsApp généré automatiquement pour appeler le client.
    *   **Admin (Propriétaire)** : Voit tout (Dashboard financier, marges, gestion des produits et des utilisateurs).
3.  **Le Closing & L'Éducation du Pixel (CAPI)** :
    *   Le Closer confirme la commande au téléphone et change le statut en `Confirmé`.
    *   **ACTION CRITIQUE** : C'est ce changement d'état dans la base de données qui déclenche une requête serveur (Meta Conversions API - CAPI). Le backend envoie secrètement l'événement `Purchase` à Facebook avec la valeur réelle.
    *   Résultat : L'algorithme Facebook ne reçoit que les données des clients *vérifiés*.

## 4. Fonctionnalités à Développer (MVP)

### Composants Front-End
- [ ] Layout principal ultra-léger et responsive (Mobile-first).
- [ ] Page Produit (`/product/[id]`) optimisée conversion (titres larges, grille bento, animations fluides).
- [ ] Composants d'urgence (Timers, Stock Alert) dynamiques.
- [ ] Formulaire de commande COD (sans paiement par carte) avec case d'engagement.
- [ ] Flux d'Upsell Post-Achat (One-Click Upsell).

### Composants Back-Office (Admin & CRM)
- [ ] Système d'authentification et de permissions (Admin vs Closer).
- [ ] **Dashboard Admin** : KPIs (CA, Marges, Taux de conversion), Graphiques de ventes.
- [ ] **CRM Commandes** : Liste des commandes, statuts personnalisables, bouton d'action WhatsApp.
- [ ] **Gestion Produits** : CRUD des produits, prix de revient vs prix de vente (calcul des marges).
- [ ] **Gestion Avis** : Interface pour uploader des photos et des textes d'avis clients.
- [ ] Intégration Meta Conversions API (CAPI) liée aux changements de statuts.

## 5. User Review Required (Validation Requise)

> [!IMPORTANT]
> **Base de Données** : Veux-tu que nous utilisions PostgreSQL en local pour le développement ou as-tu déjà un service cloud (ex: Supabase, Neon, ou ta propre base sur o2switch) ?
> **Design Front-End** : Veux-tu qu'on parte sur une esthétique spécifique (Minimaliste, Luxe, Très coloré "Black Friday") pour tes pages produits ?

## 6. Plan d'Exécution (Prochaines Étapes)

Dès ton approbation, nous procéderons dans cet ordre :
1.  Initialisation du projet Next.js (nettoyage de l'ancien code si nécessaire).
2.  Configuration de la base de données (Schémas Prisma/Drizzle pour Users, Products, Orders, Reviews).
3.  Développement du Back-office (Authentification et CRM pour les closers).
4.  Développement du Front-end (Page produit haute conversion).
5.  Mise en place de la logique d'Upsell et de l'intégration Meta CAPI.
