---
title: 'svelte/easing'
---

Easing functions specify the rate of change over time and are useful when working with Svelte's built-in transitions and animations as well as the tweened and spring utilities. `svelte/easing` contains 31 named exports, a `linear` ease and 3 variants of 10 different easing functions: `in`, `out` and `inOut`.

You can explore the various eases using the [ease visualiser](/examples/easing) in the [examples section](/examples).

| ease        | in          | out          | inOut          |
| ----------- | ----------- | ------------ | -------------- |
| **back**    | `backIn`    | `backOut`    | `backInOut`    |
| **bounce**  | `bounceIn`  | `bounceOut`  | `bounceInOut`  |
| **circ**    | `circIn`    | `circOut`    | `circInOut`    |
| **cubic**   | `cubicIn`   | `cubicOut`   | `cubicInOut`   |
| **elastic** | `elasticIn` | `elasticOut` | `elasticInOut` |
| **expo**    | `expoIn`    | `expoOut`    | `expoInOut`    |
| **quad**    | `quadIn`    | `quadOut`    | `quadInOut`    |
| **quart**   | `quartIn`   | `quartOut`   | `quartInOut`   |
| **quint**   | `quintIn`   | `quintOut`   | `quintInOut`   |
| **sine**    | `sineIn`    | `sineOut`    | `sineInOut`    |

<!-- TODO -->

<!--
<div class="max">
	<iframe
		title="Aphrodite example"
		src="/repl/easing"
		scrolling="no"
	></iframe>
</div> -->
