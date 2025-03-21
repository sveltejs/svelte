---
title: $effect
---

Effects are functions that run when state updates, and can be used for things like calling third-party libraries, drawing on `<canvas>` elements, or making network requests. They only run in the browser, not during server-side rendering.

Generally speaking, you should _not_ update state inside effects, as it will make code more convoluted and will often lead to never-ending update cycles. If you find yourself doing so, see [when not to use `$effect`](#When-not-to-use-$effect) to learn about alternative approaches.

You can create an effect with the `$effect` rune ([demo](/playground/untitled#H4sIAAAAAAAAE31S246bMBD9lZF3pSRSAqTVvrCAVPUP2sdSKY4ZwJJjkD0hSVH-vbINuWxXfQH5zMyZc2ZmZLVUaFn6a2R06ZGlHmBrpvnBvb71fWQHVOSwPbf4GS46TajJspRlVhjZU1HqkhQSWPkHIYdXS5xw-Zas3ueI6FRn7qHFS11_xSRZhIxbFtcDtw7SJb1iXaOg5XIFeQGjzyPRaevYNOGZIJ8qogbpe8CWiy_VzEpTXiQUcvPDkSVrSNZz1UlW1N5eLcqmpdXUvaQ4BmqlhZNUCgxuzFHDqUWNAxrYeUM76AzsnOsdiJbrBp_71lKpn3RRbii-4P3f-IMsRxS-wcDV_bL4PmSdBa2wl7pKnbp8DMgVvJm8ZNskKRkEM_OzyOKQFkgqOYBQ3Nq89Ns0nbIl81vMFN-jKoLMTOr-SOBOJS-Z8f5Y6D1wdcR8dFqvEBdetK-PHwj-z-cH8oHPY54wRJ8Ys7iSQ3Bg3VA9azQbmC9k35kKzYa6PoVtfwbbKVnBixBiGn7Pq0rqJoUtHiCZwAM3jdTPWCVtr_glhVrhecIa3vuksJ_b7TqFs4DPyriSjd5IwoNNQaAmNI-ESfR2p8zimzvN1swdCkvJHPH6-_oX8o1SgcIDAAA=)):

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

When Svelte runs an effect function, it tracks which pieces of state (and derived state) are accessed (unless accessed inside [`untrack`](svelte#untrack)), and re-runs the function when that state later changes.

> [!NOTE] If you're having difficulty understanding why your `$effect` is rerunning or is not running see [understanding dependencies](#Understanding-dependencies). Effects are triggered differently than the `$:` blocks you may be used to if coming from Svelte 4.

### Understanding lifecycle

Your effects run after the component has been mounted to the DOM, and in a [microtask](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide) after state changes. Re-runs are batched (i.e. changing `color` and `size` in the same moment won't cause two separate runs), and happen after any DOM updates have been applied.

You can use `$effect` anywhere, not just at the top level of a component, as long as it is called while a parent effect is running.

> [!NOTE] Svelte uses effects internally to represent logic and expressions in your template — this is how `<h1>hello {name}!</h1>` updates when `name` changes.

An effect can return a _teardown function_ which will run immediately before the effect re-runs ([demo](/playground/untitled#H4sIAAAAAAAAE42SQVODMBCF_8pOxkPRKq3HCsx49K4n64xpskjGkDDJ0tph-O8uINo6HjxB3u7HvrehE07WKDbiyZEhi1osRWksRrF57gQdm6E2CKx_dd43zU3co6VB28mIf-nKO0JH_BmRRRVMQ8XWbXkAgfKtI8jhIpIkXKySu7lSG2tNRGZ1_GlYr1ZTD3ddYFmiosUigbyAbpC2lKbwWJkIB8ZhhxBQBWRSw6FCh3sM8GrYTthL-wqqku4N44TyqEgwF3lmRHr4Op0PGXoH31c5rO8mqV-eOZ49bikgtcHBL55tmhIkEMqg_cFB2TpFxjtg703we6NRL8HQFCS07oSUCZi6Rm04lz1yytIHBKoQpo1w6Gsm4gmyS8b8Y5PydeMdX8gwS2Ok4I-ov5NZtvQde95GMsccn_1wzNKfu3RZtS66cSl9lvL7qO1aIk7knbJGvefdtIOzi73M4bYvovUHDFk6AcX_0HRESxnpBOW_jfCDxIZCi_1L_wm4xGQ60wIAAA==)).

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
			// if a teardown function is provided, it will run
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

Teardown functions also run when the effect is destroyed, which happens when its parent is destroyed (for example, a component is unmounted) or the parent effect re-runs.

### Understanding dependencies

`$effect` automatically picks up any reactive values (`$state`, `$derived`, `$props`) that are _synchronously_ read inside its function body (including indirectly, via function calls) and registers them as dependencies. When those dependencies change, the `$effect` schedules a re-run.

If `$state` and `$derived` are used directly inside the `$effect` (for example, during creation of a [reactive class](https://svelte.dev/docs/svelte/$state#Classes)), those values will _not_ be treated as dependencies.

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

For instance, if `a` is `true` in the code snippet below, the code inside the `if` block will run and `b` will be evaluated. As such, changes to either `a` or `b` [will cause the effect to re-run](/playground/untitled#H4sIAAAAAAAAE3VQzWrDMAx-FdUU4kBp71li6EPstOxge0ox8-QQK2PD-N1nLy2F0Z2Evj9_chKkP1B04pnYscc3cRCT8xhF95IEf8-Vq0DBr8rzPB_jJ3qumNERH-E2ECNxiRF9tIubWY00lgcYNAywj6wZJS8rtk83wjwgCrXHaULLUrYwKEgVGrnkx-Dx6MNFNstK5OjSbFGbwE0gdXuT_zGYrjmAuco515Hr1p_uXak3K3MgCGS9s-9D2grU-judlQYXIencnzad-tdR79qZrMyvw9wd5Z8Yv1h09dz8mn8AkM7Pfo0BAAA=).

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

The `$effect.tracking` rune is an advanced feature that tells you whether or not the code is running inside a tracking context, such as an effect or inside your template ([demo](/playground/untitled#H4sIAAAAAAAACn3PwYrCMBDG8VeZDYIt2PYeY8Dn2HrIhqkU08nQjItS-u6buAt7UDzmz8ePyaKGMWBS-nNRcmdU-hHUTpGbyuvI3KZvDFLal0v4qvtIgiSZUSb5eWSxPfWSc4oB2xDP1XYk8HHiSHkICeXKeruDDQ4Demlldv4y0rmq6z10HQwuJMxGVv4mVVXDwcJS0jP9u3knynwtoKz1vifT_Z9Jhm0WBCcOTlDD8kyspmML5qNpHg40jc3fFryJ0iWsp_UHgz3180oBAAA=)):

```svelte
<script>
	console.log('in component setup:', $effect.tracking()); // false

	$effect(() => {
		console.log('in effect:', $effect.tracking()); // true
	});
</script>

<p>in template: {$effect.tracking()}</p> <!-- true -->
```

It is used to implement abstractions like [`createSubscriber`](/docs/svelte/svelte-reactivity#createSubscriber), which will create listeners to update reactive values but _only_ if those values are being tracked (rather than, for example, read inside an event handler).

## `$effect.root`

The `$effect.root` rune is an advanced feature that creates a non-tracked scope that doesn't auto-cleanup. This is useful for nested effects that you want to manually control. This rune also allows for the creation of effects outside of the component initialisation phase.

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

> [!NOTE] For things that are more complicated than a simple expression like `count * 2`, you can also use `$derived.by`.

If you're using an effect because you want to be able to reassign the derived value (to build an optimistic UI, for example) note that [deriveds can be directly overridden]($derived#Overriding-derived-values) as of Svelte 5.25.

You might be tempted to do something convoluted with effects to link one value to another. The following example shows two inputs for "money spent" and "money left" that are connected to each other. If you update one, the other should update accordingly. Don't use effects for this ([demo](/playground/untitled#H4sIAAAAAAAACpVRy26DMBD8FcvKgUhtoIdeHBwp31F6MGSJkBbHwksEQvx77aWQqooq9bgzOzP7mGTdIHipPiZJowOpGJAv0po2VmfnDv4OSBErjYdneHWzBJaCjcx91TWOToUtCIEE3cig0OIty44r5l1oDtjOkyFIsv3GINQ_CNYyGegd1DVUlCR7oU9iilDUcP8S8roYs9n8p2wdYNVFm4csTx872BxNCcjr5I11fdgonEkXsjP2CoUUZWMv6m6wBz2x7yxaM-iJvWeRsvSbSVeUy5i0uf8vKA78NIeJLSZWv1I8jQjLdyK4XuTSeIdmVKJGGI4LdjVOiezwDu1yG74My8PLCQaSiroe5s_5C2PHrkVGAgAA)):

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

Instead, use `oninput` callbacks or — better still — [function bindings](bind#Function-bindings) where possible ([demo](/playground/untitled#H4sIAAAAAAAAE51SsW6DMBT8FcvqABINdOhCIFKXTt06lg4GHpElYyz8iECIf69tcIIipo6-u3f3fPZMJWuBpvRzkBXyTpKSy5rLq6YRbbgATdOfmeKkrMgCBt9GPpQ66RsItFjJNBzhVScRJBobmumq5wovhSxQABLskAmSk7ckOXtMKyM22ItGhhAk4Z0R0OwIN-tIQzd-90HVhvy2HsGNiQFCMltBgd7XoecV2xzXNV7XaEcth7ZfRv7kujnsTX2Qd7USb5rFjwZkJlgJwpWRcakG04cpOS9oz-QVCuoeInXW-RyEJL-sG0b7Wy6kZWM-u7CFxM5tdrIl9qg72vB74H-y7T2iXROHyVb0CLanp1yNk4D1A1jQ91hzrQSbUtIIGLcir0ylJDm9Q7urz42bX4UwIk2xH2D5Xf4A7SeMcMQCAAA=)):

```svelte
<script>
	let total = 100;
	let spent = $state(0);
	let left = $state(total);

	function updateSpent(value) {
		spent = value;
		left = total - spent;
	}

	function updateLeft(value) {
		left = value;
		spent = total - left;
	}
</script>

<label>
	<input type="range" bind:value={() => spent, updateSpent} max={total} />
	{spent}/{total} spent
</label>

<label>
	<input type="range" bind:value={() => left, updateLeft} max={total} />
	{left}/{total} left
</label>
```

If you absolutely have to update `$state` within an effect and run into an infinite loop because you read and write to the same `$state`, use [untrack](svelte#untrack).
