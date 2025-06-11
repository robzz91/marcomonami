const express = require("express")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const mysql = require("mysql2/promise")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "green_delivery",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

const pool = mysql.createPool(dbConfig)

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Token d'accès requis" })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token invalide" })
    }
    req.user = user
    next()
  })
}

// Routes

// Register
app.post("/api/register", async (req, res) => {
  try {
    const { email, password, nom, prenom, telephone, adresse, ville, code_postal, userType } = req.body

    // Check if user exists
    const [existingUsers] = await pool.execute("SELECT id FROM utilisateurs WHERE email = ?", [email])

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: "Cet email est déjà utilisé" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert user
    const [result] = await pool.execute(
      `INSERT INTO utilisateurs (email, password, nom, prenom, telephone, adresse, ville, code_postal, verified, active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, true, true)`,
      [email, hashedPassword, nom, prenom, telephone, adresse, ville, code_postal],
    )

    const userId = result.insertId

    // Get role ID
    const [roles] = await pool.execute("SELECT id FROM roles WHERE nom = ?", [userType || "client"])

    if (roles.length > 0) {
      // Assign role
      await pool.execute("INSERT INTO role_utilisateur (utilisateur_id, role_id) VALUES (?, ?)", [userId, roles[0].id])

      // Create client or livreur record
      if (userType === "client") {
        await pool.execute("INSERT INTO clients (utilisateur_id) VALUES (?)", [userId])
      } else if (userType === "livreur") {
        await pool.execute("INSERT INTO livreurs (utilisateur_id) VALUES (?)", [userId])
      }
    }

    res.status(201).json({ message: "Utilisateur créé avec succès" })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ error: "Erreur lors de la création du compte" })
  }
})

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Get user with roles
    const [users] = await pool.execute(
      `
      SELECT u.*, r.nom as role_name 
      FROM utilisateurs u 
      LEFT JOIN role_utilisateur ru ON u.id = ru.utilisateur_id 
      LEFT JOIN roles r ON ru.role_id = r.id 
      WHERE u.email = ? AND u.active = true
    `,
      [email],
    )

    if (users.length === 0) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" })
    }

    const user = users[0]

    // Check password
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" })
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role_name,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role_name,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Erreur lors de la connexion" })
  }
})

// Get categories
app.get("/api/categories", async (req, res) => {
  try {
    const [categories] = await pool.execute("SELECT * FROM categories_annonces ORDER BY nom")
    res.json(categories)
  } catch (error) {
    console.error("Categories error:", error)
    res.status(500).json({ error: "Erreur lors de la récupération des catégories" })
  }
})

// Create announcement
app.post("/api/annonces", authenticateToken, async (req, res) => {
  try {
    const {
      categorie_id,
      titre,
      description,
      adresse_depart,
      cp_depart,
      ville_depart,
      pays_depart,
      adresse_arrivee,
      cp_arrivee,
      ville_arrivee,
      pays_arrivee,
      date_livraison_souhaitee,
      heure_debut,
      heure_fin,
      poids,
      dimensions,
      fragile,
      prix_propose,
    } = req.body

    // Get client ID
    const [clients] = await pool.execute("SELECT id FROM clients WHERE utilisateur_id = ?", [req.user.userId])

    if (clients.length === 0) {
      return res.status(403).json({ error: "Seuls les clients peuvent créer des annonces" })
    }

    const [result] = await pool.execute(
      `
      INSERT INTO annonces (
        createur_id, type_createur, categorie_id, titre, description,
        adresse_depart, cp_depart, ville_depart, pays_depart,
        adresse_arrivee, cp_arrivee, ville_arrivee, pays_arrivee,
        date_livraison_souhaitee, heure_debut, heure_fin,
        poids, dimensions, fragile, prix_propose, statut, date_publication
      ) VALUES (?, 'client', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'publiee', NOW())
    `,
      [
        clients[0].id,
        categorie_id,
        titre,
        description,
        adresse_depart,
        cp_depart,
        ville_depart,
        pays_depart || "France",
        adresse_arrivee,
        cp_arrivee,
        ville_arrivee,
        pays_arrivee || "France",
        date_livraison_souhaitee,
        heure_debut,
        heure_fin,
        poids,
        dimensions,
        fragile || false,
        prix_propose,
      ],
    )

    res.status(201).json({
      message: "Annonce créée avec succès",
      annonceId: result.insertId,
    })
  } catch (error) {
    console.error("Create announcement error:", error)
    res.status(500).json({ error: "Erreur lors de la création de l'annonce" })
  }
})

// Get announcements
app.get("/api/annonces", async (req, res) => {
  try {
    const [annonces] = await pool.execute(`
      SELECT 
        a.*,
        c.nom as categorie_nom,
        u.prenom,
        u.nom as nom_utilisateur
      FROM annonces a
      JOIN categories_annonces c ON a.categorie_id = c.id
      JOIN clients cl ON a.createur_id = cl.id
      JOIN utilisateurs u ON cl.utilisateur_id = u.id
      WHERE a.statut = 'publiee'
      ORDER BY a.created_at DESC
    `)

    res.json(annonces)
  } catch (error) {
    console.error("Get announcements error:", error)
    res.status(500).json({ error: "Erreur lors de la récupération des annonces" })
  }
})

// Get user's announcements
app.get("/api/mes-annonces", authenticateToken, async (req, res) => {
  try {
    const [clients] = await pool.execute("SELECT id FROM clients WHERE utilisateur_id = ?", [req.user.userId])

    if (clients.length === 0) {
      return res.json([])
    }

    const [annonces] = await pool.execute(
      `
      SELECT 
        a.*,
        c.nom as categorie_nom
      FROM annonces a
      JOIN categories_annonces c ON a.categorie_id = c.id
      WHERE a.createur_id = ? AND a.type_createur = 'client'
      ORDER BY a.created_at DESC
    `,
      [clients[0].id],
    )

    res.json(annonces)
  } catch (error) {
    console.error("Get user announcements error:", error)
    res.status(500).json({ error: "Erreur lors de la récupération de vos annonces" })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
