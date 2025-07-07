const axios = require('axios');

class AcademicSearchService {
  constructor() {
    this.semanticScholarBase = 'https://api.semanticscholar.org/graph/v1';
    this.crossRefBase = 'https://api.crossref.org/works';
    this.arXivBase = 'http://export.arxiv.org/api/query';
    this.openAccessSources = ['arXiv', 'bioRxiv', 'medRxiv', 'DOAJ', 'PLoS ONE', 'BMC'];
  }

  async searchSemanticScholar(query, fields = ['title', 'abstract', 'authors', 'year', 'citationCount', 'url', 'venue'], limit = 20) {
    try {
      const response = await axios.get(`${this.semanticScholarBase}/paper/search`, {
        params: {
          query,
          fields: fields.join(','),
          limit
        }
      });
      
      return this.formatSemanticScholarResults(response.data);
    } catch (error) {
      console.error('Semantic Scholar search error:', error.message);
      return { error: 'Failed to search Semantic Scholar' };
    }
  }

  async searchCrossRef(query, rows = 20) {
    try {
      const response = await axios.get(this.crossRefBase, {
        params: {
          query,
          rows,
          select: 'title,author,published-print,DOI,URL,container-title,abstract'
        }
      });
      
      return this.formatCrossRefResults(response.data);
    } catch (error) {
      console.error('CrossRef search error:', error.message);
      return { error: 'Failed to search CrossRef' };
    }
  }

  async searchArXiv(query, maxResults = 10) {
    try {
      const response = await axios.get(this.arXivBase, {
        params: {
          search_query: `all:${query}`,
          max_results: maxResults,
          sortBy: 'relevance',
          sortOrder: 'descending'
        }
      });
      
      return this.formatArXivResults(response.data);
    } catch (error) {
      console.error('arXiv search error:', error.message);
      return { error: 'Failed to search arXiv' };
    }
  }

  async combinedSearch(query, options = {}) {
    const { includeSemanticScholar = true, includeCrossRef = true, includeArXiv = true, openAccessOnly = false, limit = 10 } = options;
    
    const searches = [];
    
    if (includeSemanticScholar) {
      searches.push(this.searchSemanticScholar(query, undefined, limit));
    }
    
    if (includeCrossRef) {
      searches.push(this.searchCrossRef(query, limit));
    }
    
    if (includeArXiv) {
      searches.push(this.searchArXiv(query, limit));
    }
    
    try {
      const results = await Promise.all(searches);
      let mergedResults = this.mergeResults(results, query);
      
      if (openAccessOnly) {
        mergedResults = this.filterOpenAccess(mergedResults);
      } else {
        mergedResults = this.markOpenAccess(mergedResults);
      }
      
      return mergedResults;
    } catch (error) {
      console.error('Combined search error:', error.message);
      return { error: 'Failed to perform combined search' };
    }
  }

  formatSemanticScholarResults(data) {
    if (!data || !data.data) return { papers: [], source: 'semantic-scholar' };
    
    return {
      papers: data.data.map(paper => ({
        title: paper.title,
        authors: paper.authors?.map(author => author.name) || [],
        year: paper.year,
        abstract: paper.abstract,
        citationCount: paper.citationCount,
        url: paper.url,
        venue: paper.venue,
        source: 'Semantic Scholar',
        doi: paper.externalIds?.DOI || null,
        openAccess: paper.openAccessPdf !== null || paper.isOpenAccess
      })),
      source: 'semantic-scholar',
      total: data.total
    };
  }

  formatArXivResults(xmlData) {
    try {
      // Simple regex parsing for arXiv XML - more robust than DOM parsing in Node.js
      const entryRegex = /<entry>(.*?)<\/entry>/gs;
      const titleRegex = /<title>(.*?)<\/title>/s;
      const authorRegex = /<author>.*?<name>(.*?)<\/name>.*?<\/author>/gs;
      const summaryRegex = /<summary>(.*?)<\/summary>/s;
      const publishedRegex = /<published>(.*?)<\/published>/s;
      const idRegex = /<id>(.*?)<\/id>/s;
      
      const entries = [...xmlData.matchAll(entryRegex)];
      
      const papers = entries.map(entryMatch => {
        const entryContent = entryMatch[1];
        
        const titleMatch = entryContent.match(titleRegex);
        const title = titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ') : 'No title';
        
        const authorMatches = [...entryContent.matchAll(authorRegex)];
        const authors = authorMatches.map(match => match[1].trim());
        
        const summaryMatch = entryContent.match(summaryRegex);
        const summary = summaryMatch ? summaryMatch[1].trim().replace(/\s+/g, ' ') : 'No abstract';
        
        const publishedMatch = entryContent.match(publishedRegex);
        const year = publishedMatch ? new Date(publishedMatch[1]).getFullYear() : null;
        
        const idMatch = entryContent.match(idRegex);
        const id = idMatch ? idMatch[1].trim() : null;
        
        return {
          title,
          authors,
          year,
          abstract: summary,
          citationCount: null,
          url: id,
          venue: 'arXiv',
          source: 'arXiv',
          doi: null,
          openAccess: true
        };
      });
      
      return {
        papers,
        source: 'arxiv',
        total: papers.length
      };
    } catch (error) {
      console.error('arXiv XML parsing error:', error);
      return { papers: [], source: 'arxiv' };
    }
  }

  formatCrossRefResults(data) {
    if (!data || !data.message || !data.message.items) return { papers: [], source: 'crossref' };
    
    return {
      papers: data.message.items.map(item => ({
        title: item.title?.[0] || 'No title',
        authors: item.author?.map(author => `${author.given || ''} ${author.family || ''}`.trim()) || [],
        year: item['published-print']?.['date-parts']?.[0]?.[0] || null,
        abstract: item.abstract || null,
        doi: item.DOI,
        url: item.URL,
        venue: item['container-title']?.[0] || null,
        source: 'CrossRef',
        citationCount: null,
        openAccess: this.detectOpenAccess(item)
      })),
      source: 'crossref',
      total: data.message['total-results']
    };
  }

  detectOpenAccess(item) {
    if (!item) return false;
    
    const venue = item['container-title']?.[0]?.toLowerCase() || '';
    const publisher = item.publisher?.toLowerCase() || '';
    const url = item.URL?.toLowerCase() || '';
    
    // Check for known open access venues
    const isOpenAccessVenue = this.openAccessSources.some(source => 
      venue.includes(source.toLowerCase()) || 
      publisher.includes(source.toLowerCase()) ||
      url.includes(source.toLowerCase())
    );
    
    // Check for CC license
    const hasCreativeCommons = item.license?.some(license => 
      license.URL?.includes('creativecommons.org')
    );
    
    return isOpenAccessVenue || hasCreativeCommons || false;
  }

  isOpenAccessPaper(paper) {
    if (paper.openAccess !== undefined) return paper.openAccess;
    
    const venue = paper.venue?.toLowerCase() || '';
    const source = paper.source?.toLowerCase() || '';
    const url = paper.url?.toLowerCase() || '';
    
    // arXiv is always open access
    if (source === 'arxiv') return true;
    
    // Check against known open access sources
    return this.openAccessSources.some(oaSource => 
      venue.includes(oaSource.toLowerCase()) ||
      source.includes(oaSource.toLowerCase()) ||
      url.includes(oaSource.toLowerCase())
    );
  }

  markOpenAccess(results) {
    if (!results.papers) return results;
    
    results.papers = results.papers.map(paper => ({
      ...paper,
      openAccess: this.isOpenAccessPaper(paper),
      accessType: this.isOpenAccessPaper(paper) ? 'Open Access' : 'Subscription Required'
    }));
    
    results.openAccessCount = results.papers.filter(p => p.openAccess).length;
    results.subscriptionCount = results.papers.length - results.openAccessCount;
    
    return results;
  }

  filterOpenAccess(results) {
    if (!results.papers) return results;
    
    results.papers = results.papers.filter(paper => this.isOpenAccessPaper(paper));
    results.total = results.papers.length;
    results.openAccessCount = results.papers.length;
    results.subscriptionCount = 0;
    results.filtered = true;
    
    return results;
  }

  mergeResults(results, query) {
    const merged = {
      query,
      papers: [],
      sources: [],
      timestamp: new Date().toISOString()
    };
    
    results.forEach(result => {
      if (result && result.papers) {
        merged.papers.push(...result.papers);
        merged.sources.push(result.source);
      }
    });
    
    merged.papers = this.deduplicateResults(merged.papers);
    merged.total = merged.papers.length;
    
    return merged;
  }

  deduplicateResults(papers) {
    const seen = new Set();
    return papers.filter(paper => {
      const key = `${paper.title?.toLowerCase()}${paper.authors?.join('')}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  async searchBiblicalTerms(terms, context = '') {
    const query = `${terms.join(' ')} ${context} biblical theology exegesis narrative criticism`.trim();
    return this.combinedSearch(query);
  }

  async searchByScripture(reference, analysisType = 'narrative-critical') {
    const query = `${reference} ${analysisType} biblical studies exegesis commentary`;
    return this.combinedSearch(query);
  }
}

module.exports = AcademicSearchService;