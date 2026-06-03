<script>
	export function foo() {
		console.log('foo');
	}

	const value = await Promise.resolve('bar');

	export const bar = () => console.log(value);
</script>
