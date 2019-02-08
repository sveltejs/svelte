<script>
	import LazyLoad from './LazyLoad.svelte';
</script>

<LazyLoad load="{() => import('./Foo.svelte')}"/>