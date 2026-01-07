# 12. Troubleshooting Guide

Common issues and solutions for the SN Auto Parts application.

## Database Issues

### Connection Refused

**Symptoms:**
- Backend fails to start
- Error: "Can't reach database server"

**Solutions:**
1. Verify `DATABASE_URL` in `.env` is correct
2. Check database is running (if local)
3. Verify network connectivity
4. Check firewall rules
5. For Neon: Verify connection string includes `?sslmode=require`

### Migration Errors

**Symptoms:**
- `prisma migrate` fails
- Schema drift errors

**Solutions:**
```bash
# Reset database (WARNING: deletes data)
npx prisma migrate reset

# Or resolve migration manually
npx prisma migrate resolve --applied <migration-name>
```

### Prisma Client Not Generated

**Symptoms:**
- TypeScript errors: "Cannot find module '@prisma/client'"
- Import errors

**Solutions:**
```bash
# Regenerate Prisma client
npx prisma generate

# If still failing, reinstall
rm -rf node_modules
npm install
npx prisma generate
```

---

## Authentication Issues

### Session Not Persisting

**Symptoms:**
- User logged out after page refresh
- 401 errors on authenticated routes

**Solutions:**
1. Check cookie settings:
   - `httpOnly: true`
   - `secure: true` in production
   - `sameSite: 'lax'`
2. Verify `AUTH_SECRET` is set
3. Check session expiration time
4. Verify cookie domain/path settings

### Invalid Token Errors

**Symptoms:**
- 401 Unauthorized errors
- "Invalid or expired session"

**Solutions:**
1. Clear browser cookies
2. Verify token format
3. Check session expiration
4. Verify database connection
5. Check if session was deleted

### Role-Based Access Denied

**Symptoms:**
- 403 Forbidden errors
- Cannot access manager/admin routes

**Solutions:**
1. Verify user role in database
2. Check route guard configuration
3. Verify role enum matches database
4. Check if user role was changed

---

## API Issues

### CORS Errors

**Symptoms:**
- Browser console: "CORS policy blocked"
- Requests fail in browser

**Solutions:**
1. Verify `FRONTEND_URL` in backend `.env`
2. Check CORS configuration in `backend/src/index.ts`:
   ```typescript
   await fastify.register(cors, {
     origin: config.frontendUrl,
     credentials: true,
   });
   ```
3. Ensure frontend URL matches exactly
4. Check for trailing slashes

### 404 Not Found

**Symptoms:**
- API endpoint returns 404
- Route not found

**Solutions:**
1. Verify route is registered in route index
2. Check route prefix matches
3. Verify HTTP method (GET, POST, etc.)
4. Check route path spelling
5. Verify route is loaded in `src/index.ts`

### Validation Errors

**Symptoms:**
- 400 Bad Request
- Zod validation errors

**Solutions:**
1. Check request body matches schema
2. Verify required fields are present
3. Check data types match schema
4. Review Zod error message for details
5. Check for typos in field names

---

## Payment Issues

### Stripe Payment Intent Fails

**Symptoms:**
- Payment intent creation fails
- Stripe API errors

**Solutions:**
1. Verify `STRIPE_SECRET_KEY` is correct
2. Check Stripe API key is for correct environment (test/live)
3. Verify account has sufficient permissions
4. Check Stripe dashboard for errors
5. Verify amount is valid (positive, in cents)

### Webhook Not Received

**Symptoms:**
- Payment succeeds but order not confirmed
- Webhook events not processed

**Solutions:**
1. Verify webhook endpoint URL is correct
2. Check `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
3. Verify webhook endpoint is accessible (HTTPS in production)
4. Check Stripe webhook logs
5. Verify webhook signature verification

### Duplicate Orders

**Symptoms:**
- Multiple orders created for single payment
- Idempotency not working

**Solutions:**
1. Ensure idempotency key is sent
2. Verify idempotency key is unique per checkout attempt
3. Check database unique constraint on `idempotencyKey`
4. Verify order creation checks for existing order

---

## Frontend Issues

### Build Errors

**Symptoms:**
- `ng build` fails
- TypeScript compilation errors

**Solutions:**
1. Check TypeScript errors:
   ```bash
   npm run build -- --verbose
   ```
2. Verify all imports are correct
3. Check for missing dependencies
4. Clear build cache:
   ```bash
   rm -rf dist .angular
   ```
5. Reinstall dependencies

### Mock Data Not Working

**Symptoms:**
- Mock data not loading
- Still calling real API

**Solutions:**
1. Verify `enableMockData: true` in `environment.ts`
2. Check service is checking mock flag
3. Restart development server
4. Clear browser cache
5. Verify mock data service is imported

### Routing Issues

**Symptoms:**
- Routes not working
- 404 on navigation

**Solutions:**
1. Verify route is defined in `app.routes.ts`
2. Check route path matches exactly
3. Verify lazy loading syntax
4. Check for route guards blocking access
5. Verify base href in `index.html`

### State Not Updating

**Symptoms:**
- UI not reflecting changes
- Signals not updating

**Solutions:**
1. Verify signal is being updated in service
2. Check component is using readonly signal
3. Verify change detection is running
4. Check for async operations not completing
5. Verify observable is subscribed

---

## Performance Issues

### Slow API Responses

**Symptoms:**
- Long response times
- Timeout errors

**Solutions:**
1. Check database query performance
2. Add database indexes
3. Use pagination for large datasets
4. Check for N+1 queries
5. Enable query logging to identify slow queries

### Slow Frontend Load

**Symptoms:**
- Long initial load time
- Slow page transitions

**Solutions:**
1. Enable lazy loading for routes
2. Optimize images
3. Enable production build optimizations
4. Check bundle size
5. Use code splitting

---

## Email Issues

### Emails Not Sending

**Symptoms:**
- Order confirmations not received
- Email service errors

**Solutions:**
1. Verify `RESEND_API_KEY` is correct
2. Check `EMAIL_FROM` is valid
3. Verify Resend account is active
4. Check email service logs
5. Verify email addresses are valid

---

## Environment Issues

### Environment Variables Not Loading

**Symptoms:**
- Configuration values are undefined
- Default values being used

**Solutions:**
1. Verify `.env` file exists
2. Check `.env` file is in correct location
3. Restart server after changing `.env`
4. Verify variable names match exactly
5. Check for typos in variable names

### Wrong Environment

**Symptoms:**
- Using production config in development
- API calls going to wrong URL

**Solutions:**
1. Check `NODE_ENV` value
2. Verify correct environment file is used
3. Check Angular environment configuration
4. Verify build configuration

---

## Common Error Messages

### "Cannot find module '@prisma/client'"

**Solution:**
```bash
npx prisma generate
```

### "Port 3000 is already in use"

**Solution:**
```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### "Schema drift detected"

**Solution:**
```bash
# Reset database (WARNING: deletes data)
npx prisma migrate reset

# Or create new migration
npx prisma migrate dev --name fix_drift
```

### "Unauthorized" (401)

**Solutions:**
1. Check authentication token
2. Verify session exists in database
3. Check token expiration
4. Clear cookies and re-login

### "Forbidden" (403)

**Solutions:**
1. Verify user role
2. Check route requires correct role
3. Verify role guard configuration

---

## Debugging Tips

### Enable Debug Logging

**Backend:**
```env
LOG_LEVEL=debug
```

**Frontend:**
- Use browser DevTools
- Enable Angular DevTools
- Check Network tab for API calls

### Database Debugging

```bash
# View database in GUI
npx prisma studio

# Check database directly
psql $DATABASE_URL

# View recent queries
SELECT * FROM pg_stat_activity;
```

### API Debugging

- Use Postman or Insomnia
- Check request/response in browser Network tab
- Review backend logs
- Check error responses for details

---

## Getting Help

### Check Logs

**Backend:**
```bash
# PM2 logs
pm2 logs

# Application logs
tail -f logs/app.log
```

**Frontend:**
- Browser console
- Network tab
- Angular DevTools

### Common Resources

- Prisma Documentation: https://www.prisma.io/docs
- Fastify Documentation: https://www.fastify.io/docs
- Angular Documentation: https://angular.io/docs
- Stripe Documentation: https://stripe.com/docs

---

## Prevention

### Best Practices

1. **Always validate inputs** - Use Zod schemas
2. **Handle errors gracefully** - Don't expose internals
3. **Use transactions** - For multi-step operations
4. **Test locally first** - Before deploying
5. **Keep dependencies updated** - Security patches
6. **Use environment variables** - Never hardcode secrets
7. **Monitor logs** - Catch issues early
8. **Use TypeScript strictly** - Catch errors at compile time

---

**Back to:** [Documentation Index](README.md)

