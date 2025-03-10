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

<canvas bind:this={canvas} width="100" height="100"></canvas>
```

When Svelte runs an effect function, it tracks which pieces of state (and derived state) are accessed (unless accessed inside [`untrack`](svelte#untrack)), and re-runs the function when that state later changes.

> [!NOTE] If you're having difficulty understanding why your `$effect` is rerunning or is not running see [understanding dependencies](#Understanding-dependencies). Effects are triggered differently than the `$:` blocks you may be used to if coming from Svelte 4.

### Understanding lifecycle

Your effects run after the component has been mounted to the DOM, and in a [microtask](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide) after state changes. Re-runs are batched (i.e. changing `color` and `size` in the same moment won't cause two separate runs), and happen after any DOM updates have been applied.

You can use `$effect` anywhere, not just at the top level of a component, as long as it is called while a parent effect is running.

> [!NOTE] Svelte uses effects internally to represent logic and expressions in your template — this is how `<h1>hello {name}!</h1>` updates when `name` changes.

An effect can return a _teardown function_ which will run immediately before the effect re-runs ([demo](/playground/untitled#H4sIAAAAAAAAA41T24rbQAz9FTEE4oCbuCndsq4dKHltH9ruPnUKmXjkeFhHNjPKrcH_XsaT214ofbOOjs6R5NFRkFqjSMUjseEatYhFaWp0Iv11FHxofc4DIj4zv7Tt2G2xZo8tlcO38KIhRmInUpG5wpqWZ5Ik18jgzB-EHAaOFWN0lySjz-dUoWirnA9JctGQY9i0WjHO-wTkEDHueQT5DI6ec2b1dnuG_CQxXiHPAxYNp3oYLHq2x8ZFjcr-wIKjJIYkPlftjObqElVoVhW_LC0b8j7DD9N2Dw6tKYcvGaauH7yzj2J4n8Tw8TRkF6gkeYBl6f2j18OsURv1fYP2ADnsDOlmN14rLqpvPhEtorXav-tbTWFw9Ovs2v1ocdOoY6gU6Rr7inmlaOVXHuGtmWRTQoRBGt3oiku-3Xq0-FlYRILeEnbKwcqiYrTAlaJrCzEo0sAVEtTo3KUhyV346E5_VvJ1xLHS-qtxjIQ2etW0lwAINRZ5Ywmi5zPcKFlcN1v8t9ilDe58mE2uj5MeGnCIfgAIPycGbdWqB1xYATewRL8IvBn2bRIpa5vd2Atn2mzB8aHGXIq1sitDKUyTdg-JFP1dZMsNc0PQUFGb4ik_hilPp3KXJN2sqLB4grKxPvRPrzfLJqHyP1Tun6vcv62STbTZ9uvIwhnA0pBOuTIuPwakCy8hl-JTkkgB4U5yKaY-nGWTQJuJWPgLECnbDXa_u7-plT6obAQAAA==)).

```svelte
<script>
	let size = $state(600);
	let canvas;

	const updateCanvas = (text) => {
		const context = canvas.getContext('2d');
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.font = '32px serif';
		context.fillText(text, 10, 50);
	};
	
	$effect(() => {
		const mediaQuery = window.matchMedia(`(max-width: ${size}px)`);
		const handleMediaChange = (e) => {
			if (e.matches) {
				updateCanvas(`Screen width was greater than ${size}px, and then less`);
			}
		};

		mediaQuery.addListener(handleMediaChange);
  
		return () => {
			mediaQuery.removeListener(handleMediaChange);
		};
	});
</script>

To see the effect, drag the screen to be wide, and then drag the screen to be narrow.

<div style="margin: 20px 0">
	<button onclick={() => size = 600}>check for 600px screen</button>
	<button onclick={() => size = 900}>check for 900px screen</button>
</div>

<canvas bind:this={canvas} width="700" height="200"></canvas>
```

Teardown functions also run when the effect is destroyed, which happens when its parent is destroyed (for example, a component is unmounted) or the parent effect re-runs.

### Understanding dependencies

`$effect` automatically picks up any reactive values (`$state`, `$derived`, `$props`) that are _synchronously_ read inside its function body (including indirectly, via function calls) and registers them as dependencies. When those dependencies change, the `$effect` schedules a re-run.

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

For instance, if `a` is `true` in the code snippet below, the code inside the `if` block will run and `b` will be evaluated. As such, changes to either `a` or `b` [will cause the effect to re-run](/playground/untitled#H4sIAAAAAAAAA31SXWvbQBD8K5slIBmErbiUgqoThPyD0Dzl-nAnreyjykro1q6D0H8Pp6taY9o-zuzM7cfchGzeCAt8YXHSUYMZtq4jj8XrhPI-hFogMFuVj8Ow9WfqJHDWePobX_csxOKxwNLXoxuk0qylIwEDCu69GKFUxhNtvq4F-69CbfhsfICspe7ZC5yGxgg9LQVQkApdZAOqgiloVtUyxUVA_XpieyB5ilya7JsktljUgdvWHZnxmWpJ8wzybHX9dI0cf6MjucNRbq1tz6FP8mk_XMDT6NrkVuG67lvoHFAGD3kGn_P4zBylrOWe2jb0T6-XuV42TcYTs-PDOvyicC2kZrPqbx22SDKw68Tz0jGgcvcnGi4bdwYv7x0pjW9mPDguYJ8PF8g1LuGV9iTSM_Rcd67-oaY4ZMjzzsyVAedhMnO5i7r_eULUd3au7OKx155y17hzFVcr48nBOm4KOTqvpsjMsGSiNH7Jc40QM1Ea9wFW5S7KKs2YYbg3FuFLzd_nD1eS-7_xAgAA).

Conversely, if `a` is `false`, `b` will not be evaluated, and the effect will _only_ re-run when `a` changes.

```ts
let a = false;
let b = false;
// ---cut---
$effect(() => {
	updateCanvas('running');

	if (a) {
		updateCanvas('b:', b);
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

The `$effect.tracking` rune is an advanced feature that tells you whether or not the code is running inside a tracking context, such as an effect or inside your template ([demo](/playground/untitled?version=5.22.5#H4sIAAAAAAAAA22Q3U6DQBCFX2XcmEAjfzZeUSAxfQT1SrzYwlA2bocNO8UawrubLaKm9nK_PWfmzBkFyQOKVLwQK9ZYi0A0SqMV6eso-NO4PwdEsCgfjYnsgJod20mL13jVESOxFanIbNUrw0VJJVcdWQZF2-5gOkLiJ-SjgRxusWmw4oh7Wb0r2vurDcQxWDkgKALqKOxRVqwGhEH2Su40luRGamSoJA3Sbtzze5DvryAvYHRoWXvOdGLIv_XRHnk7M99b195q86N2LGo6cmJvnZgTWOxV410qlNbPZ7simBen4MHdlXMCSAJYJ_NZ3B9dep7cyiz-LYgyUyiCaqkHrOsnhfGysimLTQHZTRhCI7VFCMNicTMejJaMKYz_c_wxuhSzr6RsrgR2iuqUW2XzcSYTfKia27wUD0lSCmhR7VvOS3HvnkUWz7KiJBEIV4pI3dzpbfoCBROKmlsCAAA=)):

```svelte
<script>
	const inComponentSetup = $effect.tracking(); // save in non-reactive variable

	let canvas;
	$effect(() => {
		const context = canvas.getContext('2d');
		context.font = '20px serif';
		context.fillText('in effect: ' + $effect.tracking(), 0, 20); // true
	});
</script>

<p>in component setup: {inComponentSetup}</p> <!-- false -->
<p>in template: {$effect.tracking()}</p> <!-- true -->

<canvas bind:this={canvas} width="400" height="100"></canvas>
```

It is used to implement abstractions like [`createSubscriber`](/docs/svelte/svelte-reactivity#createSubscriber), which will create listeners to update reactive values but _only_ if those values are being tracked (rather than, for example, read inside an event handler).

## `$effect.root`

The `$effect.root` rune is an advanced feature that creates a non-tracked scope that doesn't auto-cleanup. This is useful for nested effects that you want to manually control. This rune also allows for the creation of effects outside of the component initialisation phase.

```svelte
<script>
	const cleanup = $effect.root(() => {
		$effect(() => {
			// some effect
		});

		return () => {
			// cleanup function
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

Instead, use callbacks where possible ([demo](/playground/untitled#H4sIAAAAAAAACo1SMW6EMBD8imWluFMSIEUaDiKlvy5lSOHjlhOSMRZeTiDkv8deMEEJRcqdmZ1ZjzzxqpZgePo5cRw18JQA_sSVaPz0rnVk7iDRYxdhYA8vW4Wg0NnwzJRdrfGtUAVKQIYtCsly9pIkp4AZ7cQOezAoEA7JcWUkVBuCdol0dNWrEutWsV5fHfnhPQ5wZJMnCwyejxCh6G6A0V3IHk4zu_jOxzzPBxBld83PTr7xXrb3rUNw8PbiYJ3FP22oTIoLSComq5XuXTeu8LzgnVA3KDgj13wiQ8taRaJ82rzXskYM-URRlsXktejjgNLoo9e4fyf70_8EnwncySX1GuunX6kGRwnzR_BgaPNaGy3FmLJKwrCUeBM6ZUn0Cs2mOlp3vwthQJ5i14P9st9vZqQlsQIAAA==)):

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

If you need to use bindings, for whatever reason (for example when you want some kind of "writable `$derived`"), consider using getters and setters to synchronise state ([demo](/playground/untitled#H4sIAAAAAAAACpWRwW6DMBBEf8WyekikFOihFwcq9TvqHkyyQUjGsfCCQMj_XnvBNKpy6Qn2DTOD1wu_tRocF18Lx9kCFwT4iRvVxenT2syNoDGyWjl4xi93g2AwxPDSXfrW4oc0EjUgwzsqzSr2VhTnxJwNHwf24lAhHIpjVDZNwy1KS5wlNoGMSg9wOCYksQccerMlv65p51X0p_Xpdt_4YEy9yTkmV3z4MJT579-bUqsaNB2kbI0dwlnCgirJe2UakJzVrbkKaqkWivasU1O1ULxnOVk3JU-Uxti0p_-vKO4no_enbQ_yXhnZn0aHs4b1jiJMK7q2zmo1C3bTMG3LaZQVrMjeoSPgaUtkDxePMCEX2Ie6b_8D4WyJJEwCAAA=)):

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
