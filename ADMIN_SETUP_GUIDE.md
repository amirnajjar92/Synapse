# Admin Setup Guide

## Quick Start: Making Your First Admin User

Since all new users default to the `USER` role, you need to manually promote your account to `ADMIN` role to access the admin panel.

## Method 1: Using Prisma Studio (Recommended)

1. Start Prisma Studio:
```bash
npx prisma studio
```

2. Navigate to the **User** table in the browser window that opens

3. Find your user account (search by email)

4. Click on the `role` field

5. Change it from `USER` to `ADMIN`

6. Click **Save**

7. Refresh your app and you should see the "Admin Panel" link in the sidebar

## Method 2: Direct Database Query

If you have direct database access, run this SQL query:

```sql
UPDATE "User" 
SET role = 'ADMIN' 
WHERE email = 'your-email@example.com';
```

Replace `your-email@example.com` with your actual email address.

## Method 3: Using Prisma Client Script

Create a temporary script file `scripts/make-admin.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeAdmin(email: string) {
  const user = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' },
  });
  console.log(`✅ ${user.email} is now an admin!`);
}

// Replace with your email
makeAdmin('your-email@example.com')
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
```

Run it with:
```bash
npx tsx scripts/make-admin.ts
```

## Verifying Admin Access

After promoting your account:

1. Refresh your application
2. Open the sidebar menu (burger menu)
3. You should see a purple **"Admin Panel"** link
4. Click it to access the admin dashboard

## Admin Panel Features

Once you have admin access, you can:

- **View all users** with their activity metrics
- **View all prompts** submitted by any user
- **Change user roles** (promote users to admin or demote to user)
- **Monitor user engagement** (prompt count, plan count)

## Security Notes

- ⚠️ Only promote trusted users to ADMIN role
- 🔒 Admin users can view ALL user data and prompts
- 🚫 Non-admin users are automatically redirected from `/admin` page
- ✅ All admin API endpoints verify ADMIN role before processing

## Testing Your Admin Setup

1. ✅ Access admin panel from sidebar
2. ✅ View the users list
3. ✅ Click on a user to see their prompts
4. ✅ Try changing a user's role (you can change it back)
5. ✅ Log out and log back in - admin link should still appear

## Need Help?

If you encounter issues:

1. Check your database connection in `.env` file
2. Verify migrations ran successfully: `npx prisma migrate status`
3. Check browser console for error messages
4. Ensure you're using the same email that's in your database
