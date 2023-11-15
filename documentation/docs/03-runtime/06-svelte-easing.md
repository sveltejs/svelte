---
title: 'svelte/easing'
---

Les fonctions de lissage permettent de configurer la vitesse de transitions ou d'animations. Elles peuvent également être utilisées avec les <span class="vo">[stores](/docs/sveltejs#store)</span> [`tweened`](/docs/svelte-motion#tweened) et [`spring`](/docs/svelte-motion#spring). `svelte/easing` exporte 31 utilitaires, une fonction de lissage linéaire (`linear`), et 3 variantes de 10 différentes fonctions de lissage : `in`, `out` et `inOut`.

Un exemple de chaque méthode est présenté dans le [démonstrateur des fonctions de lissage](/examples/easing) ainsi que dans la section d'[exemples](/examples).


| ease | in | out | inOut |
| --- | --- | --- | --- |
| **back** | `backIn` | `backOut` | `backInOut` |
| **bounce** | `bounceIn` | `bounceOut` | `bounceInOut` |
| **circ** | `circIn` | `circOut` | `circInOut` |
| **cubic** | `cubicIn` | `cubicOut` | `cubicInOut` |
| **elastic** | `elasticIn` | `elasticOut` | `elasticInOut` |
| **expo** | `expoIn` | `expoOut` | `expoInOut` |
| **quad** | `quadIn` | `quadOut` | `quadInOut` |
| **quart** | `quartIn` | `quartOut` | `quartInOut` |
| **quint** | `quintIn` | `quintOut` | `quintInOut` |
| **sine** | `sineIn` | `sineOut` | `sineInOut` |

<!-- TODO -->

<!--
<div class="max">
	<iframe
		title="Aphrodite example"
		src="/repl/easing"
		scrolling="no"
	></iframe>
</div> -->
