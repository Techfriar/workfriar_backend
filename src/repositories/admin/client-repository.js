import client from "../../models/client.js";

class ClientRepository{
    async createClient(clientDetails){
        const newClient = new client(clientDetails)
        return await newClient.save()
    }

    async findExistingClient({ clientName, location, clientManager, billingCurrency }) {
        return await client.findOne({
            clientName,
            location,
            clientManager,
            billingCurrency,
        });
    }

    async findById(id){
        return await client.findById({_id:id})
    }

    async allClients(){
        return await client.find()
    }

    async updateClient(id,updatedData){
        const updatedClient = await client.findByIdAndUpdate(id, updatedData,{
            new: true
        });
        return updatedClient
    }
}

export default ClientRepository;