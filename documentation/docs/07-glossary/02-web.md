---
title: 'Web'
---

Voici quelques informations sur les angliscismes usuels utilisés dans le contexte web.

Ces mots n'ont pas de réelle traduction en français, ou alors celle-ci n'est que très rarement utilisée. Nous préférons donc laisser leur version anglaise dans la documentation pour rester au plus près de l'usage courant.

> Cette section de glossaire est spécifique à la documentation française de Svelte, et n'existe pas dans la documentation officielle.

## ARIA

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

## Checkbox

> Bientôt...

## Client-side rendering

> Bientôt...

## DOM

Le _Document Object Model_ (DOM) est la représentation objet d'un document HTML chargé dans le navigateur web. Cette représentation du document permet de le voir comme un groupe structuré de nœuds et d'objets possédant différentes propriétés et méthodes. On parle souvent d'"arbre DOM".

Le DOM relie les pages web aux scripts, fichiers de styles, ressources externes ou langages de programmation. Il peut être manipulé à l'aide du JavaScript.

## Framework

> Bientôt...

## Header

> Bientôt...

## Hot Module Reloading

> Bientôt...

## Iframe

> Bientôt...

## Keyframe

> Bientôt...

## Language Server

Un _language server_ est un algorithme exécuté par un <span class="vo">[IDE](/docs/development#ide)</span>. Il permet d’exécuter les aides au développement (autocomplétion, accès rapide, liste des utilisations, etc.) adaptées à un langage de programmation. L'interface entre l'IDE et le _language server_ est défini par un protocole, le _Language Server Protocol_ (LSP).

Plus d'infos sur le [site de la documentation du LSP](https://microsoft.github.io/language-server-protocol/).

## Lazy loading

> Bientôt...

## Markup

> Bientôt...

## Metadata

> Bientôt...

## MPA

> Bientôt...

## Preprocessing

> Bientôt...

## REPL

> Bientôt...

## Routing

> Bientôt...

## Sourcemap

> Bientôt...

## Server-side rendering

Le rendu côté serveur, ou _server-side rendering_ (SSR) est l'action de générer une page web avec tout ou partie des données métier directement sur le serveur. Il est à mettre en opposition avec le <span class='vo'>[rendu côté client](#client-side-rendering)</span>, ou _client-side rendering_, où les pages viennent charger la logique dans un premier temps et les données métiers avec des requêtes supplémentaires, ce qui implique de construire une grande partie de la page dans le navigateur.

Le SSR a pour avantages :

- une exécution plus rapide car nécessitant moins de requêtes
- le fait de pouvoir générer l'entièreté d'une page à la première requête, ce qui permet d'afficher une page même si JavaScript n'est pas disponible côté client
- bénéficie d'un meilleur référencement SEO, car les balises de référencement sont générées côté serveur et disponibles pour les outils d'indexation

SvelteKit propose le SSR par défaut, qui peut être désactivé au cas par cas.

## SPA

> Bientôt...

## Web component

> Bientôt...

## XSS

> Bientôt...
