import {Options} from "@mikro-orm/mysql";

const options : Options ={
    entities: [],
    dbName: 'FWE_DATABASE',
    password: 'dev',
    user: 'localdev',
    debug: true
};

export default options;