<script>
	import Slotted from './Slotted.svelte';
	let lotsOfNumbers = Array.from({length: 50}, () => 1);
	
	let [a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z, aa, ab, ac, ad, ae, af, ag, ah] = lotsOfNumbers;
	
	let last = 1;
	function toggle () {
		last = 2;
	}
</script>

<Slotted>
	<button slot="target">
		Toggle inside {last} 
	</button>
	
	<div slot="content">
		Open
	</div>
</Slotted>

<button on:click={toggle}>Toggle outside</button>