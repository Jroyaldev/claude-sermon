const express = require('express');

const router = express.Router();

class CitationManager {
  static formatAPA(paper) {
    const authors = paper.authors && paper.authors.length > 0 
      ? paper.authors.length === 1 
        ? paper.authors[0]
        : paper.authors.length === 2
          ? `${paper.authors[0]} & ${paper.authors[1]}`
          : `${paper.authors[0]} et al.`
      : 'Unknown Author';
    
    const year = paper.year || 'n.d.';
    const title = paper.title || 'Untitled';
    const venue = paper.venue || 'Unknown Venue';
    
    let citation = `${authors} (${year}). ${title}. ${venue}`;
    
    if (paper.doi) {
      citation += `. https://doi.org/${paper.doi}`;
    } else if (paper.url) {
      citation += `. ${paper.url}`;
    }
    
    return citation;
  }
  
  static formatMLA(paper) {
    const authors = paper.authors && paper.authors.length > 0 
      ? paper.authors.length === 1 
        ? paper.authors[0]
        : paper.authors.length === 2
          ? `${paper.authors[0]} and ${paper.authors[1]}`
          : `${paper.authors[0]} et al.`
      : 'Unknown Author';
    
    const year = paper.year || 'n.d.';
    const title = paper.title || 'Untitled';
    const venue = paper.venue || 'Unknown Venue';
    
    let citation = `${authors}. "${title}" ${venue}`;
    
    if (paper.year) {
      citation += `, ${year}`;
    }
    
    if (paper.doi) {
      citation += `. https://doi.org/${paper.doi}`;
    } else if (paper.url) {
      citation += `. ${paper.url}`;
    }
    
    return citation;
  }
  
  static formatChicago(paper) {
    const authors = paper.authors && paper.authors.length > 0 
      ? paper.authors.length === 1 
        ? paper.authors[0]
        : paper.authors.length === 2
          ? `${paper.authors[0]} and ${paper.authors[1]}`
          : `${paper.authors[0]} et al.`
      : 'Unknown Author';
    
    const year = paper.year || 'n.d.';
    const title = paper.title || 'Untitled';
    const venue = paper.venue || 'Unknown Venue';
    
    let citation = `${authors}. "${title}" ${venue}`;
    
    if (paper.year) {
      citation += ` (${year})`;
    }
    
    if (paper.doi) {
      citation += `. https://doi.org/${paper.doi}`;
    } else if (paper.url) {
      citation += `. ${paper.url}`;
    }
    
    return citation;
  }
  
  static formatTurabian(paper) {
    const authors = paper.authors && paper.authors.length > 0 
      ? paper.authors.length === 1 
        ? paper.authors[0]
        : paper.authors.length === 2
          ? `${paper.authors[0]} and ${paper.authors[1]}`
          : `${paper.authors[0]} et al.`
      : 'Unknown Author';
    
    const year = paper.year || 'n.d.';
    const title = paper.title || 'Untitled';
    const venue = paper.venue || 'Unknown Venue';
    
    let citation = `${authors}. "${title}" ${venue}`;
    
    if (paper.year) {
      citation += ` (${year})`;
    }
    
    if (paper.doi) {
      citation += `. https://doi.org/${paper.doi}`;
    } else if (paper.url) {
      citation += `. ${paper.url}`;
    }
    
    return citation;
  }
  
  static formatSBL(paper) {
    const authors = paper.authors && paper.authors.length > 0 
      ? paper.authors.length === 1 
        ? paper.authors[0]
        : paper.authors.length === 2
          ? `${paper.authors[0]} and ${paper.authors[1]}`
          : `${paper.authors[0]} et al.`
      : 'Unknown Author';
    
    const year = paper.year || 'n.d.';
    const title = paper.title || 'Untitled';
    const venue = paper.venue || 'Unknown Venue';
    
    let citation = `${authors}. "${title}" ${venue}`;
    
    if (paper.year) {
      citation += ` (${year})`;
    }
    
    if (paper.doi) {
      citation += `. DOI: ${paper.doi}`;
    } else if (paper.url) {
      citation += `. ${paper.url}`;
    }
    
    return citation;
  }
}

router.post('/format', async (req, res) => {
  try {
    const { papers, style = 'APA' } = req.body;
    
    if (!papers || !Array.isArray(papers)) {
      return res.status(400).json({ error: 'Papers array is required' });
    }
    
    const validStyles = ['APA', 'MLA', 'Chicago', 'Turabian', 'SBL'];
    if (!validStyles.includes(style)) {
      return res.status(400).json({ error: 'Invalid citation style' });
    }
    
    const citations = papers.map(paper => {
      switch (style) {
        case 'APA':
          return CitationManager.formatAPA(paper);
        case 'MLA':
          return CitationManager.formatMLA(paper);
        case 'Chicago':
          return CitationManager.formatChicago(paper);
        case 'Turabian':
          return CitationManager.formatTurabian(paper);
        case 'SBL':
          return CitationManager.formatSBL(paper);
        default:
          return CitationManager.formatAPA(paper);
      }
    });
    
    res.json({
      style,
      citations,
      count: citations.length
    });
  } catch (error) {
    console.error('Citation formatting error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/bibliography', async (req, res) => {
  try {
    const { papers, style = 'APA', title = 'Bibliography' } = req.body;
    
    if (!papers || !Array.isArray(papers)) {
      return res.status(400).json({ error: 'Papers array is required' });
    }
    
    const validStyles = ['APA', 'MLA', 'Chicago', 'Turabian', 'SBL'];
    if (!validStyles.includes(style)) {
      return res.status(400).json({ error: 'Invalid citation style' });
    }
    
    const citations = papers.map(paper => {
      switch (style) {
        case 'APA':
          return CitationManager.formatAPA(paper);
        case 'MLA':
          return CitationManager.formatMLA(paper);
        case 'Chicago':
          return CitationManager.formatChicago(paper);
        case 'Turabian':
          return CitationManager.formatTurabian(paper);
        case 'SBL':
          return CitationManager.formatSBL(paper);
        default:
          return CitationManager.formatAPA(paper);
      }
    });
    
    citations.sort();
    
    const bibliography = {
      title,
      style,
      citations,
      count: citations.length,
      generated: new Date().toISOString()
    };
    
    res.json(bibliography);
  } catch (error) {
    console.error('Bibliography generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/styles', (_, res) => {
  const styles = [
    { code: 'APA', name: 'American Psychological Association', description: 'Common in psychology, education, and social sciences' },
    { code: 'MLA', name: 'Modern Language Association', description: 'Common in literature, arts, and humanities' },
    { code: 'Chicago', name: 'Chicago Manual of Style', description: 'Common in history, literature, and arts' },
    { code: 'Turabian', name: 'Turabian Style', description: 'Student version of Chicago style' },
    { code: 'SBL', name: 'Society of Biblical Literature', description: 'Standard for biblical and theological studies' }
  ];
  
  res.json(styles);
});

module.exports = router;