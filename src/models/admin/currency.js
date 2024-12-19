import mongoose from 'mongoose'

const currencySchema = new mongoose.Schema({
    country: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      code: {
        type: String,
        required: true,
      },
      symbol: {
        type: String,
        required: true
      }
})

const currency = mongoose.model('currency', currencySchema);
export default currency;