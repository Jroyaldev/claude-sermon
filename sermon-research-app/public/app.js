let selectedPapers = [];
let currentSermons = [];

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`button[onclick="showTab('${tabName}')"]`).classList.add('active');
    
    if (tabName === 'sermons') {
        loadSermons();
    } else if (tabName === 'citations') {
        updateSelectedPapers();
    } else if (tabName === 'analysis') {
        checkClaudeStatus();
    }
}

async function checkClaudeStatus() {
    try {
        const response = await fetch('/api/analysis/status');
        const status = await response.json();
        
        if (!status.claudeConfigured) {
            showAnalysisMessage('Claude API is not configured. Some analysis features may not be available.');
        }
    } catch (error) {
        console.error('Failed to check Claude status:', error);
    }
}

async function analyzeSelectedPapers() {
    if (selectedPapers.length === 0) {
        showError('Please select some papers first');
        return;
    }
    
    showAnalysisLoading();
    
    try {
        const response = await fetch('/api/analysis/analyze-abstracts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                papers: selectedPapers,
                context: 'sermon preparation and pastoral ministry'
            })
        });
        
        const data = await response.json();
        displayAnalysisResults('Abstract Analysis', data);
    } catch (error) {
        showError('Failed to analyze papers: ' + error.message);
    }
}

async function analyzeScripture() {
    const reference = document.getElementById('scriptureAnalysisRef').value.trim();
    const analysisType = document.getElementById('scriptureAnalysisType').value;
    
    if (!reference) {
        showError('Please enter a scripture reference');
        return;
    }
    
    showAnalysisLoading();
    
    try {
        const response = await fetch('/api/analysis/analyze-scripture', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reference, analysisType })
        });
        
        const data = await response.json();
        displayAnalysisResults('Scripture Analysis', data);
    } catch (error) {
        showError('Failed to analyze scripture: ' + error.message);
    }
}

async function generateSermonOutline() {
    const scripture = document.getElementById('outlineScripture').value.trim();
    const theme = document.getElementById('outlineTheme').value.trim();
    const researchSummary = document.getElementById('outlineResearch').value.trim();
    
    if (!scripture) {
        showError('Please enter a scripture reference');
        return;
    }
    
    showAnalysisLoading();
    
    try {
        const response = await fetch('/api/analysis/generate-outline', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ scripture, theme, researchSummary })
        });
        
        const data = await response.json();
        displayAnalysisResults('Sermon Outline', data);
    } catch (error) {
        showError('Failed to generate outline: ' + error.message);
    }
}

function displayAnalysisResults(title, data) {
    const container = document.getElementById('analysisResults');
    
    if (data.error) {
        container.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i> ${data.error}
                ${data.message ? `<br><small>${data.message}</small>` : ''}
            </div>
        `;
        return;
    }
    
    let content = '';
    if (data.analysis) {
        content = data.analysis;
    } else if (data.outline) {
        content = data.outline;
    } else if (data.summary) {
        content = data.summary;
    } else {
        content = 'No analysis content available';
    }
    
    container.innerHTML = `
        <h3>${title}</h3>
        <div class="analysis-content">${content}</div>
        <small style="color: #666; margin-top: 10px; display: block;">
            Generated: ${new Date(data.timestamp || Date.now()).toLocaleString()}
        </small>
    `;
}

function showAnalysisLoading() {
    document.getElementById('analysisResults').innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Analyzing...</div>';
}

function showAnalysisMessage(message) {
    const container = document.getElementById('analysisResults');
    if (container.innerHTML.trim() === '') {
        container.innerHTML = `<div style="padding: 20px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; color: #856404;"><i class="fas fa-info-circle"></i> ${message}</div>`;
    }
}

async function performGeneralSearch() {
    const query = document.getElementById('generalQuery').value.trim();
    if (!query) return;
    
    const options = getSearchOptions();
    
    showLoading();
    
    try {
        const response = await fetch('/api/research/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query, options })
        });
        
        const data = await response.json();
        displayResults(data);
    } catch (error) {
        showError('Failed to perform search: ' + error.message);
    }
}

async function performSmartSearch() {
    const query = document.getElementById('generalQuery').value.trim();
    if (!query) return;
    
    const options = getSearchOptions();
    const analyzeResults = document.getElementById('analyzeWithClaude').checked;
    
    showLoading();
    
    try {
        const response = await fetch('/api/analysis/smart-search-and-analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query, options, analyzeResults })
        });
        
        const data = await response.json();
        displayResults(data);
    } catch (error) {
        showError('Failed to perform smart search: ' + error.message);
    }
}

function getSearchOptions() {
    return {
        openAccessOnly: document.getElementById('openAccessOnly').checked,
        includeArXiv: document.getElementById('includeArXiv').checked,
        includeSemanticScholar: document.getElementById('includeSemanticScholar').checked,
        includeCrossRef: document.getElementById('includeCrossRef').checked,
        limit: 20
    };
}

async function performBiblicalSearch() {
    const termsInput = document.getElementById('biblicalTerms').value.trim();
    const context = document.getElementById('biblicalContext').value.trim();
    
    if (!termsInput) return;
    
    const terms = termsInput.split(',').map(term => term.trim());
    
    showLoading();
    
    try {
        const response = await fetch('/api/research/biblical-search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ terms, context })
        });
        
        const data = await response.json();
        displayResults(data);
    } catch (error) {
        showError('Failed to perform biblical search: ' + error.message);
    }
}

async function performScriptureSearch() {
    const reference = document.getElementById('scriptureRef').value.trim();
    const analysisType = document.getElementById('analysisType').value;
    
    if (!reference) return;
    
    showLoading();
    
    try {
        const response = await fetch('/api/research/scripture-search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reference, analysisType })
        });
        
        const data = await response.json();
        displayResults(data);
    } catch (error) {
        showError('Failed to perform scripture search: ' + error.message);
    }
}

function displayResults(data) {
    const resultsContainer = document.getElementById('searchResults');
    
    if (data.error) {
        showError(data.error);
        return;
    }
    
    if (!data.papers || data.papers.length === 0) {
        resultsContainer.innerHTML = '<p>No results found.</p>';
        return;
    }
    
    let html = `
        <div class="results-header">
            <h3>Search Results</h3>
            <div class="results-stats">
                Found ${data.papers.length} papers from ${data.sources ? data.sources.join(', ') : 'multiple sources'}
                ${data.openAccessCount !== undefined ? `<br>Open Access: ${data.openAccessCount}, Subscription: ${data.subscriptionCount || 0}` : ''}
            </div>
        </div>
    `;
    
    // Display Claude analysis if available
    if (data.claudeAnalysis && data.claudeAnalysis.summary) {
        html += `
            <div class="claude-analysis">
                <h4><i class="fas fa-brain"></i> Claude Analysis</h4>
                <div class="claude-analysis-content">${data.claudeAnalysis.summary}</div>
            </div>
        `;
    }
    
    html += data.papers.map(paper => `
        <div class="paper-card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                <h4 class="paper-title">${paper.title || 'Untitled'}</h4>
                <span class="access-badge ${paper.openAccess ? 'open' : 'subscription'}">
                    ${paper.accessType || (paper.openAccess ? 'Open Access' : 'Subscription')}
                </span>
            </div>
            <div class="paper-authors">${paper.authors ? paper.authors.join(', ') : 'Unknown Authors'}</div>
            <div class="paper-meta">
                <span><i class="fas fa-calendar"></i> ${paper.year || 'Unknown Year'}</span>
                <span><i class="fas fa-book"></i> ${paper.venue || 'Unknown Venue'}</span>
                <span><i class="fas fa-quote-left"></i> ${paper.citationCount || 0} citations</span>
                <span><i class="fas fa-database"></i> ${paper.source || 'Unknown Source'}</span>
            </div>
            ${paper.abstract ? `<div class="paper-abstract">${truncateText(paper.abstract, 300)}</div>` : ''}
            <div class="paper-actions">
                <button class="btn-small btn-select" onclick="selectPaper(${JSON.stringify(paper).replace(/"/g, '&quot;')})">
                    <i class="fas fa-plus"></i> Select
                </button>
                ${paper.url ? `<button class="btn-small btn-link" onclick="window.open('${paper.url}', '_blank')">
                    <i class="fas fa-external-link-alt"></i> View Paper
                </button>` : ''}
                ${paper.doi ? `<button class="btn-small btn-link" onclick="window.open('https://doi.org/${paper.doi}', '_blank')">
                    <i class="fas fa-link"></i> DOI
                </button>` : ''}
                ${!paper.openAccess ? '<small style="color: #999; display: block; margin-top: 5px;"><i class="fas fa-lock"></i> Subscription required for full text</small>' : ''}
            </div>
        </div>
    `).join('');
    
    resultsContainer.innerHTML = html;
}

function selectPaper(paper) {
    if (!selectedPapers.find(p => p.title === paper.title)) {
        selectedPapers.push(paper);
        showSuccess('Paper added to selection');
        updateSelectedPapers();
    } else {
        showError('Paper already selected');
    }
}

function removePaper(index) {
    selectedPapers.splice(index, 1);
    updateSelectedPapers();
}

function updateSelectedPapers() {
    const container = document.getElementById('papersList');
    
    if (selectedPapers.length === 0) {
        container.innerHTML = '<p>No papers selected yet.</p>';
        return;
    }
    
    const html = selectedPapers.map((paper, index) => `
        <div class="selected-paper">
            <div class="selected-paper-info">
                <div class="selected-paper-title">${paper.title || 'Untitled'}</div>
                <div class="selected-paper-authors">${paper.authors ? paper.authors.join(', ') : 'Unknown Authors'}</div>
            </div>
            <button class="btn-remove" onclick="removePaper(${index})">
                <i class="fas fa-trash"></i> Remove
            </button>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

async function formatSelectedCitations() {
    if (selectedPapers.length === 0) {
        showError('Please select some papers first');
        return;
    }
    
    const style = document.getElementById('citationStyle').value;
    
    try {
        const response = await fetch('/api/citations/format', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ papers: selectedPapers, style })
        });
        
        const data = await response.json();
        displayCitations(data);
    } catch (error) {
        showError('Failed to format citations: ' + error.message);
    }
}

async function generateBibliography() {
    if (selectedPapers.length === 0) {
        showError('Please select some papers first');
        return;
    }
    
    const style = document.getElementById('citationStyle').value;
    
    try {
        const response = await fetch('/api/citations/bibliography', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                papers: selectedPapers, 
                style,
                title: 'Bibliography'
            })
        });
        
        const data = await response.json();
        displayBibliography(data);
    } catch (error) {
        showError('Failed to generate bibliography: ' + error.message);
    }
}

function displayCitations(data) {
    const container = document.getElementById('citationResults');
    
    let html = `
        <h3>Citations (${data.style} Style)</h3>
        <div class="citation-list">
    `;
    
    html += data.citations.map(citation => `
        <div class="citation-item">${citation}</div>
    `).join('');
    
    html += '</div>';
    
    container.innerHTML = html;
}

function displayBibliography(data) {
    const container = document.getElementById('citationResults');
    
    let html = `
        <h3>${data.title} (${data.style} Style)</h3>
        <div class="citation-list">
    `;
    
    html += data.citations.map(citation => `
        <div class="citation-item">${citation}</div>
    `).join('');
    
    html += '</div>';
    
    container.innerHTML = html;
}

function showSermonForm() {
    document.getElementById('sermonForm').classList.remove('hidden');
}

function hideSermonForm() {
    document.getElementById('sermonForm').classList.add('hidden');
    document.getElementById('sermonForm').querySelector('form').reset();
}

async function saveSermon(event) {
    event.preventDefault();
    
    const formData = {
        title: document.getElementById('sermonTitle').value,
        scripture_reference: document.getElementById('sermonScripture').value,
        theme: document.getElementById('sermonTheme').value,
        outline: document.getElementById('sermonOutline').value,
        research_notes: document.getElementById('sermonNotes').value,
        sources: selectedPapers
    };
    
    try {
        const response = await fetch('/api/sermons', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showSuccess('Sermon saved successfully');
            hideSermonForm();
            loadSermons();
        } else {
            showError(data.error || 'Failed to save sermon');
        }
    } catch (error) {
        showError('Failed to save sermon: ' + error.message);
    }
}

async function loadSermons() {
    try {
        const response = await fetch('/api/sermons');
        const sermons = await response.json();
        
        displaySermons(sermons);
        currentSermons = sermons;
    } catch (error) {
        showError('Failed to load sermons: ' + error.message);
    }
}

function displaySermons(sermons) {
    const container = document.getElementById('sermonList');
    
    if (sermons.length === 0) {
        container.innerHTML = '<p>No sermons created yet.</p>';
        return;
    }
    
    const html = sermons.map(sermon => `
        <div class="sermon-card">
            <h3>${sermon.title}</h3>
            <div class="sermon-meta">
                <span><i class="fas fa-book"></i> ${sermon.scripture_reference}</span>
                <span><i class="fas fa-calendar"></i> ${new Date(sermon.created_at).toLocaleDateString()}</span>
                ${sermon.theme ? `<span><i class="fas fa-tag"></i> ${sermon.theme}</span>` : ''}
            </div>
            ${sermon.outline ? `<div class="sermon-outline">${truncateText(sermon.outline, 200)}</div>` : ''}
            <div class="sermon-actions">
                <button class="btn-small btn-select" onclick="viewSermon(${sermon.id})">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn-small btn-link" onclick="editSermon(${sermon.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

function viewSermon(id) {
    const sermon = currentSermons.find(s => s.id === id);
    if (!sermon) return;
    
    alert(`Title: ${sermon.title}\nScripture: ${sermon.scripture_reference}\nTheme: ${sermon.theme || 'None'}\n\nOutline:\n${sermon.outline || 'None'}\n\nNotes:\n${sermon.research_notes || 'None'}`);
}

function editSermon(id) {
    showError('Edit functionality not implemented yet');
}

function showLoading() {
    document.getElementById('searchResults').innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
    
    document.body.insertBefore(errorDiv, document.body.firstChild);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success';
    successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    
    document.body.insertBefore(successDiv, document.body.firstChild);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text || '';
    return text.substring(0, maxLength) + '...';
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('generalQuery').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performGeneralSearch();
        }
    });
    
    document.getElementById('biblicalTerms').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performBiblicalSearch();
        }
    });
    
    document.getElementById('scriptureRef').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performScriptureSearch();
        }
    });
});