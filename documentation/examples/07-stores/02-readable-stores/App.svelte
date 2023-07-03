<script>
	import { time } from './stores.js';

	const formatter = new Intl.DateTimeFormat('fr', {
		hour12: true,
		hour: 'numeric',
		minute: '2-digit',
		second: '2-digit'
	});
</script>

<h1>Il est {formatter.format($time)}</h1>
