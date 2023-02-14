import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('transactions', (table) => {
    table.uuid('session_id').after('id').index()
    // table.dropColumn('created_at')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('transactions', (table) => {
    table.dropColumn('session_id')
    // knex.fn.now permits to change database without breaking
    // table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
  })
}
