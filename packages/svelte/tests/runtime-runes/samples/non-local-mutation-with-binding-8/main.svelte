<script>
	import CounterBinding from './CounterBinding.svelte';
	import CounterContext from './CounterContext.svelte';
	import { setContext } from 'svelte';

	let counter = $state({ count: 0 });

	class Linked {
		#getter;
		linked = $derived.by(() => {
			const state = $state({ current: $state.snapshot(this.#getter()) });
			return state;
		});

		constructor(fn) {
			this.#getter = fn;
		}
	}

	const linked1 = $derived.by(() => {
		const state = $state({ current: $state.snapshot(counter) });
		return state;
	});
	const linked2 = new Linked(() => counter);

	setContext('linked1', {
		get linked() {
			return linked1;
		}
	});
	setContext('linked2', linked2);

	const linked3 = $derived.by(() => {
		const state = $state({ current: $state.snapshot(counter) });
		return state;
	});
	const linked4 = new Linked(() => counter);
</script>

<p>Parent</p>
<button onclick={() => counter.count++}>
	Increment Original ({counter.count})
</button>

<CounterContext />
<CounterBinding bind:linked3={linked3.current} bind:linked4={linked4.linked.current} />
