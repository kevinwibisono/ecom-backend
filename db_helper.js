const { Pool } = require('pg');

const PGpool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {rejectUnauthorized: false},
});

async function executeQuery(queryString)
{
    const client = await PGpool.connect();
    const result = await client.query(queryString);
    client.release();
    return result;
}

module.exports = {executeQuery};