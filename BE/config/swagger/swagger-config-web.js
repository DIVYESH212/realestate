import swaggerJsDocs from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Resimpli API Documentation',
      version: '1.0.0',
      description: 'Swagger API documentation for the Resimpli Backend Project',
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message description' },
          },
        },
        Register: {
          type: 'object',
          required: ['username', 'password', 'email', 'mobilenumber'],
          properties: {
            username: { type: 'string', example: 'john_doe' },
            password: { type: 'string', example: 'Password123' },
            email: { type: 'string', example: 'user@example.com' },
            mobilenumber: { type: 'string', example: '1234567890' },
          },
        },
        ResetPassword: {
          type: 'object',
          required: ['token', 'password'],
          properties: {
            token: { type: 'string', example: 'reset-jwt-token' },
            password: { type: 'string', example: 'NewPassword123' },
          },
        },
        Buyer: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'John Doe' },
            mobilenumber: { type: 'string', example: '1234567890' },
            email: { type: 'string', example: 'john@example.com' },
            propertyAddress: { type: 'string', example: '123 Main St' },
            status: { type: 'string', enum: ['active', 'inactive', 'hold', 'assign'], example: 'active' },
            lead_id: { type: 'string', example: '60d5ecb8b3f1c20015f8d9f1' },
            notes: { type: 'string', example: 'Buyer notes...' },
          },
        },
        Lead: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Jane Smith' },
            firstName: { type: 'string', example: 'Jane' },
            lastName: { type: 'string', example: 'Smith' },
            email: { type: 'string', example: 'jane@example.com' },
            mobilenumber: { type: 'string', example: '9876543210' },
            phone: { type: 'string', example: '9876543210' },
            ownername: { type: 'string', example: 'Jane Smith' },
            ownermailingaddress: { type: 'string', example: '456 Elm St' },
            estimatedvalue: { type: 'number', example: 250000 },
            estimatedtotallens: { type: 'number', example: 100000 },
            estimatedequity: { type: 'number', example: 150000 },
            leadsource: { type: 'string', enum: ['website', 'referral', 'social media', 'other'], example: 'website' },
            market_segment: { type: 'string', enum: ['residential', 'commercial', 'industrial', 'other'], example: 'residential' },
            propertyAddress: { type: 'string', example: '789 Oak Ave' },
            leadstatus: { type: 'string', example: 'new' },
            status: { type: 'string', example: 'active' },
            city: { type: 'string', example: 'New York' },
            state: { type: 'string', example: 'NY' },
            zip: { type: 'string', example: '10001' },
            propertytype: { type: 'string', example: 'Single Family' },
            loanamount: { type: 'number', example: 200000 },
            loaninterest: { type: 'number', example: 3.5 },
            loanterm: { type: 'number', example: 30 },
            loanduration: { type: 'number', example: 360 },
            loanpayment: { type: 'number', example: 1200 },
            notes: { type: 'string', example: 'Lead notes...' },
          },
        },
      },
    },
  },
  apis: ['./api/v1/web/*/*.js'],
};

export default swaggerJsDocs(swaggerOptions);
