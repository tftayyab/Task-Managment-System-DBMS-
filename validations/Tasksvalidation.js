const Joi = require("joi");

const taskSchema = Joi.object({
  title: Joi.string().required().messages({
    'string.empty': 'Title is required.',
  }),

  description: Joi.string().required().messages({
    'string.empty': 'Description is required.',
  }),

  status: Joi.string()
    .valid("Pending", "In Progress", "Completed")
    .optional()
    .messages({
      'any.only': 'Status must be Pending, In Progress, or Completed.',
    }),

  dueDate: Joi.date().optional().messages({
    'date.base': 'Due Date must be a valid date.',
  }),

  createdAt: Joi.date().optional().messages({
    'date.base': 'CreatedAt must be a valid date.',
  }),

  owner: Joi.string().optional(), // set from token

  shareWith: Joi.array().items(Joi.string()).optional().messages({
    'array.base': 'ShareWith must be an array of usernames.',
    'string.base': 'Each item in ShareWith must be a string.',
  }),

  teamIds: Joi.array()
    .items(Joi.alternatives().try(Joi.number().integer().positive(), Joi.string().pattern(/^\d+$/)))
    .optional()
    .messages({
      'array.base': 'Team IDs must be an array of numeric IDs.',
    }),
});

const validateTasks = () => taskSchema;

module.exports = { validateTasks };
