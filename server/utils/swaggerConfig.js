import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "API documentation",
    },
  },
  apis: ["./routes/*.js"], // Include all route files where APIs are defined
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerSpec, swaggerUi };
