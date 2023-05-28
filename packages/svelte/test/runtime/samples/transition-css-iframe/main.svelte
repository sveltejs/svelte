<script>
	import Frame from './Frame.svelte';
	import Foo from './Foo.svelte';

	export let visible;
</script>

<Frame component={Foo} {visible}/>