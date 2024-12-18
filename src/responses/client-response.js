class ClientResponse{
    /**
     * Transform the client resource into an object.
     *
     * @param {Object} client - The client object to transform.
     * @return {Object} - An object containing selected properties from the client.
     */
    async addClientResponse(client){
        return{
            id: client._id,
            name: client.client_name
        }
    }

    async allClientsResponse(client){
        return {
            id: client._id,
            name: client.client_name,
            location: client.location,
            client_manager: client.client_manager.full_name,
            billing_currency: client.billing_currency,
            status: client.status
        };
    }
    
    async editClientResponse(client){
        return{
            id: client._id,
            name: client.client_name,
            status: client.status
        }
    }
}

export default ClientResponse;