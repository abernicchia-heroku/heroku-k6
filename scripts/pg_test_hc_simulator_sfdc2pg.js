// https://github.com/grafana/xk6-sql/blob/master/examples/postgres_test.js

import sql from 'k6/x/sql';

// duration/iterations cannot be changed via CLI - it seems to be a bug https://github.com/grafana/k6/issues/3742
export const options = {
    scenarios: {
      constant_request_rate: {
        executor: 'constant-arrival-rate',
        rate: 10,
        timeUnit: '1m', // 20 iterations per second (rate=20, timeUnit=1s)
        duration: '20m', // total test duration
        preAllocatedVUs: 10, // how large the initial pool of VUs would be
        maxVUs: 200, // if the preAllocatedVUs are not enough, we can initialize more
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
  let results = sql.query(db, "select * from myschema.myaccount WHERE NOT EXISTS (SELECT 1 FROM salesforce.account WHERE myaccount.my_ext_id__c = account.my_ext_id__c) LIMIT 1;");
  if (results.length > 0) {
    //console.log(`first record from myschema.myaccount that not exists in salesforce.account my_ext_id__c: ${results[0].my_ext_id__c}`);
    db.exec("insert into salesforce.account(name, my_ext_id__c, sfid) VALUES ('HC simulator sfdc2pg', $1, $2);", results[0].my_ext_id__c, results[0].sfid);
  }
  else {
    console.log(`WARNING: no more records to reconcile, please insert new myaccount records !!`);
  } 
}