// https://github.com/grafana/xk6-sql/blob/master/examples/postgres_test.js

import sql from 'k6/x/sql';
import { check, fail } from 'k6';

// duration/iterations cannot be changed via CLI - it seems to be a bug https://github.com/grafana/k6/issues/3742
export const options = {
    scenarios: {
      constant_rate_sim_sfdc2pg: {
        executor: 'constant-arrival-rate',
        rate: 10,
        timeUnit: '1m', // 20 iterations per second (rate=20, timeUnit=1s)
        duration: '20m', // total test duration
        preAllocatedVUs: 1, // how large the initial pool of VUs would be - WARNING: VUs it must be set to 1 (singleton) to avoid selecting the same my_ext_id__c from different VUs causing duplicate key value on hcu_idx_account_my_ext_id__c after inserts
        maxVUs: 1, // if the preAllocatedVUs are not enough, we can initialize more - WARNING: it must be 1 see above
      },
    },
  };

// The second argument is a PostgreSQL connection string, e.g.
// postgres://myuser:mypass@127.0.0.1:5432/postgres?sslmode=require
// binary_parameters=yes is required for pgbouncer https://stackoverflow.com/a/53225070
const db = sql.open('postgres', `${__ENV.DATABASE_URL}?sslmode=require&binary_parameters=yes`);

export function teardown() {
  db.close();
}

export default function () {
  // it's possible to increase the LIMIT to increase the rate as there must be only one VU at time to reconcile
  let results = sql.query(db, "select * from myschema.myaccount WHERE NOT EXISTS (SELECT 1 FROM salesforce.account WHERE myaccount.my_ext_id__c = account.my_ext_id__c) LIMIT 1;");
  if (results.length > 0) {
    for (let i = 0; i < results.length; i++) {
      console.log(`record from myschema.myaccount that does not exist in salesforce.account my_ext_id__c: ${results[i].my_ext_id__c} [${i}]`);

      // let accounts = sql.query(db, "select * from salesforce.account WHERE my_ext_id__c=$1;", results[i].my_ext_id__c);
      // if (accounts.length > 0) {
      //   fail(`ERROR: selected record that was already present in salesforce.account my_ext_id__c: ${results[i].my_ext_id__c}`);
      // }
      // else {
      //   console.log(`not found in salesforce.account my_ext_id__c: ${results[i].my_ext_id__c} [${i}]`);
      // }

      db.exec("insert into salesforce.account(name, my_ext_id__c, sfid) VALUES ('HC simulator sfdc2pg', $1, $2);", results[i].my_ext_id__c, results[i].sfid);
      console.log(`record inserted succesfully into salesforce.account my_ext_id__c: ${results[i].my_ext_id__c} [${i}]`);
    }
  }
  else {
    console.log(`WARNING: no more records to sync, please insert new myaccount records !!`);
  } 
}