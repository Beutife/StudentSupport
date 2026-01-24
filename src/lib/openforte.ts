import Openfort from '@openfort/openfort-node';


export const openfort = new Openfort(process.env.OPENFORT_SECRET_KEY!);