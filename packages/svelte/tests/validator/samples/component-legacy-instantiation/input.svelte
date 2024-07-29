<script>
	import Foo, { Bar } from './Somewhere.svelte';
	import Baz from './somewhereelse';

	let Buzz;

	new Foo({});
	new Bar();
	new Baz();
	new Buzz();
</script>
