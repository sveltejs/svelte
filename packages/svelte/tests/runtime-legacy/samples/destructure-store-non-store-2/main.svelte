<script>
	import  { readable } from 'svelte/store'

	let firstNonStore, secondNonStore, thirdNonStore, firstStore, fourthNonStore, secondStore;

	({ firstNonStore, secondNonStore, thirdNonStore, firstStore, fourthNonStore, secondStore } = {
		firstNonStore: 1,
		secondNonStore: 2,
		thirdNonStore: 3,
		firstStore: readable(4),
		fourthNonStore: 5,
		secondStore: readable(6)
	});
</script>

<p>{firstNonStore}</p>
<p>{secondNonStore}</p>
<p>{thirdNonStore}</p>
<p>{$firstStore}</p>
<p>{fourthNonStore}</p>
<p>{$secondStore}</p>
