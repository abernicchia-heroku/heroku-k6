// https://github.com/grafana/xk6-sql/blob/master/examples/postgres_test.js

import sql from 'k6/x/sql';

export const options = {
    scenarios: {
      constant_request_rate: {
        executor: 'constant-arrival-rate',
        rate: 15,
        timeUnit: '1s', // 20 iterations per second (rate=20, timeUnit=1s)
        duration: '20m', // total test duration
        preAllocatedVUs: 10, // how large the initial pool of VUs would be
        maxVUs: 200, // if the preAllocatedVUs are not enough, we can initialize more
      },
    },
  };

// The second argument is a PostgreSQL connection string, e.g.
// postgres://myuser:mypass@127.0.0.1:5432/postgres?sslmode=require
const db = sql.open('postgres', `${__ENV.DATABASE_URL}?sslmode=require`);

export function teardown() {
  db.close();
}

export default function () {
  let results = sql.query(db, 'SELECT my_ext_id__c FROM salesforce.account TABLESAMPLE SYSTEM_ROWS(1) LIMIT 1;');
  //console.log(`random my_ext_id__c: ${results[0].my_ext_id__c}`);
  results = sql.query(db, 'SELECT * FROM myschema.account_view WHERE my_ext_id__c= $1;', results[0].my_ext_id__c);
  //console.log(`myschema.account_view name: ${results[0].name}`);
}