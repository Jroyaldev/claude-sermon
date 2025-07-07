# Sermon Research App

A comprehensive academic research tool for sermon preparation that integrates multiple scholarly databases to provide pastors with access to real academic sources for post-evangelic narrative critical study.

## Features

### 🔍 Academic Search Integration
- **Semantic Scholar API**: Access to 200+ million academic papers
- **CrossRef API**: Comprehensive bibliographic metadata
- **Combined Search**: Aggregate results from multiple sources
- **Specialized Biblical Search**: Targeted searches for biblical terms and concepts
- **Scripture Reference Search**: Analysis-specific searches (narrative-critical, historical-critical, etc.)

### 📚 Sermon Management
- Create and organize sermon projects
- Link research directly to specific sermons
- Track sources and citations
- Save research notes and outlines

### 📖 Citation Management
- Multiple citation styles (APA, MLA, Chicago, Turabian, SBL)
- Automatic bibliography generation
- Source tracking and management
- Export capabilities

### 🎯 Narrative Critical Focus
- Specialized search filters for post-evangelic scholarship
- Support for various critical methodologies
- Academic-level research capabilities
- Real source verification (not AI hallucination)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sermon-research-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Create data directory:
```bash
mkdir data
```

5. Start the application:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Usage

### Basic Search
1. Navigate to the Research tab
2. Enter your search terms in the General Search field
3. Review results from multiple academic databases
4. Select papers to add to your citation library
5. Use the **Open Access** toggle to show only freely available papers

### Biblical Terms Search
1. Use the Biblical Terms Search for theological concepts
2. Enter comma-separated terms (e.g., "covenant, salvation, redemption")
3. Add contextual information for more targeted results

### Scripture Reference Search
1. Enter specific biblical references (e.g., "John 3:16", "Matthew 5:1-12")
2. Choose your analysis type (narrative-critical, historical-critical, etc.)
3. Get scholarly commentary and exegesis

### Sermon Creation
1. Go to the Sermons tab
2. Click "New Sermon" to create a sermon project
3. Add research notes and link selected papers
4. Save and organize your sermon library

### Citation Management
1. Select papers from your search results
2. Go to the Citations tab
3. Choose your preferred citation style
4. Generate formatted citations or complete bibliography

## API Endpoints

### Research Routes
- `POST /api/research/search` - General academic search
- `POST /api/research/biblical-search` - Biblical terms search
- `POST /api/research/scripture-search` - Scripture reference search
- `GET /api/research/semantic-scholar/:query` - Direct Semantic Scholar search
- `GET /api/research/crossref/:query` - Direct CrossRef search
- `GET /api/research/fetch-pdf?url=` - Proxy to retrieve open access PDFs

### Sermon Routes
- `POST /api/sermons` - Create new sermon
- `GET /api/sermons` - List all sermons
- `GET /api/sermons/:id` - Get specific sermon
- `PUT /api/sermons/:id` - Update sermon
- `POST /api/sermons/:id/research` - Save research to sermon
- `GET /api/sermons/:id/research` - Get sermon research

### Citation Routes
- `POST /api/citations/format` - Format citations
- `POST /api/citations/bibliography` - Generate bibliography
- `GET /api/citations/styles` - List available citation styles

## Database Schema

### Sermons Table
- `id` - Primary key
- `title` - Sermon title
- `scripture_reference` - Biblical reference
- `theme` - Sermon theme/topic
- `outline` - Sermon outline
- `research_notes` - Research notes
- `sources` - JSON array of linked papers
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Sermon Research Table
- `id` - Primary key
- `sermon_id` - Foreign key to sermons
- `query` - Search query used
- `results` - JSON search results
- `search_type` - Type of search performed
- `created_at` - Creation timestamp

## Citation Styles Supported

- **APA** - American Psychological Association
- **MLA** - Modern Language Association
- **Chicago** - Chicago Manual of Style
- **Turabian** - Student version of Chicago
- **SBL** - Society of Biblical Literature (specialized for biblical studies)

## Rate Limits

- Semantic Scholar: 100 requests per 5 minutes (unauthenticated)
- CrossRef: No authentication required, reasonable use expected
- Combined searches count toward individual API limits

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run tests
- `npm run lint` - Run ESLint

### Technology Stack
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **APIs**: Semantic Scholar, CrossRef
- **Icons**: Font Awesome

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

## Acknowledgments

- Semantic Scholar for providing comprehensive academic search
- CrossRef for bibliographic metadata
- The open-source community for various dependencies
- Biblical scholars and theologians who contribute to accessible research