const Joi = require('joi');

const validator = (schema) => (playload) =>
    schema.validate(playload, { abortEarly: false });

const registerSchema = Joi.object({
    username: Joi.string().min(3).required().messages({
        'string.base': 'Invalid type',
        'string.empty': 'Username is required',
        'string.min': `Username minimum {#limit} characters`,
    }),
    email: Joi.string().email().required().messages({
        'string.base': 'Invalid type',
        'string.empty': 'Email is required',
    }),
    password: Joi.string().min(12).required().messages({
        'string.base': 'Invalid type',
        'string.empty': 'Password is required',
        'string.min': `Password minimum {#limit} characters`,
    }),
    isAdmin: Joi.boolean().messages({
        'string.base': 'Invalid type',
    }),
    logo: Joi.string().optional().allow("").messages({
    "string.base": "Invalid type",
  }),
})

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.base': 'Invalid type',
        'string.empty': 'Email is required',
    }),
    password: Joi.string().required().messages({
        'string.base': 'Invalid type',
        'string.empty': 'Password is required',
    }),
})

const updateSchema = Joi.object({
  username: Joi.string().allow("").min(3).optional().messages({
    "string.base": "Invalid type",
    "string.empty": "Username is required",
    "string.min": `Username should have a minimum length of {#limit}`,
  }),
  email: Joi.string().email().allow("").optional().messages({
    "string.base": "Invalid type",
    "string.empty": "Email is required",
  }),
  password: Joi.string().allow("").min(12).optional().messages({
    "string.base": "Invalid type",
    "string.empty": "Password is required",
    "string.min": `Password should have a minimum length of {#limit}`,
  }),
  isAdmin: Joi.boolean().truthy('true', '1').falsy('false', '0').optional().messages({
    "boolean.base": "Invalid type",
  }),
  logo: Joi.string().optional().allow("").messages({
    "string.base": "Invalid type",
  }),
  banner: Joi.string().optional().allow("").messages({
    "string.base": "Invalid type",
  }),
});

exports.validateRegister = validator(registerSchema);
exports.validateLogin = validator(loginSchema);
exports.validateUpdate = validator(updateSchema);

