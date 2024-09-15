// src/swagger.ts
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { Express } from 'express';

// Load the swagger.yaml file
const swaggerDocument = YAML.load('./src/docs/swagger.yaml');

// Function to set up Swagger UI
const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};

export default setupSwagger;
