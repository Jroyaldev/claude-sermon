const express = require('express');
const AcademicSearchService = require('../services/academicSearch');

const router = express.Router();
const searchService = new AcademicSearchService();

router.post('/search', async (req, res) => {
  try {
    const { query, options = {} } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    // Enhanced options with open access filtering
    const searchOptions = {
      includeSemanticScholar: options.includeSemanticScholar !== false,
      includeCrossRef: options.includeCrossRef !== false,
      includeArXiv: options.includeArXiv !== false,
      openAccessOnly: options.openAccessOnly === true,
      limit: options.limit || 20
    };
    
    const results = await searchService.combinedSearch(query, searchOptions);
    res.json(results);
  } catch (error) {
    console.error('Search route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/arxiv/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 20 } = req.query;
    
    const results = await searchService.searchArXiv(query, parseInt(limit));
    res.json(results);
  } catch (error) {
    console.error('arXiv route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/biblical-search', async (req, res) => {
  try {
    const { terms, context = '' } = req.body;
    
    if (!terms || !Array.isArray(terms)) {
      return res.status(400).json({ error: 'Terms array is required' });
    }
    
    const results = await searchService.searchBiblicalTerms(terms, context);
    res.json(results);
  } catch (error) {
    console.error('Biblical search route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/scripture-search', async (req, res) => {
  try {
    const { reference, analysisType = 'narrative-critical' } = req.body;
    
    if (!reference) {
      return res.status(400).json({ error: 'Scripture reference is required' });
    }
    
    const results = await searchService.searchByScripture(reference, analysisType);
    res.json(results);
  } catch (error) {
    console.error('Scripture search route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/semantic-scholar/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 20 } = req.query;
    
    const results = await searchService.searchSemanticScholar(query, undefined, parseInt(limit));
    res.json(results);
  } catch (error) {
    console.error('Semantic Scholar route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/crossref/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { rows = 20 } = req.query;
    
    const results = await searchService.searchCrossRef(query, parseInt(rows));
    res.json(results);
  } catch (error) {
    console.error('CrossRef route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;