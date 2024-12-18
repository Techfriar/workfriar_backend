import client from "../../models/client.js";

class ClientRepository {
    async createClient(clientDetails) {
        try {
            const newClient = new client(clientDetails);
            return await newClient.save();
        } catch (error) {
            throw new Error(error);
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

    async allClients() {
        try {
            return await client.find().populate('client_manager', 'full_name').populate('location', 'name').populate('billing_currency', 'code')
            .lean();
        } catch (error) {
            throw new Error(error); 
        }
    }


    async updateClient(id, updatedData) {
        try {
            const updatedClient = await client.findByIdAndUpdate(id, updatedData, {
                new: true,
            });
            return updatedClient;
        } catch (error) {
            throw new Error(error); 
        }
    }
}

export default ClientRepository;