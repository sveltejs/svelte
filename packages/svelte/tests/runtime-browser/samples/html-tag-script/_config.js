import { test } from '../../assert';

export default test({
	// Test that @html does not execute scripts when instantiated in the client.
	// Needs to be in this test suite because JSDOM does not quite get this right.
	html: `<div></div><script>document.body.innerHTML = 'this should not be executed'</script>`,
	mode: ['client']
});
