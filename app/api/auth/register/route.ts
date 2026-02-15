
import { NextResponse } from "next/server"
import { Pool } from "pg"
import { randomUUID, createHash } from "node:crypto"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

// Simple hash for demo purposes (In production use bcrypt)
const hashPassword = (password: string) => {
    return createHash('sha256').update(password).digest('hex')
}

export async function POST(req: Request) {
    try {
        const { name, email, password, role } = await req.json()
        const client = await pool.connect()

        // Check if user exists
        const existing = await client.query("SELECT * FROM user_roles WHERE email = $1", [email])
        if (existing.rows.length > 0) {
            client.release()
            return NextResponse.json({ success: false, error: "Email already registered." }, { status: 400 })
        }

        const userId = randomUUID()
        const passHash = hashPassword(password)

        const result = await client.query(`
      INSERT INTO user_roles (user_id, username, email, password_hash, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING user_id, username, email, role
    `, [userId, name, email, passHash, role || 'public'])

        client.release()
        return NextResponse.json({ success: true, user: result.rows[0] })
    } catch (err: any) {
        console.error("Registration Error:", err)
        return NextResponse.json({ success: false, error: err.message }, { status: 500 })
    }
}
