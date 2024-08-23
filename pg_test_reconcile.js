// https://github.com/grafana/xk6-sql/blob/master/examples/postgres_test.js

import sql from 'k6/x/sql';

export const options = {
    scenarios: {
      constant_request_rate: {
        executor: 'constant-arrival-rate',
        rate: 2,
        timeUnit: '1s', // 20 iterations per second (rate=20, timeUnit=1s)
        duration: '1s', // total test duration
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
  console.log(`env vars - RECONCILE_BATCHSIZE: ${__ENV.RECONCILE_BATCHSIZE} RECONCILE_STOPAT: ${__ENV.RECONCILE_STOPAT}`);
  db.exec("CALL myschema.reconcile_all_account_records_proc($1,$2);", `${__ENV.RECONCILE_BATCHSIZE}`, `${__ENV.RECONCILE_STOPAT}`);
}