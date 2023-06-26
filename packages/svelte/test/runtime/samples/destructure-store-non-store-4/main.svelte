<script>
	import  { readable } from 'svelte/store'

	let firstNonStore, secondNonStore, thirdNonStore, firstStore, fourthNonStore, secondStore;

	([firstNonStore, secondNonStore, thirdNonStore, firstStore, fourthNonStore, secondStore] = [1, 2, 3, readable(4), 5, readable(6)]);
</script>

<p>{firstNonStore}</p>
<p>{secondNonStore}</p>
<p>{thirdNonStore}</p>
<p>{$firstStore}</p>
<p>{fourthNonStore}</p>
<p>{$secondStore}</p>
