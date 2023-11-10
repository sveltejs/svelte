import { test } from '../../test';

export default test({
	html: `
		<span data-xxx="&amp;copy=value" style="&amp;copy=value"></span>

		<span data-xxx="&amp;copy=value" style="&amp;copy=value"></span>

		<span data-xxx="©" style="©"></span>

		<span data-xxx="©=value" style="©=value"></span>

		<span data-xxx="&amp;copyotherstring=value" style="&amp;copyotherstring=value"></span>

		<span data-xxx="&amp;copy123=value" style="&amp;copy123=value"></span>

		<span data-xxx="&amp;rect=value" style="&amp;rect=value"></span>

		<span data-xxx="▭=value" style="▭=value"></span>
	`
});
