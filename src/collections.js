export const unique = (values) => [...new Set(values)];

export const without = (values, removed) => values.filter((value) => !removed.includes(value));
