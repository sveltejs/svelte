<script>
	import { onInterval } from './utils.js';

	let seconds = 0;
	onInterval(() => (seconds += 1), 1000);
</script>

<p>
	La page est ouverte depuis
	{seconds}
	{seconds > 1 ? 'secondes' : 'seconde'}
</p>
