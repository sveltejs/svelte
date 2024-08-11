---
title: Side effects
---

- `$effect` (.pre)
- when not to use it, better patterns for what to do instead

Side effects play a crucial role in applications. They are triggered by state changes and can then interact with external systems, like logging something, setting up a server connection or synchronize with a third-party library that has no knowledge of Svelte's reactivity model.

## `$effect` fundamentals

To run _side-effects_ when the component is mounted to the DOM, and when values change, we can use the `$effect` rune ([demo](/#H4sIAAAAAAAAE31T24rbMBD9lUG7kAQ2sbdlX7xOYNk_aB_rQhRpbAsU2UiTW0P-vbrYubSlYGzmzMzROTPymdVKo2PFjzMzfIusYB99z14YnfoQuD1qQh-7bmdFQEonrOppVZmKNBI49QthCc-OOOH0LZ-9jxnR6c7eUpOnuv6KeT5JFdcqbvbcBcgDz1jXKGg6ncFyBedYR6IzLrAZwiN5vtSxaJA-EzadfJEjKw11C6GR22-BLH8B_wxdByWpvUYtqqal2XB6RVkG1CoHB6U1WJzbnYFDiwb3aGEdDa3Bm1oH12sQLTcNPp7r56m_00mHocSG97_zd7ICUXonA5fwKbPbkE2ZtMJGGVkEdctzQi4QzSwr9prnFYNk5hpmqVuqPQjNnfOJoMF22lUsrq_UfIN6lfSVyvQ7grB3X2mjMZYO3XO9w-U5iLx42qg29md3BP_ni5P4gy9ikTBlHxjLzAtPDlyYZmRdjAbGq7HprEQ7p64v4LU_guu0kvAkhBim3nMplWl8FreQD-CW20aZR0wq12t-KqDWeBywhvexKC3memmDwlHAv9q4Vo2ZK8KtK0CgX7u9J8wXbzdKv-nRnfF_2baTqlYoWUF2h5efl9-n0O6koAMAAA==)):

```svelte
<script>
	let size = $state(50);
	let color = $state('#ff3e00');

	let canvas;

	$effect(() => {
		const context = canvas.getContext('2d');
		context.clearRect(0, 0, canvas.width, canvas.height);

		// this will re-run whenever `color` or `size` change
		context.fillStyle = color;
		context.fillRect(0, 0, size, size);
	});
</script>

<canvas bind:this={canvas} width="100" height="100" />
```

The function passed to `$effect` will run when the component mounts, and will re-run after any changes to the values it reads that were declared with `$state` or `$derived` (including those passed in with `$props`). Re-runs are batched (i.e. changing `color` and `size` in the same moment won't cause two separate runs), and happen after any DOM updates have been applied.

You can return a function from `$effect`, which will run immediately before the effect re-runs, and before it is destroyed ([demo](/#H4sIAAAAAAAAE42SzW6DMBCEX2Vl5RDaVCQ9JoDUY--9lUox9lKsGBvZC1GEePcaKPnpqSe86_m0M2t6ViqNnu0_e2Z4jWzP3pqGbRhdmrHwHWrCUHvbOjF2Ei-caijLTU4aCYRtDUEKK0-ccL2NDstNrbRWHoU10t8Eu-121gTVCssSBa3XEaQZ9GMrpziGj0p5OAccCgSHwmEgJZwrNNihg6MyhK7j-gii4uYb_YyGUZ5guQwzPdL7b_U4ZNSOvp9T2B3m1rB5cLx4zMkhtc7AHz7YVCVwEFzrgosTBMuNs52SKDegaPbvWnMH8AhUXaNUIY6-hHCldQhUIcyLCFlfAuHvkCKaYk8iYevGGgy2wyyJnpy9oLwG0sjdNe2yhGhJN32HsUzi2xOapNpl_bSLIYnDeeoVLZE1YI3QSpzSfo7-8J5PKbwOmdf2jC6JZyD7HxpPaMk93aHhF6utVKVCyfbkWhy-hh9Z3o_2nQIAAA==)).

```svelte
<script>
	let count = $state(0);
	let milliseconds = $state(1000);

	$effect(() => {
		// This will be recreated whenever `milliseconds` changes
		const interval = setInterval(() => {
			count += 1;
		}, milliseconds);

		return () => {
			// if a callback is provided, it will run
			// a) immediately before the effect re-runs
			// b) when the component is destroyed
			clearInterval(interval);
		};
	});
</script>

<h1>{count}</h1>

<button onclick={() => (milliseconds *= 2)}>slower</button>
<button onclick={() => (milliseconds /= 2)}>faster</button>
```

## `$effect` dependencies

`$effect` automatically picks up any reactivy values (`$state`, `$derived`, `$props`) that are _synchronously_ read inside its function body and registers them as dependencies. When those dependencies change, the `$effect` schedules a rerun.

Values that are read asynchronously — after an `await` or inside a `setTimeout`, for example — will _not_ be tracked. Here, the canvas will be repainted when `color` changes, but not when `size` changes ([demo](/#H4sIAAAAAAAAE31T24rbMBD9lUG7kCxsbG_LvrhOoPQP2r7VhSjy2BbIspHGuTT436tLnMtSCiaOzpw5M2dGPrNaKrQs_3VmmnfIcvZ1GNgro9PgD3aPitCdbT8a4ZHCCiMH2pS6JIUEVv5BWMOzJU64fM9evswR0ave3EKLp7r-jFm2iIwri-s9tx5ywDPWNQpaLl9gvYFz4JHotfVqmvBITi9mJA3St4gtF5-qWZUuvEQo5Oa7F8tewT2XrIOsqL2eWpRNS7eGSkpToFZaOEilwODKjBoOLWrco4FtsLQF0XLdoE2S5LGmm6X6QSflBxKod8IW6afssB8_uAslndJuJNA9hWKw9VO91pmJ92XunHlu_J1nMDk8_p_8q0hvO9NFtA47qavcW12fIzJBmM26ZG9ZVjKIs7ke05hdyT0Ixa11Ad-P6ZUtWbgNheI7VJvYQiH14Bz5a-SYxvtwIqHonqsR12ff8ORkQ-chP70T-L9eGO4HvYAFwRh9UCxS13h0YP2CgmoyG5h3setNhWZF_ZDD23AE2ytZwZMQ4jLYgVeV1I2LYgfZBey4aaR-xCppB8VPOdQKjxes4UMgxcVcvwHf4dzAv9K4ko1eScLO5iDQXQFzL5gl7zdJt-nZnXYfbddXspZYsZzMiNPv6S8Bl41G7wMAAA==)):

```ts
// @filename: index.ts
declare let canvas: {
	width: number;
	height: number;
	getContext(type: '2d', options?: CanvasRenderingContext2DSettings): CanvasRenderingContext2D;
};
declare let color: string;
declare let size: number;

// ---cut---
$effect(() => {
	const context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);

	// this will re-run whenever `color` changes...
	context.fillStyle = color;

	setTimeout(() => {
		// ...but not when `size` changes
		context.fillRect(0, 0, size, size);
	}, 0);
});
```

An effect only reruns when the object it reads changes, not when a property inside it changes. (If you want to observe changes _inside_ an object at dev time, you can use [`$inspect`](/docs/svelte/misc/debugging#$inspect).)

```svelte
<script>
	let state = $state({ value: 0 });
	let derived = $derived({ value: state.value * 2 });

	// this will run once, because `state` is never reassigned (only mutated)
	$effect(() => {
		state;
	});

	// this will run whenever `state.value` changes...
	$effect(() => {
		state.value;
	});

	// ...and so will this, because `derived` is a new object each time
	$effect(() => {
		derived;
	});
</script>

<button onclick={() => (state.value += 1)}>
	{state.value}
</button>

<p>{state.value} doubled is {derived.value}</p>
```

## When not to use `$effect`

In general, `$effect` is best considered something of an escape hatch — useful for things like analytics and direct DOM manipulation — rather than a tool you should use frequently. In particular, avoid using it to synchronise state. Instead of this...

```svelte
<script>
	let count = $state(0);
	let doubled = $state();

	// don't do this!
	$effect(() => {
		doubled = count * 2;
	});
</script>
```

...do this:

```svelte
<script>
	let count = $state(0);
	let doubled = $derived(count * 2);
</script>
```

> For things that are more complicated than a simple expression like `count * 2`, you can also use [`$derived.by`](#$derived-by).

You might be tempted to do something convoluted with effects to link one value to another. The following example shows two inputs for "money spent" and "money left" that are connected to each other. If you update one, the other should update accordingly. Don't use effects for this ([demo](/#H4sIAAAAAAAACpVRy2rDMBD8lWXJwYE0dg-9KFYg31H3oNirIJBlYa1DjPG_F8l1XEop9LgzOzP7mFAbSwHF-4ROtYQCL97jAXn0sQh3skx4wNANfR2RMtS98XyuXMWWGLhjZUHCa1GcVix4cgwSdoEVU1bsn4wl_Y1I2kS6inekNdWcZXuQZ5giFDWpfwl5WYyT2fynbB1g1UWbTVbm2w6utOpKNq1TGucHhri6rLBX7kYVwtW4RtyVHUhOyXeGVj3klLxnyJP0i8lXNJUx6en-v6A48K85kTimpi0sYj-yAo-Wlh9FcL1LY4K3ahSgLT1OC3ZTXkBxfKN2uVC6T5LjAduuMdpQg4L7geaP-RNHPuClMQIAAA==)):

```svelte
<script>
	let total = 100;
	let spent = $state(0);
	let left = $state(total);

	$effect(() => {
		left = total - spent;
	});

	$effect(() => {
		spent = total - left;
	});
</script>

<label>
	<input type="range" bind:value={spent} max={total} />
	{spent}/{total} spent
</label>

<label>
	<input type="range" bind:value={left} max={total} />
	{left}/{total} left
</label>
```

Instead, use callbacks where possible ([demo](/#H4sIAAAAAAAACo2SP2-DMBDFv8rp1CFR84cOXQhU6p6tY-ngwoEsGWPhI0pk8d0rG5yglqGj37v7veMJh7VUZDH9dKhFS5jiuzG4Q74Z_7AXUky4Q9sNfemVzJa9NPxW6IIVMXDHQkEOL0lyipo1pBlyeLIsmDbJ9u4oqhdG2A2mLrgedMmy0zCYSjB9eMaGtuC8WXBkPtOBRd8QHy5CDXSa3Jk7HbOfDgjWuAo_U71kz9vr6Bgc2X44orPjow2dKfFNKhSTSW0GBl9iXmAvdEMFQqDmLgBH6HQYyt3ie0doxTV3IWqEY2DN88eohqePvsf9O9mf_if4HMSVXD89NfEI99qvbMs3RdPv4MXYaSWtUeKWQq3oOlfZCJNCcnildlFgWMcdtl0la0kVptwPNH6NP_uzV0acAgAA)):

```svelte
<script>
	let total = 100;
	let spent = $state(0);
	let left = $state(total);

	function updateSpent(e) {
		spent = +e.target.value;
		left = total - spent;
	}

	function updateLeft(e) {
		left = +e.target.value;
		spent = total - left;
	}
</script>

<label>
	<input type="range" value={spent} oninput={updateSpent} max={total} />
	{spent}/{total} spent
</label>

<label>
	<input type="range" value={left} oninput={updateLeft} max={total} />
	{left}/{total} left
</label>
```

If you need to use bindings, for whatever reason (for example when you want some kind of "writable `$derived`"), consider using getters and setters to synchronise state ([demo](/#H4sIAAAAAAAACo2SQW-DMAyF_4pl7dBqXcsOu1CYtHtvO44dsmKqSCFExFRFiP8-xRCGth52tJ_9PecpA1bakMf0Y0CrasIU35zDHXLvQuGvZJhwh77p2nPoZP7casevhS3YEAM3rAzk8Jwkx9jzjixDDg-eFdMm2S6KoWolyK6ItuCqs2fWjYXOlYrpPTA2tIUhiAVH5iPtWbUX4v1VmY6Okzpzp2OepgNEGu_CT1St2fP2fXQ0juwwHNHZ4ScNmxn1RUaCybR1HUMIMS-wVfZCBYJQ80GAIzRWhvJh9d4RanXLB7Ea4SCsef4Qu1IG68Xu387h9D_GJ2ne8ZXpxTZUv1w994amjxCaMc1Se2dUn0Jl6DaHeFEuhWT_QvUqOlnHHdZNqStNJabcdjR-jt8IbC-7lgIAAA==)):

```svelte
<script>
	let total = 100;
	let spent = $state(0);

	let left = {
		get value() {
			return total - spent;
		},
		set value(v) {
			spent = total - v;
		}
	};
</script>

<label>
	<input type="range" bind:value={spent} max={total} />
	{spent}/{total} spent
</label>

<label>
	<input type="range" bind:value={left.value} max={total} />
	{left.value}/{total} left
</label>
```

If you absolutely have to update `$state` within an effect and run into an infinite loop because you read and write to the same `$state`, use [untrack](functions#untrack).

## `$effect.pre`

In rare cases, you may need to run code _before_ the DOM updates. For this we can use the `$effect.pre` rune:

```svelte
<script>
	import { tick } from 'svelte';

	let div = $state();
	let messages = $state([]);

	// ...

	$effect.pre(() => {
		if (!div) return; // not yet mounted

		// reference `messages` array length so that this code re-runs whenever it changes
		messages.length;

		// autoscroll when new messages are added
		if (div.offsetHeight + div.scrollTop > div.scrollHeight - 20) {
			tick().then(() => {
				div.scrollTo(0, div.scrollHeight);
			});
		}
	});
</script>

<div bind:this={div}>
	{#each messages as message}
		<p>{message}</p>
	{/each}
</div>
```

Apart from the timing, `$effect.pre` works exactly like [`$effect`](#$effect) — refer to its documentation for more info.

## `$effect.tracking`

The `$effect.tracking` rune is an advanced feature that tells you whether or not the code is running inside a tracking context, such as an effect or inside your template ([demo](/#H4sIAAAAAAAAE3XP0QrCMAwF0F-JRXAD595rLfgdzodRUyl0bVgzQcb-3VYFQfExl5tDMgvrPCYhT7MI_YBCiiOR2Aq-UxnSDT1jnlOcRlMSlczoiHUXOjYxpOhx5-O12rgAJg4UAwaGhDyR3Gxhjdai4V1v2N2wqus9tC3Y3ifMQjbehaqq4aBhLtEv_Or893icCsdLve-Caj8nBkU67zMO5HtGCfM3sKiWNKhV0zwVaBqd3x3ixVmHFyFLuJyXB-moOe8pAQAA)):

```svelte
<script>
	console.log('in component setup:', $effect.tracking()); // false

	$effect(() => {
		console.log('in effect:', $effect.tracking()); // true
	});
</script>

<p>in template: {$effect.tracking()}</p> <!-- true -->
```

This allows you to (for example) add things like subscriptions without causing memory leaks, by putting them in child effects. Here's a `readable` function that listens to changes from a callback function as long as it's inside a tracking context:

```ts
import { tick } from 'svelte';

export default function readable<T>(
	initial_value: T,
	start: (callback: (update: (v: T) => T) => T) => () => void
) {
	let value = $state(initial_value);

	let subscribers = 0;
	let stop: null | (() => void) = null;

	return {
		get value() {
			// If in a tracking context ...
			if ($effect.tracking()) {
				$effect(() => {
					// ...and there's no subscribers yet...
					if (subscribers === 0) {
						// ...invoke the function and listen to changes to update state
						stop = start((fn) => (value = fn(value)));
					}

					subscribers++;

					// The return callback is called once a listener unlistens
					return () => {
						tick().then(() => {
							subscribers--;
							// If it was the last subscriber...
							if (subscribers === 0) {
								// ...stop listening to changes
								stop?.();
								stop = null;
							}
						});
					};
				});
			}

			return value;
		}
	};
}
```

## `$effect.root`

The `$effect.root` rune is an advanced feature that creates a non-tracked scope that doesn't auto-cleanup. This is useful for
nested effects that you want to manually control. This rune also allows for creation of effects outside of the component initialisation phase.

```svelte
<script>
	let count = $state(0);

	const cleanup = $effect.root(() => {
		$effect(() => {
			console.log(count);
		});

		return () => {
			console.log('effect root cleanup');
		};
	});
</script>
```
