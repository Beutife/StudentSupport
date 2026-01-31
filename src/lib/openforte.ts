import Openfort from '@openfort/openfort-node';

// Initialize Openfort with secret key
//  ONLY use this on server (API routes)
// Handle missing key during build time gracefully
const getOpenfortInstance = () => {
  const secretKey = process.env.OPENFORT_SECRET_KEY;
  if (!secretKey) {
    // During build time, return a mock object to prevent errors
    // The actual API routes will handle missing keys at runtime
    return {
      createEncryptionSession: async () => {
        throw new Error('OPENFORT_SECRET_KEY not configured');
      },
      transactionIntents: {
        create: async () => {
          throw new Error('OPENFORT_SECRET_KEY not configured');
        },
      },
    } as any;
  }
  return new Openfort(secretKey);
};

export const openfort = getOpenfortInstance();