import { assert, test } from 'vitest';
import {
	baseline_year_for_feature,
	detect_features_in_text,
	versions_for_feature
} from './browser-support.detector.js';

test.each([
	['#value = 0;', 'private_class_fields', '14.1'],
	['#update() {}', 'private_class_methods', '15'],
	['get #value() { return 0; }', 'private_class_methods', '15']
])('uses the specific compatibility data for %s', (member, feature, safari) => {
	const key = `javascript.classes.${feature}`;
	const detected = detect_features_in_text(`class Example { ${member} }`);

	assert.include([...detected], key);
	assert.equal(baseline_year_for_feature(key), 2021);
	assert.equal(versions_for_feature(key)?.firefox, '90');
	assert.equal(versions_for_feature(key)?.safari, safari);
});

test('does not flag public fields and methods as private', () => {
	const detected = detect_features_in_text('class Example { value = 0; update() {} }');

	assert.notInclude([...detected], 'javascript.classes.private_class_fields');
	assert.notInclude([...detected], 'javascript.classes.private_class_methods');
});
