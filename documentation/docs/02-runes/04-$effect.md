---
title: $effect
---

Effects are what make your application _do things_. When Svelte runs an effect function, it tracks which pieces of state (and derived state) are accessed, and re-runs the function when that state later changes.

Most of the effects in a Svelte app are created by Svelte itself — they're the bits that update the text in `<h1>hello {name}!</h1>` when `name` changes, for example.

But you can also create your own effects with the `$effect` rune, which is useful when you need to synchronize an external system (whether that's a library, or a `<canvas>` element, or something across a network) with state inside your Svelte app.

> [!NOTE] Avoid overusing effects! When you do too much work in them, code often becomes difficult to understand and maintain. See [when not to use effects](#When-not-to-use-effects) to learn about alternative approaches.

Your effects run after the component has been mounted to the DOM, and in a [microtask](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide) after state changes ([demo](/playground/untitled#H4sIAAAAAAAAE31S246bMBD9lZF3pSRSAqTVvrCAVPUP2sdSKY4ZwJJjkD0hSVH-vbINuWxXfQH5zMyZc2ZmZLVUaFn6a2R06ZGlHmBrpvnBvb71fWQHVOSwPbf4GS46TajJspRlVhjZU1HqkhQSWPkHIYdXS5xw-Zas3ueI6FRn7qHFS11_xSRZhIxbFtcDtw7SJb1iXaOg5XIFeQGjzyPRaevYNOGZIJ8qogbpe8CWiy_VzEpTXiQUcvPDkSVrSNZz1UlW1N5eLcqmpdXUvaQ4BmqlhZNUCgxuzFHDqUWNAxrYeUM76AzsnOsdiJbrBp_71lKpn3RRbii-4P3f-IMsRxS-wcDV_bL4PmSdBa2wl7pKnbp8DMgVvJm8ZNskKRkEM_OzyOKQFkgqOYBQ3Nq89Ns0nbIl81vMFN-jKoLMTOr-SOBOJS-Z8f5Y6D1wdcR8dFqvEBdetK-PHwj-z-cH8oHPY54wRJ8Ys7iSQ3Bg3VA9azQbmC9k35kKzYa6PoVtfwbbKVnBixBiGn7Pq0rqJoUtHiCZwAM3jdTPWCVtr_glhVrhecIa3vuksJ_b7TqFs4DPyriSjd5IwoNNQaAmNI-ESfR2p8zimzvN1swdCkvJHPH6-_oX8o1SgcIDAAA=)):

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

Re-runs are batched (i.e. changing `color` and `size` in the same moment won't cause two separate runs), and happen after any DOM updates have been applied.

You can place `$effect` anywhere, not just at the top level of a component, as long as it is called during component initialization (or while a parent effect is active). It is then tied to the lifecycle of the component (or parent effect) and will therefore destroy itself when the component unmounts (or the parent effect is destroyed).

You can return a function from `$effect`, which will run immediately before the effect re-runs, and before it is destroyed ([demo](/playground/untitled#H4sIAAAAAAAAE42RQY-bMBCF_8rI2kPopiXpMQtIPfbeW6m0xjyKtWaM7CFphPjvFVB2k2oPe7LmzXzyezOjaqxDVKefo5JrD3VaBLVXrLu5-tb3X-IZTmat0hHv6cazgCWqk8qiCbaXouRSHISMH1gop4coWrA7JE9bp7PO2QjjuY5vA8fDYZ3hUh7QNDCy2yWUFzTOUilpSj9aG-linaMKFGACtKCmSwvGGYGeLQvCWbtnMq3m34grajxHoa1JOUXI93_V_Sfz7Oz7Mafj0ypN-zvHm8dSAmQITP_xaUq2IU1GO1dp80I2Uh_82dao92Rl9R8GvgF0QrbrUFstcFeq0PgAkha0LoICPoeB4w1SJUvsZcj4rvcMlvmvGlGCv6J-DeSgw2vabQnJlm55p7nM0rcTctYei3HZxZSl7XHVqkHEM3k2zpqXfFyj393zU05fpyI6f0HI0hUoPoamC9roKDeo2ivBH1EnCQOmX9NfYw2GHrgCAAA=)).

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

### Understanding dependencies

`$effect` automatically picks up any reactive values (`$state`, `$derived`, `$props`) that are _synchronously_ read inside its function body and registers them as dependencies. When those dependencies change, the `$effect` schedules a rerun.

Values that are read _asynchronously_ — after an `await` or inside a `setTimeout`, for example — will not be tracked. Here, the canvas will be repainted when `color` changes, but not when `size` changes ([demo](/playground/untitled#H4sIAAAAAAAAE31T246bMBD9lZF3pWSlBEirfaEQqdo_2PatVIpjBrDkGGQPJGnEv1e2IZfVal-wfHzmzJyZ4cIqqdCy9M-F0blDlnqArZjmB3f72XWRHVCRw_bc4me4aDWhJstSlllhZEfbQhekkMDKfwg5PFvihMvX5OXH_CJa1Zrb0-Kpqr5jkiwC48rieuDWQbqgZ6wqFLRcvkC-hYvnkWi1dWqa8ESQTxFRjfQWsOXiWzmr0sSLhEJu3p1YsoJkNUcdZUnN9dagrBu6FVRQHAM10sJRKgUG16bXcGxQ44AGdt7SDkTDdY02iqLHnJVU6hedlWuIp94JW6Tf8oBt_8GdTxlF0b4n0C35ZLBzXb3mmYn3ae6cOW74zj0YVzDNYXRHFt9mprNgHfZSl6mzml8CMoLvTV6wTZIUDEJv5us2iwMtiJRyAKG4tXnhl8O0yhbML0Wm-B7VNlSSSd31BG7z8oIZZ6dgIffAVY_5xdU9Qrz1Bnx8fCfwtZ7v8Qc9j3nB8PqgmMWlHIID6-bkVaPZwDySfWtKNGtquxQ23Qlsq2QJT0KIqb8dL0up6xQ2eIBkAg_c1FI_YqW0neLnFCqFpwmreedJYT7XX8FVOBfwWRhXstZrSXiwKQjUhOZeMIleb5JZfHWn2Yq5pWEpmR7Hv-N_wEqT8hEEAAA=)):

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

An effect only reruns when the object it reads changes, not when a property inside it changes. (If you want to observe changes _inside_ an object at dev time, you can use [`$inspect`]($inspect).)

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

An effect only depends on the values that it read the last time it ran. This has interesting implications for effects that have conditional code.

For instance, if `a` is `true` in the code snippet below, the code inside the `if` block will run and `b` will be evaluated. As such, changes to either `a` or `b` [will cause the effect to re-run](/playground/untitled#H4sIAAAAAAAAE3WQTWrDMBCFrzIRAcsQkr1rC3KIruouJHUURNWxscalRejuleqEQElXQu99b_6SIP2BohPPxJ4DvomDcD5gFN1LEvw9V68KRb-S53k-xk8MXDWjIz7S7USMxKWM6KNd_MxqpLE0YNAwwD6yZpROh4jt080xj5zi7dE5tCxlC4OCVKWRS4c4BTyG6SKbZSXydGm2WhvgHUjd3vA_AdM1BzBXnHN9cv31p_u01JuVeSKYyAZv34e0DVAX2OmsNPgISef-tHHq30RdbGeyMr8Jc0-USzF-seh4WTG_5h_LyPoejwEAAA==).

Conversely, if `a` is `false`, `b` will not be evaluated, and the effect will _only_ re-run when `a` changes.

```ts
let a = false;
let b = false;
// ---cut---
$effect(() => {
	console.log('running');

	if (a) {
		console.log('b:', b);
	}
});
```

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

Apart from the timing, `$effect.pre` works exactly like `$effect`.

## `$effect.tracking`

The `$effect.tracking` rune is an advanced feature that tells you whether or not the code is running inside a tracking context, such as an effect or inside your template ([demo](/playground/untitled#H4sIAAAAAAAAE3XP0QrCMAwF0F-JRXAD595rLfgdzodRUyl0bVgzQcb-3VYFQfExl5tDMgvrPCYhT7MI_YBCiiOR2Aq-UxnSDT1jnlOcRlMSlczoiHUXOjYxpOhx5-O12rgAJg4UAwaGhDyR3Gxhjdai4V1v2N2wqus9tC3Y3ifMQjbehaqq4aBhLtEv_Or893icCsdLve-Caj8nBkU67zMO5HtGCfM3sKiWNKhV0zwVaBqd3x3ixVmHFyFLuJyXB-moOe8pAQAA)):

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

## When not to use effects

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

> [!NOTE] For things that are more complicated than a simple expression like `count * 2`, you can also use `$derived.by`.

You might be tempted to do something convoluted with effects to link one value to another. The following example shows two inputs for "money spent" and "money left" that are connected to each other. If you update one, the other should update accordingly. Don't use effects for this ([demo](/playground/untitled#H4sIAAAAAAAACpVRy2rDMBD8lWXJwYE0dg-9KFYg31H3oNirIJBlYa1DjPG_F8l1XEop9LgzOzP7mFAbSwHF-4ROtYQCL97jAXn0sQh3skx4wNANfR2RMtS98XyuXMWWGLhjZUHCa1GcVix4cgwSdoEVU1bsn4wl_Y1I2kS6inekNdWcZXuQZ5giFDWpfwl5WYyT2fynbB1g1UWbTVbm2w6utOpKNq1TGucHhri6rLBX7kYVwtW4RtyVHUhOyXeGVj3klLxnyJP0i8lXNJUx6en-v6A48K85kTimpi0sYj-yAo-Wlh9FcL1LY4K3ahSgLT1OC3ZTXkBxfKN2uVC6T5LjAduuMdpQg4L7geaP-RNHPuClMQIAAA==)):

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

Instead, use callbacks where possible ([demo](/playground/untitled#H4sIAAAAAAAACo2SP2-DMBDFv8rp1CFR84cOXQhU6p6tY-ngwoEsGWPhI0pk8d0rG5yglqGj37v7veMJh7VUZDH9dKhFS5jiuzG4Q74Z_7AXUky4Q9sNfemVzJa9NPxW6IIVMXDHQkEOL0lyipo1pBlyeLIsmDbJ9u4oqhdG2A2mLrgedMmy0zCYSjB9eMaGtuC8WXBkPtOBRd8QHy5CDXSa3Jk7HbOfDgjWuAo_U71kz9vr6Bgc2X44orPjow2dKfFNKhSTSW0GBl9iXmAvdEMFQqDmLgBH6HQYyt3ie0doxTV3IWqEY2DN88eohqePvsf9O9mf_if4HMSVXD89NfEI99qvbMs3RdPv4MXYaSWtUeKWQq3oOlfZCJNCcnildlFgWMcdtl0la0kVptwPNH6NP_uzV0acAgAA)):

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

If you need to use bindings, for whatever reason (for example when you want some kind of "writable `$derived`"), consider using getters and setters to synchronise state ([demo](/playground/untitled#H4sIAAAAAAAACo2SQW-DMAyF_4pl7dBqXcsOu1CYtHtvO44dsmKqSCFExFRFiP8-xRCGth52tJ_9PecpA1bakMf0Y0CrasIU35zDHXLvQuGvZJhwh77p2nPoZP7casevhS3YEAM3rAzk8Jwkx9jzjixDDg-eFdMm2S6KoWolyK6ItuCqs2fWjYXOlYrpPTA2tIUhiAVH5iPtWbUX4v1VmY6Okzpzp2OepgNEGu_CT1St2fP2fXQ0juwwHNHZ4ScNmxn1RUaCybR1HUMIMS-wVfZCBYJQ80GAIzRWhvJh9d4RanXLB7Ea4SCsef4Qu1IG68Xu387h9D_GJ2ne8ZXpxTZUv1w994amjxCaMc1Se2dUn0Jl6DaHeFEuhWT_QvUqOlnHHdZNqStNJabcdjR-jt8IbC-7lgIAAA==)):

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

If you absolutely have to update `$state` within an effect and run into an infinite loop because you read and write to the same `$state`, use [untrack](svelte#untrack).
