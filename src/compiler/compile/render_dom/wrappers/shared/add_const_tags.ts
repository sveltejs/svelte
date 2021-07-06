import ConstTag from '../../../nodes/ConstTag';
import Block from '../../Block';
import { b, x } from 'code-red';
import Renderer from '../../Renderer';

export function add_const_tags(block: Block, const_tags: ConstTag[], ctx: string) {
  const const_tags_props = [];
  const_tags.forEach((const_tag, i) => {
    const name = `#constants_${i}`;
    const_tags_props.push(b`const ${name} = ${const_tag.expression.manipulate(block, ctx)}`);
    const_tag.contexts.forEach(context => {
      const_tags_props.push(b`${ctx}[${block.renderer.context_lookup.get(context.key.name).index}] = ${context.default_modifier(context.modifier({ type: 'Identifier', name }), name => block.renderer.context_lookup.has(name) ? x`${ctx}[${block.renderer.context_lookup.get(name).index}]` : { type: 'Identifier', name })};`);
    });
  });
  return const_tags_props;
}

export function add_const_tags_context(renderer: Renderer, const_tags: ConstTag[]) {
  const_tags.forEach(const_tag => {
    const_tag.contexts.forEach(context => {
      renderer.add_to_context(context.key.name, true);
    });
  });
}
