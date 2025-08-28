# 📱 WhatsApp Tickets - CNOL 2025

## 🎯 Vue d'ensemble

Ce module ajoute la possibilité d'envoyer les tickets de masterclass et ateliers par WhatsApp en complément des emails traditionnels. Cela améliore l'expérience utilisateur en offrant un double canal de communication.

## ✨ Fonctionnalités

### 🔄 Double Envoi Automatique
- **Validation** : Lors de la validation d'une réservation, le ticket est envoyé par email ET WhatsApp
- **Renvoi** : Lors du renvoi d'un ticket, il est envoyé par email ET WhatsApp
- **Fallback** : Si WhatsApp échoue, l'email est toujours envoyé (pas de blocage)

### 📱 Interface d'Administration
- Bouton "Envoyer WhatsApp" à côté de "Renvoyer ticket"
- Disponible dans les composants `AteliersAdmin` et `MasterclassAdmin`
- Gestion des erreurs avec notifications toast

### 🛠️ Gestion Intelligente des Numéros
- Validation automatique des formats de numéros
- Normalisation des numéros marocains (0xxx → +212xxx)
- Support des formats internationaux

## 🏗️ Architecture

### Fichiers Modifiés
```
lib/
├── mailer.js                    # Ajout de sendTicketWhatsApp()
└── supabaseClient.js            # Client Supabase existant

utils/
└── whatsappUtils.js             # Nouveau: utilitaires WhatsApp

components/
├── AteliersAdmin.js             # Ajout bouton WhatsApp
└── MasterclassAdmin.js          # Ajout bouton WhatsApp

pages/api/
├── valider-reservation-atelier.js      # Envoi WhatsApp + email
├── valider-reservation-masterclass.js  # Envoi WhatsApp + email
├── renvoyer-ticket-atelier.js          # Renvoi WhatsApp + email
└── renvoyer-ticket-masterclass.js      # Renvoi WhatsApp + email
```

### Flux de Données
```
1. Validation/Renvoi → 2. Génération PDF → 3. Upload Supabase → 4. Envoi Email + WhatsApp
```

## 🚀 Utilisation

### Pour les Administrateurs

#### Validation d'une Réservation
1. Aller dans **Administration > Ateliers** ou **Masterclass**
2. Cliquer sur **"Liste inscrits"** pour un événement
3. Cliquer sur **"Valider"** pour une réservation en attente
4. Le ticket est automatiquement envoyé par email ET WhatsApp

#### Renvoi d'un Ticket
1. Dans la liste des inscrits, pour une réservation confirmée
2. Cliquer sur **"Renvoyer ticket"** pour l'email
3. Cliquer sur **"Envoyer WhatsApp"** pour WhatsApp uniquement

### Pour les Développeurs

#### Test des Fonctionnalités
```bash
# Exécuter les tests
node test-whatsapp-tickets.js

# Ou dans la console du navigateur
testPhoneValidation()
testPhoneNormalization()
testFileNameGeneration()
testWhatsAppMessage()
```

#### Ajout à un Nouveau Composant
```javascript
import { sendTicketWhatsApp } from '../lib/mailer';

const handleWhatsApp = async (reservationId) => {
  try {
    await sendTicketWhatsApp({
      to: reservation.telephone,
      nom: reservation.nom,
      prenom: reservation.prenom,
      eventType: 'Atelier',
      eventTitle: reservation.ateliers.titre,
      eventDate: reservation.ateliers.date_heure,
      pdfBuffer,
      pdfFileName: `ticket-${eventType}.pdf`
    });
    toast.success('Ticket WhatsApp envoyé !');
  } catch (error) {
    toast.error('Erreur envoi WhatsApp');
  }
};
```

## ⚙️ Configuration

### Variables d'Environnement Requises
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Base URL de l'application
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### API WhatsApp
L'application utilise l'API interne `/api/send-whatsapp` qui communique avec Wasender API.

## 🔍 Dépannage

### Erreurs Communes

#### "Numéro de téléphone invalide"
- Vérifier que le numéro est au format international (+212...)
- Le système normalise automatiquement les numéros marocains

#### "Erreur envoi WhatsApp"
- Vérifier la connectivité réseau
- Vérifier que l'API Wasender est accessible
- Consulter les logs de l'application

#### "Erreur upload ticket"
- Vérifier les permissions Supabase Storage
- Vérifier l'espace disque disponible

### Logs
Les actions WhatsApp sont loggées avec le format :
```
[2025-08-09T10:30:00.000Z] ✅ WhatsApp envoi - Atelier: Optique & Contactologie - Ahmed Ouahi
[2025-08-09T10:30:01.000Z] ❌ WhatsApp envoi - Masterclass: Rétinopathie - Marie Martin - Erreur: Numéro invalide
```

## 📊 Statistiques

### Suivi des Envois
- Les envois WhatsApp sont enregistrés dans la table `whatsapp_envois`
- Les statistiques sont mises à jour dans `statistiques_participants`
- Métriques disponibles : succès/échecs, taux de livraison

### Performance
- Envoi asynchrone (non-bloquant)
- Upload PDF optimisé (cache 1h)
- Gestion des timeouts et retry automatiques

## 🔮 Évolutions Futures

### Fonctionnalités Prévues
- [ ] Notifications push pour confirmation de réception
- [ ] Templates de messages personnalisables
- [ ] Planification d'envois différés
- [ ] Intégration avec d'autres messageries (Telegram, SMS)

### Améliorations Techniques
- [ ] Queue de traitement pour les gros volumes
- [ ] Compression PDF intelligente selon l'usage
- [ ] Métriques temps réel
- [ ] A/B testing des messages

## 📞 Support

Pour toute question ou problème :
- Consulter les logs de l'application
- Vérifier la configuration des variables d'environnement
- Tester avec le fichier `test-whatsapp-tickets.js`

---

**Développé pour CNOL 2025** 🎯 