import fs from 'fs';
import path from 'path';

import { EmailMinifier } from '../lib/email-minifier';

const getTestData = (filename: string) => {
  return fs.readFileSync(path.resolve(__dirname, 'fixtures', filename), {
    encoding: 'utf-8',
  });
};

/**
 * Create an email body with the standard html format
 */
const createEmailBody = (content: string, css: string[] = []) => {
  return `
  <!DOCTYPE html>
  <html xmlns="http://www.w3.org/1999/xhtml">
  <head>
      ${css?.map((c) => `<style>${c}</style>`).join('\n')}
  </head>
  <body>
      ${content}
  </body>
  </html>`;
};

const removeUnusedAttrs = [
  'data-*',
  'autocorrect',
  'spellcheck',
  'contenteditable',
].map((x) => new RegExp(`^${x}`));

describe('email-minifier', () => {
  describe('Tasks', () => {
    it('should not generate tasks if incorrect email body provided', async () => {
      const emailBody = 'invalid email body';
      const minifier = new EmailMinifier(emailBody);
      const { tasks } = await minifier.minify();
      expect(tasks.length).toEqual(0);
    });

    it('should generate minify id tasks', async () => {
      const emailBody = createEmailBody(
        `<div id="test-id-1" ></div>
          <div id="test-id-2" ></div>
          <div id="test-id-unused" id-will-be-remove ></div>`,
        [`#test-id-1, #test-id-2 { font-size: 16px; }`],
      );
      const minifier = new EmailMinifier(emailBody);
      const { tasks } = await minifier.minify();

      const removeIdTasks = tasks.filter(
        (x) => x.action === 'remove-attribute' && x.name === 'id',
      );
      expect(removeIdTasks).toHaveLength(1);
      const [removeIdTask] = removeIdTasks;
      expect(removeIdTask.el.getAttribute('id-will-be-remove')).toEqual('');
      expect(removeIdTask.el.id).toEqual('');

      const setIdTasks = tasks.filter(
        (x) => x.action === 'set-attribute' && x.name === 'id',
      );
      expect(setIdTasks).toHaveLength(2);

      expect(setIdTasks).toContainEqual({
        el: expect.any(Object),
        action: 'set-attribute',
        name: 'id',
        value: 'a',
      });
      expect(setIdTasks).toContainEqual({
        el: expect.any(Object),
        action: 'set-attribute',
        name: 'id',
        value: 'b',
      });
    });

    it('should generate minify class tasks', async () => {
      const emailBody = createEmailBody(
        `<div class="test-class-reused" ></div>
          <div class="test-class-reused test-class-1" ></div>
          <div class="test-class-unused" class-will-be-removed ></div>`,
        [`.test-class-reused, .test-class-1 { font-size: 16px; }`],
      );
      const minifier = new EmailMinifier(emailBody);

      const { tasks } = await minifier.minify();
      const removeClassTasks = tasks.filter(
        (x) => x.action === 'remove-attribute' && x.name === 'class',
      );
      expect(removeClassTasks).toHaveLength(1);
      const [removeIdTask] = removeClassTasks;
      expect(removeIdTask.el.getAttribute('class-will-be-removed')).toEqual('');
      expect(removeIdTask.el.className).toEqual('');

      const setClassTasks = tasks.filter(
        (x) => x.action === 'set-attribute' && x.name === 'class',
      );
      expect(setClassTasks).toHaveLength(2);

      expect(setClassTasks).toContainEqual({
        el: expect.any(Object),
        action: 'set-attribute',
        name: 'class',
        value: 'a',
      });
      expect(setClassTasks).toContainEqual({
        el: expect.any(Object),
        action: 'set-attribute',
        name: 'class',
        value: 'a b',
      });
    });

    it('should generate minify style tasks', async () => {
      const emailBody = createEmailBody(
        `
        <div class="test-class-1"></div>
        <div class="test-class-2"></div>`,
        [
          `.test-class-1 {font-size: 16px; }`,
          `.test-class-2 {font-size: 16px; }`,
        ],
      );
      const minifier = new EmailMinifier(emailBody);

      const { tasks } = await minifier.minify();
      const minifyCSSTasks = tasks.filter((x) => x.action === 'minify-style');
      expect(minifyCSSTasks).toHaveLength(2);
    });

    it('should generate remove unused attribute tasks', async () => {
      const emailBody = createEmailBody(
        `<div contenteditable spellcheck autocorrect data-test-id="data-test-id" data-unremoved="data-unremoved" ></div>`,
      );
      const minifier = new EmailMinifier(emailBody);

      const { tasks } = await minifier.minify({
        removeUnusedAttrs,
      });
      expect(tasks).toContainEqual({
        el: expect.any(Object),
        action: 'remove-attribute',
        name: 'contenteditable',
      });
      expect(tasks).toContainEqual({
        el: expect.any(Object),
        action: 'remove-attribute',
        name: 'data-test-id',
      });
      expect(tasks).toContainEqual({
        el: expect.any(Object),
        action: 'remove-attribute',
        name: 'spellcheck',
      });
      expect(tasks).toContainEqual({
        el: expect.any(Object),
        action: 'remove-attribute',
        name: 'autocorrect',
      });
    });

    it('should generate minify data-* attribute tasks', async () => {
      const emailBody = createEmailBody(
        `<div data-test-name="data-test-name" data-test-age="data-test-age" ></div>`,
      );
      const minifier = new EmailMinifier(emailBody);

      const { tasks } = await minifier.minify();
      expect(tasks).toContainEqual({
        el: expect.any(Object),
        action: 'remove-attribute',
        name: 'data-test-name',
      });
      expect(tasks).toContainEqual({
        el: expect.any(Object),
        action: 'set-attribute',
        name: 'dtn',
        value: '',
      });
      expect(tasks).toContainEqual({
        el: expect.any(Object),
        action: 'remove-attribute',
        name: 'data-test-age',
      });
      expect(tasks).toContainEqual({
        el: expect.any(Object),
        action: 'set-attribute',
        name: 'dta',
        value: '',
      });
    });
  });

  describe('Options', () => {
    it('should generate tasks follow options.minifyIds', async () => {
      const emailBody = getTestData('full-featured-email-body');
      const minifier = new EmailMinifier(emailBody);
      expect((await minifier.minify({ minifyIds: true })).tasks).toContainEqual(
        {
          action: 'set-attribute',
          name: 'id',
          el: expect.any(Object),
          value: expect.any(String),
        },
      );
      expect(
        (await minifier.minify({ minifyIds: false })).tasks,
      ).not.toContainEqual({
        action: 'set-attribute',
        name: 'id',
        el: expect.any(Object),
        value: expect.any(String),
      });
    });

    it('should generate tasks follow options.minifyClasses', async () => {
      const emailBody = getTestData('full-featured-email-body');
      const minifier = new EmailMinifier(emailBody);
      expect(
        (await minifier.minify({ minifyClasses: true })).tasks,
      ).toContainEqual({
        action: 'set-attribute',
        name: 'class',
        el: expect.any(Object),
        value: expect.any(String),
      });
      expect(
        (await minifier.minify({ minifyClasses: false })).tasks,
      ).not.toContainEqual({
        action: 'set-attribute',
        name: 'class',
        el: expect.any(Object),
        value: expect.any(String),
      });
    });

    it('should generate tasks follow options.minifyStyles', async () => {
      const emailBody = getTestData('full-featured-email-body');
      const minifier = new EmailMinifier(emailBody);
      expect(
        (await minifier.minify({ minifyStyles: true })).tasks,
      ).toContainEqual({
        action: 'minify-style',
        el: expect.any(Object),
      });
      expect(
        (await minifier.minify({ minifyStyles: false })).tasks,
      ).not.toContainEqual({
        action: 'minify-style',
        el: expect.any(Object),
      });
    });

    it('should generate tasks follow options.minifyDatasets', async () => {
      const emailBody = getTestData('full-featured-email-body');
      const minifier = new EmailMinifier(emailBody);
      expect(
        (await minifier.minify({ minifyDatasets: true })).tasks,
      ).toContainEqual({
        action: 'remove-attribute',
        name: expect.stringMatching(/^data/),
        el: expect.any(Object),
      });
      expect(
        (await minifier.minify({ minifyDatasets: false })).tasks,
      ).not.toContainEqual({
        action: 'remove-attribute',
        name: expect.stringMatching(/^data/),
        el: expect.any(Object),
      });
    });

    it('should generate tasks follow options.removeUnusedAttrs', async () => {
      const emailBody = getTestData('full-featured-email-body');
      const minifier = new EmailMinifier(emailBody);
      expect(
        (await minifier.minify({ removeUnusedAttrs })).tasks,
      ).toContainEqual({
        action: 'remove-attribute',
        name: expect.stringMatching(/contenteditable/),
        el: expect.any(Object),
      });
      expect(
        (await minifier.minify({ removeUnusedAttrs: false })).tasks,
      ).not.toContainEqual({
        action: 'remove-attribute',
        name: expect.stringMatching(/contenteditable/),
        el: expect.any(Object),
      });
    });
  });

  describe('Snapshots', () => {
    it('should minify email correctly', async () => {
      const emailBody = getTestData('full-featured-email-body');
      const minifier = new EmailMinifier(emailBody);
      const { original, minified } = await minifier.minify({
        removeUnusedAttrs,
      });
      expect(minified!.length).toBeLessThan(original.length);
      expect(minified).toMatchSnapshot();
    });
  });
});
