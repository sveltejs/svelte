<script>
	export let foo = "font-size: 20px; color: blue;";
	let baz = "red"; // static value
	let bar = "32"; // static value interpolated
	export let bg = "gre"; // dynamic value interpolated/cached
	export let borderColor = "green"; // dynamic value non-cached
</script>

<p
	style:font-size="{bar}px"
	style:color={baz}
	style="{foo}"
	style:background-color="{bg}en"
	style:border-color={borderColor}
></p>
