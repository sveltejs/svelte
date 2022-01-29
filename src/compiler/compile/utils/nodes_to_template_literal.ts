import { TemplateElement, TemplateLiteral } from 'estree';
import { MustacheTag, Text } from '../../interfaces';

/**
 * Transforms a list of Text and MustacheTags into a TemplateLiteral expression.
 * Start/End positions on the elements of the expression are not set.
 */
export function nodes_to_template_literal(value: Array<Text | MustacheTag>): TemplateLiteral {
    const literal: TemplateLiteral  = {
        type: 'TemplateLiteral',
        expressions: [],
        quasis: []
    };

    let quasi: TemplateElement  = {
        type: 'TemplateElement',
        value: { raw: '', cooked: null },
        tail: false
    };

    value.forEach((node) => {
        if (node.type === 'Text') {
            quasi.value.raw += node.raw;
        } else if (node.type === 'MustacheTag') {
            literal.quasis.push(quasi);
            literal.expressions.push(node.expression as any);
            quasi = {
                type: 'TemplateElement',
                value: { raw: '', cooked: null },
                tail: false
            };
        }
    });
    quasi.tail = true;
    literal.quasis.push(quasi);
    return literal;
}
