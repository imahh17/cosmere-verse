export default {
  '*.{ts,tsx,js,mjs}': ['eslint --fix', 'prettier --write'],
  '*.astro': ['eslint --fix', 'prettier --write'],
  '*.scss': ['prettier --write'],
  '*.{json,yaml,yml,md}': ['prettier --write'],
};
