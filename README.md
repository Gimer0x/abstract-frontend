# Document Summarizer Frontend

React frontend for the document processing and summarization application.

## Features

- Modern, responsive user interface
- Drag-and-drop file upload
- Real-time processing status
- Interactive summary display
- Multiple export formats (PDF, DOCX, TXT)
- Copy to clipboard functionality
- Toast notifications

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running (see backend README)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file (optional):
```bash
# Create .env file if you need to customize API URL
REACT_APP_API_URL=http://localhost:5000
```

3. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Project Structure

```
src/
├── components/           # React components
│   ├── DocumentUpload.js
│   ├── DocumentUpload.css
│   ├── SummaryDisplay.js
│   ├── SummaryDisplay.css
│   ├── ExportOptions.js
│   └── ExportOptions.css
├── App.js               # Main application component
├── App.css              # Main application styles
└── index.js             # Application entry point
```

## Components

### DocumentUpload
Handles file upload with drag-and-drop functionality.

**Props:**
- `onDocumentProcessed` - Callback when document is processed
- `onProcessingError` - Callback for processing errors
- `isProcessing` - Boolean for processing state
- `setIsProcessing` - Function to set processing state

**Features:**
- Drag-and-drop interface
- File type validation
- File size validation (5MB limit)
- Processing indicator
- Error handling

### SummaryDisplay
Displays the processed summary and extracted information.

**Props:**
- `summaryData` - Object containing summary information
- `originalFilename` - Name of the original document

**Features:**
- Executive summary display
- Key points, action items, dates, names, places
- Copy to clipboard functionality
- Responsive design
- Smooth animations

### ExportOptions
Provides export functionality for different formats.

**Props:**
- `summaryData` - Summary data to export
- `originalFilename` - Original filename
- `onExportStart` - Callback when export starts
- `onExportComplete` - Callback when export completes
- `onExportError` - Callback for export errors
- `isExporting` - Boolean for export state

**Features:**
- PDF export
- DOCX export
- TXT export
- Download functionality
- Export status indicators

## File Format Support

- **PDF** (.pdf) - Adobe PDF documents
- **DOCX** (.docx) - Microsoft Word documents
- **TXT** (.txt) - Plain text files
- **RTF** (.rtf) - Rich Text Format files
- **ODT** (.odt) - OpenDocument Text files

## Styling

The application uses:
- CSS modules for component-specific styles
- Responsive design with mobile-first approach
- Modern CSS features (Grid, Flexbox, CSS Variables)
- Smooth animations and transitions
- Accessibility-focused design

## API Integration

The frontend communicates with the backend API:
- Base URL: `http://localhost:5000` (configurable via environment)
- File upload: `POST /api/process-document`
- Export endpoints: `POST /api/export/{format}`

## Error Handling

Comprehensive error handling for:
- Network errors
- File upload errors
- Processing errors
- Export errors
- User feedback via toast notifications

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Adding New Features

1. Create new components in `src/components/`
2. Add corresponding CSS files
3. Update App.js to include new components
4. Test across different screen sizes

### Code Style

- Use functional components with hooks
- Follow React best practices
- Maintain consistent naming conventions
- Include proper error handling
- Add comments for complex logic

## Build and Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:5000)

## Troubleshooting

### Common Issues

1. **Backend Connection Error**
   - Ensure backend server is running
   - Check API URL configuration
   - Verify CORS settings on backend

2. **File Upload Issues**
   - Check file size (max 5MB)
   - Verify file format is supported
   - Check browser console for errors

3. **Export Issues**
   - Ensure backend export services are working
   - Check file permissions
   - Verify download settings in browser

## Contributing

1. Follow the existing code style
2. Add proper error handling
3. Test on multiple browsers
4. Ensure responsive design
5. Update documentation as needed
