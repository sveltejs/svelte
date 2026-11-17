<script lang="ts">
	import { fork, type Fork } from 'svelte';
	import Child from './Child.svelte';

	let show = $state(false);
	let speculative: Fork;
	let increment: (() => void) | undefined;
	const parked = new Promise<number>(() => {});
	const requests = new Map<number, { settled: boolean; resolve: () => void }>();
	let overflow = false;

	function register(fn: () => void) {
		increment = fn;
	}

	function load(value: number) {
		// Keep the original request intact if a broken rebase resets n and tries
		// load(0) again. Park extra work rather than allowing a feedback loop.
		if ((value !== 0 && value !== 1) || requests.has(value)) {
			if (!overflow) console.log(`unexpected load ${value}`);
			overflow = true;
			return parked;
		}
		console.log(`load ${value}`);
		const deferred = Promise.withResolvers<number>();
		requests.set(value, { settled: false, resolve: () => deferred.resolve(value) });
		return deferred.promise;
	}

	function resolve(value: number) {
		const request = requests.get(value);
		if (!request || request.settled) throw new Error(`Missing pending load(${value})`);
		request.settled = true;
		request.resolve();
	}

	function write_from_real() {
		if (!increment) throw new Error('Child did not register its state writer');
		// This event runs in the real world, where show remains false. The writer
		// batch does not adopt/select the child that owns the edited state source.
		increment();
	}
</script>

<button onclick={() => speculative = fork(() => show = true)}>fork show</button>
<button onclick={write_from_real}>foreign real state write</button>
<button onclick={() => resolve(1)}>resolve new</button>
<button onclick={() => speculative.commit()}>commit fork</button>
<button onclick={() => resolve(0)}>resolve old</button>

<output>{#if show}<Child {register} {load} />{/if}</output>
