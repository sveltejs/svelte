<script>
	import { get, writable } from 'svelte/store'

	let bagOlStores = writable([1, 2, 3, writable(4), writable(5), writable(6)]);

	let firstNonStore, secondNonStore, thirdNonStore, firstStore, secondStore, thirdStore;
	([firstNonStore, secondNonStore, thirdNonStore, firstStore, secondStore, thirdStore] = $bagOlStores);

	function changeStores() {
		$bagOlStores = ([
			firstNonStore,
			secondNonStore,
			thirdNonStore,
			firstStore,
			$secondStore,
			thirdStore
		] = [
			7,
			8,
			9,
			writable(10),
			11,
			writable(12),
			writable(14),
			writable(15)
		]);
	}
</script>

<p>{firstNonStore}</p>
<p>{secondNonStore}</p>
<p>{thirdNonStore}</p>
<p>{$firstStore}</p>
<p>{$secondStore}</p>
<p>{$thirdStore}</p>

<h1>Bag'ol stores</h1>
<p>{get($bagOlStores[5])}</p>
<p>{get($bagOlStores[6])}</p>
<p>{get($bagOlStores[7])}</p>

<button on:click={changeStores}>Click me!</button>
