---
title: Introduction
---

Bienvenue sur la documentation Svelte de référence ! Ces pages sont pensées comme une ressource utile pour des personnes ayant déjà une certaine familiarité avec Svelte, et souhaitant en apprendre davantage.

Si ce n'est pas (encore) le cas pour vous, vous préférerez probablement jeter un oeil au [tutoriel interactif](/tutorial) ou aux [exemples](/examples) avant de consulter cette section. Vous pouvez essayez Svelte en ligne en utilisant le [REPL](/repl), ou bien sur [StackBlitz](https://sveltekit.new) si vous préférez un environnement de développement plus complet.

Cette documentation en français, ainsi que l'intégralité du contenu en français de ce site est une **traduction bénévole et non officielle** de la [documentation et du site officiels](https://svelte.dev) (en anglais). N'hésitez pas à y jeter un oeil. Vous pouvez aussi [nous faire part de vos suggestions de traduction](https://github.com/Svelte-Society-Fr/svelte/issues) si celles que vous trouverez dans ces pages ne vous conviennent pas.

## Démarrer un nouveau projet

Nous recommandons d'utiliser [SvelteKit](https://kit.svelte.dev/), le framework d'application officiel créé par l'équipe Svelte :

```
npm create svelte@latest myapp
cd myapp
npm install
npm run dev
```

SvelteKit se charge d'exécuter [le compilateur Svelte](https://www.npmjs.com/package/svelte) pour convertir vos fichiers `.svelte` en fichiers `.js` qui créent le DOM, et en fichiers `.css` qui le stylisent. Il fournit également tout ce dont vous avez besoin pour créer une application web, comme un serveur de développement, du routage, et des outils de déploiement. [SvelteKit](https://kit.svelte.dev/) utilise [Vite](https://vitejs.dev/) pour empaqueter votre code.

### Alternatives à SvelteKit

Si vous ne souhaitez pas utiliser SvelteKit, vous pouvez aussi utiliser Svelte (sans SvelteKit) avec Vite en exécutant `npm create vite@latest`, puis en choisissant l'option `svelte`. De cette manière, `npm run build` génèrera les fichiers HTML, JS et CSS dans le dossier `dist`. Dans la plupart des cas, vous aurez aussi probablement besoin de [choisir une librairie de routing](/faq#is-there-a-router).

Il existe également des [plugins pour les bundlers web majeurs](https://sveltesociety.dev/tools#bundling) pour gérer la compilation Svelte — qui génèreront les `.js` et `.css` à insérer dans votre HTML — mais la plupart ne gèreront pas pas le rendu côté serveur (SSR).

## Outillage d'éditeur

L'équipe Svelte maintient une extension [VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode), et des intégrations existent également pour d'autres [éditeurs](https://sveltesociety.dev/tools#editor-support) ou outils.

## Obtenir de l'aide

Si vous rencontrez des difficultés, vous trouverez de l'aide sur le [Discord officiel](https://svelte.dev/chat) ou sur le [Discord francophone](/chat). Vous trouverez également des réponses sur [StackOverflow](https://stackoverflow.com/questions/tagged/svelte).
