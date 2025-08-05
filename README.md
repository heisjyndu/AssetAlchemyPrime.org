# AssetAlchemyPrime.org - Premium Investment Platform

A comprehensive premium investment platform built with React, TypeScript, and Tailwind CSS. Features a modern dark theme, multi-language support, and enterprise-grade security.

## 🚀 Features

### Dashboard
- **Summary Cards**: Real-time balance, active deposits, profits, withdrawals, and bonuses
- **Action Center**: Quick access to deposit, withdraw, reinvest, and card applications
- **Transaction History**: Comprehensive transaction table with filtering and status tracking

### Investment System
- **5-Tier Plans**: Basic, Standard, Advanced, Business, and Veteran investment tiers
- **Dynamic Calculator**: Real-time profit calculations with plan-based validation
- **Smart Validation**: Amount sliders with min/max limits per plan
- **Referral System**: 10% commission tracking and management

### Security & Compliance
- **Jurisdiction Gate**: Country-based access control with blocked regions
- **2FA Enforcement**: Two-factor authentication for all transactions
- **Withdrawal Security**: Password verification + 2FA + 24-hour cooldown
- **Address Whitelisting**: Secure withdrawal address management

### Transaction Flows
- **Deposits**: Crypto wallet address generation with receipt upload
- **Card Deposits**: Stripe integration for instant card payments
- **Withdrawals**: Multi-step verification process with security holds
- **Card Applications**: Virtual and physical crypto card ordering

### Global Features
- **Multi-Language**: 50+ language support with RTL compatibility
- **Responsive Design**: Mobile-first approach with dark/light themes
- **Admin Portal**: Real-time monitoring and user management
- **Modern UI**: Teal and blue accent colors with smooth animations

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Supabase
- **Payments**: Stripe integration
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Styling**: PostCSS, Autoprefixer
- **Linting**: ESLint with TypeScript support
- **Deployment**: Netlify

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AssetAlchemyPrime/platform.git
   cd platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Start with backend (optional)**
   ```bash
   npm run dev:full
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── Admin/           # Admin dashboard components
│   ├── Auth/            # Authentication components
│   ├── Dashboard/       # Dashboard-specific components
│   ├── Investment/      # Investment system components
│   ├── Layout/          # Layout components (Header, Sidebar)
│   ├── Modals/          # Modal dialogs
│   └── ComplianceGate.tsx
├── data/                # Mock data and constants
├── hooks/               # Custom React hooks
├── services/            # API services and integrations
├── types/               # TypeScript type definitions
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── index.css            # Global styles

server/                  # Backend API
├── middleware/          # Express middleware
├── routes/              # API routes
├── database.cjs         # Database configuration
└── index.cjs            # Server entry point

supabase/               # Database migrations
└── migrations/         # SQL migration files
```

## 🎨 Design System

### Colors
- **Primary**: Teal (#14B8A6) to Blue (#3B82F6) gradients
- **Background**: Gray-50 (light) / Gray-900 (dark)
- **Cards**: White (light) / Gray-800 (dark)
- **Text**: Gray-900 (light) / White (dark)

### Typography
- **Headings**: Font weights 600-700
- **Body**: Font weight 400-500
- **Code**: Monospace font family

### Spacing
- **Base Unit**: 4px (0.25rem)
- **Component Padding**: 24px (1.5rem)
- **Card Spacing**: 32px (2rem)

## 🔒 Security Features

### Compliance
- Country-based access restrictions
- Age verification (18+)
- Terms of service acknowledgment

### Authentication
- Two-factor authentication (2FA)
- Password strength requirements
- Session management

### Transactions
- Multi-step verification process
- 24-hour security holds
- Email confirmations
- Address whitelisting

## 🌍 Internationalization

The platform supports 50+ languages with:
- RTL (Right-to-Left) language support
- Dynamic language switching
- Localized number and currency formatting
- Cultural adaptations for different regions

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch Friendly**: Large tap targets and gesture support
- **Performance**: Optimized images and lazy loading

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run dev:full` - Start with backend server
- `npm run server` - Start backend only
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style
- TypeScript strict mode enabled
- ESLint with React and TypeScript rules
- Consistent naming conventions
- Component-based architecture

## 🚀 Deployment

### Netlify (Recommended)
The application is configured for easy Netlify deployment:

```bash
npm run build
# Deploy dist/ folder to Netlify
```

### Docker Deployment
```bash
# Build and run with Docker Compose
npm run dev:docker

# Or build Docker image
npm run build:docker
```

### Environment Variables
Create a `.env` file for environment-specific configurations:
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/assetalchemyprime

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

## 🧪 Testing

### Demo Credentials
- **Admin**: `admin@assetalchemyprime.org` / `admin123`
- **User**: `demo@assetalchemyprime.org` / `user123`

### Features to Test
- ✅ Authentication system
- ✅ Investment calculator
- ✅ Deposit/withdrawal flows
- ✅ Admin dashboard
- ✅ Mobile responsiveness
- ✅ Multi-language support
- ✅ Dark/light themes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📞 Support

For support and questions:
- Create an issue on [GitHub](https://github.com/AssetAlchemyPrime/platform/issues)
- Email: support@assetalchemyprime.org
- Documentation: [docs.assetalchemyprime.org](https://docs.assetalchemyprime.org)

## 🎯 Roadmap

- [ ] Real-time WebSocket integration
- [ ] Advanced charting and analytics
- [ ] Mobile app development
- [ ] API documentation with Swagger
- [ ] Automated testing suite
- [ ] Performance monitoring
- [ ] Multi-currency support
- [ ] Advanced security features
- [ ] KYC/AML integration
- [ ] Institutional trading features

## 🏆 Live Demo

**🔗 Demo**: [https://gentle-mandazi-1445d4.netlify.app](https://gentle-mandazi-1445d4.netlify.app)

---

Built with ❤️ by the AssetAlchemyPrime Team