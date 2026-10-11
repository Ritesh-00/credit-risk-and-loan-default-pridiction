import { body } from 'express-validator';

export const createPredictionValidator = [
  body('applicantName')
    .trim()
    .notEmpty()
    .withMessage('Applicant name or identifier is required'),
  body('applicant')
    .optional()
    .isObject()
    .withMessage('Applicant data must be a valid JSON object'),
  body('applicantData')
    .optional()
    .isObject()
    .withMessage('Applicant data must be a valid JSON object'),
  body().custom((value, { req }) => {
    if (!req.body.applicant && !req.body.applicantData) {
      throw new Error('Applicant feature payload is required (provide applicant or applicantData)');
    }
    return true;
  }),
];
