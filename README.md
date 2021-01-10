# Application NodeJS - Express

Cette application Express sert à récupérer les données fournies par une API de la sncf, de les indexer dans une base de données Mongo
et de servir les données grâce à une API REST.

### Deploiement

Pour déployer notre projet, il suffit de le cloner puis d'utiliser la commande suivante pour installer les dépendances
dans le dossier node_modules/ :

```
npm install
```

### Indexer les données 

Attention ! Avant d'indéxer les donner, l'application necessite que mongoDB soit lancé pour pouvoir écrire dans la base de données. Pour cela se référer à la documentation disponible à cette adresse : https://gitlab.com/master-2-idc/vuejs-sncf.

De même, copiez le .env.sample dans le .env et remplacez les valeurs par les valeurs propres à votre base de données.

Afin d'indexer les données, il suffit de lancer les commandes suivantes depuis la racine du projet :

```
cd indexer
```

Indexation des données relatives aux gares.

```
node stations_indexing.js 
```

Indexation des données relatives aux départements (à ne pas répéter avec cron).

```
node departments_indexing
```

Facultatif : Configurer Cron pour indexer a intervalle de temps souhaité (ex: tous les jours, toutes les semaines, toutes les heures, ...)

### Lancer l'API REST

Pour servir nos données fraichement indexées il vous faudra depuis la racine du projet lancer la commande :

```
apt install pm2
```

Cette utilitaire va globalement nous permettre de lancer et manager notre application express.

Enfin, lancez la commande 

```
pm2 start server.js
```

Pour vérifier que le processus est lancé, utilisez la commande :

```
pm2 list
```

Félicitations, votre application tourne sur le port 8081 de votre serveur !
