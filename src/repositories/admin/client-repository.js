import client from "../../models/client.js";

class ClientRepository{
    async createClient(clientDetails) {
        try {
            const newClient = new client(clientDetails);
            return await newClient.save();
        } catch (error) {
            console.error("Error creating client:", error);
            throw error; // Re-throw the error to be handled elsewhere
        }
    }

    async findExistingClient({ clientName, location, clientManager, billingCurrency }) {
        try {
            return await client.findOne({
                clientName,
                location,
                clientManager,
                billingCurrency,
            });
        } catch (error) {
            console.error("Error finding existing client:", error);
            throw error;
        }
    }

    async findById(id) {
        try {
            return await client.findById({ _id: id });
        } catch (error) {
            console.error("Error finding client by ID:", error);
            throw error;
        }
    }

    async allClients() {
        try {
            return await client.find();
        } catch (error) {
            console.error("Error fetching all clients:", error);
            throw error;
        }
    }


    async updateClient(id, updatedData) {
        try {
            const updatedClient = await client.findByIdAndUpdate(id, updatedData, {
                new: true,
            });
            return updatedClient;
        } catch (error) {
            console.error("Error updating client:", error);
            throw error;
        }
    }
}

export default ClientRepository;