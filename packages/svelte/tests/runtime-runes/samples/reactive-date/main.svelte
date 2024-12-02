<script>
	import { SvelteDate } from 'svelte/reactivity';

	let date = new SvelteDate('2024-02-23T15:00:00Z');
</script>

<div>getSeconds: {date.getUTCSeconds()}</div>
<div>getMinutes: {date.getUTCMinutes()}</div>
<div>getHours: {date.getUTCHours()}</div>
<div>getTime: {date.getTime()}</div>
<div>toUTCString: {date.toUTCString()}</div>

<button onclick={() => {
	date.setSeconds(date.getSeconds() + 1);
}}>1 second</button>
<button onclick={() => {
	date.setMinutes(date.getMinutes() + 1);
}}>1 minute</button>
<button onclick={() => {
	date.setHours(date.getHours() + 1);
}}>1 hour</button>
