// https://github.com/grafana/xk6-sql/blob/master/examples/postgres_test.js

import sql from 'k6/x/sql';

export const options = {
    scenarios: {
      constant_rate_insert: {
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
// binary_parameters=yes is required for pgbouncer https://stackoverflow.com/a/53225070
const db = sql.open('postgres', `${__ENV.DATABASE_URL}?sslmode=require&binary_parameters=yes`);

export function setup() {
  // ALTER SEQUENCE myschema.pgb_account_view_id_seq RESTART WITH 40000000;
  db.exec(`CREATE SEQUENCE IF NOT EXISTS myschema.pgb_account_view_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;
  `);
}

export function teardown() {
  db.close();
}

export default function () {
  let results = sql.query(db, "SELECT nextval('myschema.pgb_account_view_id_seq');");
  //console.log(`sequence nextval: ${results[0].nextval}`);
  db.exec("insert into myschema.account_view(name, my_ext_id__c, sfid) VALUES (CONCAT('inserted via k6 ', $1::text), CONCAT('myID', $1::text), LPAD($1::text, 18, '0'));", results[0].nextval);
}