<script>
	export let parent = 'no';
	export let translate;
	export let draggable;
	export let href;
</script>

<section translate={parent}><div {translate}>x</div></section>
<a {href} {draggable}>link</a>
