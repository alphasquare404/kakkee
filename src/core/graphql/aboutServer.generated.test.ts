import { describe, expect, it } from 'vitest';
import { AboutServerDocument } from './generated/graphql';

describe('AboutServerDocument', () => {
  it('is generated as a query document for the aboutServer operation', () => {
    expect(AboutServerDocument.kind).toBe('Document');
    expect(AboutServerDocument.definitions).toHaveLength(1);
    expect(AboutServerDocument.definitions[0]).toMatchObject({
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'AboutServer' },
    });
  });
});
