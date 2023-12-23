import fs from 'fs';
import path from 'path';
import { EmailMinifier } from '../lib/email-minifier';
import { performance } from 'perf_hooks';

const source = 'https://dashboard.unlayer.com';
const dir = 'templates';

(async () => {
  const examples = [];
  const filenames = fs.readdirSync(dir);
  for (const filename of filenames) {
    const file = path.join(dir, filename);
    if (fs.statSync(file).isFile()) {
      const html = fs.readFileSync(file, 'utf-8');
      const t1 = performance.now();
      const { original, minified } = await new EmailMinifier(html).minify();
      const t2 = performance.now();
      examples.push({
        filename,
        url: file,
        originalSize: original.length / 1024,
        minifiedSize: minified.length / 1024,
        elapsed: t2 - t1,
      });
    }
  }
  const content = examples
    .sort((a, b) => a.originalSize - b.originalSize)
    .map(
      (example) =>
        `|[${
          example.filename
        }](https://github.com/luckrnx09/email-minifier/tree/main/${encodeURIComponent(
          example.url,
        )})|${example.originalSize.toFixed(2)}kb|${example.minifiedSize.toFixed(
          2,
        )}kb|${example.elapsed.toFixed(2)}ms|`,
    )
    .join(`\n`);
  const sectionContent = [
    'The following table shows the statistics in the Node.js environment',
    '| Email                         | Original Size | Minified Size | Elapsed Time |',
    '| ----------------------------- | ------------- | ------------- | ------------ |',
    content,
    `> The emails above are generated from [unlayer](${source}).`,
  ].join('\n');

  const readMe = fs.readFileSync('README.md', 'utf-8');
  const startMark = '## Performance';
  const endMark = '## License';
  const start = readMe.indexOf(startMark);
  const end = readMe.indexOf(endMark);
  const newReadMe =
    readMe.substring(0, start + startMark.length) +
    '\n\n' +
    sectionContent +
    '\n\n' +
    readMe.substring(end);
  readMe.substring(end);
  fs.writeFileSync('README.md', newReadMe, 'utf-8');
})();
