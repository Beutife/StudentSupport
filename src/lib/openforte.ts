import Openfort from '@openfort/openfort-node';

// Initialize Openfort with secret key
//  ONLY use this on server (API routes)
export const openfort = new Openfort(process.env.OPENFORT_SECRET_KEY!);