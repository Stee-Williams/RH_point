# Configuration du service de réinitialisation du mot de passe

Le lien de réinitialisation est envoyé par e-mail. Configurez ces variables
dans l’environnement du serveur (ne placez aucun secret SMTP dans le dépôt) :

- `MAILER_DSN` : DSN SMTP du fournisseur de messagerie.
- `MAILER_SENDER` : adresse d’expédition vérifiée, par exemple `rh@example.org`.
- `FRONTEND_URL` : origine publique de l’interface, sans slash final.

La valeur de développement `null://null` n’envoie aucun message ; l’API
signale explicitement que le service n’est pas configuré.

Après déploiement du code, appliquez la migration :

```sh
php bin/console doctrine:migrations:migrate
```
