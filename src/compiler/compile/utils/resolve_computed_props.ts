import { Context } from '../nodes/shared/Context';
import ConstTag from '../nodes/ConstTag';
import Block from '../render_dom/Block';

export function resolve_computed_prop_conflicts(block: Block, node_contexts: Context[], node_const_tags: ConstTag[]) {
  node_contexts.forEach((context: Context) => {
    if (context.type === 'ComputedProperty') {
      context.property_name.name = block.get_unique_name('computed_prop').name;
    }
  });

  node_const_tags.forEach((const_tag: ConstTag) => {
    const_tag.contexts.forEach((context: Context) => {
      if (context.type === 'ComputedProperty') {
        context.property_name.name = block.get_unique_name('computed_prop').name;
      }
    });
  });
}
