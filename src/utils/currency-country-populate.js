import currency from "../models/admin/currency.js";
import country from "../models/admin/country.js";

export default class PopulateData{
    async populateCountry(req,res){
        try{
            const countries = await country.find()
            const countryResponse = countries.map((country) => {
                return {
                    _id: country._id,
                    country: country.name,
                }
            })
            if(countries.length > 0){
                res.status(200).json({
                    status: true,
                    message: "Country data fetched successfully",
                    data: countryResponse
                })
            }
            else{
                res.status(200).json({
                    status: false,
                    message: "Country data not found",
                    data:[]
                })
            }
        }
        catch(err){
            return res.status(500).json({
                status: false,
                message: err,
                data:[]
            })
        }
    }
    async populateCurrency(req,res){
        try{
            const currencies = await currency.find()
            const currencyResponse = currencies.map((currency) => {
                return {
                    _id: currency._id,
                    currency: `${currency.name} (${currency.code})`, 
                }
            })
            if(currencies.length > 0){
                res.status(200).json({
                    status: true,
                    message: "Currency data fetched successfully",
                    data: currencyResponse
                })
            }
            else{
                res.status(200).json({
                    status: false,
                    message: "Currency data not found",
                    data:[]
                })
            }
        }
        catch(err){
            return res.status(500).json({
                status: false,
                message: err,
                data:[]
            })
        }
    }

    async findCountry(id){
        try{
            const countryData = await country.findById({ _id: id})
            if(countryData){
                return countryData
            }
            else{
                return null
            }
        }catch(error){
            throw new error
        }
    }

    async findCurrency(id){
        try{
            const currencyData = await currency.findById({ _id: id})
            if(currencyData){
                return currencyData
            }
            else{
                return null
            }
        }catch(error){
            throw new error
        }
    }
}