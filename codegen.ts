import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'graphql/schema/stable-v2.4.2366.graphql',
  documents: ['graphql/operations/**/*.graphql'],
  ignoreNoDocuments: false,
  generates: {
    'src/core/graphql/generated/': {
      preset: 'client',
      config: {
        scalars: {
          LongString: 'string',
          Cursor: 'string',
          Duration: 'string',
          Upload: 'File',
        },
        nonOptionalTypename: true,
        useTypeImports: true,
      },
    },
  },
};

export default config;
