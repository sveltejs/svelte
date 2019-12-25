function has_selection_capabilities(input) {
	const node_name = input.nodeName.toLowerCase();
	return (
		(node_name === 'input' &&
			(input.type === 'text' ||
				input.type === 'search' ||
				input.type === 'tel' ||
				input.type === 'url' ||
				input.type === 'password')) ||
		node_name === 'textarea'
	);
}

function get_selection(input) {
	return {
		start: input.selectionStart,
		end: input.selectionEnd,
	};
}

export function restore_input_selection(input, offsets) {
  let {start, end} = offsets;
  if (end === undefined) {
    end = start;
  }

  input.selectionStart = start;
  input.selectionEnd = Math.min(end, input.value.length);
}


export function save_input_selection(input) {
	return has_selection_capabilities(input) ? get_selection(input) : null;
}
