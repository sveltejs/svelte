<script>
	export let callback;
	export let interval = 1000;

	import { onInterval } from './utils.js';

	onInterval(callback, interval);
</script>

<p>This component will execute callback every {interval} milliseconds</p>
