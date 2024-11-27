
export default class CategoryResponse{
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