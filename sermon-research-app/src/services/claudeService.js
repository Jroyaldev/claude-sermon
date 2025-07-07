const Anthropic = require('@anthropic-ai/sdk');

class ClaudeService {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async analyzeAbstracts(papers, context = '') {
    if (!this.anthropic.apiKey) {
      console.warn('Claude API key not configured');
      return { error: 'Claude API not configured' };
    }

    try {
      const abstractTexts = papers.map(paper => ({
        title: paper.title,
        authors: paper.authors?.join(', ') || 'Unknown',
        abstract: paper.abstract || 'No abstract available',
        year: paper.year
      }));

      const prompt = `As a biblical scholar and theologian, analyze these research papers for sermon preparation. Context: ${context}

Papers to analyze:
${abstractTexts.map((paper, i) => `
${i + 1}. Title: ${paper.title}
   Authors: ${paper.authors}
   Year: ${paper.year}
   Abstract: ${paper.abstract}
`).join('\n')}

Please provide:
1. Key theological themes across these papers
2. Narrative critical insights that emerge
3. Practical applications for sermon preparation
4. Connections between different papers
5. Suggested sermon outline structure based on these findings

Focus on post-evangelic, academically rigorous analysis suitable for pastoral ministry.`;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      });

      return {
        analysis: response.content[0].text,
        papersAnalyzed: papers.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Claude analysis error:', error);
      return { error: 'Failed to analyze papers with Claude' };
    }
  }

  async generateSermonOutline(scripture, theme, researchSummary) {
    if (!this.anthropic.apiKey) {
      return { error: 'Claude API not configured' };
    }

    try {
      const prompt = `As an experienced pastor and biblical scholar, create a comprehensive sermon outline for:

Scripture: ${scripture}
Theme: ${theme}
Research Summary: ${researchSummary}

Please create:
1. A compelling sermon title
2. Main points (3-4 key points)
3. Sub-points for each main point
4. Suggested illustrations or applications
5. Introduction and conclusion suggestions
6. Key exegetical insights
7. Narrative critical observations

Focus on practical application while maintaining academic rigor. The outline should be suitable for post-evangelic preaching that engages both heart and mind.`;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      });

      return {
        outline: response.content[0].text,
        scripture,
        theme,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Sermon outline generation error:', error);
      return { error: 'Failed to generate sermon outline' };
    }
  }

  async summarizeResearch(papers, query) {
    if (!this.anthropic.apiKey) {
      return { error: 'Claude API not configured' };
    }

    try {
      const paperData = papers.map(paper => ({
        title: paper.title,
        authors: paper.authors?.join(', ') || 'Unknown',
        year: paper.year,
        abstract: paper.abstract || 'No abstract available',
        venue: paper.venue,
        citationCount: paper.citationCount || 0
      }));

      const prompt = `Provide a comprehensive research summary for the query: "${query}"

Based on these academic papers:
${paperData.map((paper, i) => `
${i + 1}. ${paper.title} (${paper.year})
   Authors: ${paper.authors}
   Venue: ${paper.venue || 'Unknown'}
   Citations: ${paper.citationCount}
   Abstract: ${paper.abstract}
`).join('\n')}

Please provide:
1. Executive summary of key findings
2. Recurring themes and patterns
3. Methodological approaches used
4. Gaps in current research
5. Implications for pastoral ministry
6. Suggested areas for further study

Focus on practical insights that would benefit sermon preparation and pastoral care.`;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      });

      return {
        summary: response.content[0].text,
        papersCount: papers.length,
        query,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Research summarization error:', error);
      return { error: 'Failed to summarize research' };
    }
  }

  async extractKeyInsights(text, focus = 'sermon preparation') {
    if (!this.anthropic.apiKey) {
      return { error: 'Claude API not configured' };
    }

    try {
      const prompt = `Extract key insights from this academic content for ${focus}:

${text}

Please provide:
1. 3-5 main takeaways
2. Theological implications
3. Practical applications
4. Questions for further reflection
5. Connections to broader biblical themes

Keep insights concise but substantive, suitable for pastoral use.`;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      });

      return {
        insights: response.content[0].text,
        focus,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Insight extraction error:', error);
      return { error: 'Failed to extract insights' };
    }
  }

  async analyzeScriptureContext(reference, analysisType = 'narrative-critical') {
    if (!this.anthropic.apiKey) {
      return { error: 'Claude API not configured' };
    }

    try {
      const prompt = `Provide a ${analysisType} analysis of ${reference}:

Please include:
1. Historical context
2. Literary structure
3. Theological themes
4. Narrative elements (if applicable)
5. Connections to broader biblical narrative
6. Interpretive challenges
7. Homiletical opportunities
8. Contemporary applications

Focus on scholarly depth while remaining accessible for sermon preparation.`;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      });

      return {
        analysis: response.content[0].text,
        reference,
        analysisType,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Scripture analysis error:', error);
      return { error: 'Failed to analyze scripture' };
    }
  }

  isConfigured() {
    return !!this.anthropic.apiKey;
  }
}

module.exports = ClaudeService;