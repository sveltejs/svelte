<script>
	import { Date } from 'svelte/reactivity';

	let date = new Date('2024/02/23 15:00:00');
</script>

<div>getSeconds: {date.getSeconds()}</div>
<div>getMinutes: {date.getMinutes()}</div>
<div>getHours: {date.getHours()}</div>
<div>getTime: {date.getTime()}</div>
<div>toDateString: {date.toDateString()}</div>

<button onclick={() => {
	date.setSeconds(date.getSeconds() + 1);
}}>1 second</button>
<button onclick={() => {
	date.setMinutes(date.getMinutes() + 1);
}}>1 minute</button>
<button onclick={() => {
	date.setHours(date.getHours() + 1);
}}>1 hour</button>
