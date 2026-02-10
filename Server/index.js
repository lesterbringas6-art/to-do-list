import express from 'express';
import { pool } from './db.js';
import session from 'express-session';
import { hashPassword, comparePassword } from './components/hash.js';
import cors from 'cors';

const app = express();
const PORT = 3000;
app.use(express.json());
app.use(cors({
    origin: 'https://to-do-list-1e06.onrender.com', 
    credentials: true 
}));

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: true,
        httpOnly: true, 
        maxAge: 24 * 60 * 60 * 1000 
    }
}));

// Helper Middleware to protect routes
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
};

// --- Auth Routes ---

app.post('/register', async (req, res) => {
    const { username, password, confirm, name } = req.body;

    if (!username || !password || !name) {
        return res.status(400).json({ success: false, message: "Missing fields" });
    }
    if (password !== confirm) {
        return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    try {
        const checkUser = await pool.query('SELECT * FROM user_accounts WHERE username = $1', [username]);
        if (checkUser.rows.length > 0) {
            return res.status(400).json({ success: false, message: "Username already exists" });
        }

        const hashedPassword = await hashPassword(password);
        await pool.query(
            'INSERT INTO user_accounts (username, password, name) VALUES($1, $2, $3)', 
            [username, hashedPassword, name]
        );

        res.status(200).json({ success: true, message: "Registered successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query('SELECT id, username, password, name FROM user_accounts WHERE username = $1', [username]);
        const user = result.rows[0];

        if (user && await comparePassword(password, user.password)) {
            req.session.user = {
                user_id: user.id,
                name: user.name
            };

            res.status(200).json({
                success: true,
                message: "Login successful",
                user: { name: user.name } 
            });
        } else {
            res.status(400).json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET Current Session User
app.get('/session', (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

// LOGOUT Route
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Could not log out" });
        }
        res.clearCookie('connect.sid'); // Clears the session cookie
        res.status(200).json({ success: true, message: "Logged out successfully" });
    });
});

// --- List Routes (Protected) ---

app.get('/get-lists', isAuthenticated, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT l.*, 
            COALESCE(json_agg(i.*) FILTER (WHERE i.id IS NOT NULL), '[]') AS items
            FROM list l
            LEFT JOIN items i ON l.id = i.list_id
            GROUP BY l.id
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/add-list', isAuthenticated, async (req , res) => {
    const { title } = req.body;
    try {
        await pool.query(`INSERT INTO list (title, status) VALUES($1,$2)`, [title,"pending"]);
        res.status(200).json({success:true,message: "title added Successfully"});
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/delete-list/:id', isAuthenticated, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM list WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "List not found" });
        }
        res.status(200).json({ success: true, message: "List deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database error", error: error.message });
    }
});

app.put('/edit-list/:id', isAuthenticated, async (req, res) => {
    const { id } = req.params;
    const { title, status } = req.body;
    try {
        const result = await pool.query(
            `UPDATE list SET title = $1, status = $2 WHERE id = $3`,
            [title, status, id]
        );
        if (result.rowCount === 0) return res.status(404).json({ success: false, message: "Not found" });
        res.status(200).json({ success: true, message: "Updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- Item Routes (Protected) ---

app.post('/add-items', isAuthenticated, async (req, res) => {
    const { list_id, description } = req.body;
    try {
        await pool.query(
            `INSERT INTO items (list_id, description, status) VALUES($1, $2, $3)`,
            [list_id, description, "pending"]
        );
        res.status(200).json({ success: true, message: "Item added" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/edit-item/:id', isAuthenticated, async (req, res) => {
    const { id } = req.params;
    const { description, status } = req.body;
    try {
        const result = await pool.query(
            `UPDATE items SET description = $1, status = $2 WHERE id = $3`,
            [description, status, id]
        );
        if (result.rowCount === 0) return res.status(404).json({ success: false });
        res.status(200).json({ success: true, message: "Item updated" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/delete-item/:id', isAuthenticated, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM items WHERE id = $1', [id]);
        if (result.rowCount === 0) return res.status(404).json({ success: false });
        res.status(200).json({ success: true, message: "Item deleted" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on the port ${PORT}`);
});