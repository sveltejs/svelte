---
title: 'Développement'
---

Voici quelques informations sur les anglicismes usuels utilisés dans un contexte de développement informatique.

Ces mots n'ont pas de réelle traduction en français, ou alors celle-ci n'est que très rarement utilisée. Nous préférons donc laisser leur version anglaise dans la documentation pour rester au plus près de l'usage courant.

> Cette section de glossaire est spécifique à la documentation française de Svelte, et n'existe pas dans la documentation officielle.

## API

Une API est une interface de programmation d'application. Il s'agit d'un ensemble de **points d'accès** publics ou privés basés sur le protocol HTTP et qui répondent des données, généralement exprimé en JSON.

Une API peut suivre une architecture logicielle particulière. Les plus connues sont le REST (_Representational State Transfer_) ou le GraphQL (_Graph Query Language_).

Dans le cadre de SvelteKit, il est possible de [définir une API publique](PUBLIC_KIT_SITE_URL/docs/routing#server) en définissant un fichier `+server.js` dans le dossier `routes`.

## AST

Un arbre de la syntaxe abstraite (_Abstract Syntax Tree_ ou _AST_) est un format de représentation de certains données sous forme d'arbre dont les nœuds internes et les feuilles (ou nœuds externes) possèdent des caractéristiques particulières.

Svelte utilise le format _AST_ comme intermédiaire entre un composant Svelte et le code JavaScript natif interprété par le navigateur web.

## Bug

Vous le savez très certainement, un _bug_ (["insecte"](https://fr.wikipedia.org/wiki/Bug_(informatique)#/media/Fichier:First_Computer_Bug,_1945.jpg) en anglais) est une erreur ou un problème qui empêche le bon fonctionnement d'un logiciel.

Il est courant d'utiliser un _debugger_ ou "débuggueur" pour aider à la résolution de ces _bugs_.

Le mot francisé est "bogue", mais il semble que personne ne s'en serve.

## Build

Un _build_ est l'ensemble de fichiers produits par le <span class="vo">[bundler](/docs/web#bundler-packager)</span>. C'est le plus souvent ce qui sera utilisé pour déployer l'application en production.

## Build-time

Le build-time, par opposition au <span class="vo">[runtime](PUBLIC_SVELTE_SITE_URL/docs/development#runtime)</span> correspond à la phase de compilation d'un projet en un livrable qui pourra être exécuté sur la plateforme de déploiement du site ou de l'application.


## Buffer

Un _buffer_ (ou une mémoire tampon) est une zone de mémoire utilisée pour entreposer temporairement des données, notamment entre deux processus ou matériels ne travaillant pas au même rythme. Par extension, il s'agit également des données qui transitent entre deux appareils ou serveurs envoyés par paquet.

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

## CI

L'intégration continue est une méthode de développement de logiciel par laquelle les développeurs intègrent régulièrement leurs modifications de code à un référentiel centralisé. Au cours de l'intégration continue, des opérations de création, de test ou de déploiement peuvent être automatiquement configurés et exécutés.

## CLI

_CLI_ est l'acronyme de "Command Line Interface" ("Interface en ligne de commande"), et désigne l'<span class="vo">[API](#api)</span> d'un programme que l'on lance en ligne de commande.

Il s'agit donc de toutes les interactions possibles avec un programme que vous allez lancer en entrant des instructions dans votre terminal.

Par exemple, [npm](https://www.npmjs.com/) est un programme en ligne de commande, et possède donc un CLI. [Git](https://git-scm.com/book/fr/v2/D%C3%A9marrage-rapide-La-ligne-de-commande) est un autre exemple de programme pouvant s'exécuter via un CLI.

```bash
npm install
npm publish

git init
git clone
git branch
...
```

## Commit

Un _commit_, représente un enregistrement unitaire de code dans un projet suivi avec le logiciel git. L'ensemble des commits du projet représente l'historique de celui-ci.

Un _commit_ peut également faire référence à l'action de validation d'une série de requêtes exécutées sur une base de données.

## Debugger

Un _debugger_ est un outil logiciel aidant à la résolution de <span class="vo">[bugs](#bug)</span>.

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

Une _issue_ (qui signifie "problème" en anglais) est une note sur un dépôt à propos de quelque chose qui nécessite une attention particulière. Il peut s'agir d'un bogue, d'une demande de fonctionnalité, d'une question ou de bien d'autres choses. Cette terminologie est très utilisée entre autres sur les sites [Github](https://github.com), [Gitlab](https://gitlab.com) et [Bitbucket](https://bitbucket.org).

On parle parfois en français de "ticket".

## Log

Un _log_ est l'affichage d'une information lors de l'exécution d'un programme. Ils peuvent être affichées en direct, ou bien stockées dans un fichier de logs.

## Monorepo

Un _monorepo_ est un dépôt unique contenant plusieurs projets distincts, avec des relations bien définies. Des outils permettent de les mettre en oeuvre ; ils permettent notamment de compiler l'ensemble du projet en une étape suivant les dépendances internes.

## Namespace

Un `_namespace_` ou "espace de noms" est un espace abstrait dans lequel on peut regrouper des définitions. Cela permet de définir par exemple deux définitions ayant le même nom dans deux espaces différents, sans pour autant les confondre.

Par exemple, on peut définir `sinus` dans un namespace `Math`, ainsi que dans un namespace `Corps`. Ainsi `Math.sinus` renvoie à la fonction mathématique sinus, tandis que `Corps.sinus` renvoie aux cavités nasales du corps humain.

Dans le développement web, les `_namespaces_` sont souvent utilisés en TypeScript pour organiser les types.

## Number

_Number_ est le mot anglais pour "nombre". En développement informatique, il s'agit la plupart du temps d'un type de variable représentant des nombres.

# Open-source

Un projet _open source_ (ou en code source ouvert), est un projet dont la licence respecte des critères précisément établis, c'est-à-dire les possibilités de libre redistribution, d'accès au code source et de création de travaux dérivés.

## Package

Un _package_ ou une librairie est un ensemble de fonctions ou composants pouvant être réutilisés dans d'autres projets. Dans le contexte de NodeJs, les librairies <span class="vo">[open-source](#open-source)</span> sont disponibles sur le registre [npm](https://www.npmjs.com/). Les librairies peuvent également être privées (hébergées sur un dépôt privé) ou inclus dansw des [monorepos](#monorepo).

## Parser

_Parser_ est un verbe représentant l'action de transformer une donnée reçue dans un format adapté à son traitement. Un cas classique dans une application web est de _parser_ une chaîne de caractères représentant un <span class="vo">[JSON](/docs/web#json)</span>, reçu en réponse d'un appel HTTP, en un objet JavaScript, plus simple à manipuler. Dans d'autres contextes, il est est également possible de _parser_ du binaire en chaîne de caractères.

## Payload

Une _payload_ représente la donnée utile transportée dans une communication.

## Placeholder

Un _placeholder_ (ou texte de substitution) peut désigner deux choses :

* un texte ou image fictif permettant de s'imaginer un apperçu final. L'outil le plus connu pour générer du texte fictif est le Lorem Ipsum.
* l'attribut de l'élément html `<input>` ou `<textarea>` et désigne une aide à la saisie lorsque le champs est vide.

## Plugin

Un _plugin_ est une librairie utilitaire que l'on peut ajouter à un programme (navigateur web, <span class="vo">[IDE](/docs/development#ide)</span>, etc.) pour l'améliorer.

## Pull Request

Une _Pull Request_ est une demande d'intégration de nouveau code dans le code existant d'un logiciel. Ce terme est en général utilisé lorsque le logiciel est versionné avec Git.

Comme <span class="vo">[issue](#issue)</span>, cette terminologie est très utilisée entre autres sur les sites [Github](https://github.com) et [Bitbucket](https://bitbucket.org). Sur [Gitlab](https://gitlab.com), on parle de _Merge Request_, qui est synonyme.

## Race condition

Une _race condition_, ou ["situation de compétition"](https://fr.wikipedia.org/wiki/Situation_de_comp%C3%A9tition) décrit une situation où un enchaînement d'opérations effectuées par plusieurs acteurs d'un système donne des résultats différents selon l'ordre dans lequel les acteurs effectuent leurs opérations.

Il est en général préférable d'éviter d'avoir de telles situations.

## Readonly

On dit d'une entité qu'elle est _readonly_ lorsqu'on ne peut pas changer sa valeur une fois que celle-ci a été définie. On parle aussi de "lecture seule" en français.

Ce terme est à mettre en opposition avec <span class="vo">[writable](#writable)</span>.

## Repository

> Bientôt...

## Runtime

Un _runtime_ est un environnement d'exécution permettant d'effectuer les opérations d'un programme informatique dans un langage donné.

Dans le contexte du langage JavaScript, on désigne par _runtime_ les programmes permettant l'exécution de programmes écrits en JavaScript sur un serveur. Les trois _runtime_ JavaScript les plus connus sont [NodeJS](https://nodejs.org/en), [Deno](https://deno.com), et [Bun](https://bun.sh).

## Scope

Un _scope_ définit la [portée](https://fr.wikipedia.org/wiki/Port%C3%A9e_(informatique)) ou les limites dans lesquelles une certaine chose est définie ou a de l'influence.

On parle de la portée d'une variable en JavaScript pour désigner les limites dans lesquelles celle-ci est définie. De même, on parle de la portée d'une règle CSS pour désigner les limites dans lesquelles cette règle s'applique.

## Slash

Un _slash_ est simplement le caractère `/`, à ne pas confondre avec son frère jumeau _antislash_ `\`.

## Stack trace

Une _stack trace_, ou "trace de pile", est une liste détaillant dans l'ordre chronologique les appels de fonctions utilisés lorsqu'un programme informatique produit une erreur. Cela permet de suivre le chemin d'exécution du programme, et facilite ainsi la résolution de <span class="vo">[bugs](#bug)</span>.

## String

_String_ est le mot anglais pour "chaîne de caractères". En développement informatique, il s'agit la plupart du temps d'un type de variable représentant du texte.

## Timestamp

Un _timestamp_ est un compteur de seconde utilisé en informatique pour représenter une date à partir du 1er janvier 1970. Par extension, on parle de _timestamp_ d'un objet pour désigner sa date de création.

## Thread

Un _thread_, ou ["fil d'exécution"](https://fr.wikipedia.org/wiki/Thread_(informatique)) est similaire dans une certaine mesure à un processus permettant l'exécution de tâches sur un microprocesseur.

JavaScript est un langage ne pouvant historiquement s'exécuter que sur un seul _thread_, mais l'arrivée récente des [Web Workers](https://developer.mozilla.org/fr/docs/Web/API/Web_Workers_API/Using_web_workers) permet d'exécuter JavaScript sur plusieurs _threads_.

## Template

Un _template_ désigne un modèle qui simplifie la création d'un site web, d'un logiciel, d'une application ou d'un design. Il intègre des éléments déjà préconçus et faciles à modifier pour rendre la création web plus facile et rapide.

## Tooltip

Un _tooltip_ est une info-bulle, c'est-à-dire un message qui peut s'afficher à l'écran dans certaines circonstances (souvent au survol du curseur) pour fournir des informations contextuelles.

## Tree-shaking

Le _tree shaking_ désigne le processus par lequel un <span class="vo">[bundler](/docs/web#bundler-packager)</span> supprime du code mort (inutilisé). Pour ce faire, il repose sur les imports et exports pour détecter si les modules de code sont exportés et importés pour une utilisation entre des fichiers JavaScript.

## Warning

Un _warning_ est un avertissement, moins grave qu'une erreur, mais suffisamment important pour qu'il soit porté à l'attention des personnes concernées.

## Worker

Un _worker_ désigné chez certains hébergeurs une solution de déploiement logiciel particulier.

## Workflow

Un _workflow__ est un processus automatisé configurable qui exécute une ou plusieurs tâches, tels que les Github actions ou la GitLab CI.

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

On dit d'une entité qu'elle est _writable_ lorsqu'on peut pas changer sa valeur une fois que celle-ci a été définie. Le terme _writable_ est à mettre en opposition avec <span class="vo">[readonly](#readonly)</span>.

Dans le cadre de Svelte, _writable_ fait souvent référence à un <span class="vo">[store](/docs/sveltejs#store)</span> _writable_, dont la valeur peut être mise à jour.
