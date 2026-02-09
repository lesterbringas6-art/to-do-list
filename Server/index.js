import express from 'express';
import { pool } from './db.js';
import session from 'express-session';
import { hashPassword, comparePassword } from './components/hash.js';
import cors from 'cors';

const app = express();
app.use(express.json());

// Note: If your frontend is on a different port, 
// make sure to set credentials: true in cors and session.
app.use(cors({
    origin: 'https://to-do-list-neon-two-40.vercel.app/', // Replace with your frontend URL
    credentials: true
}));

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true, // Security best practice
        secure: true // Set to true if using HTTPS
    }
}));

const PORT = 3000;

// --- AUTHENTICATION MIDDLEWARE ---
const authenticateUser = (req, res, next) => {
    if (req.session.user && req.session.user.user_id) {
        next();
    } else {
        res.status(401).json({ success: false, message: "Unauthorized: Please log in" });
    }
};

// --- AUTH ROUTES ---

app.post('/register', async (req, res) => {
    const { username, password, confirm, name } = req.body;
    if (!username || !password || !name) return res.status(400).json({ success: false, message: "Missing fields" });
    if (password !== confirm) return res.status(400).json({ success: false, message: "Passwords do not match" });

    try {
        const checkUser = await pool.query('SELECT * FROM user_accounts WHERE username = $1', [username]);
        if (checkUser.rows.length > 0) return res.status(400).json({ success: false, message: "Username already exists" });

        const hashedPassword = await hashPassword(password);
        await pool.query('INSERT INTO user_accounts (username, password, name) VALUES($1, $2, $3)', [username, hashedPassword, name]);
        res.status(200).json({ success: true, message: "Registered successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const result = await pool.query('SELECT id, username, password, name FROM user_accounts WHERE username = $1', [username]);
    const user = result.rows[0];

    if (user && await comparePassword(password, user.password)) {
        req.session.user = { user_id: user.id, name: user.name };
        res.status(200).json({ success: true, message: "Login successful", user: { name: user.name } });
    } else {
        res.status(400).json({ success: false, message: "Invalid credentials" });
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ success: false, message: "Logout failed" });
        res.clearCookie('connect.sid'); 
        res.status(200).json({ success: true, message: "Logged out" });
    });
});

// --- PROTECTED LIST ROUTES (Requires authenticateUser) ---

app.post('/add-list', authenticateUser, async (req, res) => {
    const { title } = req.body;
    const userId = req.session.user.user_id; // Get ID from session

    try {
        await pool.query(`INSERT INTO list (title, status, user_id) VALUES($1, $2, $3)`, [title, "pending", userId]);
        res.status(200).json({ success: true, message: "Title added Successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/get-lists', authenticateUser, async (req, res) => {
    const userId = req.session.user.user_id;
    try {
        const result = await pool.query(`
            SELECT l.*, 
            COALESCE(json_agg(i.*) FILTER (WHERE i.id IS NOT NULL), '[]') AS items
            FROM list l
            LEFT JOIN items i ON l.id = i.list_id
            WHERE l.user_id = $1
            GROUP BY l.id
        `, [userId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.put('/edit-list/:id', authenticateUser, async (req, res) => {
    const { id } = req.params;
    const { title, status } = req.body;
    const userId = req.session.user.user_id;

    try {
        const result = await pool.query(
            `UPDATE list SET title = $1, status = $2 WHERE id = $3 AND user_id = $4`,
            [title, status, id, userId]
        );

        if (result.rowCount === 0) return res.status(404).json({ success: false, message: "List not found/unauthorized" });
        res.status(200).json({ success: true, message: "List updated" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/delete-list/:id', authenticateUser, async (req, res) => {
    const { id } = req.params;
    const userId = req.session.user.user_id;

    try {
        const result = await pool.query('DELETE FROM list WHERE id = $1 AND user_id = $2', [id, userId]);
        if (result.rowCount === 0) return res.status(404).json({ success: false, message: "List not found/unauthorized" });
        res.status(200).json({ success: true, message: "List deleted" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- PROTECTED ITEM ROUTES ---

app.post('/add-items', authenticateUser, async (req, res) => {
    const { list_id, description } = req.body;
    const userId = req.session.user.user_id;

    try {
        // Verification: Ensure the list being added to belongs to the logged-in user
        const checkOwnership = await pool.query('SELECT id FROM list WHERE id = $1 AND user_id = $2', [list_id, userId]);
        if (checkOwnership.rows.length === 0) return res.status(403).json({ success: false, message: "Unauthorized access to this list" });

        await pool.query(`INSERT INTO items (list_id, description, status) VALUES($1, $2, $3)`, [list_id, description, "pending"]);
        res.status(200).json({ success: true, message: "Item added successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/edit-item/:id', authenticateUser, async (req, res) => {
    const { id } = req.params;
    const { description, status } = req.body;
    const userId = req.session.user.user_id;

    try {
        // Use a JOIN in the UPDATE to ensure user ownership via the list table
        const result = await pool.query(
            `UPDATE items SET description = $1, status = $2 
             WHERE id = $3 AND list_id IN (SELECT id FROM list WHERE user_id = $4)`,
            [description, status, id, userId]
        );

        if (result.rowCount === 0) return res.status(404).json({ success: false, message: "Item not found/unauthorized" });
        res.status(200).json({ success: true, message: "Item updated" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/delete-item/:id', authenticateUser, async (req, res) => {
    const { id } = req.params;
    const userId = req.session.user.user_id;

    try {
        const result = await pool.query(
            `DELETE FROM items WHERE id = $1 AND list_id IN (SELECT id FROM list WHERE user_id = $2)`,
            [id, userId]
        );
        if (result.rowCount === 0) return res.status(404).json({ success: false, message: "Item not found/unauthorized" });
        res.status(200).json({ success: true, message: "Item deleted" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on the port ${PORT}`);
});