import { useState } from 'react';
import { TextField, Button, Box, CircularProgress, List, ListItem, ListItemText, Typography } from '@mui/material';

export default function ResearchTab() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch('/api/research/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
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
        <Button variant="contained" onClick={handleSearch}>Search</Button>
      </Box>
      {loading && <CircularProgress />}
      {!loading && results.length > 0 && (
        <List>
          {results.map((paper, idx) => (
            <ListItem key={idx} alignItems="flex-start">
              <ListItemText
                primary={paper.title}
                secondary={<>
                  <Typography component="span" variant="body2" color="text.secondary">
                    {paper.authors?.join(', ')} ({paper.year})
                  </Typography>
                  <br />{paper.venue}
                </>}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
