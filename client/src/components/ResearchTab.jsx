import { useState } from 'react';
import { TextField, Button, Box, CircularProgress, List, ListItem, ListItemText, Typography, Checkbox, FormControlLabel } from '@mui/material';

export default function ResearchTab() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAccessOnly, setOpenAccessOnly] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch('/api/research/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, options: { openAccessOnly } })
      });
      const data = await res.json();
      setResults(data.papers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          fullWidth
          label="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <FormControlLabel
          control={<Checkbox checked={openAccessOnly} onChange={(e) => setOpenAccessOnly(e.target.checked)} />}
          label="Open Access"
        />
        <Button variant="contained" onClick={handleSearch}>Search</Button>
      </Box>
      {loading && <CircularProgress />}
      {!loading && results.length > 0 && (
        <List>
            {results.map((paper, idx) => (
              <ListItem key={idx} alignItems="flex-start" sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <ListItemText
                  primary={paper.title}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.secondary">
                        {paper.authors?.join(', ')} ({paper.year})
                      </Typography>
                      <br />{paper.venue}
                    </>
                  }
                />
                <Box sx={{ mt: 1 }}>
                  {paper.openAccessPdf ? (
                    <Button size="small" variant="outlined" href={`/api/research/fetch-pdf?url=${encodeURIComponent(paper.openAccessPdf)}`} target="_blank">
                      Read PDF
                    </Button>
                  ) : (
                    paper.url && (
                      <Button size="small" variant="outlined" href={paper.url} target="_blank">
                        View Source
                      </Button>
                    )
                  )}
                </Box>
              </ListItem>
            ))}
        </List>
      )}
    </Box>
  );
}
