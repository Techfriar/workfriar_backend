/**
 * Swagger configurations
 */
const swagger = {
    definition: {
        openapi: '3.1.0',
        info: {
            title: 'Workfriar - API with Swagger',
            version: '0.1.0',
            description:
                'This is a Workfriar API application made with Express and documented with Swagger',
            license: {
                name: 'MIT',
                url: 'https://spdx.org/licenses/MIT.html',
            },
            contact: {
                name: 'Workfriar',
                url: 'https://test.com',
                email: 'info@email.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:3002/api',
                description: 'Local server',
            },
        ],
        //auth setup start
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    in: 'header',
                    name: 'Authorization',
                    description: 'Bearer token to access these api endpoints',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        //auth setup end
    },
    apis: ['./src/controllers/admin/*.js', './src/controllers/user/*.js','./src/controllers/admin/*.js','./src/controllers/*.js'],
}

export default swagger
