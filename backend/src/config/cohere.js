// Change this line
import { CohereClientV2 } from 'cohere-ai'; 

// Update the constructor
export const cohere = new CohereClientV2({
  token: process.env.COHERE_API_KEY, 
});

export const getCohereClient = (personalKey) => {
  if (personalKey) {
    return new CohereClientV2({ token: personalKey });
  }
  return cohere;
};

export const COHERE_MODEL = 'command-r-08-2024';