import { OntologyDisciplineConverterPipe } from './ontology-discipline-converter.pipe';

describe('OntologyDisciplineConverterPipe', () => {
  it('create an instance', () => {
    const mockOntologyService = { getParameter: () => null };
    const mockLoggerService = { log: () => {} };

    const pipe = new OntologyDisciplineConverterPipe(
      mockOntologyService as any,
      mockLoggerService as any
    );
    expect(pipe).toBeTruthy();
  });
});
