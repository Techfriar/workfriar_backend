import client from "../../models/client.js";

class ClientRepository {

    async createClient(clientDetails) {
        try {
            const newClient = new client(clientDetails);
            await newClient.save();

            const savedClientDetails = await client
                .findById(newClient._id)
                .populate('client_manager', 'full_name')
                .populate('location', 'name')
                .populate('billing_currency', 'code')
                .lean();
            return savedClientDetails;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    

    async findExistingClient({ client_name, location, client_manager, billing_currency }) {
        try {
            return await client.findOne({
                client_name,
                location,
                client_manager,
                billing_currency,
            });
        } catch (error) {
            throw new Error(error);
        }
    }

    async findById(id) {
        try {
            return await client.findById({ _id: id });
        } catch (error) {
            throw new Error(error); 
        }
    }

    async allClients(page, limit) {
        try {
            const skip = (page - 1) * limit;

            // Count total clients
            const totalCount = await client.countDocuments();

            const existingClients = await client.find()
            .populate('client_manager', 'full_name')
            .populate('location', 'name')
            .populate('billing_currency', 'code')
            .skip(skip) 
            .limit(limit) 
            .lean();

        return { existingClients, totalCount };
        } catch (error) {
            throw new Error(error); 
        }
    }


    async updateClient(id, updatedData) {
        try {
             await client.findByIdAndUpdate(id, updatedData, {
                new: true,
            });
            const updatedClient = await client
            .findById(id)
            .populate('client_manager', 'full_name')
            .populate('location', 'name')
            .populate('billing_currency', 'code')
            .lean();
            return updatedClient;
        } catch (error) {
            throw new Error(error); 
        }
    }

    async changeClientStatus(id, status) {
        try {
            await client.findByIdAndUpdate(id, { status }, {
                new: true,
            });
            const updatedClient = await client
            .findById(id)
            .populate('client_manager', 'full_name')
            .populate('location', 'name')
            .populate('billing_currency', 'code')
            .lean();
            return updatedClient;

        } catch (error) {
            throw new Error(error);
        }
    }
}

export default ClientRepository;