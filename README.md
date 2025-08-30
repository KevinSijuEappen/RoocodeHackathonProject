# Community Transparency Digest

A full-stack AI-powered civic engagement platform that transforms government documents into interactive, personalized insights. Upload PDFs, get AI analysis, chat with documents, and take action on local issues.

## 🚀 Core Features

### 1. **Personalized "Impact Lens"**
- Input ZIP code + interests (housing, transport, environment, business, etc.)
- AI highlights only document portions that directly affect you
- Tailored summaries based on your civic interests

### 2. **AI Town Hall Chatbot**
- Natural language chat interface for government documents
- Ask questions like "How will this zoning change affect parking near me?"
- Answers in plain English with source citations

### 3. **Policy Sentiment Heatmap**
- Analyzes public comments and transcripts for sentiment
- Visual charts showing support vs opposition
- Sample comments with sentiment analysis

### 4. **Automatic "What You Can Do" Action Buttons**
- Pre-drafted emails to representatives
- RSVP links to public hearings
- Share buttons for social engagement

### 5. **Comparative Context Generator**
- Compares local proposals with nearby cities
- Uses open civic datasets for context
- Example: "Your city spends 2x more on policing than nearby towns"

### 6. **Future Forecast Scenarios**
- AI predicts likely policy impacts based on historical patterns
- Confidence scores and timeframes
- Example: "If passed, expect +15% traffic near Main St. within 2 years"

## 🛠 Tech Stack

- **Frontend**: Next.js 15 + React 19 + Tailwind CSS
- **Backend**: Next.js API Routes
- **AI**: OpenAI GPT-4o + Google Gemini
- **Charts**: Recharts for data visualization
- **File Processing**: PDF parsing with pdf-parse
- **Database**: Mock in-memory (easily replaceable with Supabase/PostgreSQL)

## ⚡ Quick Start (15 minutes)

### 1. **Clone and Install**
```bash
git clone <your-repo-url>
cd roocodehack
npm install
```

### 2. **Environment Setup**
Copy `.env.example` to `.env.local` and add your API keys:

```bash
cp .env.example .env.local
```

**Required API Key:**
- **GEMINI_API_KEY**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey) (Free!)

**Optional (for extended features):**
- **NEWS_API_KEY**: Get from [NewsAPI.org](https://newsapi.org/register)
- **OPENCAGE_API_KEY**: Get from [OpenCage Geocoding](https://opencagedata.com/api)

### 3. **Run the Application**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Demo Flow

### Step 1: Personalization Setup
1. Enter your ZIP code (try: 94102)
2. Select interests (housing, transport, environment, etc.)

### Step 2: Document Upload
1. Upload a government PDF or use pre-loaded sample documents
2. Watch AI process and analyze the document
3. Get personalized insights based on your interests

### Step 3: Explore Features
- **Dashboard**: View impact analysis, action buttons, charts
- **Chat**: Ask questions about the document in natural language
- **Sentiment**: See public opinion analysis
- **Forecasts**: View predicted impacts and scenarios

## 📊 Sample Data Included

The app comes with realistic sample data:
- **3 Government Documents**: Housing proposal, transportation budget, environmental assessment
- **Public Comments**: With sentiment analysis (positive/negative/neutral)
- **Comparative Data**: Budget comparisons across Bay Area cities
- **Forecasts**: AI-generated impact predictions

## 🏗 Architecture

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── documents/          # Document CRUD operations
│   │   ├── chat/              # AI chat functionality
│   │   └── ...
│   ├── page.tsx               # Main dashboard
│   └── layout.tsx             # App layout
├── components/
│   ├── PersonalizationSetup.tsx    # ZIP + interests setup
│   ├── DocumentUpload.tsx          # PDF upload with processing
│   ├── DocumentDashboard.tsx       # Main insights dashboard
│   ├── ChatInterface.tsx           # AI chat component
│   ├── SentimentHeatmap.tsx        # Sentiment visualization
│   ├── ComparativeContext.tsx      # City comparisons
│   └── ForecastScenarios.tsx       # Impact predictions
└── database/
    ├── schema.sql             # Database schema
    └── seed-data.sql          # Sample data
```

## 🔧 Customization

### Adding New Document Types
1. Update the upload handler in `src/app/api/documents/upload/route.ts`
2. Add processing logic for new document formats
3. Update the AI prompts for document-specific analysis

### Extending AI Analysis
1. Modify prompts in the processing functions
2. Add new insight categories
3. Customize action item generation

### Database Integration
Replace the mock database with real persistence:
1. Set up Supabase or PostgreSQL
2. Run the schema from `database/schema.sql`
3. Update API routes to use real database queries

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Mode**: Full dark mode support
- **Loading States**: Smooth loading animations
- **Error Handling**: Graceful error states and user feedback
- **Accessibility**: WCAG compliant components

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel
```

### Docker
```bash
# Build Docker image
docker build -t community-transparency-digest .

# Run container
docker run -p 3000:3000 community-transparency-digest
```

## 📈 Hackathon Demo Tips

1. **Start with personalization** - Show ZIP code + interests setup
2. **Upload a sample PDF** - Demonstrate real-time AI processing
3. **Explore the dashboard** - Highlight personalized insights and action buttons
4. **Use the chat feature** - Ask natural language questions
5. **Show visualizations** - Sentiment charts and comparative data
6. **Demonstrate forecasts** - AI-predicted impacts with confidence scores

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**Built for civic engagement and government transparency** 🏛️✨

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
