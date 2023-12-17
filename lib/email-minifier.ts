import { Sequence } from './sequence';
import { createDocument } from './document';
import { TaskManager } from './task-manager';
import { Context, ComposeOption, MinifyResult } from './types';

const DEFAULT_COMPOSE_OPTIONS: ComposeOption = {
  minifyIds: true,
  minifyClasses: true,
  minifyDatasets: true,
  minifyStyles: true,
  removeUnusedAttrs: false,
};
/**
 * Minify an email body
 * @example
 * const minifier = new EmailMinifier('<html>...</html>');
 * const result = await minifier.minify();
 * console.log(result.minified);
 */
export class EmailMinifier {
  private emailBody: string;

  constructor(emailBody: string) {
    this.emailBody = emailBody;
  }
  /**
   * Compose the minify tasks
   */
  private compose = (
    context: Context,
    options?: ComposeOption,
  ): TaskManager => {
    const taskManager = new TaskManager();
    const {
      minifyIds,
      minifyClasses,
      minifyDatasets,
      minifyStyles,
      removeUnusedAttrs,
    } = { ...DEFAULT_COMPOSE_OPTIONS, ...(options ?? {}) };

    const { document } = context;

    document.body.querySelectorAll('*').forEach((el) => {
      minifyIds && taskManager.add('minify-ids', el, context);
      minifyClasses && taskManager.add('minify-classes', el, context);
      removeUnusedAttrs &&
        taskManager.add('remove-unused-attrs', el, context, {
          matches: removeUnusedAttrs,
        });
      minifyDatasets && taskManager.add('minify-dataset-attrs', el, context);
    });
    document.head.querySelectorAll('style').forEach((el) => {
      taskManager.add('minify-styles', el, context, {
        minifyStyles,
      });
    });
    return taskManager;
  };

  private async createContext(): Promise<Context> {
    const { emailBody } = this;
    const document = await createDocument(emailBody);
    return {
      originalEmailBody: emailBody,
      styles: Array.from(document.head.querySelectorAll('style'))
        .map((el) => el.textContent)
        .join('\n'),
      document,
      idSequence: new Sequence(),
      classSequence: new Sequence(),
      mapping: {
        ids: new Map<string, string>(),
        classes: new Map<string, string>(),
        dataSets: new Map<string, string>(),
      },
    };
  }

  async minify(options?: ComposeOption): Promise<MinifyResult> {
    const context = await this.createContext();
    const taskManager = this.compose(context, options);
    const { originalEmailBody, document } = context;
    const tasks = taskManager.runAll();

    if (tasks.length === 0) {
      return {
        original: originalEmailBody,
        minified: null,
        tasks,
      };
    }

    return {
      original: originalEmailBody,
      minified: document.documentElement.outerHTML,
      tasks,
    };
  }
}
