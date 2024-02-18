import MagicString from 'magic-string';
import { test } from '../../test';
import { SourceMapConsumer, SourceMapGenerator } from 'source-map';
import * as path from 'node:path';

export default test({
	preprocess: {
		style: async ({ content, filename = '' }) => {
			const src = new MagicString(content);
			const idx = content.indexOf('baritone');
			src.overwrite(idx, idx + 'baritone'.length, 'bar');

			// This test checks that the sourcemap format from source-map
			// also works with our preprocessor merging.
			const map = SourceMapGenerator.fromSourceMap(
				await new SourceMapConsumer(
					// sourcemap must be encoded for SourceMapConsumer
					src.generateMap({
						source: path.basename(filename),
						hires: true,
						includeContent: false
					})
				)
			);

			return { code: src.toString(), map };
		}
	},
	css: [{ str: '--baritone: red', strGenerated: '--bar: red' }, '--baz: blue']
});
