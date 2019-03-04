<script>
	import { onInterval } from './utils.js';

	let seconds = 0;
	onInterval(() => seconds += 1, 1000);
</script>

<p>
	The page has been open for
	{seconds} {seconds === 1 ? 'second' : 'seconds'}
</p>