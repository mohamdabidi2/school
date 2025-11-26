# Module de Gestion des Paiements et Dépenses

Ce document décrit les nouvelles fonctionnalités ajoutées au système de gestion scolaire pour la gestion des paiements des élèves et des dépenses.

## 🎯 Fonctionnalités Ajoutées

### 1. Module Paiements des Élèves

#### Modèles Prisma
- **Payment** : Enregistre les paiements des élèves
- **PaymentType** : Enum pour définir le type de paiement (complet ou par tranches)

#### Fonctionnalités
- ✅ Affichage de tous les élèves avec leurs paiements
- ✅ Gestion des types de paiement (complet/tranches)
- ✅ Ajout de nouveaux paiements
- ✅ Génération de PDF pour les reçus de paiement
- ✅ Validation des règles de paiement (un seul paiement pour le type "complet")

#### Pages
- **`/list/payments`** : Page principale de gestion des paiements

### 2. Module Dépenses

#### Modèles Prisma
- **Expense** : Enregistre les dépenses de l'école
- **ExpenseStatus** : Enum pour le statut des dépenses (PENDING, APPROVED, REJECTED)

#### Fonctionnalités
- ✅ Création de nouvelles dépenses
- ✅ Affichage de toutes les dépenses avec leur statut
- ✅ Statistiques des dépenses
- ✅ Interface utilisateur intuitive

#### Pages
- **`/list/depenses`** : Page de gestion des dépenses

### 3. Module Validation des Dépenses (Admin)

#### Fonctionnalités
- ✅ Interface d'administration pour valider/rejeter les dépenses
- ✅ Affichage des dépenses en attente de validation
- ✅ Statistiques des dépenses par statut
- ✅ Actions rapides d'approbation/rejet

#### Pages
- **`/admin/validation`** : Page de validation des dépenses (réservée aux admins)

## 🛠️ Technologies Utilisées

- **Prisma** : ORM pour la gestion de la base de données
- **PDFKit** : Génération de PDF pour les reçus
- **Next.js 14** : Framework React avec App Router
- **TypeScript** : Typage statique
- **Tailwind CSS** : Styling

## 📁 Structure des Fichiers

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── list/
│   │   │   ├── payments/
│   │   │   │   └── page.tsx          # Page de gestion des paiements
│   │   │   └── depenses/
│   │   │       └── page.tsx          # Page de gestion des dépenses
│   │   └── admin/
│   │       └── validation/
│   │           └── page.tsx          # Page de validation des dépenses
│   └── api/
│       └── students-with-payments/
│           └── route.ts              # API pour récupérer les étudiants avec paiements
├── components/
│   └── Menu.tsx                      # Navigation mise à jour
├── lib/
│   └── actions.ts                    # Actions Prisma pour paiements et dépenses
└── utils/
    └── pdf.ts                        # Utilitaires de génération PDF
```

## 🚀 Installation et Configuration

### 1. Installation des dépendances
```bash
npm install pdfkit @types/pdfkit
```

### 2. Mise à jour de la base de données
```bash
npx prisma db push
```

### 3. Redémarrage du serveur
```bash
npm run dev
```

## 📋 Utilisation

### Gestion des Paiements

1. **Accéder à la page des paiements** : `/list/payments`
2. **Changer le type de paiement** : Sélectionner "Complet" ou "Tranches" pour chaque élève
3. **Ajouter un paiement** : Cliquer sur "Ajouter un Paiement" et remplir le formulaire
4. **Télécharger un reçu PDF** : Cliquer sur "Télécharger PDF" pour chaque paiement

### Gestion des Dépenses

1. **Accéder à la page des dépenses** : `/list/depenses`
2. **Ajouter une dépense** : Cliquer sur "Ajouter une Dépense" et remplir le formulaire
3. **Consulter les statistiques** : Voir le total des dépenses et leur répartition par statut

### Validation des Dépenses (Admin)

1. **Accéder à la page de validation** : `/admin/validation`
2. **Approuver une dépense** : Cliquer sur "✅ Approuver"
3. **Rejeter une dépense** : Cliquer sur "❌ Rejeter"
4. **Consulter les statistiques** : Voir le nombre de dépenses par statut

## 🔒 Règles de Validation

### Paiements
- **Type "Complet"** : Un seul paiement autorisé par élève
- **Type "Tranches"** : Plusieurs paiements autorisés avec numéro de tranche

### Dépenses
- **Statut par défaut** : PENDING (En attente)
- **Validation** : Seuls les administrateurs peuvent approuver/rejeter
- **Création** : Accessible aux enseignants et administrateurs

## 🎨 Interface Utilisateur

- **Design responsive** : Adapté aux écrans desktop et mobile
- **Couleurs cohérentes** : Utilisation de la palette de couleurs existante
- **Feedback utilisateur** : Messages de succès/erreur
- **Navigation intuitive** : Intégration dans le menu existant

## 🔧 Personnalisation

### Modification des types de paiement
Éditer l'enum `PaymentType` dans `prisma/schema.prisma`

### Modification des statuts de dépenses
Éditer l'enum `ExpenseStatus` dans `prisma/schema.prisma`

### Personnalisation des PDF
Modifier le fichier `src/utils/pdf.ts` pour changer l'apparence des reçus

## 🐛 Dépannage

### Erreur de génération PDF
- Vérifier que PDFKit est correctement installé
- Vérifier les permissions d'écriture

### Erreur de base de données
- Exécuter `npx prisma db push` pour synchroniser le schéma
- Vérifier la connexion à la base de données

### Erreur d'authentification
- Vérifier que l'utilisateur a le bon rôle (admin, teacher)
- Vérifier la configuration Clerk

## 📈 Améliorations Futures

- [ ] Export des données en Excel/CSV
- [ ] Notifications par email pour les paiements
- [ ] Historique des modifications
- [ ] Rapports financiers détaillés
- [ ] Intégration avec des systèmes de paiement externes
- [ ] Dashboard financier avec graphiques
