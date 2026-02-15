
import { NextResponse } from "next/server"
import { Pool } from "pg"
import { createHash } from "node:crypto"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

const hashPassword = (password: string) => {
    return createHash('sha256').update(password).digest('hex')
}

export async function POST(req: Request) {
    try {
        const { email, name, password } = await req.json()
        const client = await pool.connect()

        let query = "UPDATE user_roles SET username = $1, updated_at = NOW()"
        let params: any[] = [name]

        if (password) {
            const passHash = hashPassword(password)
            query += ", password_hash = $2"
            params.push(passHash)
            params.push(email)
            query += " WHERE email = $3"
        } else {
            params.push(email)
            query += " WHERE email = $2"
        }

        const result = await client.query(query + " RETURNING user_id, username as name, email, role", params)
        client.release()

        if (result.rows.length === 0) {
            return NextResponse.json({ success: false, error: "User not found." }, { status: 404 })
        }

        return NextResponse.json({ success: true, user: result.rows[0] })
    } catch (err: any) {
        console.error("Profile Update Error:", err)
        return NextResponse.json({ success: false, error: err.message }, { status: 500 })
    }
}
