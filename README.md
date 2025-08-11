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
- **Backend**: Supabase (Database, Auth, Real-time)
- **Database**: PostgreSQL with Row Level Security
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
   # Add your Supabase project URL and anon key
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
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
Create a `.env` file with your Supabase configuration:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Stripe for payments
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

### Supabase Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run the database migrations**:
   - Copy the SQL from `supabase/migrations/20250729110712_falling_forest.sql`
   - Run it in your Supabase SQL editor
   - Copy the SQL from `supabase/migrations/create_rls_policies.sql`
   - Run it to set up Row Level Security

3. **Configure Authentication**:
   - Go to Authentication > Settings in your Supabase dashboard
   - Enable email authentication
   - Disable email confirmation for development (optional)

4. **Set up Row Level Security**:
   - The RLS policies are automatically created by the migration
   - Users can only access their own data
   - Admin users can access all data

5. **Get your project credentials**:
   - Go to Settings > API in your Supabase dashboard
   - Copy your project URL and anon key to your `.env` file

## 🧪 Testing

### Demo Credentials
- Create accounts through the registration form
- Or use the pre-seeded accounts from the migration:
  - **Admin**: `admin@cryptovest.com` / `admin123`
  - **User**: `user@example.com` / `user123`

### Features to Test
- ✅ Authentication system
- ✅ Investment calculator
- ✅ Deposit/withdrawal flows
- ✅ Admin dashboard
- ✅ Mobile responsiveness
- ✅ Multi-language support
- ✅ Dark/light themes
- ✅ Real-time data updates
- ✅ Supabase integration

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

- [x] Real-time Supabase integration
- [x] Row Level Security implementation
- [ ] Advanced charting and analytics
- [ ] Mobile app development
- [ ] API documentation with Swagger
- [ ] Automated testing suite
- [ ] Performance monitoring
- [ ] Multi-currency support
- [ ] Advanced security features
- [ ] Institutional trading features
- [ ] Mobile app with React Native

## 🏆 Live Demo

**🔗 Demo**: [https://gentle-mandazi-1445d4.netlify.app](https://gentle-mandazi-1445d4.netlify.app)

---

Built with ❤️ by the AssetAlchemyPrime Team