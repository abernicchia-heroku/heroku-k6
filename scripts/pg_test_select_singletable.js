// https://github.com/grafana/xk6-sql/blob/master/examples/postgres_test.js

import sql from 'k6/x/sql';

// duration/iterations cannot be changed via CLI - it seems to be a bug https://github.com/grafana/k6/issues/3742
export const options = {
    scenarios: {
      constant_rate_select: {
        executor: 'constant-arrival-rate',
        rate: 150,
        timeUnit: '1s', // 20 iterations per second (rate=20, timeUnit=1s)
        duration: '20m', // total test duration
        preAllocatedVUs: 10, // how large the initial pool of VUs would be
        maxVUs: 300, // if the preAllocatedVUs are not enough, we can initialize more
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
  let results = sql.query(db, 'SELECT my_ext_id__c FROM salesforce.account LIMIT 1;');
}