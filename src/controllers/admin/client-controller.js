import ClientRequest from '../../requests/admin/client-request.js'
import ClientRepository from '../../repositories/admin/client-repository.js'
import ClientResponse from '../../responses/client-response.js';
import { CustomValidationError } from '../../exceptions/custom-validation-error.js';

const clientRepository = new ClientRepository()
const clientResponse = new ClientResponse();

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
     *                 description: The location of the client.
     *                 example: New York
     *               client_manager:
     *                 type: string
     *                 description: The manager responsible for the client.
     *                 example: John Doe
     *               billing_currency:
     *                 type: string
     *                 description: The currency used for billing.
     *                 example: USD
     *               status:
     *                 type: string
     *                 description: The status of the client.
     *                 enum: [Not started,In progress,On hold,Cancelled]
     *                 example: "Not started"
     *     responses:
     *       201:
     *         description: Client added successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: Client added successfully
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       description: The ID of the new client.
     *                       example: 12345
     *       422:
     *         description: Validation errors occurred
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
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
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: An internal server error occurred
     */

    async addClient(req, res) {
        try {
            const clientRequest = new ClientRequest(req.body);
            const validationResult = await clientRequest.validate();

            if (validationResult.error) {
                // If there are validation errors, return a error
                throw new CustomValidationError(validationResult.error)
                
            }

            const { client_name, location, client_manager, billing_currency, status } = validationResult.value

            const newClient = await clientRepository.createClient({
                client_name,
                location,
                client_manager,
                billing_currency,
                status,
            });

            if (newClient) {
                const createResponse = await clientResponse.addClientResponse(newClient)
                return res.status(201).json({
                    success: true,
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
                    success: false,
                    message: 'Validation error',
                    errors: error.errors,
                });
            }
            else{
                return res.status(500).json({
                    success: false,
                    message: 'An internal server error occurred',
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
     *                 success:
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
     *                         example: "On hold"
     *                   example: []
     *       500:
     *         description: Internal server error.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
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
                return res.status(200).json({
                    success: true,
                    message: 'Clients fetched successfully',
                    data: existingClients,
                });
            } else {
                return res.status(200).json({
                    success: false,
                    message: 'No clients found.',
                    data: [],
                });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
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
     *                 description: The updated location of the client.
     *                 example: "San Francisco"
     *               client_manager:
     *                 type: string
     *                 description: The updated manager responsible for the client.
     *                 example: "Jane Doe"
     *               billing_currency:
     *                 type: string
     *                 description: The updated currency used for billing.
     *                 example: "EUR"
     *               status:
     *                 type: string
     *                 description: The updated status of the client.
     *                 enum: [Not started,In progress,On hold,Cancelled]
     *                 example: "Not started"
     *     responses:
     *       200:
     *         description: Client updated successfully.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
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
     *                       example: "San Francisco"
     *                     client_manager:
     *                       type: string
     *                       example: "Jane Doe"
     *                     billing_currency:
     *                       type: string
     *                       example: "EUR"
     *                     status:
     *                       type: string
     *                       example: "On hold"
     *       422:
     *         description: Validation errors occurred.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
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
     *                 success:
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
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "An internal server error occurred"
     */

    async editClient(req, res) {
        try {
            const clientRequest = new ClientRequest(req.body);
            const validationResult = await clientRequest.validateForEdit();

            if (validationResult.error) {
                // If there are validation errors, return a error
                throw new CustomValidationError(validationResult.error)
            }

            const { _id, client_name, location, client_manager, billing_currency, status } = validationResult.value

            const updatedClient = await clientRepository.updateClient(_id, {
                client_name,
                location,
                client_manager,
                billing_currency,
                status,
            })

            if (updatedClient) {
                const editResponse = await clientResponse.editClientResponse(updatedClient)
                return res.status(200).json({
                    success: true,
                    message: 'Client updated successfully',
                    data: editResponse,
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Failed to update client.',
                });
            }
        }
        catch (error) {
            if (error instanceof CustomValidationError) {
                res.status(422).json({
                    success: false,
                    message: 'Validation error',
                    errors: error.errors,
                });
            }
            else{
                return res.status(500).json({
                    success: false,
                    message: 'An internal server error occurred',
                });
            }
        }
    }
}

export default ClientController;