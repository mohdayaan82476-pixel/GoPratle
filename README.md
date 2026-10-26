# GoPratle — Event Talent & Production Marketplace

GoPratle is a modern platform to discover and hire verified event planners, live performers, and technical crew across India.

## Stack
- **Frontend**: Next.js 15 (App Router, React 19, Tailwind CSS)
- **Backend**: Express + Node.js (TypeScript)
- **Database**: MongoDB Atlas via Mongoose
- **Email**: Nodemailer (Brevo SMTP)

## Features
- Dynamic 4-step event requirement wizard
- Email OTP verification with rate limiting & HMAC tokens
- Live marketplace browse and search
- Founder & Admin portal (`/admin`) for lead management
- Legal & compliance pages (`/privacy`, `/terms`)
