import MagicString from 'magic-string';
import { SourceMapConsumer, SourceMapGenerator } from 'source-map';

export default {
	preprocess: {
		style: async ({ content, filename }) => {
			const src = new MagicString(content);
			const idx = content.indexOf('baritone');
			src.overwrite(idx, idx + 'baritone'.length, 'bar');

			const map = SourceMapGenerator.fromSourceMap(
				await new SourceMapConsumer(
					// sourcemap must be encoded for SourceMapConsumer
					src.generateMap({
						source: filename,
						hires: true,
						includeContent: false
					})
				)
			);

			return { code: src.toString(), map };
		}
	}
};
