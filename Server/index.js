import express from 'express';
import { pool } from './db.js';
import session from 'express-session';
import { hashPassword, comparePassword } from './components/hash.js';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// 1. TRUST PROXY: Essential for cookies on Render/Vercel
app.set('trust proxy', 1);

app.use(express.json());

// 2. MULTI-ORIGIN CORS: Supports local coding and production
// 2. UPDATED CORS: Allow localhost, your main domain, and Vercel preview deployments
const allowedOrigins = [
    'https://to-do-list-1e06.onrender.com',
    'https://to-do-list-neon-two-40.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        // 1. Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);

        // 2. Allow if origin is in our list OR if it's a vercel.app preview URL
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            console.log("CORS Blocked Origin:", origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true 
}));

// 3. SECURE SESSION: Cross-domain compatible
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key', // Recommended to use env var
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: { 
        secure: true,      
        httpOnly: true, 
        sameSite: 'none',  
        maxAge: 24 * 60 * 60 * 1000 
    }
}));

// --- Middleware ---
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
};

// --- Auth Routes ---

app.post('/register', async (req, res) => {
    const { username, password, confirm, name } = req.body;
    if (!username || !password || !name || password !== confirm) {
        return res.status(400).json({ success: false, message: "Invalid input or passwords do not match" });
    }

    try {
        const checkUser = await pool.query('SELECT * FROM user_accounts WHERE username = $1', [username]);
        if (checkUser.rows.length > 0) return res.status(400).json({ success: false, message: "Username exists" });

        const hashedPassword = await hashPassword(password);
        await pool.query('INSERT INTO user_accounts (username, password, name) VALUES($1, $2, $3)', [username, hashedPassword, name]);
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
            req.session.user = { user_id: user.id, name: user.name };
            res.status(200).json({ success: true, user: { name: user.name } });
        } else {
            res.status(400).json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/session', (req, res) => {
    res.json(req.session.user ? { loggedIn: true, user: req.session.user } : { loggedIn: false });
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ success: false });
        res.clearCookie('connect.sid', { secure: true, sameSite: 'none' });
        res.status(200).json({ success: true });
    });
});

// --- List & Item Routes (Protected) ---

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
        res.status(200).json({success:true});
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/delete-list/:id', isAuthenticated, async (req, res) => {
    try {
        await pool.query('DELETE FROM list WHERE id = $1', [req.params.id]);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/edit-list/:id', isAuthenticated, async (req, res) => {
    const { title, status } = req.body;
    try {
        await pool.query(`UPDATE list SET title = $1, status = $2 WHERE id = $3`, [title, status, req.params.id]);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

app.post('/add-items', isAuthenticated, async (req, res) => {
    const { list_id, description } = req.body;
    try {
        await pool.query(`INSERT INTO items (list_id, description, status) VALUES($1, $2, $3)`, [list_id, description, "pending"]);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

app.put('/edit-item/:id', isAuthenticated, async (req, res) => {
    const { description, status } = req.body;
    try {
        await pool.query(`UPDATE items SET description = $1, status = $2 WHERE id = $3`, [description, status, req.params.id]);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

app.delete('/delete-item/:id', isAuthenticated, async (req, res) => {
    try {
        await pool.query('DELETE FROM items WHERE id = $1', [req.params.id]);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});