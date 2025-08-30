# Community Transparency Digest - Setup Guide

## 🚀 Quick Setup (15 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create `.env.local` file with these keys:

```env
# Required for AI features
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Optional for extended features
NEWS_API_KEY=your_news_api_key_here
OPENCAGE_API_KEY=your_opencage_api_key_here
```

### 3. Get API Keys

#### OpenAI API Key (Required)
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up/login
3. Create new API key
4. Copy to `.env.local`

#### Gemini API Key (Required)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign up/login with Google account
3. Create new API key
4. Copy to `.env.local`

#### NewsAPI Key (Optional)
1. Go to [NewsAPI.org](https://newsapi.org/register)
2. Sign up for free account
3. Copy API key to `.env.local`

#### OpenCage API Key (Optional)
1. Go to [OpenCage Geocoding](https://opencagedata.com/api)
2. Sign up for free account (2,500 requests/day)
3. Copy API key to `.env.local`

### 4. Run the Application
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🎯 Demo Flow

### First Time Setup
1. **Enter ZIP Code**: Try `94102` (San Francisco)
2. **Select Interests**: Choose 3-4 topics like Housing, Transport, Environment
3. **Click "Get Started"**

### Upload Document
1. **Upload PDF**: Use the sample file in `sample-documents/` or any government PDF
2. **Watch Processing**: AI will analyze the document (takes 10-30 seconds)
3. **View Results**: See personalized insights on the dashboard

### Explore Features
1. **Document Dashboard**: 
   - View personalized impact analysis
   - See action buttons (email templates, calendar links)
   - Check sentiment analysis charts
   - Compare with other cities

2. **AI Chat**:
   - Switch to "AI Town Hall Chat" tab
   - Ask questions like:
     - "How will this affect parking in my area?"
     - "What are the budget implications?"
     - "When do these changes take effect?"

### Sample Questions to Try
- "Explain this proposal in simple terms"
- "How much will this cost taxpayers?"
- "What can I do to provide input?"
- "How does this compare to other cities?"
- "What are the environmental impacts?"

## 🛠 Troubleshooting

### Common Issues

#### "Failed to upload document"
- Check that OpenAI API key is valid
- Ensure file is PDF, DOC, DOCX, or TXT
- File size should be under 10MB

#### "Processing failed"
- Verify OpenAI API key has credits
- Check console for detailed error messages
- Try with a smaller document

#### Charts not loading
- Ensure all dependencies installed: `npm install`
- Check browser console for errors

#### Chat not working
- Verify OpenAI API key is set
- Check that document is fully processed first

### Performance Tips
- Use smaller documents (under 5MB) for faster processing
- PDF files work best for government documents
- Processing time depends on document length (10-60 seconds)

## 📊 Sample Data

The app includes realistic sample data:
- 3 pre-loaded government documents
- Public comments with sentiment analysis
- Comparative budget data for Bay Area cities
- AI-generated forecasts and predictions

You can test all features immediately without uploading documents.

## 🎨 Customization

### Change Sample Location
Edit the seed data in:
- `src/app/api/documents/route.ts`
- Update ZIP codes and city names

### Add New Document Categories
Update the interests in:
- `src/components/PersonalizationSetup.tsx`
- Add new categories to the `INTEREST_OPTIONS` array

### Modify AI Prompts
Customize AI analysis in:
- `src/app/api/documents/upload/route.ts`
- `src/app/api/chat/message/route.ts`

## 🚀 Ready for Demo!

Once setup is complete, you have a fully functional civic engagement platform ready for demonstration. The app works offline with sample data and can process real government documents with AI analysis.

Perfect for hackathons, civic tech demos, and government transparency initiatives!