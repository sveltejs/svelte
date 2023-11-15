import { test } from '../../test';

export default test({
	html: `
		@x
		@@x
		#foo
		##foo
		%1
		%%2

		<div>
			@x
			@@x
			#foo
			##foo
			%1
			%%2
		</div>

		<div>
			@x
			@@x
			#foo
			##foo
			%1
			%%2
			<span>inner</span>
		</div>
	`
});
