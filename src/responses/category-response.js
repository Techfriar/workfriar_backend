
export default class CategoryResponse{
    async sendSuccessResponse  (res, data,message) {
        return res.status(200).json({
            success: true,
            message,
            data : data
        });
    };   
    async sendErrorResponse(res,message)
    {
        return res.status(500).json({
            success: false,
            message:message,
            data : null
        });
    }
}