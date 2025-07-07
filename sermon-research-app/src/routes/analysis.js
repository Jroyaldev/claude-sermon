const express = require('express');
const ClaudeService = require('../services/claudeService');
const AcademicSearchService = require('../services/academicSearch');

const router = express.Router();
const claudeService = new ClaudeService();
const searchService = new AcademicSearchService();

router.post('/analyze-abstracts', async (req, res) => {
  try {
    const { papers, context = '' } = req.body;
    
    if (!papers || !Array.isArray(papers) || papers.length === 0) {
      return res.status(400).json({ error: 'Papers array is required' });
    }
    
    if (!claudeService.isConfigured()) {
      return res.status(503).json({ 
        error: 'Claude API not configured',
        message: 'Please set ANTHROPIC_API_KEY environment variable'
      });
    }
    
    const analysis = await claudeService.analyzeAbstracts(papers, context);
    res.json(analysis);
  } catch (error) {
    console.error('Abstract analysis route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/generate-outline', async (req, res) => {
  try {
    const { scripture, theme, researchSummary } = req.body;
    
    if (!scripture) {
      return res.status(400).json({ error: 'Scripture reference is required' });
    }
    
    if (!claudeService.isConfigured()) {
      return res.status(503).json({ 
        error: 'Claude API not configured',
        message: 'Please set ANTHROPIC_API_KEY environment variable'
      });
    }
    
    const outline = await claudeService.generateSermonOutline(scripture, theme, researchSummary);
    res.json(outline);
  } catch (error) {
    console.error('Outline generation route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/summarize-research', async (req, res) => {
  try {
    const { papers, query } = req.body;
    
    if (!papers || !Array.isArray(papers) || papers.length === 0) {
      return res.status(400).json({ error: 'Papers array is required' });
    }
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    if (!claudeService.isConfigured()) {
      return res.status(503).json({ 
        error: 'Claude API not configured',
        message: 'Please set ANTHROPIC_API_KEY environment variable'
      });
    }
    
    const summary = await claudeService.summarizeResearch(papers, query);
    res.json(summary);
  } catch (error) {
    console.error('Research summarization route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/extract-insights', async (req, res) => {
  try {
    const { text, focus = 'sermon preparation' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    if (!claudeService.isConfigured()) {
      return res.status(503).json({ 
        error: 'Claude API not configured',
        message: 'Please set ANTHROPIC_API_KEY environment variable'
      });
    }
    
    const insights = await claudeService.extractKeyInsights(text, focus);
    res.json(insights);
  } catch (error) {
    console.error('Insight extraction route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/analyze-scripture', async (req, res) => {
  try {
    const { reference, analysisType = 'narrative-critical' } = req.body;
    
    if (!reference) {
      return res.status(400).json({ error: 'Scripture reference is required' });
    }
    
    if (!claudeService.isConfigured()) {
      return res.status(503).json({ 
        error: 'Claude API not configured',
        message: 'Please set ANTHROPIC_API_KEY environment variable'
      });
    }
    
    const analysis = await claudeService.analyzeScriptureContext(reference, analysisType);
    res.json(analysis);
  } catch (error) {
    console.error('Scripture analysis route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/smart-search-and-analyze', async (req, res) => {
  try {
    const { query, options = {}, analyzeResults = true } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    // Perform the search
    const searchResults = await searchService.combinedSearch(query, options);
    
    if (searchResults.error) {
      return res.json(searchResults);
    }
    
    // If Claude is configured and analysis is requested, analyze the results
    if (analyzeResults && claudeService.isConfigured() && searchResults.papers && searchResults.papers.length > 0) {
      try {
        const analysis = await claudeService.summarizeResearch(searchResults.papers, query);
        searchResults.claudeAnalysis = analysis;
      } catch (analysisError) {
        console.warn('Claude analysis failed, returning search results only:', analysisError.message);
        searchResults.claudeAnalysis = { error: 'Analysis failed but search succeeded' };
      }
    }
    
    res.json(searchResults);
  } catch (error) {
    console.error('Smart search route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/status', (_, res) => {
  res.json({
    claudeConfigured: claudeService.isConfigured(),
    features: {
      abstractAnalysis: claudeService.isConfigured(),
      sermonOutlineGeneration: claudeService.isConfigured(),
      researchSummarization: claudeService.isConfigured(),
      insightExtraction: claudeService.isConfigured(),
      scriptureAnalysis: claudeService.isConfigured(),
      smartSearch: true
    }
  });
});

module.exports = router;