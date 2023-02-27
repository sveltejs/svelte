<script>
	export let translate_x = "45px";
	export let border_width = 100;
	export let border_color;
</script>

<p style:color={"green"} style:transform="translateX({translate_x})" style:border="{border_width}px solid {border_color || 'pink'}" />
