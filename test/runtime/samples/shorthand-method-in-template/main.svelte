<script>
	import Foo from './Foo.svelte';
</script>

<Foo bar={{
	answer() {
		return 42;
	}
}} />