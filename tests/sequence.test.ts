import { Sequence } from '../lib/sequence';

describe('sequence', () => {
  it('should generate the correct result', () => {
    const generator = new Sequence();
    expect(generator.next()).toBe('a');
    expect(generator.next()).toBe('b');
    expect(generator.next()).toBe('c');
  });

  it('should generate the correct result if next() is called more than 26 times', () => {
    const generator = new Sequence();
    for (let i = 0; i < 26; i++) {
      generator.next();
    }
    expect(generator.next()).toBe('aa');
    expect(generator.next()).toBe('ab');
    expect(generator.next()).toBe('ac');
  });

  it('should generate the correct result if next() is called more than 78 times', () => {
    const generator = new Sequence();
    for (let i = 0; i < 78; i++) {
      generator.next();
    }
    expect(generator.next()).toBe('ca');
    expect(generator.next()).toBe('cb');
    expect(generator.next()).toBe('cc');
  });

  it('should generate the correct result if next() is called more than 260 times', () => {
    const generator = new Sequence();
    for (let i = 0; i < 260; i++) {
      generator.next();
    }
    expect(generator.next()).toBe('ja');
    expect(generator.next()).toBe('jb');
    expect(generator.next()).toBe('jc');
  });
});
