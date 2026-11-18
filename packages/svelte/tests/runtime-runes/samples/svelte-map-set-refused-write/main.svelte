<script>
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';

	const map = new SvelteMap([[1, 'a']]);
	const set = new SvelteSet([1]);

	/** @param {() => void} write */
	function attempt(write) {
		try {
			write();
			return 'written';
		} catch {
			return 'refused';
		}
	}

	export function model() {
		return JSON.stringify([[...map], [...set]]);
	}
</script>

<p>{attempt(() => map.set(1, 'z'))}</p>
<p>{attempt(() => map.set(2, 'b'))}</p>
<p>{attempt(() => map.delete(1))}</p>
<p>{attempt(() => map.clear())}</p>
<p>{attempt(() => set.add(2))}</p>
<p>{attempt(() => set.delete(1))}</p>
<p>{attempt(() => set.clear())}</p>
