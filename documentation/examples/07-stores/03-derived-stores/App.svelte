<script>
	import { time, elapsed } from './stores.js';

	const formatter = new Intl.DateTimeFormat('en', {
		hour12: true,
		hour: 'numeric',
		minute: '2-digit',
		second: '2-digit'
	});
</script>

<h1>Il est {formatter.format($time)}</h1>

<p>
	Cette page est ouverte depuis
	{$elapsed}
	{$elapsed > 1 ? 'secondes' : 'seconde'}
</p>
