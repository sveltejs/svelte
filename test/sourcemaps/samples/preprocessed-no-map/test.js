import { assert_mapped, assert_not_mapped } from '../../helpers';

export function test({ input, preprocessed }) {
	// markup (start)
	assert_mapped({
		code: '<script>',
		input: input.locate,
		preprocessed
	});

	// script content (preprocessed without map, content not changed)
	assert_mapped({
		code: 'console.log(name);',
		input: input.locate,
		preprocessed
	});
	
	// markup (middle)
	assert_mapped({
		code: '<div>{name}</div>',
		input: input.locate,
		preprocessed
	});
	
	// style content (preprocessed without map, content changed)
	assert_not_mapped({
		code: 'font-weight: bold;',
		preprocessed
	});

	// markup (end)
	assert_mapped({
		code: '</style>',
		input: input.locate,
		preprocessed
	});
}
