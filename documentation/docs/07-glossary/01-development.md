---
title: 'Développement'
---

Voici quelques informations sur les angliscismes usuels utilisés dans un contexte de développement informatique.

Ces mots n'ont pas de réelle traduction en français, ou alors celle-ci n'est que très rarement utilisée. Nous préférons donc laisser leur version anglaise dans la documentation pour rester au plus près de l'usage courant.

> Cette section de glossaire est spécifique à la documentation française de Svelte, et n'existe pas dans la documentation officielle.

## API

> Bientôt...

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

> Bientôt...

## IDE

> Bientôt...

## Issue

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

## Race conditions

> Bientôt...

## Runtime

> Bientôt...

## Scope

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
