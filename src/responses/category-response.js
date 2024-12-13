
export default class CategoryResponse{
       /**
     * Transform the Category resource into an object.
     * @param {Object} category - The object with category.
     * @return {Object} - An object containing selected properties of category.
     */
    async formattedResponse  (category) {
        return ({
            id:category.id,
            category:category.category,
            timeentry:category.time_entry
        });
    };   

    async formatCategorySet(categories)
    {
        return categories.map(category => ({
            id: category.id,
            category: category.category,
            timeentry: category.time_entry
        }));
    }
    
}