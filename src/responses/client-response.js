class ClientResponse{
    /**
     * Transform the client resource into an object.
     *
     * @param {Object} client - The client object to transform.
     * @return {Object} - An object containing selected properties from the client.
     */
    async addClientResponse(client){
        return{
            _id: client._id,
            name: client.client_name
        }
    }

    async allClientsResponse(client){
        return {
            _id: client._id,
            client_name: client.client_name,
            location_id: client.location._id,
            location: client.location.name,
            client_manager_id: client.client_manager._id,
            client_manager: client.client_manager.full_name,
            billing_currency_id: client.billing_currency._id,
            billing_currency: client.billing_currency.code,
            status: client.status
        };
    }
    
    async editClientResponse(client){
        return{
            _id: client._id,
            name: client.client_name,
            status: client.status
        }
    }
}

export default ClientResponse;