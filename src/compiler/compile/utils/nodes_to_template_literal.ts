/**
 * Transforms a list of Text and MustacheTags into a TemplateLiteral expression.
 * Start/End positions on the elements of the expression are not set.
 * @param {Array<Text | MustacheTag>} value
 * @returns {import("C:/repos/svelte/svelte/node_modules/.pnpm/@types+estree@1.0.0/node_modules/@types/estree/index").TemplateLiteral}
 */
export function nodes_to_template_literal(value) {

 /**
 * @type {TemplateLiteral}
 */
    const literal = {
        type: 'TemplateLiteral',
        expressions: [],
        quasis: []
    };

 /**
 * @type {TemplateElement}
 */
    let quasi = {
        type: 'TemplateElement',
        value: { raw: '', cooked: null },
        tail: false
    };
    value.forEach((node) => {
        if (node.type === 'Text') {
            quasi.value.raw += node.raw;
        }
        else if (node.type === 'MustacheTag') {
            literal.quasis.push(quasi);
            literal.expressions.push(node.expression);
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




