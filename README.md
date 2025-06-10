# BN Products - AI-Powered Business Solutions Showcase

A modern, marketing-focused product showcase built with React and Vite that transforms AI-generated product development content into customer-facing landing pages and detailed product information.

## 🚀 Live Demo

Visit the live product showcase: **[Coming Soon]**

## 📋 Overview

This project creates a public-facing product portfolio website that showcases 8 AI-powered business solutions. Instead of showing development progress, it presents products as polished, market-ready solutions with:

- **Hero Landing Pages** - Compelling product introductions
- **Feature Showcases** - Key capabilities and benefits
- **Use Case Examples** - Real-world applications
- **Detailed Information** - Complete product specifications
- **Target Audience** - Who each product serves
- **Competitive Advantages** - Why choose these solutions

## 🏗️ Architecture

```
Raw Product Data → AI Content Generation → Marketing Extraction → React Showcase
```

### Key Components:

1. **Content Extraction** (`scripts/extract_marketing_content.py`)

   - Processes 120 AI-generated product files
   - Extracts marketing-relevant content
   - Creates structured JSON for the frontend

2. **React Frontend** (`product-dashboard/`)

   - Modern, responsive design
   - Marketing-focused product cards
   - Detailed product pages with tabs
   - Clean, minimal UI with #0700FF accent color

3. **Product Configuration** (`config/product-config.json`)
   - Master configuration with all product data
   - Generated from 8 products × 15 development stages

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 18+
- Python 3.8+
- Git

### Quick Start

```bash
# Clone the repository
git clone https://github.com/jasonlryan/bn-products.git
cd bn-products

# Extract marketing content
python3 scripts/extract_marketing_content.py

# Install and run the React app
cd product-dashboard
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

## 📁 Project Structure

```
bn-products/
├── config/
│   ├── product-config.json           # Master product configuration
│   └── product-config.schema.json    # JSON schema validation
├── data/
│   └── BN Products List - 2025.csv   # Source product data
├── products/                         # 120 AI-generated content files
│   ├── 01_ai_power_hour_01_big_idea_product_manifesto.md
│   ├── 02_ai_b_c_05_plan_competitor_sweep.md
│   └── ... (118 more files)
├── scripts/
│   ├── extract_marketing_content.py  # Marketing content extractor
│   ├── generate_clean_config.py      # Clean config generator
│   └── generate_product_config.py    # Original config generator
├── product-dashboard/                # React/Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx         # Homepage with product grid
│   │   │   ├── ProductDetail.jsx     # Individual product pages
│   │   │   └── StageDetail.jsx       # Detailed content view
│   │   ├── App.jsx                   # Main app component
│   │   └── App.css                   # Styling
│   ├── public/
│   │   └── marketing-content.json    # Extracted marketing data
│   └── package.json
└── README.md
```

## 🎯 Product Portfolio

### 8 AI-Powered Solutions:

1. **AI Power Hour** - Strategic AI consultation sessions
2. **AI B2C** - Consumer-focused AI implementations
3. **AI Innovation Programme** - Comprehensive AI transformation
4. **AI Leadership Partner** - Fractional AI executive services
5. **AI Research & Insight Sprint** - Data-driven AI insights
6. **AI Consultancy Retainer** - Ongoing AI advisory services
7. **AI Innovation Day** - Intensive AI strategy workshops
8. **Social Intelligence Dashboard** - AI-powered social analytics

## 🔧 Development Workflow

### Content Generation Process:

1. **Source Data** - CSV with product definitions
2. **AI Generation** - 15 development stages per product
3. **Content Extraction** - Marketing-focused content parsing
4. **Frontend Display** - React components for public showcase

### Key Scripts:

```bash
# Generate clean product configuration
python3 scripts/generate_clean_config.py

# Extract marketing content for frontend
python3 scripts/extract_marketing_content.py

# Start development server
cd product-dashboard && npm run dev

# Build for production
cd product-dashboard && npm run build
```

## 🎨 Design System

- **Colors**: White background, black text, #0700FF blue accent
- **Typography**: System fonts (SF Pro, Segoe UI, Roboto)
- **Layout**: Responsive grid system, mobile-first
- **Components**: Cards, buttons, tabs, hero sections
- **Interactions**: Hover effects, smooth transitions

## 📱 Features

### Homepage

- Hero section with company overview
- Product grid with benefits preview
- Call-to-action sections
- Responsive design

### Product Pages

- **Overview Tab**: Benefits, target audience, competitive advantages
- **Features Tab**: Capabilities and technical specifications
- **Use Cases Tab**: Real-world applications and examples
- **Details Tab**: Complete product information and documentation

### Navigation

- Breadcrumb navigation
- Sticky product navigation tabs
- Smooth scrolling and transitions

## 🚀 Deployment

### Build for Production:

```bash
cd product-dashboard
npm run build
```

### Deploy Options:

- **Vercel**: Connect GitHub repo for automatic deployments
- **Netlify**: Drag & drop `dist/` folder
- **GitHub Pages**: Use GitHub Actions for automated builds
- **Custom Server**: Upload `dist/` contents

## 🔄 Content Updates

To update product content:

1. Modify source files in `products/` directory
2. Run content extraction: `python3 scripts/extract_marketing_content.py`
3. Restart development server or rebuild for production

## 📊 Analytics & Tracking

Ready for integration with:

- Google Analytics
- Mixpanel
- Hotjar
- Custom tracking pixels

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## 📄 License

This project is proprietary and confidential. All rights reserved.

## 📞 Contact

For questions about this product showcase:

- **Repository**: [https://github.com/jasonlryan/bn-products](https://github.com/jasonlryan/bn-products)
- **Issues**: Use GitHub Issues for bug reports and feature requests

---

**Built with ❤️ using React, Vite, and AI-generated content**
