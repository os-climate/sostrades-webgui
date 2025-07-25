import { DisciplineIconMappingConverterPipe } from './discipline-icon-mapping-converter.pipe';

describe('DisciplineIconMappingConverterPipe', () => {
  it('create an instance', () => {
    const mockOntologyService = { getParameter: () => null };
    const mockLoggerService = { log: (log) => {console.log(log);} };

    const pipe = new DisciplineIconMappingConverterPipe(
      mockOntologyService as any,
      mockLoggerService as any
    );
    expect(pipe).toBeTruthy();
  });
});
