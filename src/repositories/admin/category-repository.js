import Category from "../../models/admin/category.js";

export default class CategoryRepository{

    /*creates new category */
   async createCategory(category,timeentry)
   {
    try
    {
        console.log("category and tmeentry",category,timeentry)
        const newCategory=await Category.create({
            category,
            time_entry:timeentry
        })
        return newCategory
   }
   catch(error)
   {
    throw new Error(error)
   }
  }
  /*get all Categories */
 async  getAllCategories()
 {
    try
    {
        const categories=await Category.find()
        return categories
    }catch(error)
    {
        throw new Error(error)
    }
 }

 //Update the time entry for category
 async updateCategory(updateFields, id) {
    try {
        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true } // Return the updated document
        );

        return updatedCategory;
    } catch (error) {
        throw new Error(error);
    }
}

}