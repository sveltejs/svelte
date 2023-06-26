<script>
	import { writable } from 'svelte/store'

	let { firstNonStore, secondNonStore, thirdNonStore, firstStore, fourthNonStore, secondStore } = {
		firstNonStore: 1,
		secondNonStore: 2,
		thirdNonStore: 3,
		firstStore: writable(4),
		fourthNonStore: 5,
		secondStore: writable(6)
	};

	({ firstNonStore, secondNonStore, thirdNonStore, fourthNonStore, $firstStore, $secondStore } = {
		firstNonStore: 7,
		secondNonStore: 8,
		thirdNonStore: 9,
		fourthNonStore: 11,
		$firstStore: 10,
		$secondStore: 12
	});
</script>

<p>{firstNonStore}</p>
<p>{secondNonStore}</p>
<p>{thirdNonStore}</p>
<p>{$firstStore}</p>
<p>{fourthNonStore}</p>
<p>{$secondStore}</p>

