# Milestone-based Prototype

A React/TypeScript prototype for the milestone-based loyalty program settings interface.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment to Vercel

### Initial Setup

1. **Push to GitHub** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/psclpzt/milestone-based-prototype.git
   git push -u origin main
   ```

2. **Create a new Vercel project**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import the `milestone-based-prototype` repository
   - **Important**: Give it a different project name than your spend-based prototype (e.g., "milestone-prototype" vs "spend-prototype")
   - Vercel will auto-detect the framework (Vite)
   - Click "Deploy"

### Keeping Projects Separate

To ensure this project doesn't override your spend-based prototype:

1. **Different Repository**: This project uses a separate GitHub repository (`milestone-based-prototype`)
2. **Different Vercel Project**: Create a new Vercel project with a distinct name
3. **Different Domain**: Vercel will assign a unique URL (e.g., `milestone-prototype.vercel.app`)
4. **Separate Environment Variables**: If you add any, they'll be project-specific

### Build Settings

Vercel should auto-detect these settings:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Manual Configuration (if needed)

If auto-detection doesn't work, manually set:
- **Root Directory**: `.` (or leave empty)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Project Structure

```
├── src/
│   ├── components/
│   │   └── ui/          # Reusable UI components
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── tailwind.config.js   # Tailwind CSS configuration
```

## Features

- Milestone rule configuration
- Multiple reward types (free product, flat discount, percent-off, points)
- Category-based eligibility rules
- Redemption and expiry settings
- Responsive design matching ROLLERWorld interface

