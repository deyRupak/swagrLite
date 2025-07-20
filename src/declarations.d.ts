declare module 'swagger-ui-react' {
  import type { ComponentType } from 'react';
  const SwaggerUI: ComponentType<{ spec: object }>;
  export default SwaggerUI;
}