# 🔐 Spencer Denim Task Manager - Login Credentials

## Test User Accounts

All users have the password: **`password123`**

### Available Users:

1. **Admin User**
   - **Email**: `admin@spencer.com`
   - **Password**: `password123`
   - **Role**: Administrator

2. **T. Madusanka** (Senior Merchandiser)
   - **Email**: `madusanka@spencerdenimsl.com`
   - **Password**: `password123`
   - **Role**: Senior Merchandiser

3. **Production Manager**
   - **Email**: `production@spencerdenimsl.com`
   - **Password**: `password123`
   - **Role**: Production Manager

4. **Quality Controller**
   - **Email**: `quality@spencerdenimsl.com`
   - **Password**: `password123`
   - **Role**: Quality Controller

## Quick Test

1. Go to: [http://localhost:3000](http://localhost:3000)
2. You'll be redirected to sign in
3. Use any of the emails above with password: `password123`
4. You should be logged in successfully!

## Database Access

You can also view/edit users in PgAdmin:
- URL: [http://localhost:5050](http://localhost:5050)
- Email: `admin@spencer-denim.com`
- Password: `admin123`

## Troubleshooting

If login doesn't work:
```bash
# Check app logs
docker-compose logs -f app

# Restart containers
docker-compose restart

# Check database connection
docker-compose exec postgres psql -U spencer_admin -d spencer_taskmanager -c "SELECT count(*) FROM users;"
```
