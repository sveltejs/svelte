import * as namespaces from '../../utils/namespaces';
import getStaticAttributeValue from '../../utils/getStaticAttributeValue';
import fuzzymatch from '../utils/fuzzymatch';
import validateEventHandler from './validateEventHandler';
import { Validator } from '../index';
import { Node } from '../../interfaces';

const ariaAttributes = 'activedescendant atomic autocomplete busy checked controls current describedby details disabled dropeffect errormessage expanded flowto grabbed haspopup hidden invalid keyshortcuts label labelledby level live modal multiline multiselectable orientation owns placeholder posinset pressed readonly relevant required roledescription selected setsize sort valuemax valuemin valuenow valuetext'.split(' ');
const ariaAttributeSet = new Set(ariaAttributes);

const ariaRoles = 'alert alertdialog application article banner button cell checkbox columnheader combobox command complementary composite contentinfo definition dialog directory document feed figure form grid gridcell group heading img input landmark link list listbox listitem log main marquee math menu menubar menuitem menuitemcheckbox menuitemradio navigation none note option presentation progressbar radio radiogroup range region roletype row rowgroup rowheader scrollbar search searchbox section sectionhead select separator slider spinbutton status structure switch tab table tablist tabpanel term textbox timer toolbar tooltip tree treegrid treeitem widget window'.split(' ');
const ariaRoleSet = new Set(ariaRoles);

const invisibleElements = new Set(['meta', 'html', 'script', 'style']);

export default function a11y(
	validator: Validator,
	node: Node,
	elementStack: Node[]
) {
	if (node.type === 'Text') {
		// accessible-emoji
		return;
	}

	function shouldHaveAttribute(attributes: string[], name = node.name) {
		if (attributes.length === 0 || !attributes.some((name: string) => attributeMap.has(name))) {
			const article = /^[aeiou]/.test(attributes[0]) ? 'an' : 'a';
			const sequence = attributes.length > 1 ?
				attributes.slice(0, -1).join(', ') + ` or ${attributes[attributes.length - 1]}` :
				attributes[0];

			validator.warn(node, {
				code: `a11y-missing-attribute`,
				message: `A11y: <${name}> element should have ${article} ${sequence} attribute`
			});
		}
	}

	if (/^h[1-6]$/.test(node.name)) {
		if (attributeMap.has('aria-hidden')) {
			validator.warn(attributeMap.get('aria-hidden'), {
				code: `a11y-hidden`,
				message: `A11y: <${node.name}> element should not be hidden`
			});
		}
	}

	if (node.name === 'figcaption') {
		const parent = elementStack[elementStack.length - 1];
		if (parent) {
			if (parent.name !== 'figure') {
				validator.warn(node, {
					code: `a11y-structure`,
					message: `A11y: <figcaption> must be an immediate child of <figure>`
				});
			} else {
				const children = parent.children.filter(node => {
					if (node.type === 'Comment') return false;
					if (node.type === 'Text') return /\S/.test(node.data);
					return true;
				});

				const index = children.indexOf(node);

				if (index !== 0 && index !== children.length - 1) {
					validator.warn(node, {
						code: `a11y-structure`,
						message: `A11y: <figcaption> must be first or last child of <figure>`
					});
				}
			}
		}
	}
}