<script>
	import counter from './counter.js';

	export let x;
	export let y;

	function myHelper(value) {
		counter.count += 1;
		return value;
	}
</script>

<p>{x}</p>
<p class='{myHelper(y)}'></p>
