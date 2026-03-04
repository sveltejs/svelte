<script lang="ts">
	class Item {
		product: number;

		constructor(n: number) {
			this.product = $derived(multiplier * n);
		}
	}

	let numbers = $state([1, 2, 3]);
	let multiplier = $state(1);

	let items = $derived(numbers.map((n) => new Item(n)))
	let products = $derived(items.map(item => item.product));
</script>

<button onclick={() => {
	multiplier += 1;
}}>+1</button>

<button onclick={() => {
	numbers.push(numbers.length + 1);

	// this is load-bearing — by reading it outside a reaction, we recompute
	// `products`, removing it as a reaction from `Item.product` dependencies,
	// but we don't add it as a reaction to the new `Item.product` dependencies
	products;
}}>add number</button>

<p>{products.join(', ')}</p>
