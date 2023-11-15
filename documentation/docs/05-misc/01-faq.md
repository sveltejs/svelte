---
title: Foire aux questions
---

## Je débute avec Svelte. Par où commencer ?

Nous pensons que la meilleure manière de commencer est de jouer avec le [tutoriel](PUBLIC_LEARN_SITE_URL/) interactif. Chaque étape est principalement axée sur un aspect spécifique et est facile à suivre. Vous éditerez et exécuterez de vrais composants directement dans votre navigateur.

Cinq à dix minutes devraient suffire pour démarrer. Une heure et demie devrait vous permettre de parcourir entièrement le tutoriel.

## Où puis-je obtenir de l'aide ?

Si votre question est en rapport avec une certaine syntaxe, la [page d'API](https://svelte-french.vercel.app/docs/introduction) est un bon point de départ.

Stack Overflow est un forum populaire pour poser des questions liées à du code ou si vous bloquez sur une erreur spécifique. Lisez les questions existantes étiquetées avec [Svelte](https://stackoverflow.com/questions/tagged/svelte+or+svelte-3) ou [posez la votre](https://stackoverflow.com/questions/ask?tags=svelte) !

Il existe des forums en ligne pour échanger à propos des bonnes pratiques, de l'architecture d'une application ou tout simplement pour apprendre à connaître d'autres développeurs Svelte. [Le Discord anglophone](PUBLIC_SVELTE_SITE_URL/chat), le [Discord francophone](https://discord.gg/D6Dzc5m3) ou [le canal Reddit](https://www.reddit.com/r/sveltejs/) en sont des exemples. Si vous avez une question relative à du code Svelte, Stack Overflow est probablement le meilleur endroit.

## Existe-t-il des ressources tierces ?

La Svelte Society maintient une [liste de livres et vidéos](https://sveltesociety.dev/resources).

## Comment puis-je utiliser la coloration syntaxique sur mes fichiers .svelte dans VS Code ?

Il existe une [extension VS Code officielle pour Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode).

## Existe-t-il un outil pour formater automatiquement mes fichiers .svelte ?

Vous pouvez utiliser Prettier avec le <span class="vo">[plugin](/docs/development#plugin)</span> [plugin-prettier-svelte](https://www.npmjs.com/package/prettier-plugin-svelte).

## Comment documenter mes composants ?

Dans les éditeurs qui utilisent le <span class="vo">[Language Server](/docs/web#language-server)</span> Svelte ([svelte-language-server](https://www.npmjs.com/package/svelte-language-server)), vous pouvez documenter les composants, fonctions et exports à l'aide de commentaires spécialement formatés.

```svelte
<script>
	/** Comment doit-on appeler l'utilisateur ? */
	export let nom = 'world';
</script>

<!--
@component
Voici une documentation pour ce composant.
Elle apparaîtra au survol

- Vous pouvez utiliser la syntaxe Markdown ici.
- Vous pouvez également utiliser des blocs de code ici.
- Utilisation:
  ```tsx
  <main nom="Arethra">
  ```
-->
<main>
	<h1>
		Salut, {nom}
	</h1>
</main>
````

Note: Le `@component` est nécessaire dans le commentaire HTML qui décrit votre composant.

## Est-ce que l'usage de Svelte est pertinent à grande échelle ?

Il y aura certainement un article de blog à ce sujet, mais en attendant, consultez [cette discussion](https://github.com/sveltejs/svelte/issues/2546).

## Existe-t-il une bibliothèque de composants d'interface ?

Il existe plusieurs bibliothèques de composants d'interface ainsi que des composants autonomes. Retrouvez-les dans la [section design systems de la page composants](https://sveltesociety.dev/components#design-systems) du site de Svelte Society.

## Comment tester mes applications Svelte ?

La façon dont votre application est structurée et l'endroit où la logique est définie vont déterminer la meilleure façon de s'assurer qu'elle est correctement testée. Il est important de comprendre que certaines logiques ne devraient pas être définies dans un composant — notamment les sujets de transformation de données, de gestion d'état inter-composants, et l'affichage de <span class="vo">[logs](/docs/development#log)</span>, entre autres. Ayez en tête que la librairie Svelte a sa propre suite de tests, vous n'avez donc pas besoin d'écrire des tests pour vérifier les détails d'implémentation fournis par Svelte.

Une application Svelte aura généralement trois types différents de tests : Unitaires, Composants et <span class="vo">[end to end](/docs/development#end-to-end)<span> (E2E)

_Tests Unitaires_ : Servent à tester la logique métier en isolation. Souvent il s'agit de valider des fonction individuelles et des cas particuliers. Minimiser la surface de ces tests permet de les garder légers et rapides, et extraire un maximum de logique de vos composants Svelte vous permet d'augmenter le nombre de ce type de tests pour couvrir votre application. Lorsque vous créez un nouveau projet SvelteKit, vous avez la possibilité de choisir d'installer [Vitest](https://vitest.dev/) pour les tests unitaires. D'autres moteurs de tests pourraient être également utilisés.

_Tests de composant_ : Vérifier qu'un composant Svelte s'instancie et réagit comme prévu aux interactions au cours de sa vie nécessite un outil qui fournit un <span class="vo">[DOM](/docs/web#dom)</span>. Les composants peuvent être compilés (puisque Svelte est un compilateur et non une simple librairie) et montés pour permettre de vérifier la structure de l'élément, les gestionnaires d'évènements, l'état, et les autres fonctionnalités offertes par un composant Svelte. Les outils de test de composant vont d'une implémentation en mémoire type [jsdom](https://www.npmjs.com/package/jsdom) couplée à un moteur de test type [Vitest](https://vitest.dev/), à des solutions qui utilisent de vrais navigateurs pour fournir des fonctionnalités de tests visuels comme [Playwright](https://playwright.dev/docs/test-components) ou [Cypress](https://www.cypress.io/).

_Tests <span class="vo">[end to end](/docs/development#end-to-end)</span>_ : Pour vous assurer que votre application fonctionne comme prévu dans des cas réels d'utilisation, il est nécessaire de la tester d'une manière la plus proche possible de la production. Cela se fait avec des tests dits <span class="vo">[end to end](/docs/development#end-to-end)</span> (E2E) qui chargent et interagissent avec une version déployée de votre application afin de simuler les interactions utilisateur. Lorsque vous créez un nouveau projet SvelteKit, vous avez la possibilité de choisir d'installer [Playwright](https://playwright.dev/) pour les tests <span class="vo">[end to end](/docs/development#end-to-end)</span>. Il existe également d'autres librairies de tests E2E.

Quelques ressources pour démarrer avec les tests unitaires :

- [Svelte Testing Library](https://testing-library.com/docs/svelte-testing-library/example/)
- [Tests de composants Svelte avec Cypress](https://docs.cypress.io/guides/component-testing/svelte/overview)
- [Exemple utilisant vitest](https://github.com/vitest-dev/vitest/tree/main/examples/svelte)
- [Exemple utilisant uvu avec JSDOM](https://github.com/lukeed/uvu/tree/master/examples/svelte)
- [Tests de composants Svelte Vitest et Playwright](https://davipon.hashnode.dev/test-svelte-component-using-vitest-playwright)
- [Tests de composants avec WebdriverIO](https://webdriver.io/docs/component-testing/svelte)

## Un routeur est-il intégré ?

La bibliothèque officielle de <span class="vo">[routing](/docs/web#routing)</span> est [SvelteKit](PUBLIC_KIT_SITE_URL/). Sveltekit fournit un routeur basé sur le système de fichier, un <span class="vo">[rendu coté serveur (SSR)](/docs/web#server-side-rendering)</span> et un <span class="vo">[rechargement automatique de module (HMR)](/docs/web#hot-module-reloading)</span> en une seule librairie facile à utiliser. Il est similaire à Next.js pour React.

Toutefois, vous pouvez utiliser n'importe quelle bibliothèque de <span class='vo'>[routing](/docs/web#routing)</span> de votre choix. Beaucoup de gens utilisent [page.js](https://github.com/visionmedia/page.js). Il y a aussi [navaid](https://github.com/lukeed/navaid), qui est très similaire. Et [universal-router](https://github.com/kriasoft/universal-router), qui est isomorphe avec les routes enfants, mais sans prise en charge intégrée de l'historique.

Si vous préférez une approche HTML déclarative, il existe la bibliothèque isomorphe [svelte-routing](https://github.com/EmilTholin/svelte-routing) et un fork appelé [svelte-navigator](https://github. com/mefechoel/svelte-navigator) contenant des fonctionnalités supplémentaires.

Si vous avez besoin d'un <span class='vo'>[routing](/docs/web#routing)</span> basé sur le <span class="vo">[hashing](/docs/development#hash)</span> côté client, consultez [svelte-spa-router](https://github.com/ItalyPaleAle/svelte-spa-router) ou [abstract-state-router](https://github.com/TehShrike/abstract-state-router/).

[Routify](https://routify.dev) est un autre routeur basé sur l'arborescence de fichiers, similaire au routeur de SvelteKit. La version 3 supporte le rendu côté serveur natif de Svelte.

Vous pouvez trouver une [liste de routeurs maintenus par la communauté sur sveltesociety.dev](https://sveltesociety.dev/components#routers).

## Puis-je demander à Svelte de pne pas supprimer mes styles inutilisés ?

Non. Svelte supprime les styles inutilisés des composants et vous prévient pour éviter certaines problématiques qui surviendraient sinon.

Le <span class="vo">[scoping](/docs/development#scope)</span> des styles d'un composant Svelte fonctionne en générant une classe unique pour le composant en question, en l'ajoutant aux éléments pertinents du composant sous le contrôle de Svelte, puis en ajoutant cette classe à chacun des sélecteurs dans le style de ce composant. Si le compilateur ne peut pas savoir sur quels éléments un sélecteur de style s'applique, deux mauvaises options s'offrent à lui pour le garder :

- S'il garde le sélecteur et lui ajoute la classe, le sélecteur ne s'appliquera probablement plus aux éléments du composant auxquels il est censé s'appliquer, et certainement pas si ces éléments ont été créés par un composant enfant ou par `{@html ...}`.
- S'il garde le sélecteur sans lui ajouter la classe, le style en question devient un style global, affectant toute votre page.

Si vous ave besoin de styliser quelque chose que Svelte ne peut pas identifier au moment de la compilation, vous aurez besoin d'utiliser explicitement les styles globaux en utilisant `:global (...)`. Mais gardez également en tête que vous pouvez entourer seulement une partie d'un sélecteur avec `:global (...)`. `.foo :global(.bar) { ... }` s'appliquera à tout élément `.bar` présent dans les éléments `.foo` du composant. Tant qu'il y a un élément parent au sein du composant courant, les sélecteur globaux partiels comme `.foo :global(.bar) { ... }` vous permettront presque systématiquement d'obtenir ce que vous recherchez.

## La version 2 de Svelte est-elle toujours disponible ?

Nous n'y ajoutons pas de nouvelles fonctionnalités, et les bugs ne seront probablement corrigés que s'ils sont extrêmement dangereux ou présentent une sorte de vulnérabilité de sécurité.

La documentation est toujours disponible [ici](https://v2.svelte.dev/guide).

## Comment puis-je recharger un module automatiquement ?

Nous vous recommandons d'utiliser [SvelteKit](PUBLIC_KIT_SITE_URL/), qui prend en charge le <span class="vo">[HMR](/docs/web#hot-module-reloading)</span> prêt à l'emploi et est construit avec [Vite](https://vitejs.dev/) et [svelte-hmr](https://github.com/sveltejs/svelte-hmr). Il existe également des <span class="vo">[plugins](/docs/development#plugin)</span> communautaires pour [rollup](https://github.com/rixo/rollup-plugin-svelte-hot) et [webpack](https://github.com/sveltejs/svelte-loader).
