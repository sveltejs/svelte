<script>
	import { get, writable } from 'svelte/store'

	let bagOlStores = writable({
		firstNonStore: 1,
		secondNonStore: 2,
		thirdNonStore: 3,
		firstStore: writable(4),
		secondStore: writable(5),
		thirdStore: writable(6)
	});

	let { firstNonStore, secondNonStore, thirdNonStore, firstStore, secondStore, thirdStore } = $bagOlStores;

	function changeStores() {
		$bagOlStores = ({
			thirdStore,
			$secondStore,
			$firstStore,
			firstNonStore,
			secondNonStore,
			thirdNonStore,
		} = {
			firstNonStore: 7,
			secondNonStore: 8,
			thirdNonStore: 9,
			$firstStore: 10,
			$secondStore: 11,
			firstStore: writable(14),
			secondStore: writable(13),
			thirdStore: writable(12)
		});
	}
</script>

<p>{firstNonStore}</p>
<p>{secondNonStore}</p>
<p>{thirdNonStore}</p>
<p>{$firstStore}</p>
<p>{$secondStore}</p>
<p>{$thirdStore}</p>

<h1>Bag'ol stores</h1>
<p>{get($bagOlStores.firstStore)}</p>
<p>{get($bagOlStores.secondStore)}</p>
<p>{get($bagOlStores.thirdStore)}</p>

<button on:click={changeStores}>Click me!</button>
