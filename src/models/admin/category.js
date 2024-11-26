import mongoose from "mongoose";

/*
    Define Category Schema
*/
const categorySchema=new mongoose.Schema({
    category:{
        type:String,
        required: true,
        trim:true
    },
    time_entry:{
        type:String,
        enum:['Open Entry','Close Entry'],
        required:true
    }
},{timestamps:true})
const Category=mongoose.model('Category',categorySchema)

export default Category