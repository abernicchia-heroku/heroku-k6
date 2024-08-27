// https://github.com/grafana/xk6-sql/blob/master/examples/postgres_test.js

import sql from 'k6/x/sql';
import { check, fail } from 'k6';

// duration/iterations cannot be changed via CLI - it seems to be a bug https://github.com/grafana/k6/issues/3742
export const options = {
    scenarios: {
      constant_rate_reconcile: {
        executor: 'constant-arrival-rate',
        rate: 1,
        timeUnit: '1s', // 20 iterations per second (rate=20, timeUnit=1s)
        duration: '20m', // total test duration
        preAllocatedVUs: 1, // how large the initial pool of VUs would be - WARNING: VUs it must be set to 1 (singleton)
        maxVUs: 1, // if the preAllocatedVUs are not enough, we can initialize more - WARNING: VUs it must be set to 1 (singleton)
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
  // check if there are records to reconcile otherwise no records will be inserted/deleted
  let results = sql.query(db, "select myschema.myaccount.my_ext_id__c from myschema.myaccount INNER JOIN salesforce.account ON myschema.myaccount.my_ext_id__c = salesforce.account.my_ext_id__c LIMIT 1;");
  if (results.length == 0) {
    fail(`ERROR: no records to reconcile, insert new myaccount records !!`);
  }

  console.log(`env vars - RECONCILE_BATCHSIZE: ${__ENV.RECONCILE_BATCHSIZE} RECONCILE_STOPAT: ${__ENV.RECONCILE_STOPAT}`);
  db.exec("CALL myschema.reconcile_all_account_records_proc($1,$2);", `${__ENV.RECONCILE_BATCHSIZE}`, `${__ENV.RECONCILE_STOPAT}`);
}