# Trip Planner Backend

### Developing locally -
1. Install npm packages `npm i`
2. Set env variables
    ```
    NODE_ENV development
    
    MONGODB_URL mongodb://localhost:27017/trip-planner
    BASE_URL http://localhost:4000
    FRONTEND_BASE_URL http://localhost:8081
    
    # Get from team
    GOOGLE_CLIENT_ID 
    GOOGLE_CLIENT_SECRET 
    FACEBOOK_CLIENT_ID 
    FACEBOOK_CLIENT_SECRET 
    
    # Make email account with ethereal
    EMAIL_HOST smtp.ethereal.email
    EMAIL_PORT 587
    EMAIL_USER <username>
    EMAIL_PASS <password>
    ```
3. Run server (defaults to http://localhost:4000)
    - With type checking `npm run tdev`
    - Without type checking `npm run dev`

### Endpoints
- Auth
  - POST /auth/login, /auth/sign-up, /auth/verify-email, /auth/request-reset-password, /auth/reset-password
- OAuth
  - GET /oauth/google/redirect, /oauth/facebook/redirect
  - POST /oauth/google/callback, /oauth/facebook/callback
- Plans
  - GET, POST /plans
  - PUT, DELETE /plans/:id