<script>
	import { devicePixelRatio, innerHeight, innerWidth, online, outerHeight, outerWidth, screenLeft, screenTop, scrollX, scrollY } from "svelte/reactivity/window";
</script>

<p>devicePixelRatio: {devicePixelRatio.current}</p>
<p>innerHeight: {innerHeight.current}</p>
<p>innerWidth: {innerWidth.current}</p>
<p>online: {online.current}</p>
<p>outerHeight: {outerHeight.current}</p>
<p>outerWidth: {outerWidth.current}</p>
<p>screenLeft: {screenLeft.current}</p>
<p>screenTop: {screenTop.current}</p>
<p>scrollX: {scrollX.current}</p>
<p>scrollY: {scrollY.current}</p>