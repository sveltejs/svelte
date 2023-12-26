<script lang="ts">
	function box(v) {
		let state = $state(v)
		return {
			get value() {
				return state;
			},
			set value(v) {
				state = v;
			}
		}
	}

	function derivedBox(v, multiplier) {
		let state = $derived(v.value * multiplier);
		return {
			get value() {
				return state;
			}
		}
	}

	let count = box(0);
	let doubled = derivedBox(count, 2);
	let tripled = derivedBox(count, 3);
	let quadrupled = derivedBox(count, 4);
	let whatever_comes_after_that = derivedBox(count, 5);
</script>

{#snippet foo(n: number, ...[doubled, { tripled }, ...rest]: number[])}
	<p>clicks: {n.value}, doubled: {doubled.value}, tripled: {tripled.value}, quadrupled: {rest[0].value}, something else: {rest[1].value}</p>
{/snippet}

{@render foo(...[count, doubled, {tripled}, quadrupled, whatever_comes_after_that])}

<button on:click={() => count.value += 1}>
	click me
</button>
