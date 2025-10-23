# Constry - Smart Construction Management System

<div align="center">
  <h3>🏗️ Build Smarter. Manage Better.</h3>
  <p>The all-in-one Construction Management System for tracking workers, automating payroll, and managing budgets.</p>
</div>

---

## ✨ Features

- 👷 **Worker Management** - Track workers, roles, and daily rates
- ⏰ **Attendance Tracking** - Monitor worker attendance and hours
- 💰 **Automated Payroll** - Calculate and manage payroll effortlessly
- 💵 **Expense Tracking** - Track all project expenses by category
- 📊 **Budget Management** - Set budgets and monitor spending
- 📈 **Analytics Dashboard** - Real-time insights and statistics
- 📄 **PDF Weekly Reports** - Generate professional reports with charts
- 🔒 **Secure Authentication** - Supabase-powered user management
- 🌓 **Dark/Light Mode** - Comfortable viewing in any environment
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

---

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- npm or yarn
- Supabase account (free tier available)

### Installation

```sh
# 1. Clone the repository
git clone https://github.com/nissi15/consty-build-flow.git

# 2. Navigate to the project directory
cd consty-build-flow

# 3. Install dependencies
npm install

# 4. Set up environment variables
# Copy .env.example to .env and fill in your Supabase credentials
cp .env.example .env

# 5. Start the development server
npm run dev
```

The app will be available at `http://localhost:8080`

---

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these from your Supabase project settings.

---

## 📦 Build for Production

```sh
npm run build
```

This generates optimized production files in the `dist/` directory.

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite (optimized for speed)
- **UI Components**: Shadcn UI + Radix UI
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **PDF Generation**: jsPDF + jsPDF-AutoTable
- **State Management**: React Query + Zustand
- **Routing**: React Router v6

---

## 📁 Project Structure

```
constry-build-flow/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/          # Page components
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utilities and helpers
│   ├── integrations/   # Third-party integrations
│   └── styles/         # Global styles
├── public/             # Static assets
└── supabase/          # Database migrations
```

---

## 🚀 Deployment

This project is optimized for deployment on **Vercel** or **Netlify**.

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy!

See `DEPLOYMENT-GUIDE.md` for detailed instructions.

---

## 📊 Performance

- ⚡ **70% smaller** initial bundle (lazy loading)
- 🚀 **66% faster** load time (optimized chunks)
- 📦 **Code splitting** for better caching
- 🎯 **Lighthouse score**: 95/100

See `PERFORMANCE-OPTIMIZATIONS.md` for details.

---

## 🔒 Security

- ✅ Environment variables secured
- ✅ Row Level Security (RLS) enabled
- ✅ API keys not committed to repo
- ✅ Production-ready configuration

See `SECURITY-AUDIT-FINAL.md` for full security analysis.

---

## 📖 Documentation

- `DEPLOYMENT-GUIDE.md` - Complete deployment instructions
- `PERFORMANCE-OPTIMIZATIONS.md` - Performance improvements
- `SECURITY-AUDIT-FINAL.md` - Security analysis
- `PDF-WEEKLY-REPORT-FEATURE.md` - PDF report feature docs

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

<div align="center">
  <p>Built with ❤️ for construction professionals</p>
  <p>© 2024 Constry. All rights reserved.</p>
</div>
