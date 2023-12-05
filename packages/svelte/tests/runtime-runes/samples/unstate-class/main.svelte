<script>
		import { unstate, UNSTATE_SYMBOL } from 'svelte';

		class Item {
			data = $state()

			constructor(a) {
				this.data = { a };
			}

			[UNSTATE_SYMBOL]() {
				debugger
				return {
					data: unstate(this.data)
				};
			}
		}

    let items = $state([new Item(0)]);
</script>

<button on:click={() => items.push(new Item(items.length))}>{JSON.stringify(structuredClone(unstate(items)))}</button>
