<script>
	import { getAbortSignal } from 'svelte';

	const queue = [];

	let n = $state(1);
	let fizz = $state(true);
	let buzz = $state(true);

	function increment() {
		n++;

		fizz = n % 3 === 0;
		buzz = n % 5 === 0;
	}

	function push(value) {
		if (value === 1) return 1;
		const d = Promise.withResolvers();

		queue.push(() => d.resolve(value));

		const signal = getAbortSignal();
		signal.onabort = () => d.reject(signal.reason);

		return d.promise;
	}
</script>

<button onclick={increment}>
	{$state.eager(n)}
</button>

<button onclick={() => queue.shift()?.()}>shift</button>

<p>{n} = {await push(n)}</p>

{#if true}
	<p>fizz: {fizz}</p>
{/if}

{#if true}
	<p>buzz: {buzz}</p>
{/if}

 

<!-- <script>
	import { getAbortSignal } from 'svelte';

	const queue = [];

	function push(value) {
		if (value === 1) return 1;
		const d = Promise.withResolvers();

		queue.push(() => d.resolve(value));

		const signal = getAbortSignal();
		signal.onabort = () => d.reject(signal.reason);

		return d.promise;
	}

	function shift() {
		queue.shift()?.();
	}

	function pop() {
		queue.pop()?.();
	}

	let n = $state(1);
</script>

<button onclick={() => n++}>
	{$state.eager(n)}
</button>

<button onclick={shift}>shift</button>
<button onclick={pop}>pop</button>

<p>{n} = {await push(n)}</p> -->


<!-- <script>
	let a = $state(0);

	const deferred = []; 

	function delay(value) {
		if (!value) return value;
		return new Promise((resolve) => deferred.push(() => resolve(value)));
	}
</script>

{a} {await delay(a)}
{#if a < 2}
	{await delay(a)}
{/if}

<button onclick={() => {a++;}}>
	a+1
</button>
<button onclick={() => {a+=2;}}>
	a+2
</button>
<button onclick={() => deferred.shift()?.()}>shift</button>
<button onclick={() => deferred[2]()}>middle</button> -->

<!-- <script>
	let a = $state(0);
	let b = $derived(await delay(a * 2));
	let c = $state(0);
	let d = $derived(await delay(b + c));
	// let e = $derived(d === (b + c));

	const deferred = []; 

	function delay(value) {
		if (!value) return value;
		return new Promise((resolve) => deferred.push(() => resolve(value)));
	}
</script>

a {a} | b {b} | c {c} | d {d}
<button onclick={() => {a++;}}>
	a++
</button>
<button onclick={() => {c++;}}>
	c++
</button>
<button onclick={() => deferred.shift()?.()}>shift</button>
<button onclick={() => deferred.pop()?.()}>pop</button> -->

<!-- <script>
	let count = $state(0);
	let other = $state(0);

	const queue = [];
	function push(v) {
		return new Promise((r,e) => queue.push(() => v === 1 ? e(v) : r(v)));
	}
</script>

<button onclick={() => {
	if (count === 0) {
		other++;
		count++;
	} else {
		count++
	}
}}>increment</button>
<button onclick={() => queue.pop()?.()}>pop</button>

{#if count > 0}
	<svelte:boundary>
		{await push(count)} {count} {other}
		{#snippet failed()}boom{/snippet}
	</svelte:boundary> 
{/if} -->

<!-- <script>
	let count1 = $state(0);
	let count2 = $state(0);

	const queued = [];

	async function delay(v) {
		if (!v) return v;
		return new Promise(r => queued.push(() => r(v)));
	}

	function show(get) {
		console.log('running', get());
		return $state.eager(get()) !== get();
	}
</script>

<button onclick={() => count1++}>increment</button> 
<button onclick={() => count2++}>increment</button> 
<button onclick={() => queued.shift()?.()}>resolve</button>
 
{await delay(count1)}
{await delay(count2)}

{#if show(() => count1)}
	<p>loading...</p>
{:else}
	<p>{count1}</p>
{/if}

{#if show(() => count2)}
	<p>loading...</p>
{:else}
	<p>{count2}</p>
{/if} -->
