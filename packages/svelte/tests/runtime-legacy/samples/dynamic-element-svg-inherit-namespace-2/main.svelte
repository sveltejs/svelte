<svelte:options namespace="svg" />

<script>
	import Svg from "./svg.svelte";

	let tag = "path";
</script>

<Svg>
	<svelte:element this="{tag}" d="M21 12a9 9 0 1 1-6.219-8.56"/>
</Svg>
