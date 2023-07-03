---
title: 'Web'
---

Voici quelques informations sur les angliscismes usuels utilisés dans le contexte web.

Ces mots n'ont pas de réelle traduction en français, ou alors celle-ci n'est que très rarement utilisée. Nous préférons donc laisser leur version anglaise dans la documentation pour rester au plus près de l'usage courant.

> Cette section de glossaire est spécifique à la documentation française de Svelte, et n'existe pas dans la documentation officielle.

## ARIA

[_ARIA_](https://developer.mozilla.org/fr/docs/Web/Accessibility/ARIA) est l'acronyme de "Accessible Rich Internet Applications", et a pour objectif la popularisation d'applications internet riches d'un point de vue de l'accessibilité. Il s'agit plus concrètement d'un ensemble d'attributs et de rôles HTML permettant de rendre le contenu d'une page web plus accessible.

## Backend

> Bientôt...

## Body

> Bientôt...

## Bundler / Packager

Un _bundler_ (ou _packager_) est un outil de développement qui permet à une application web répartie sur plusieurs fichiers sources d'être ramenée à un nombre réduit de fichiers (voir en un unique fichier).

L'étape de _bundling_ est donc une sorte de compilation spécifique au contexte du web. C'est souvent lors de cette étape que l'on transforme notre code source pour l'optimiser pour le navigateur.

Les transformations classiques effectuées lors d'un _bundling_ sont :
- Typescript => Javascript
- JSX => Javascript
- Svelte => Javascript, HTML et CSS
- Minification
- ES20XX => ES6
- Réorganisation des dossiers et fichiers

> Vite et Rollup sont des exemples de _bundler_.

## CDN

> Bientôt...

## Checkbox

Une [_checkbox_](https://developer.mozilla.org/fr/docs/Web/HTML/Element/input/checkbox) est une boîte à cocher permettant à un utilisateur ou utilisatrice de faire des choix dans des formulaires.

## Client-side rendering

Le rendu côté client, ou _client-side rendering_ (CSR) est l'action de générer une page web avec tout ou partie des données métier dans le navigateur. Il est à mettre en opposition avec le <span class='vo'>[rendu côté serveur](#server-side-rendering)</span>, ou _server-side rendering_, où les pages viennent charger leurs données métier d'abord sur le serveur.

Le CSR permet notamment de naviguer au sein d'une application sans jamais reconstruire intégralement la page, puisque les différents éléments de la page sont ajoutés au fur et à mesure de la navigation. Le CSR est la stratégie de rendu naturelle des <span class="vo">[SPAs](#spa)</span>.

Une stratégie CSR nécessite néanmoins d'avoir JavaScript disponible dans son navigateur.

## CMS

> Bientôt...

## Cross-site

> Bientôt...

## Desktop

_Desktop_ signifie "bureau" en anglais et désigne un ordinateur dans un contexte de développement. Dans le milieu du web, on distingue parfois une navigation _desktop_ d'une navigation mobile pour des questions de design ou de comportements différents.

## DOM

Le _Document Object Model_ (DOM) est la représentation objet d'un document HTML chargé dans le navigateur web. Cette représentation du document permet de le voir comme un groupe structuré de nœuds et d'objets possédant différentes propriétés et méthodes. On parle souvent d'"arbre DOM".

Le DOM relie les pages web aux scripts, fichiers de styles, ressources externes ou langages de programmation. Il peut être manipulé à l'aide du JavaScript.

## DNS

> Bientôt...

## Edge

> Bientôt...

## Endpoint

Un _endpoint_ (ou "point de terminaison") est un point d'accès d'une <span class="vo">[API](/docs/development#api)</span> permettant d'interagir avec cette API.

Dans un contexte web, on parle souvent d'un _endpoint_ d'API REST, permettant de requêter les données d'un serveur.

## Framework

Un _framework_ est une libraire complète proposant des outils ainsi qu'une philosophie de travail permettant de réaliser une tâche particulière du début à la fin.

Il existe toutes sortes de frameworks, notamment serveur (Express, ...), de composants client (React, Vue, Svelte, ...) ou d'application (SvelteKit, Next, ...).

## Frontend

> Bientôt...

## Header

Un _header_ ou "en-tête" est un information que l'on fournit à une requête ou réponse HTTP pour préciser des informations sur la requête ou la réponse.

## Hot Module Reloading

Le _Hot Module Reloading_ (ou HMR) est un outil de développement permettant de rafraîchir instantanément l'état d'une page web lorsque le code source est modifié, afin de fluidifier le travail de développement. Cet outil est aujourd'hui proposé par la plupart des <span class="vo">[bundlers](#bundler-packager)</span> modernes.

## Iframe

Une [_iframe_](https://developer.mozilla.org/fr/docs/Web/HTML/Element/iframe) est un élément HTML (`<iframe>`) permettant d'intégrer une page web au sein d'une autre page web, affichant ainsi le contenu d'un site dans un autre site. Les communications entre l'_iframe_ et la page principale sont volontairement limitées pour des raisons de sécurité.

## ISR

> Bientôt...

## JSON

Le [_JSON_](https://fr.wikipedia.org/wiki/JavaScript_Object_Notation) ("JavaScript Object Notation") est un format de données représentant un objet JavaScript sous forme de chaîne de caractères. C'est un format très populaire pour transmettre des données sur le web.

```json
{
    "name": "Lucie",
		"age": 43,
		"pets": [{
			"name": "Cookie",
			"age": 3,
			"type": "dog"
		}, {
			"name": "Chouquette",
			"age": 7,
			"type": "cat"
		}]
}
```

## Keyframe

Une _keyframe_ représente une étape lors d'une animation CSS. L'usage de _keyframes_ permet de contrôler précisément le déroulé d'une animation CSS.

## Language Server

Un _language server_ est un algorithme exécuté par un <span class="vo">[IDE](/docs/development#ide)</span>. Il permet d’exécuter les aides au développement (autocomplétion, accès rapide, liste des utilisations, etc.) adaptées à un langage de programmation. L'interface entre l'IDE et le _language server_ est défini par un protocole, le _Language Server Protocol_ (LSP).

Plus d'infos sur le [site de la documentation du LSP](https://microsoft.github.io/language-server-protocol/).

## Layout

Dans le web, un _layout_ désigne un composant particulier qui a pour but de formaliser une mise en page donnée. Elle peut alors être utilisée pour tout ou partie de l'application voire être composée avec d'autres _layouts_.

## Lazy loading

Le _lazy loading_ (ou "chargement différé" ou "chargement paresseux") est l'action de charger de l'information au moment où elle nécessaire. Par exemple, il est courant d'utiliser cette technique pour charger les images d'une page de site web uniquement lorsqu'elles sont censées être visibles, mais pas avant. Cela permet de rendre le chargement initial de la page plus léger, car la plupart des images ne seront alors pas chargées.

## Load balancer

> Bientôt...

## Lockfile

> Bientôt...

## Markup

Un langage de _markup_ est un [langage de balisage](https://fr.wikipedia.org/wiki/Langage_de_balisage), c'est-à-dire décrivant l'information au sein de balises telles que `<image>` ou `<article>`. Les langages HTML et XML sont deux exemples de langages de _markup_.

Lorsqu'on parle de _markup_, on désigne l'ensemble des balises présentes dans un document ou une page.

## Metadata

Les _metadata_, ou "meta-données", sont des données non essentielles mais permettant d'enrichir le contexte des données auxquelles elles se réfèrent. Par exemple, la langue d'une page n'est pas la donnée principale de la page — le texte de la page est la donnée principale —, mais est une meta-donnée permettant de mieux interpréter le contenu de la page.

## Middleware

> Bientôt...

## MIME

> Bientôt...

## MPA

Une _Multi Page Application_, ou "Application Multi-Page", est un type d'application web se déployant sur plusieurs pages distinctes que l'on charge au fur et à mesure de la navigation. C'est le type d'application historique du web.

Les _MPAs_ sont à mettre en opposition avec les <span class="vo">[SPAs](#spa)</span>, applications sur une seule page, permettant de ne pas recharger intégralement la page à chaque navigation.

Les _MPAs_ sont souvent utilisées conjointement à une stratégie de [rendu côté serveur](#server-side-rendering).

## Preprocessing

Le _preprocessing_ désigne le fait de préparer préalablement du code ou de la donnée afin de l'optimiser ou l'adapter à son futur traitement.

Le développement JavaScript moderne implique souvent plusieurs étapes de _preprocessing_, comme par exemple :
- transformer du code JavaScript moderne en code JavaScript plus ancien, mais compatible avec plus de navigateurs
- transformer du code TypeScript en code JavaScript
- transformer du code SASS en code CSS
- minifier le code JavaScript pour le rendre plus léger à transporter

Svelte utilise également des préprocesseurs pour convertir les composants Svelte en code JavaScript natif, compréhensible par le navigateur.

## Prerendering

Le _prerendering_, ou "rendu préalable", est une stratégie de rendu d'une page web construisant les pages à l'avance. À la différences des stratégies <span class="vo">[CSR](#client-side-rendering)</span> ou <span class="vo">[SSR](#server-side-rendering)</span>, les pages prérendues sont construites une seule fois, au moment de la compilation (dans le cas où l'application nécessite une étape de compilation).

Toutes les pages d'une application ne sont pas compatibles avec cette stratégie, car il est nécessaire que les pages soient statiques, c'est-à-dire que leur contenu soit le même quel que soit la personne visitant la page ou quel que soit le moment de la visite.

Le <span class="vo">[SSG](#ssg)</span> permet d'avoir une application construite entièrement avec des pages prérendues.

## Proxy

> Bientôt...

## REPL

Un _REPL_ (de l'anglais "Read-Eval-Print-Loop") est un outil permettant de modifier et d'exécuter du code sur une page web et dans un environnement restreint, afin de tester certaines fonctionnalités. Svelte propose son propre [_REPL_](/repl).

## Routing

Le _routing_, ou "routage", est le fait d'aiguiller un utilisateur ou une utilisatrice sur les différentes pages d'un site web, éventuellement via des redirections. Normalement géré par le serveur recevant les requêtes — on parlera alors de _routing_ serveur —, il est également possible de gérer cet aiguillage directement sur le client dans une stratégie <span class="vo">[CSR](#client-side-rendering)</span> — on parlera alors de _routing_ client.

## Sourcemap

Une _sourcemap_ est un fichier ou une structure de données associée à un code source, généralement utilisée dans le développement web et la programmation front-end. Elle sert à établir une correspondance entre le code source original, tel qu'il est écrit dans un langage de programmation comme JavaScript, et le code résultant après compilation, minification ou transpilation, qui lui sera réellement exécuté par le navigateur. Cela permet de facilement retrouver dans le code source l'origine d'un <span class="vo">[bug](/docs/development#bug)</span> qui aura été généré par le code compilé.

## SEO

Le _SEO_ ("Search Engine Optimization") désigne l'ensemble des stratégies appliquées à un site web pour optimiser le référencement de ses pages au sein des moteurs de recherche, permettant une meilleure visibilité du site sur internet.

## Serverless

> Bientôt...

## Service worker

> Bientôt...

## Server-side rendering

Le rendu côté serveur, ou _server-side rendering_ (SSR) est l'action de générer une page web avec tout ou partie des données métier directement sur le serveur. Il est à mettre en opposition avec le <span class='vo'>[rendu côté client](#client-side-rendering)</span>, ou _client-side rendering_, où les pages viennent charger la logique dans un premier temps et les données métiers avec des requêtes supplémentaires, ce qui implique de construire une grande partie de la page dans le navigateur. Le SSR est une stratégie de rendu s'intégrant naturellement dans des [MPAs](#mpa).

Le SSR a pour avantages :

- une exécution plus rapide car nécessitant moins de requêtes
- le fait de pouvoir générer l'entièreté d'une page à la première requête, ce qui permet d'afficher une page même si JavaScript n'est pas disponible côté client
- bénéficie d'un meilleur référencement SEO, car les balises de référencement sont générées côté serveur et disponibles pour les outils d'indexation

SvelteKit propose le SSR par défaut, qui peut être désactivé au cas par cas.

## Sitemap

> Bientôt...

## Socket

> Bientôt...

## SPA

Une _Single Page Application_, ou "Application sur une seule page" est un genre d'application web popularisée par le <span class="vo">[frameworks](#framework)</span> [React](https://react.dev/) et [AngularJS](https://fr.wikipedia.org/wiki/AngularJS). Le principe est de construire tout le HTML de son application côté client (donc dans le navigateur), et de naviguer dans les différentes sections de l'application sans recharger la page.

Le fait de ne pas avoir besoin de recharger la page permet des fonctionnalités comme ne pas interrompre la lecture d'un flux audio ou vidéo lors de la navigation. Mais ce type d'application a également de gros inconvénients parmi lesquels un temps de chargement potentiellement allongé ainsi qu'une forte dégradation du référencement.

Les _SPAs_ sont à mettre en opposition avec les <span class="vo">[MPAs](#mpa)</span>, applications multi-pages, nécessitant un rechargement complet entre chaque page.

Les _SPAs_ nécessitent une stratégie de [rendu côté client](#client-side-rendering), et à ce titre sont plutôt considérées comme des mauvaises pratiques, sauf dans quelques cas très particuliers.

On leur préfère des stratégies comme le <span class="vo">[SSR](#server-side-rendering)</span>, le <span class="vo">[SSG](#ssg)</span>, ou encore des stratégies hybrides.

## SSG

_SSG_ est l'acronyme de "Static Site Generation", ou "Génération de Site Statique". Il s'agit d'une stratégie de rendu d'une application web où l'intégralité des pages est généré automatiquement au moment de la compilation, utilisant des méthodes de <span class="vo">[prerendering](#prerendering)</span>.

Cette stratégie requiert que toutes les pages de l'application soient statiques, c'est-à-dire que leur contenu soit le même quel que soit la personne visitant la page ou quel que soit le moment de la visite.

## Stream

> Bientôt...

## TLS

> Bientôt...

## Trailing slash

Un _trailing slash_ est le <span class="vo">[slash](/docs/development#slash)</span> que l'on retrouve parfois à la fin d'une url, par exemple `https://www.mon-super-site.com/bonjour/`.

La présence ou l'absence de ce _trailing slash_ a des répercussions sur les navigations relatives au sein du site ainsi que sur le référencement des pages concernées

## Viewport

Le _viewport_ désigne la surface visible d'une page web au sein d'un navigateur.

## Web component

Les [_web components_](https://developer.mozilla.org/fr/docs/Web/API/Web_components) sont des éléments HTML personnalisés réutilisables, créés via une <span class="vo">[API](/docs/development#api)</span> standardisée.

## XSS

_XSS_ est l'acronyme de ["Cross-Site-Scripting"](https://fr.wikipedia.org/wiki/Cross-site_scripting). Il s'agit d'un type d'attaque informatique ciblant les pages d'un site web dans l'objectif de subtiliser les informations de connexion d'un utilisateur ou d'une utilisatrice via l'exécution d'un script malveillant au sein même de la page.
