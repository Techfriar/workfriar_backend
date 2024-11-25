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
            name: client.clientName
        }
    }
    
    async editClientResponse(client){
        return{
            id: client._id,
            name: client.clientName,
            status: client.status
        }
    }
    
}

export default ClientResponse;