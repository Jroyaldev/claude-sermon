import Container from '@mui/material/Container';
import SearchTabs from './components/SearchTabs';

export default function App() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <h1>Sermon Research App</h1>
      <SearchTabs />
    </Container>
  );
}
