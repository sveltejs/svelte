<script>
	import { getAbortSignal } from 'svelte';

	const callbacks = new Map();

	// similar semantics to setInterval, but simpler to test
	function add(fn) {
		const id = crypto.randomUUID();
		callbacks.set(id, fn);
		return id;
	}

	function remove(id) {
		callbacks.delete(id);
	}

	function run() {
		for (const fn of callbacks.values()) {
			fn();
		}
	}

	class Timer {
		constructor(text) {
			this.elapsed = $state(0);
			this.text = $derived(text + ': ' + this.elapsed);

			$effect(() => {
				const id = add(() => {
					this.elapsed += 1;
				});

				getAbortSignal().onabort = () => {
					console.log('aborted');
				};

				return () => remove(id);
			});
		}

	}

	let timer = $derived(new Timer('hello'));

	let visible = $state(true);
</script>

<button onclick={() => visible = !visible}>toggle</button>
<button onclick={run}>run</button>

{#if visible}
	<p>{timer.text}</p>
{/if}
