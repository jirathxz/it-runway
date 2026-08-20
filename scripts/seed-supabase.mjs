import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const conn = process.env.DATABASE_URL
if (!conn) {
  console.error('DATABASE_URL is not set (see .env.local / .env.local.example)')
  process.exit(1)
}

const client = new pg.Client({
  connectionString: conn,
  ssl: { rejectUnauthorized: false },
})
await client.connect()

const schema = readFileSync(join(root, 'supabase', 'schema.sql'), 'utf8')
const seed = readFileSync(join(root, 'supabase', 'seed.sql'), 'utf8')

try {
  await client.query('BEGIN')
  await client.query(schema)
  await client.query(seed)
  await client.query('COMMIT')

  const events = await client.query('select count(*) n from public.events')
  const orgs = await client.query('select count(*) n from public.organizer_content')
  const register = await client.query(
    "select count(*) n from public.events where category = 'register'"
  )
  const current = await client.query(
    "select id, title from public.events where category = 'current'"
  )
  const policies = await client.query(
    "select policyname from pg_policies where schemaname = 'public' order by policyname"
  )

  console.log('schema + seed applied OK')
  console.log(`events rows: ${events.rows[0].n}`)
  console.log(`organizer_content rows: ${orgs.rows[0].n}`)
  console.log(`register: ${register.rows[0].n}`)
  console.log(`current: ${JSON.stringify(current.rows)}`)
  console.log(`policies: ${policies.rows.map((r) => r.policyname).join(', ')}`)
} catch (e) {
  await client.query('ROLLBACK').catch(() => {})
  console.error('seed failed:', e.message)
  process.exitCode = 1
} finally {
  await client.end()
}