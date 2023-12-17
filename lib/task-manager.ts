import { Context, Task, TaskType } from './types';
import { minify as minifyCSS } from 'csso';

export class TaskManager {
  private mapping: Record<
    TaskType,
    (
      el: Element,
      context: Context,
      // Feel free to submit PRs to avoid using any here
      options?: any,
    ) => Task[]
  >;
  private tasks: Task[];

  constructor() {
    this.tasks = [];
    this.mapping = {
      'minify-ids': (el: Element, context: Context) => {
        if (!el.id) {
          return [];
        }
        const id = el.id;
        const {
          styles,
          idSequence,
          mapping: { ids },
        } = context;
        if (new RegExp(`#${id}`).test(styles)) {
          let newId = '';
          if (ids.has(id)) {
            newId = ids.get(id) as string;
          } else {
            newId = idSequence.next();
            ids.set(id, newId);
          }
          return [{ el, action: 'set-attribute', name: 'id', value: newId }];
        } else {
          return [{ el, action: 'remove-attribute', name: 'id' }];
        }
      },
      'minify-classes': (el: Element, context: Context) => {
        const classNames = Array.from(el.classList.values());
        const {
          styles,
          classSequence,
          mapping: { classes },
        } = context;
        if (
          classNames.length > 0 &&
          classNames.some((className) =>
            new RegExp(`.${className}`).test(styles),
          )
        ) {
          const newClassNames: string[] = [];
          classNames.forEach((className) => {
            let newClassName = '';
            if (classes.has(className)) {
              newClassName = classes.get(className) as string;
            } else {
              newClassName = classSequence.next();
              classes.set(className, newClassName);
            }
            newClassNames.push(newClassName);
          });
          return [
            {
              el,
              action: 'set-attribute',
              name: 'class',
              value: newClassNames.join(' '),
            },
          ];
        } else {
          return [{ el, action: 'remove-attribute', name: 'class' }];
        }
      },
      'remove-unused-attrs': (
        el: Element,
        context: Context,
        { matches } = { matches: [] },
      ) => {
        const tasks: Task[] = [];
        const { styles } = context;
        if (matches.length === 0) return [];

        el.getAttributeNames()
          .filter((attr) => {
            return matches.some(
              (reg: RegExp) => reg.test(attr) && !styles.includes(`[${attr}`), // like span[data-anything]
            );
          })
          .forEach((attr) => {
            tasks.push({
              el,
              action: 'remove-attribute',
              name: attr,
            });
          });
        return tasks;
      },
      // Dataset attrs are customized, we can safely minify them.
      'minify-dataset-attrs': (el: Element, context: Context) => {
        const tasks: Task[] = [];
        const {
          mapping: { dataSets },
        } = context;
        el.getAttributeNames()
          .filter((attr) => attr.startsWith('data-'))
          .forEach((attr) => {
            const newAttribute = attr
              .split('-')
              .map((x) => x[0])
              .flat()
              .join(''); // data-offset-key -> dok
            tasks.push({ el, action: 'remove-attribute', name: attr });
            tasks.push({
              el,
              action: 'set-attribute',
              name: newAttribute,
              value: '',
            });
            dataSets.set(attr, newAttribute);
          });
        return tasks;
      },
      'minify-styles': (
        el: Element,
        context: Context,
        {
          minifyStyles = true,
        }: {
          minifyStyles: boolean;
        },
      ) => {
        const tasks: Task[] = [];
        const {
          mapping: { ids, classes, dataSets },
        } = context;

        // Replace id selectors. eg: #id
        for (const key of Array.from(ids.keys()).sort(
          (a, b) => b.length - a.length,
        )) {
          tasks.push({
            el,
            action: 'minify-css-selector',
            originSelector: `#${key}`,
            newSelector: `#${ids.get(key)}`,
          });
        }

        // Replace class selectors. eg: .class
        for (const key of Array.from(classes.keys()).sort(
          (a, b) => b.length - a.length,
        )) {
          tasks.push({
            el,
            action: 'minify-css-selector',
            originSelector: `.${key}`,
            newSelector: `.${classes.get(key)}`,
          });
        }

        // Replace dataset property selectors. eg: span[data-offset-key]
        for (const key of Array.from(dataSets.keys()).sort(
          (a, b) => b.length - a.length,
        )) {
          tasks.push({
            el,
            action: 'minify-css-selector',
            originSelector: `[${key}`,
            newSelector: `[${dataSets.get(key)}`,
          });
        }
        minifyStyles && tasks.push({ el, action: 'minify-style' });
        return tasks;
      },
    };
  }

  add(
    type: TaskType,
    el: Element,
    context: Context,
    // Feel free to submit PRs to avoid using any here
    options?: any,
  ) {
    this.tasks.push(...this.mapping[type](el, context, options));
    return this;
  }

  runAll = () => {
    const runner = (task: Task) => {
      const { el } = task;
      switch (task.action) {
        case 'set-attribute':
          el.setAttribute(task.name, task.value);
          break;
        case 'remove-attribute':
          el.removeAttribute(task.name);
          break;
        case 'minify-css-selector':
          if (el.textContent) {
            el.textContent = el.textContent.replaceAll(
              task.originSelector,
              task.newSelector,
            );
          }
          break;
        case 'minify-style':
          if (el.textContent) {
            el.textContent = minifyCSS(el.textContent).css;
          }
          break;
      }
    };
    this.tasks.forEach(runner);
    const ranTasks = [...this.tasks];
    this.tasks = [];
    return ranTasks;
  };
}
