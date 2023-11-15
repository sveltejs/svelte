import { test } from '../../test';

export default test({
	html: `
		<div>
			<style>div { color: red; }</style>
			<script>\`<>\`</script>
		</div>
	`
});
