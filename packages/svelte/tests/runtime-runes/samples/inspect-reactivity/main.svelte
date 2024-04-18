<script>
	import { Map, Set, Date } from 'svelte/reactivity';
	import { log } from './log';

	const map = new Map();
	const set = new Set();
	const date = new Date('2024-04-13 00:00:00+0000');
	let key = $state('key');
	let value = $state('value');

	$inspect(map).with((type, map) => {
		log.push({ label: 'map', type, values: [...map] });
	});
	$inspect(set).with((type, set) => {
		log.push({ label: 'set', type, values: [...set] });
	});
	$inspect(date).with((type, date) => {
		log.push({ label: 'date', type, values: date.getTime() });
	});
</script>

<input bind:value={key} />
<input bind:value={value} />

<button on:click={() => map.set(key, value)}>map</button>
<button on:click={() => set.add(key)}>set</button>
<button on:click={() => date.setMinutes(date.getMinutes() + 1)}>date</button>