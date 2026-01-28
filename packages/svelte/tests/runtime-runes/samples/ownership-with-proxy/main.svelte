<script>
	import { setContext, getContext } from "svelte";

	setContext("", new Proxy({}, {
		get(){
			return {}
		}
	}));

	getContext("");
</script>
