# QR Code Generator

A modern, responsive single-page application for generating QR codes with support for multiple data types, customization options, and both online API and offline local generation.

![QR Code Generator](https://img.shields.io/badge/React-18.2.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.3-blue.svg)

## Features

### Core Functionality
- **Multiple QR Types**: Text, URL, Wi-Fi, vCard, Email, SMS
- **Dual Generation Modes**:
  - API mode using qrserver.com (online)
  - Local mode using qrcode library (offline)
- **Real-time Validation**: Input validation with helpful error messages
- **Advanced Download Options**:
  - **Multiple Formats**: PNG, JPEG, WebP, SVG
  - **Quality Control**: Adjustable compression for JPEG and WebP
  - **Format Conversion**: Convert API-generated QR codes to any format

### New Advanced Features

#### 🎨 Image Format Conversion
- **Multi-Format Support**: Export QR codes as PNG, JPEG, or WebP
- **Quality Settings**: Adjustable compression (10-100%) for lossy formats
- **Smart Conversion**: Automatically converts API images to desired formats
- **Real-time Preview**: See format and quality settings before download

#### 📦 Batch Processing
- **Bulk Generation**: Create hundreds of QR codes at once
- **CSV Import**: Upload CSV files with Name, Data, Type columns
- **Manual Entry**: Add items individually with custom settings
- **Batch Settings**: Apply consistent styling across all QR codes
- **ZIP Download**: Automatically packages all generated codes
- **Progress Tracking**: Real-time progress with item-by-item status
- **Error Handling**: Detailed error reporting for failed generations
- **Sample CSV**: Download template file to get started quickly

#### 📋 Templates & Presets
- **Built-in Templates**: Professional presets for common use cases
  - Business Card (vCard with company branding)
  - Guest WiFi (Open network access)
  - Website Link (Company/personal website)
  - Contact Email (Pre-filled email forms)
- **Custom Templates**: Save your own QR settings as reusable templates
- **Template Management**: Edit, delete, and organize your templates
- **One-Click Apply**: Instantly apply template settings to current QR
- **Template Preview**: Visual preview with color and size information

#### 📜 History & Data Management
- **Generation History**: Automatic tracking of all created QR codes
- **Smart Storage**: Saves up to 50 recent QR codes with full settings
- **Visual Timeline**: Chronological list with timestamps and previews
- **Quick Restore**: One-click restoration of previous QR codes
- **Export/Import**: Backup and restore your QR history as JSON
- **Search & Filter**: Find specific QR codes by type, date, or content
- **Bulk Management**: Clear all history or selective deletion

### Data Types Support

#### Text
- Raw text content for any purpose

#### URL
- Automatic http:// prefix for URLs without protocol
- Validation for proper URL format

#### Wi-Fi
- Network name (SSID)
- Password with encryption support (WEP/WPA/WPA2/None)
- Hidden network option
- Generates WIFI: format string

#### vCard (Contact Card)
- Full name, organization, title
- Phone number and email
- Website URL
- Generates vCard 3.0 format

#### Email
- Recipient email address
- Subject line and message body
- Generates mailto: URLs

#### SMS
- Phone number and message content
- Generates SMSTO: format

### Customization Options
- **Size Selection**: 256x256, 320x320, 512x512 pixels
- **Margin Control**: 0-20 pixel margin around QR code
- **Error Correction**: L (7%), M (15%), Q (25%), H (30%)
- **Color Customization**: Foreground and background colors with hex color picker
- **Logo Overlay**: Upload and center logo over QR code (local mode only, max 1MB)

### User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark/Light Theme**: Automatic detection with manual toggle
- **Persistent Settings**: Saves preferences to localStorage
- **Toast Notifications**: Success and error feedback
- **Accessibility**: ARIA labels, focus management, keyboard navigation

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom components
- **QR Generation**:
  - qrcode library for offline generation
  - qrserver.com API for online generation
- **File Processing**:
  - JSZip for batch downloads
  - Canvas API for image manipulation
  - File API for uploads and conversions
- **Build Tool**: Vite
- **Code Quality**: ESLint with TypeScript support

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd qr-code-generator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Usage Guide

### Basic QR Code Generation

1. **Select QR Type**: Choose from Text, URL, Wi-Fi, vCard, Email, or SMS
2. **Enter Data**: Fill in the required fields for your selected type
3. **Customize**: Adjust size, colors, error correction, and margin as needed
4. **Generate**: Click "Generate QR Code" to create your QR code
5. **Download**: Choose format (PNG/JPEG/WebP/SVG) and download

### Advanced Features

#### Batch Processing
1. **Navigate to Batch Tab**: Click "Batch Processing" in the top navigation
2. **Prepare Data**: Upload a CSV file or add items manually
3. **Configure Settings**: Set size, colors, format, and quality for all QR codes
4. **Generate**: Click "Generate [N] QR Codes" to start batch processing
5. **Download**: Automatically downloads a ZIP file with all generated codes

#### Using Templates
1. **Navigate to Templates Tab**: Click "Templates" in the top navigation
2. **Browse Presets**: View built-in templates for common use cases
3. **Apply Template**: Click "Apply" to use template settings
4. **Create Custom**: Save your current settings as a new template

#### Managing History
1. **Navigate to History Tab**: Click "History" in the top navigation
2. **View Generated QR Codes**: Browse chronological list of all created codes
3. **Restore Previous**: Click "Restore" to reuse previous QR code settings
4. **Export/Import**: Backup your history or import from another device

### Generator Modes

#### API Mode (Default)
- Uses qrserver.com API
- Requires internet connection
- Supports all customization options
- PNG download via fetch API

#### Local Mode (Offline)
- Uses qrcode npm library
- Works completely offline
- Supports logo overlay feature
- Both PNG and SVG download options

### Logo Overlay Feature

Available only in local mode:
1. Toggle "Use local generator"
2. Upload an image file (max 1MB)
3. Image will be automatically cropped to square
4. Logo appears centered with white background for contrast
5. Maintains 18-22% of QR code size for optimal scanning

### Best Practices

- **Color Contrast**: Use high contrast between foreground and background
- **Quiet Zone**: Maintain adequate margin (4+ pixels recommended)
- **Error Correction**: Use higher levels (Q or H) for codes that might be damaged
- **Testing**: Always test QR codes with multiple scanners before distribution
- **Logo Size**: Keep logos small (under 20% of QR code size) to maintain scannability

## API vs Local Generator

| Feature | API Mode | Local Mode |
|---------|----------|------------|
| Internet Required | Yes | No |
| Logo Overlay | No | Yes |
| SVG Download | No | Yes |
| Color Support | Yes | Yes |
| Error Correction | Yes | Yes |
| File Size | N/A | Smaller |
| Customization | Full | Full |

## Browser Support

- **Modern Browsers**: Chrome 88+, Firefox 78+, Safari 14+, Edge 88+
- **Mobile**: iOS Safari 14+, Android Chrome 88+
- **Features Used**:
  - ES2020 features
  - Canvas API for logo overlay
  - File API for image uploads
  - Fetch API for downloads
  - CSS Grid and Flexbox

## File Structure

```
src/
├── main.tsx              # Application entry point
├── App.tsx               # Main app component with state management
├── lib/                  # Utility functions
│   ├── color.ts          # Color conversion helpers
│   ├── payloads.ts       # QR data builders for different types
│   ├── download.ts       # Download utilities
│   └── canvas.ts         # Canvas manipulation for logo overlay
├── components/           # React components
│   ├── Controls.tsx      # Main form component
│   ├── Preview.tsx       # QR display and download component
│   ├── ColorInput.tsx    # Color picker component
│   ├── NumberInput.tsx   # Number input component
│   ├── Select.tsx        # Select dropdown component
│   ├── Toggle.tsx        # Checkbox toggle component
│   ├── FileDrop.tsx      # File upload component
│   └── Toast.tsx         # Toast notification system
└── styles/
    └── index.css         # Tailwind CSS and custom styles
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security Considerations

- **Client-Side Only**: No server-side processing or data storage
- **Logo Files**: Validated for size (1MB limit) and type (images only)
- **URL Validation**: Basic validation prevents obvious malicious URLs
- **No Sensitive Data**: Application doesn't store or transmit sensitive information

## Troubleshooting

### Common Issues

**QR Code Not Scanning**
- Increase error correction level
- Ensure high contrast between colors
- Add more margin around the code
- Test without logo overlay

**Download Not Working**
- Check browser permissions for downloads
- Try right-click "Save as" for API images
- Ensure popup blocker isn't interfering

**Logo Overlay Issues**
- Ensure image is under 1MB
- Use square images for best results
- Switch to local generator mode

**Build Errors**
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check Node.js version (16+ required)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [qrcode](https://www.npmjs.com/package/qrcode) - QR code generation library
- [qrserver.com](https://qrserver.com/) - QR code API service
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [React](https://reactjs.org/) - JavaScript library for building user interfaces
- [Vite](https://vitejs.dev/) - Fast build tool and development server# qrcodegenerator
