---
title: 'Développement'
---

Voici quelques informations sur les anglicismes usuels utilisés dans un contexte de développement informatique.

Ces mots n'ont pas de réelle traduction en français, ou alors celle-ci n'est que très rarement utilisée. Nous préférons donc laisser leur version anglaise dans la documentation pour rester au plus près de l'usage courant.

> Cette section de glossaire est spécifique à la documentation française de Svelte, et n'existe pas dans la documentation officielle.

## API

Une API est une interface de programmation d'application. Il s'agit d'un ensemble de **points d'accès** publics ou privés basés sur le protocol HTTP et qui répondent des données, généralement exprimé en JSON.

Une API peut suivre une architecture logicielle particulière. Les plus connues sont le REST (_Representational State Transfer_) ou le GraphQL (_Graph Query Language_).

Dans le cadre de SvelteKit, il est possible de [définir une API publique](https://kit.svelte.dev/docs/routing#server) en définissant un fichier `+server.js` dans le dossier `routes`.

## AST

Un arbre de la syntaxe abstraite (_Abstract Syntax Tree_ ou _AST_) est un format de représentation de certains données sous forme d'arbre dont les nœuds internes et les feuilles (ou nœuds externes) possèdent des caractéristiques particulières.

Svelte utilise le format _AST_ comme intermédiaire entre un composant Svelte et le code JavaScript natif interprété par le navigateur web.

## Build

Un _build_ est l'ensemble de fichiers produits par le <span class="vo">[bundler](/docs/web#bundler-packager)</span>. C'est le plus souvent ce qui sera utilisé pour déployer l'application en production.

## Callback

Un _callback_ (ou fonction de rappel) est une fonction qui sera appelée lorsqu'un certain travail est terminé.

C'est en général une fonction passée en argument à une autre fonction pour que cette dernière s'en serve lorsque nécessaire.

Par exemple on peut utiliser un _callback_ pour afficher un message lorsqu'un téléchargement est terminé.
```ts
function afficheCoucou() {
	console.log('Coucou');
}

function chargeLaDonnée(callback: () => void) {
	// je charge la donnée, peu importe comment, puis...
	callback();
}

// ici, afficheCoucou est utilisée en tant que callback
chargeLaDonnée(afficheCoucou);
```

## End to end

L'adjectif bout en bout (_end to end_) s'applique à un processus qui soit complet (en opposition avec un processus unitaire).

Il s'applique généralement aux tests _end to end_ qui permettent de tester l'ensemble de l'application (IHM et serveur) sans simuler tout ou partie du système.

Dans le cadre de SvelteKit, il fait également référence au typage _end to end_, permettant de récupérer les types des données retournées par les méthodes `load()` des `layout` et des `routes` dans la variable `data` de la route correspondante.

## Getter / Setter

Un _getter_ est une fonction qui permet de lire une valeur.
Un _setter_ est une fonction qui permet d'écrire une valeur.

Ils vont souvent de pair, mais peuvent exister indépendamment de l'autre.
Ils sont en général utilisés pour éviter d'exposer les propriétés internes d'un objet et permet à l'objet de faire des vérifications ou des  supplémentaires sur les valeurs.

Un _setter_ pourrait être utilisé pour la propriété `nom` pour forcer la mise en majuscule
```ts
class Personne {
	#nom = 'Marie';

	// setter
	set nom(n: string) {
		this.#nom = n.toUpperCase()
	}

	// getter
	get nom() {
		return this.nom
	}
}
```

Vous trouverez plus de détails sur les [getters](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Functions/get) et [setters](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Functions/set) en JavaScript dans la documentation de MDN.

## Hash

Un _hash_ est le résultat d'une fonction de hachage (ou _hashing_). Une fonction de hachage est une fonction qui associe des valeurs de taille fixe à des données de taille arbitraire. Les _hash_ ont la particularité d'être statistiquement uniques, leur permettant d'être utilisés dans des applications d'indexation (pour une donnée, un hash unique est calculé et est stockée dans une table d'indexation).

Dans le cadre de Svelte, les _hash_ sont utilisés pour générer les noms de classes CSS.

## IDE

Un environnement de développement intégré (_Integrated Development Environment) est un logiciel intégrant plusieurs outils facilitant le développement informatique. Parmi les plus célèbres dans le monde web: VSCode et WebStorm.

## Intellisense

Le terme _intelliSense_ fait référence à des aides à la saisie semi-automatique de code qui comprend un certain nombre de fonctionnalités : autocomplétion, liste des propriétés, etc. Ces outils peuvent être intégré aux <span class="vo">[IDE](/docs/development#ide)</span> ou ajouté via des <span class="vo">[plugins](/docs/development#plugin)</span>. Il sont dépendants du langage de programmation et peuvent souvent être fortement configurés.

## Issue

> Bientôt...

## Log

> Bientôt...

## Namespace

> Bientôt...

## Parser

> Bientôt...

## Payload

> Bientôt...

## Plugin

> Bientôt...

## Pull Request

> Bientôt...

## Race condition

> Bientôt...

## Readonly

> Bientôt...

## Runtime

> Bientôt...

## Scope

> Bientôt...

## Thread

> Bientôt...

## Template

> Bientôt...

## Tooltip

> Bientôt...

## Warning

> Bientôt...

## Wrapper

Un _wrapper_ est une fonction qui "enveloppe" une autre fonction afin de lui apporter des fonctionnalités supplémentaires.

On peut également le voir comme une fonction qui crée et renvoie une fonction qui se sert de la fonction d'origine.

Un _wrapper_ pourrait être utilisé pour aggrémenter un message d'accueil :
```ts
// Fonction d'origine
const bonjour = function (name: string): string {
	return `Bonjour ${name}!`
}
bonjour("Jean") // "Bonjour Jean!"

// Wrapper de la fonction
function bonjourWrapper(original: (name: string) => string): (name: string) => string {
	return function (name: string) {
		return original(name) + " Comment vas-tu ?"
	}
}
const nouveauBonjour = bonjourWrapper(bonjour)
nouveauBonjour("Jean") // "Bonjour Jean! Comment vas-tu?"
```

> Par extension, un _wrapper_ désigne également un composant qui "enveloppe" une autre composant afin de lui apporter des fonctionnalités supplémentaires (style, comportement, etc.).

## Writable

> Bientôt...
