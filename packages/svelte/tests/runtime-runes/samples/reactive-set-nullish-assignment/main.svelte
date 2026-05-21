<script lang="ts">
	import Button from './Button.svelte';
	import { SvelteSet } from 'svelte/reactivity';

	class Setup {
		#options: SvelteSet<string>;

		toggle(value: string) {
			this.#options ??= new SvelteSet();
			if (this.#options.has(value)) {
				this.#options.delete(value);
			} else {
				this.#options.add(value);
			}
		}

		has(value: string) {
			this.#options ??= new SvelteSet();
			return this.#options.has(value);
		}
	}

	const setup = new Setup();
</script>

<div>
	<!-- broken -->
	<Button onclick={() => setup.toggle('active')} active={setup.has('active')} />

	<!-- working -->
	<Button onclick={() => setup.toggle('active')} active={setup.has('active')} />
</div>
