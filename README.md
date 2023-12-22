# EmailMinifier

[![npm version](https://img.shields.io/npm/v/email-minifier.svg)](https://www.npmjs.com/package/email-minifier)


EmailMinifier is a well-tested email minifier based on TypeScript for browser and Node.js

As a quick start, you can [Try it online](https://luckrnx09.github.io/email-minifier/playground) - NOT READY. Welcome to submit a PR 🚀

## Why not HTMLMinifier

[HTMLMinifier](https://github.com/kangax/html-minifier) is a great tool for compressing HTML. But email is different from HTML in many ways, compression of HTML is often not the best solution.
- JavaScript code is not supported or required in emails.
- The interactive behavior of the email is very limited, most HTML attributes are useless for the email but still load them when user open it.
- Some email clients crop oversized emails (e.g. Gmail) and the style of the email is broken after cropping, which is extremely detrimental to marketing.
- ...

## Installation

You can use the tool you like to install EmailMinifier:

npm
```shell
npm install email-minifier 
```

yarn
```shell
yarn add email-minifier 
```

pnpm
```shell
pnpm install email-minifier 
```
 
## Usage

For both browser and Node.js if you use ESM:

```javascript
import { EmailMinifier } from 'email-minifier';
(async () => { 
    const emailBody = `<div class="hello"></div>`;
    const options = {};
    const result = await new EmailMinifier(emailBody).minify(options);
    console.log(result);
})();
```


For Node.js only if you use CommonJS:

```javascript
const { EmailMinifier } = require('email-minifier');
(async () => { 
    const emailBody = `<div class="hello"></div>`;
    const options = {};
    const result = await new EmailMinifier(emailBody).minify(options);
    console.log(result);
})();
```

The `minify()` method will returns a Promise with the shape as follow:

```javascript
{
    original: '', // the original email body string
    minified: '', // minified email body string will be here, if no tasks ran, it'll be null
    tasks: [] // all ran tasks when minify email body
}
```

All available properties for `options` are as follows

| Option                         | Description     | Default |
|--------------------------------|-----------------|---------|
| `minifyIds`                | Minifiy id attributes used in style tags | `true` |
| `minifyClasses`    | Minifiy class attributes used in style tags | `true` |
| `minifyDatasets`    | Minifiy data-* attributes used in style tags | `true` |
| `removeUnusedAttrs`    | Remove custom attributes unused in style tags | `false` |
| `minifyStyles`    | Minifiy CSS content for all the style tags | `true` |

For `removeUnusedAttrs`, if you want to remove the specific unused attributes, you can provide an array with `RegExp` instances to match them. 

For example: 
```javascript
const options = {
    removeUnusedAttrs: [
        new RegExp('custom-test-id') // Remove `custom-test-id` attributes if they not used in style tags
    ]
};
```



## Performance

The following table shows the statistics in the Node.js environment
| Email                         | Original Size | Minified Size | Elapsed Time |
| ----------------------------- | ------------- | ------------- | ------------ |
|[Holiday Cheer](https://github.com/luckrnx09/email-minifier/tree/main/examples%2Ftemplates%2FHoliday%20Cheer)|33.09kb|32.36kb|756.04ms|
|[Membership Discount](https://github.com/luckrnx09/email-minifier/tree/main/examples%2Ftemplates%2FMembership%20Discount)|104.00kb|37.97kb|104.44ms|
|[Movies for Christmas](https://github.com/luckrnx09/email-minifier/tree/main/examples%2Ftemplates%2FMovies%20for%20Christmas)|289.47kb|58.30kb|184.62ms|
> The emails above are generated from [unlayer](https://dashboard.unlayer.com).

## License
See [LICENSE](./LICENSE)