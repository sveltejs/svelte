import { modules } from '$lib/generated/type-info.js';

/** @param {string} content */
export function replace_placeholders(content) {
	return content
		.replace(/> EXPANDED_TYPES: (.+?)#(.+)$/gm, (_, name, id) => {
			const module = modules.find((module) => module.name === name);
			if (!module) throw new Error(`Could not find module ${name}`);

			const type = module.types.find((t) => t.name === id);

			return (
				type.comment +
				type.children
					.map((child) => {
						let section = `### ${child.name}`;

						if (child.bullets) {
							section += `\n\n<div class="ts-block-property-bullets">\n\n${child.bullets.join(
								'\n'
							)}\n\n</div>`;
						}

						section += `\n\n${child.comment}`;

						if (child.children) {
							section += `\n\n<div class="ts-block-property-children">\n\n${child.children
								.map(stringify)
								.join('\n')}\n\n</div>`;
						}

						return section;
					})
					.join('\n\n')
			);
		})
		.replace(/> TYPES: (.+?)(?:#(.+))?$/gm, (_, name, id) => {
			const module = modules.find((module) => module.name === name);
			if (!module) throw new Error(`Could not find module ${name}`);

			if (id) {
				const type = module.types.find((t) => t.name === id);

				return (
					`<div class="ts-block">${fence(type.snippet)}` +
					type.children.map(stringify).join('\n\n') +
					`</div>`
				);
			}

			return `${module.comment}\n\n${module.types
				.map((t) => {
					let children = t.children.map(stringify).join('\n\n');
					if (t.name === 'Config' || t.name === 'KitConfig') {
						// special case — we want these to be on a separate page
						children =
							'<div class="ts-block-property-details">\n\nSee the [configuration reference](/docs/configuration) for details.</div>';
					}

					const markdown = `<div class="ts-block">${fence(t.snippet)}` + children + `</div>`;
					return `### ${t.name}\n\n${t.comment}\n\n${markdown}\n\n`;
				})
				.join('')}`;
		})
		.replace(/> EXPORT_SNIPPET: (.+?)#(.+)?$/gm, (_, name, id) => {
			const module = modules.find((module) => module.name === name);
			if (!module) throw new Error(`Could not find module ${name} for EXPORT_SNIPPET clause`);

			if (!id) {
				throw new Error(`id is required for module ${name}`);
			}

			const exported = module.exports.filter((t) => t.name === id);

			return exported
				.map((exportVal) => `<div class="ts-block">${fence(exportVal.snippet)}</div>`)
				.join('\n\n');
		})
		.replace('> MODULES', () => {
			return modules
				.map((module) => {
					if (module.exports.length === 0 && !module.exempt) return '';

					let import_block = '';

					if (module.exports.length > 0) {
						// deduplication is necessary for now, because of `error()` overload
						const exports = Array.from(new Set(module.exports.map((x) => x.name)));

						let declaration = `import { ${exports.join(', ')} } from '${module.name}';`;
						if (declaration.length > 80) {
							declaration = `import {\n\t${exports.join(',\n\t')}\n} from '${module.name}';`;
						}

						import_block = fence(declaration, 'js');
					}

					return `## ${module.name}\n\n${import_block}\n\n${module.comment}\n\n${module.exports
						.map((type) => {
							const markdown =
								`<div class="ts-block">${fence(type.snippet)}` +
								type.children.map(stringify).join('\n\n') +
								`</div>`;
							return `### ${type.name}\n\n${type.comment}\n\n${markdown}`;
						})
						.join('\n\n')}`;
				})
				.join('\n\n');
		})
		.replace(/> EXPORTS: (.+)/, (_, name) => {
			const module = modules.find((module) => module.name === name);
			if (!module) throw new Error(`Could not find module ${name} for EXPORTS: clause`);

			if (module.exports.length === 0 && !module.exempt) return '';

			let import_block = '';

			if (module.exports.length > 0) {
				// deduplication is necessary for now, because of `error()` overload
				const exports = Array.from(new Set(module.exports.map((x) => x.name)));

				let declaration = `import { ${exports.join(', ')} } from '${module.name}';`;
				if (declaration.length > 80) {
					declaration = `import {\n\t${exports.join(',\n\t')}\n} from '${module.name}';`;
				}

				import_block = fence(declaration, 'js');
			}

			return `${import_block}\n\n${module.comment}\n\n${module.exports
				.map((type) => {
					const markdown =
						`<div class="ts-block">${fence(type.snippet)}` +
						type.children.map(stringify).join('\n\n') +
						`</div>`;
					return `### ${type.name}\n\n${type.comment}\n\n${markdown}`;
				})
				.join('\n\n')}`;
		});
}

/**
 * @param {string} code
 * @param {string} lang
 */
function fence(code, lang = 'ts') {
	return '\n\n```' + lang + '\n' + code + '\n```\n\n';
}

/**
 * @param {import('./types').Type} member
 */
function stringify(member) {
	const bullet_block =
		member.bullets.length > 0
			? `\n\n<div class="ts-block-property-bullets">\n\n${member.bullets.join('\n')}</div>`
			: '';

	const child_block =
		member.children.length > 0
			? `\n\n<div class="ts-block-property-children">${member.children
					.map(stringify)
					.join('\n')}</div>`
			: '';

	return (
		`<div class="ts-block-property">${fence(member.snippet)}` +
		`<div class="ts-block-property-details">\n\n` +
		bullet_block +
		'\n\n' +
		member.comment
			.replace(/\/\/\/ type: (.+)/g, '/** @type {$1} */')
			.replace(/^(  )+/gm, (match, spaces) => {
				return '\t'.repeat(match.length / 2);
			}) +
		child_block +
		'\n</div></div>'
	);
}
