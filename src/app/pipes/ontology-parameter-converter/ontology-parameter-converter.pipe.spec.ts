import { OntologyParameterConverterPipe } from './ontology-parameter-converter.pipe';

describe('OntologyParameterConverterPipe', () => {
  it('create an instance', () => {
    const mockOntologyService = { getParameter: () => null };
    const mockLoggerService = { log: () => {} };

    const pipe = new OntologyParameterConverterPipe(
      mockOntologyService as any,
      mockLoggerService as any
    );
    expect(pipe).toBeTruthy();
  });
});
