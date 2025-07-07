import { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import ResearchTab from './ResearchTab';

export default function SearchTabs() {
  const [value, setValue] = useState(0);

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={value} onChange={(_, v) => setValue(v)} centered>
        <Tab label="Research" />
        <Tab label="Analysis" />
        <Tab label="Sermons" />
        <Tab label="Citations" />
      </Tabs>
      <Box sx={{ p: 2 }}>
        {value === 0 && <ResearchTab />}
        {value !== 0 && <div>Feature not implemented</div>}
      </Box>
    </Box>
  );
}
