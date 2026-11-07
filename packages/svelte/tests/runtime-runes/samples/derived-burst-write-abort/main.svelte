<script>
	import { flushSync, getAbortSignal } from 'svelte';

	let active = $state(false);
	let value = $state(0);
	let computed = $derived.by(() => {
		const enabled = active;
		if (!enabled) {
			getAbortSignal().addEventListener('abort', () => {
				value = 1;
			}, { once: true });
		}
		return enabled ? value : -1;
	});

	export function run() {
		active = true;
		const first = computed;
		value = 2;
		const second = computed;
		flushSync();
		return { first, second, value };
	}
</script>

<p>{computed}</p>
