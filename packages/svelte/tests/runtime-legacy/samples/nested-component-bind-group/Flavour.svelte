<label><input type=checkbox bind:group={$flavours} value={flavour}>{flavour}</label>
<script>
	import { flavours } from "./stores.js"
	export let flavour
</script>
