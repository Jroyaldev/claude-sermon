const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = express.Router();
const dbPath = path.join(__dirname, '../../data/sermons.db');

function initializeDatabase() {
  const db = new sqlite3.Database(dbPath);
  
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS sermons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      scripture_reference TEXT NOT NULL,
      theme TEXT,
      outline TEXT,
      research_notes TEXT,
      sources TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS sermon_research (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sermon_id INTEGER,
      query TEXT NOT NULL,
      results TEXT NOT NULL,
      search_type TEXT DEFAULT 'combined',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sermon_id) REFERENCES sermons (id)
    )`);
  });
  
  db.close();
}

initializeDatabase();

router.post('/', async (req, res) => {
  try {
    const { title, scripture_reference, theme, outline, research_notes, sources } = req.body;
    
    if (!title || !scripture_reference) {
      return res.status(400).json({ error: 'Title and scripture reference are required' });
    }
    
    const db = new sqlite3.Database(dbPath);
    
    const stmt = db.prepare(`
      INSERT INTO sermons (title, scripture_reference, theme, outline, research_notes, sources)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run([title, scripture_reference, theme, outline, research_notes, JSON.stringify(sources)], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to create sermon' });
      }
      
      res.json({ id: this.lastID, message: 'Sermon created successfully' });
    });
    
    stmt.finalize();
    db.close();
  } catch (error) {
    console.error('Create sermon error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const db = new sqlite3.Database(dbPath);
    
    db.all('SELECT * FROM sermons ORDER BY updated_at DESC', (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to retrieve sermons' });
      }
      
      const sermons = rows.map(row => ({
        ...row,
        sources: row.sources ? JSON.parse(row.sources) : []
      }));
      
      res.json(sermons);
    });
    
    db.close();
  } catch (error) {
    console.error('Get sermons error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = new sqlite3.Database(dbPath);
    
    db.get('SELECT * FROM sermons WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to retrieve sermon' });
      }
      
      if (!row) {
        return res.status(404).json({ error: 'Sermon not found' });
      }
      
      const sermon = {
        ...row,
        sources: row.sources ? JSON.parse(row.sources) : []
      };
      
      res.json(sermon);
    });
    
    db.close();
  } catch (error) {
    console.error('Get sermon error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, scripture_reference, theme, outline, research_notes, sources } = req.body;
    
    const db = new sqlite3.Database(dbPath);
    
    const stmt = db.prepare(`
      UPDATE sermons 
      SET title = ?, scripture_reference = ?, theme = ?, outline = ?, research_notes = ?, sources = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run([title, scripture_reference, theme, outline, research_notes, JSON.stringify(sources), id], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to update sermon' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Sermon not found' });
      }
      
      res.json({ message: 'Sermon updated successfully' });
    });
    
    stmt.finalize();
    db.close();
  } catch (error) {
    console.error('Update sermon error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/research', async (req, res) => {
  try {
    const { id } = req.params;
    const { query, results, search_type = 'combined' } = req.body;
    
    if (!query || !results) {
      return res.status(400).json({ error: 'Query and results are required' });
    }
    
    const db = new sqlite3.Database(dbPath);
    
    const stmt = db.prepare(`
      INSERT INTO sermon_research (sermon_id, query, results, search_type)
      VALUES (?, ?, ?, ?)
    `);
    
    stmt.run([id, query, JSON.stringify(results), search_type], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to save research' });
      }
      
      res.json({ id: this.lastID, message: 'Research saved successfully' });
    });
    
    stmt.finalize();
    db.close();
  } catch (error) {
    console.error('Save research error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id/research', async (req, res) => {
  try {
    const { id } = req.params;
    const db = new sqlite3.Database(dbPath);
    
    db.all('SELECT * FROM sermon_research WHERE sermon_id = ? ORDER BY created_at DESC', [id], (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to retrieve research' });
      }
      
      const research = rows.map(row => ({
        ...row,
        results: JSON.parse(row.results)
      }));
      
      res.json(research);
    });
    
    db.close();
  } catch (error) {
    console.error('Get research error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;