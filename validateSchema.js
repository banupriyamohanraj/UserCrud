const Joi = require('joi');

const userSchema = Joi.object({
    firstname: Joi.string()
        .min(3)
        .max(30)
        .required(),
    lastname: Joi.string()
        .min(3)
        .max(30)
        .required(),
    middlename: Joi.string()
        .min(3)
        .max(30),
  
     dob: Joi.number()
        .integer()
        .min(1900)
        .max(2022),
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
        .required(),

    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .required(),

    phone: Joi.number()
        .integer()
        .required(),
    occupation: Joi.string()
        .min(3)
        .max(30)
        .required(),
    company: Joi.string()
        .min(3)
        .max(30)
        .required(),
    
})

module.exports = userSchema