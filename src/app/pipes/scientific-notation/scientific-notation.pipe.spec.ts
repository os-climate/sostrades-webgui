import { ScientificNotationPipe } from './scientific-notation.pipe';

describe('ScientificNotationPipe', () => {
  it('create an instance', () => {
    const pipe = new ScientificNotationPipe();
    expect(pipe).toBeTruthy();
  });
});
