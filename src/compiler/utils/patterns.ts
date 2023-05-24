export const regex_whitespace = /\s/;
export const regex_whitespaces = /\s+/;
export const regex_starts_with_whitespace = /^\s/;
export const regex_starts_with_whitespaces = /^[ \t\r\n]*/;
export const regex_ends_with_whitespace = /\s$/;
export const regex_ends_with_whitespaces = /[ \t\r\n]*$/;
export const regex_only_whitespaces = /^\s+$/;

export const regex_whitespace_characters = /\s/g;
export const regex_non_whitespace_character = /\S/;

export const regex_starts_with_newline = /^\r?\n/;
export const regex_not_newline_characters = /[^\n]/g;

export const regex_double_quotes = /"/g;

export const regex_backslashes = /\\/g;

export const regex_starts_with_underscore = /^_/;
export const regex_ends_with_underscore = /_$/;

export const regex_invalid_variable_identifier_characters = /[^a-zA-Z0-9_$]/g;

export const regex_dimensions = /^(?:offset|client)(?:Width|Height)$/;

export const regex_content_rect = /^(?:contentRect)$/;
export const regex_content_box_size = /^(?:contentBoxSize)$/;
export const regex_border_box_size = /^(?:borderBoxSize)$/;
export const regex_device_pixel_content_box_size = /^(?:devicePixelContentBoxSize)$/;
export const regex_box_size = /^(?:contentRect|contentBoxSize|borderBoxSize|devicePixelContentBoxSize)$/;
