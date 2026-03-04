# 🌸 Flower Farm Website

Professional e-commerce platform for flower farming with CSA memberships, bulk ordering, and farm management tools.

## Project Structure

```
flower-farm-website/
├── frontend/          # React customer interface
├── backend/           # Node.js API server
├── database/          # PostgreSQL schemas & migrations
├── README.md          # This file
└── .gitignore         # Git ignore rules
```

## Features

- 🥗 **CSA Memberships** - Weekly/bi-weekly/monthly subscriptions
- 🪣 **Flower Buckets** - Bulk ordering for events
- 💐 **Retail Shop** - Individual flower sales
- 🏪 **Wholesale Portal** - Bulk pricing for florists
- 📅 **Planting Schedule** - Farm operations management
- 🗺️ **Crop Layout** - Field mapping & tracking
- 📊 **Analytics Dashboard** - Sales & farm metrics
- 💳 **Payment Processing** - Stripe integration
- 📧 **Email Notifications** - Automated customer communications

## Tech Stack

**Frontend:** React, CSS, HTML
**Backend:** Node.js, Express.js
**Database:** PostgreSQL
**Payments:** Stripe
**Storage:** AWS S3
**Hosting:** AWS (ECS, RDS, CloudFront)

## Getting Started

### Prerequisites
- Node.js & npm
- PostgreSQL
- Git
- AWS Account (for deployment)

### Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/flower-farm-website.git
cd flower-farm-website
```

2. Install dependencies:
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. Set up environment variables:
```bash
# Create .env file in backend/
cp backend/.env.example backend/.env
```

4. Start development servers:
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd frontend
npm start
```

Visit `http://localhost:3000` in your browser.

## Development Phases

- **Phase 1:** Learn web fundamentals (Weeks 1-3)
- **Phase 2:** Set up development environment (Week 4)
- **Phase 3:** Build basic structure (Weeks 5-6)
- **Phase 4:** Add authentication & payments (Weeks 7-8)
- **Phase 5:** Connect database (Weeks 9-10)
- **Phase 6:** Polish features (Weeks 11-12)
- **Phase 7:** Prepare for AWS (Week 13)
- **Phase 8:** Deploy to AWS (Weeks 14-15)
- **Phase 9:** Security hardening (Week 16)
- **Phase 10:** Monitor & scale (Ongoing)

## Project Timeline

Total development time: ~4 months to launch

## License

MIT

## Support

For questions or issues, please open a GitHub issue.

---

**Status:** 🚀 In Development
**Last Updated:** March 4, 2026
