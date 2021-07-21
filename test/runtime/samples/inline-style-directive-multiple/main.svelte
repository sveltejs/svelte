<script>
	export let myColor = "red";
	export let width = "65px";
	export let absolute = false;
	export let bold = true;
</script>

<p
	style:color={myColor}
	style:width
	style:position={absolute ? "absolute" : null}
	style:font-weight={bold ? 700 : 100}
/>
