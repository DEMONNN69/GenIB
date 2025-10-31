# GenIB Backend API

Production-ready Django REST API for GenIB exam platform with JWT authentication.

## 🏗️ Architecture

### Project Structure
```
backend/
├── core/                       # Project configuration
│   ├── settings/              # Split settings
│   │   ├── base.py           # Base settings
│   │   ├── development.py    # Dev settings
│   │   └── production.py     # Prod settings
│   ├── urls.py               # Main URL config
│   ├── wsgi.py              # WSGI config
│   └── asgi.py              # ASGI config
│
├── apps/                      # Django apps
│   ├── authentication/       # Auth app
│   │   ├── views.py         # HTTP methods only
│   │   ├── serializers.py   # Data validation
│   │   ├── services.py      # Business logic
│   │   └── urls.py          # URL routing
│   │
│   ├── users/               # User management
│   │   ├── models.py        # User model
│   │   ├── managers.py      # Custom managers
│   │   ├── views.py         # HTTP methods only
│   │   ├── serializers.py   # Data validation
│   │   ├── services.py      # Business logic
│   │   ├── signals.py       # Django signals
│   │   └── urls.py          # URL routing
│   │
│   └── common/              # Shared utilities
│       └── utils/           # Helper functions
│
├── requirements.txt         # Dependencies
├── manage.py               # Django CLI
└── .env.example           # Environment template
```

## 🚀 Quick Start

### 1. Setup Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Copy environment file
copy .env.example .env

# Edit .env with your settings
```

### 3. Database Setup

```bash
# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### 4. Run Development Server

```bash
# Development
python manage.py runserver

# With specific settings
python manage.py runserver --settings=core.settings.development
```

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/register/` | Register new user | No |
| POST | `/api/v1/auth/login/` | Login user | No |
| POST | `/api/v1/auth/logout/` | Logout user | Yes |
| POST | `/api/v1/auth/token/refresh/` | Refresh access token | No |
| POST | `/api/v1/auth/token/verify/` | Verify token | No |
| POST | `/api/v1/auth/password/change/` | Change password | Yes |
| POST | `/api/v1/auth/password/reset/` | Request password reset | No |
| POST | `/api/v1/auth/password/reset/confirm/` | Confirm password reset | No |

### Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/users/profile/` | Get current user profile | Yes |
| PUT | `/api/v1/users/profile/` | Update current user profile | Yes |
| POST | `/api/v1/users/profile/deactivate/` | Deactivate account | Yes |
| GET | `/api/v1/users/search/?q=query` | Search users | Yes |
| GET | `/api/v1/users/<id>/` | Get user by ID | Yes |

## 🔐 Authentication

### Register
```bash
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "username",
    "password": "SecurePass123!",
    "password_confirm": "SecurePass123!",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### Use JWT Token
```bash
curl -X GET http://localhost:8000/api/v1/users/profile/ \
  -H "Authorization: Bearer <access_token>"
```

## 🔧 Configuration

### Settings Structure

**base.py**: Common settings for all environments
- Database configuration
- Installed apps
- Middleware
- REST framework settings
- JWT configuration
- CORS settings
- Security settings

**development.py**: Development-specific settings
- Debug mode enabled
- SQLite database
- Console email backend
- Relaxed security

**production.py**: Production-specific settings
- Debug mode disabled
- PostgreSQL database
- SMTP email backend
- Strict security
- Redis caching

### Switch Environments

```bash
# Development
export DJANGO_SETTINGS_MODULE=core.settings.development

# Production
export DJANGO_SETTINGS_MODULE=core.settings.production
```

## 🔒 Security Features

- JWT Authentication with token refresh
- Password strength validation
- Rate limiting on auth endpoints
- Brute force protection (Django Defender)
- CORS configuration
- Secure headers
- SQL injection protection
- XSS protection

## 📦 Key Dependencies

- **Django 5.0**: Web framework
- **Django REST Framework 3.14**: API framework
- **SimpleJWT 5.3**: JWT authentication
- **psycopg2-binary**: PostgreSQL adapter
- **python-decouple**: Environment management
- **django-cors-headers**: CORS handling
- **django-ratelimit**: Rate limiting
- **django-defender**: Brute force protection

## 🏭 Production Deployment

### Environment Variables

Set these in production:
```
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://localhost:6379/1
CORS_ALLOWED_ORIGINS=https://yourdomain.com
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-email-password
```

### Collect Static Files
```bash
python manage.py collectstatic --noinput
```

### Database Migration
```bash
python manage.py migrate --settings=core.settings.production
```

## 📝 Code Architecture Principles

### Separation of Concerns

1. **Views**: HTTP request/response only
2. **Serializers**: Data validation and serialization
3. **Services**: Business logic and complex operations
4. **Models**: Data structure and database operations
5. **Utils**: Reusable helper functions

### Example Flow

```
Request → View → Serializer (validation) → Service (business logic) → Model (database) → Response
```

## 🧪 Testing

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test apps.authentication
python manage.py test apps.users
```

## 📊 Database Schema

### User Model Fields

- **Authentication**: email, username, password
- **Profile**: first_name, last_name, bio, avatar, phone_number
- **Academic**: curriculum, grade_level, school
- **Status**: is_active, is_staff, is_verified
- **Subscription**: is_premium, premium_expires_at
- **Timestamps**: date_joined, last_login, updated_at

## 🐛 Debugging

### Enable Debug Toolbar

In development, Django Debug Toolbar is available at:
```
http://localhost:8000/__debug__/
```

### View Logs

```bash
# Check debug.log
tail -f logs/debug.log
```

## 📈 Scalability Features

- Separated settings for different environments
- Service layer for business logic reusability
- Efficient database queries with indexing
- Redis caching support
- Rate limiting to prevent abuse
- Modular app structure for easy feature addition

## 🔄 Next Steps

1. Add email verification functionality
2. Implement password reset via email
3. Add more user profile fields
4. Create past papers app
5. Create question bank app
6. Create exam builder app
7. Add subscription management
8. Implement payment integration

## 📞 Support

For issues or questions, please open an issue on GitHub.
