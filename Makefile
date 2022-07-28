install:
	npm ci

publish:  
	npm publish --dry-run 

lint:
	npx eslint .

build:
	npm run build

serve:
	npx webpack serve
