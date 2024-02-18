<script>
	let count = $state(0);

	export function increment() {
		count += 1;
	}

	export const decrement = () => {
		count -= 1;
	}

	export const double = function() {
		count = count * 2;
	}
</script>

<p>
	clicks: {count}
</p>
