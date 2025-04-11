<script>
	import { createSubscriber } from 'svelte/reactivity';

	class MyStore {
		#subscribe;
		#data = $state([
			['a', [1, 2]],
			['b', [3, 4]]
		]);
		#id;

		constructor(options) {
			options?.someBoolean;
			this.#id = options?.id;
			this.#subscribe = createSubscriber(() => {
				debugger
				return () => {
					console.log('cleanup');
				};
			});
		}

		get data() {
			this.#subscribe();
			return this.#data;
		}
		set data(v) {
			this.#data = v;
		}
	}

	let storeOptions = $state({
		someBoolean: false,
		id: 0
	});

	let myStore = $derived(new MyStore(storeOptions));
</script>

<button
	onclick={() => {
		storeOptions.someBoolean = !storeOptions.someBoolean;
	}}>+</button
>

{#each myStore.data as _}{/each}
