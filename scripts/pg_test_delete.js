// https://github.com/grafana/xk6-sql/blob/master/examples/postgres_test.js

import sql from 'k6/x/sql';

// duration/iterations cannot be changed via CLI - it seems to be a bug https://github.com/grafana/k6/issues/3742
export const options = {
    scenarios: {
      constant_rate_delete: {
        executor: 'constant-arrival-rate',
        rate: 1,
        timeUnit: '1s', // 20 iterations per second (rate=20, timeUnit=1s)
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

export function setup() {
  //db.exec(`CREATE EXTENSION IF NOT EXISTS tsm_system_rows;`);
}

export function teardown() {
  db.close();
}

export default function () {
  let results = sql.query(db, 'SELECT my_ext_id__c FROM salesforce.account TABLESAMPLE SYSTEM_ROWS(1) LIMIT 1;');
  //console.log(`random my_ext_id__c: ${results[0].my_ext_id__c}`);
  db.exec("DELETE FROM  myschema.account_view WHERE my_ext_id__c= $1;", results[0].my_ext_id__c);
  //console.log(`record deleted my_ext_id__c: ${results[0].my_ext_id__c}`);
}