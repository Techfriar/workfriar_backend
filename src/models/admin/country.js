import mongoose from 'mongoose'

const countrySchema = new mongoose.Schema({
    code:{
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
      }
})

const country = mongoose.model('country', countrySchema);
export default country;