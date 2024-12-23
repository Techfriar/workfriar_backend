import ClientRequest from '../../requests/admin/client-request.js'
import ClientRepository from '../../repositories/admin/client-repository.js'
import ClientResponse from '../../responses/client-response.js';
import { CustomValidationError } from '../../exceptions/custom-validation-error.js';

const clientRepository = new ClientRepository()
const clientResponse = new ClientResponse();
const clientRequest = new ClientRequest()

class ClientController {
    /**
     * @swagger
     * /admin/add-client:
     *   post:
     *     summary: Add a new client
     *     description: Adds a new client to the system.
     *     tags:
     *       - Clients
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - client_name
     *               - location
     *               - client_manager
     *               - billing_currency
     *               - status
     *             properties:
     *               client_name:
     *                 type: string
     *                 description: The name of the client.
     *                 example: Acme Corp
     *               location:
     *                 type: string
     *                 format: objectid
     *                 description: The location of the client (MongoDB ObjectId).
     *                 example: "60d5ecb54c3f7a1234567890"
     *               client_manager:
     *                 type: string
     *                 format: objectid
     *                 description: The manager responsible for the client (MongoDB ObjectId).
     *                 example: "60d5ecb54c3f7a0987654321"
     *               billing_currency:
     *                 type: string
     *                 format: objectid
     *                 description: The currency used for billing (MongoDB ObjectId).
     *                 example: "60d5ecb54c3f7a1357924680"
     *               status:
     *                 type: string
     *                 description: The status of the client.
     *                 enum: [Active, Inactive]
     *                 example: "Inactive"
     *     responses:
     *       201:
     *         description: Client added successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: Client added successfully
     *                 data:
     *                   type: object
     *                   properties:
     *                     client_name:
     *                       type: string
     *                       example: "Acme Corp"
     *                     location:
     *                       type: string
     *                       format: objectid
     *                       example: "60d5ecb54c3f7a1234567890"
     *                     client_manager:
     *                       type: string
     *                       format: objectid
     *                       example: "60d5ecb54c3f7a0987654321"
     *                     billing_currency:
     *                       type: string
     *                       format: objectid
     *                       example: "60d5ecb54c3f7a1357924680"
     *                     status:
     *                       type: string
     *                       example: "Inactive"
     *                     _id:
     *                       type: string
     *                       format: objectid
     *                       description: The ID of the new client.
     *                       example: "60d5ecb54c3f7a2468013579"
     *       422:
     *         description: Validation errors occurred
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: Validation errors occurred
     *                 errors:
     *                   type: object
     *                   additionalProperties:
     *                     type: string
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: An internal server error occurred
     */
    async addClient(req, res) {
        try {

            const validationResult = await clientRequest.validateClientData(req.body);
            if (validationResult.error) {
                // If there are validation errors, return a error
                throw new CustomValidationError(validationResult.error)

            }

            const { client_name, location, client_manager, billing_currency, status } = validationResult

            const newClient = await clientRepository.createClient({
                client_name,
                location,
                client_manager,
                billing_currency,
                status,
            });

            if (newClient) {
                const createResponse = await clientResponse.allClientsResponse(newClient)
                return res.status(201).json({
                    status: true,
                    message: 'Client added successfully',
                    data: createResponse,
                });
            }
            else {
                res.status(400).json({
                    status: false,
                    message: 'Failed to add user.',
                    data: [],
                })
            }


        }
        catch (error) {    
            if (error instanceof CustomValidationError) {
                res.status(422).json({
                    status: false,
                    message: 'Validation error',
                    errors: error.errors
                });
            }
            else {
                return res.status(500).json({
                    status: false,
                    message: 'An internal server error occurred',
                    data:[]
                });
            }
        }
    }

    /**
     * @swagger
     * /admin/all-clients:
     *   post:
     *     summary: Get all clients
     *     description: Retrieves a list of all clients from the database.
     *     tags:
     *       - Clients
     *     responses:
     *       200:
     *         description: Clients were successfully fetched or no clients were found.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: "Clients fetched successfully"
     *                 data:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       client_name:
     *                         type: string
     *                         example: "Acme Corporation"
     *                       location:
     *                         type: string
     *                         example: "New York"
     *                       client_manager:
     *                         type: string
     *                         example: "Jane Doe"
     *                       billing_currency:
     *                         type: string
     *                         example: "USD"
     *                       status:
     *                         type: string
     *                         example: "Inactive"
     *                   example: []
     *       500:
     *         description: Internal server error.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "An internal server error occurred."
     */

    async allClient(req, res) {
        try {
            const existingClients = await clientRepository.allClients();

            if (existingClients.length > 0) {
                const data = await Promise.all(
                    existingClients.map(
                        async (client) =>
                            await clientResponse.allClientsResponse(client),
                    ),
                )
                return res.status(200).json({
                    status: true,
                    message: 'Clients fetched successfully',
                    data,
                });
            } else {
                return res.status(200).json({
                    status: false,
                    message: 'No clients found.',
                    data: [],
                });
            }
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: 'An internal server error occurred.',
            });
        }
    }


    /**
     * @swagger
     * /admin/edit-client:
     *   post:
     *     summary: Edit an existing client
     *     description: Updates the details of an existing client.
     *     tags:
     *       - Clients
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - _id
     *             properties:
     *               _id:
     *                 type: string
     *                 description: The ID of the client to update.
     *                 example: "641b3a5f3c2aee4a9f2d1234"
     *               client_name:
     *                 type: string
     *                 description: The updated name of the client.
     *                 example: "Updated Acme Corp"
     *               location:
     *                 type: string
     *                 format: objectid
     *                 description: The updated location of the client (MongoDB ObjectId).
     *                 example: "60d5ecb54c3f7a1234567890"
     *               client_manager:
     *                 type: string
     *                 format: objectid
     *                 description: The updated manager responsible for the client (MongoDB ObjectId).
     *                 example: "60d5ecb54c3f7a0987654321"
     *               billing_currency:
     *                 type: string
     *                 format: objectid
     *                 description: The updated currency used for billing (MongoDB ObjectId).
     *                 example: "60d5ecb54c3f7a1357924680"
     *               status:
     *                 type: string
     *                 description: The updated status of the client.
     *                 enum: [Inactive, Active]
     *                 example: "Inactive"
     *     responses:
     *       200:
     *         description: Client updated successfully.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: "Client updated successfully"
     *                 data:
     *                   type: object
     *                   properties:
     *                     client_name:
     *                       type: string
     *                       example: "Updated Acme Corp"
     *                     location:
     *                       type: string
     *                       format: objectid
     *                       example: "60d5ecb54c3f7a1234567890"
     *                     client_manager:
     *                       type: string
     *                       format: objectid
     *                       example: "60d5ecb54c3f7a0987654321"
     *                     billing_currency:
     *                       type: string
     *                       format: objectid
     *                       example: "60d5ecb54c3f7a1357924680"
     *                     status:
     *                       type: string
     *                       example: "Inactive"
     *       422:
     *         description: Validation errors occurred.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Validation errors occurred"
     *                 errors:
     *                   type: object
     *                   additionalProperties:
     *                     type: string
     *       400:
     *         description: Failed to update client.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Failed to update client."
     *       500:
     *         description: Internal server error.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "An internal server error occurred"
     */
    async editClient(req, res) {
        try {
            const validationResult = await clientRequest.validateEditClientData(req.body);
            if (validationResult.error) {
                // If there are validation errors, return a error
                throw new CustomValidationError(validationResult.error)
            }

            const { _id, client_name, location, client_manager, billing_currency, status } = validationResult

            const updatedClient = await clientRepository.updateClient(_id, {
                client_name,
                location,
                client_manager,
                billing_currency,
                status,
            })

            if (updatedClient) {
                const editResponse = await clientResponse.allClientsResponse(updatedClient)
                return res.status(200).json({
                    status: true,
                    message: 'Client updated successfully',
                    data: editResponse,
                });
            } else {
                return res.status(400).json({
                    status: false,
                    message: 'Failed to update client.',
                });
            }
        }
        catch (error) {
            if (error instanceof CustomValidationError) {
                res.status(422).json({
                    status: false,
                    message: 'Validation error',
                    errors: error.errors,
                });
            }
            else {
                return res.status(500).json({
                    status: false,
                    message: 'An internal server error occurred',
                    data:[]
                });
            }
        }
    }

    /**
     * @swagger
     * /admin/change-client-status:
     *   post:
     *     summary: Change client status
     *     description: Updates the status of an existing client.
     *     tags:
     *       - Clients
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - _id
     *               - status
     *             properties:
     *               _id:
     *                 type: string
     *                 description: The ID of the client to update.
     *                 example: "641b3a5f3c2aee4a9f2d1234"
     *               status:
     *                 type: string
     *                 description: The new status of the client.
     *                 enum: [Inactive, Active]
     *                 example: "Inactive"
     *     responses:
     *       200:
     *         description: Client status updated successfully.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: "Client status updated successfully"
     *                 data:
     *                   type: object
     *                   description: The updated client object
     *       400:
     *         description: Failed to update client status.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Failed to update client status."
     *                 data:
     *                   type: array
     *                   example: []
     *       422:
     *         description: Validation errors occurred.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Validation error"
     *                 errors:
     *                   type: object
     *                   additionalProperties:
     *                     type: string
     *       500:
     *         description: Internal server error.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "An internal server error occurred"
     *                 data:
     *                   type: array
     *                   example: []
     */

    async changeClientStatus(req, res) {
        try {
            const validationResult = await clientRequest.validateClientStatus(req.body);
            if (validationResult.error) {
                throw new CustomValidationError(validationResult.error)

            }
            const {  _id, status } = validationResult    
            const updateClient = await clientRepository.changeClientStatus(_id, status)
            if(updateClient){
                const createResponse = await clientResponse.allClientsResponse(updateClient)
                res.status(200).json({
                    status: true,
                    message: 'Client status updated successfully',
                    data: createResponse,
                })
            }
            else{
                res.status(400).json({
                    status: false,
                    message: 'Failed to update client status.',
                    data: [],
                })
            }
        }
        catch (error) {
            if (error instanceof CustomValidationError) {
                res.status(422).json({
                    status: false,
                    message: 'Validation error',
                    errors: error.errors,
                });
            }
            else {
                return res.status(500).json({
                    status: false,
                    message: 'An internal server error occurred',
                    data:[]
                });
            }
        }
    }
}

export default ClientController;