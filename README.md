# Trip Planner Backend

### Developing locally -
1. Install npm packages `npm i`
2. Set env variables
    ```
    NODE_ENV development
    
    MONGODB_URL mongodb://localhost:27017/trip-planner
    BASE_URL http://localhost:4000
    FRONTEND_BASE_URL http://localhost:8081
    BASE_URL_APPLE_OAUTH https://iftwmeqawuiu.loca.lt
    
    JWT_SECRET <generate-random-one>
    # Get from team
    GOOGLE_CLIENT_ID 
    GOOGLE_CLIENT_SECRET 
    FACEBOOK_CLIENT_ID 
    FACEBOOK_CLIENT_SECRET 
    APPLE_CLIENT_ID 
    APPLE_TEAM_ID
    APPLE_KEY_ID 
    APPLE_PRIVATE_KEY
    
    # Make email account with ethereal
    EMAIL_HOST smtp.ethereal.email
    EMAIL_PORT 587
    EMAIL_USER <username>
    EMAIL_PASS <password>
    ```
3. Run server (defaults to http://localhost:4000)
    - With type checking `npm run tdev`
    - Without type checking `npm run dev`
4. For apple oauth to work you must run `npm run lt` in order to create a publicly accessible url (https://iftwmeqawuiu.loca.lt) that routes requests to localhost:4000 (please note the service can be quite unreliable, so I'd only bother doing this when testing apple oauth)


### Endpoints
- Auth 
  - POST /auth/login
    - Return jwt if details match existing user
    - Body - { email: string, password: string }
  - POST /auth/sign-up 
    - Create user, send verification email
    - Body - { email: string, password: string }
  - POST /auth/verify-email - verification email links to frontend with jwt in querystring => frontend sends request here with jwt to make user verified 
  - POST /auth/request-reset-password 
    - Send password reset email out
    - Body - { email: string }
  - POST /auth/reset-password
    - Password reset email links to frontend with jwt in querystring => frontend sends requests here with jwt to reset password
    - Body - { password: string }
- OAuth
  - GET /oauth/google/redirect /oauth/facebook/redirect /oauth/apple/redirect - Redirects user to oauth provider sign-in page
  - POST /oauth/google/callback, /oauth/facebook/callback, /oauth/apple/callback - oauth providers automatically redirects here once user has signed in
- Plans
  - GET /users/me/plans - get all the plans of the logged-in user
  - POST /users/me/plans - 
    - Create plan for the logged-in user
    - Body - { name: string, startDate: date, endDate: date, travellerCount: number }
  - PATCH /plans/:id - 
    - Update plan with given id if it belongs to logged-in user
    - Body - { name: string, startDate: date, endDate: date, travellerCount: number }
  - DELETE /plans/:id - delete plan with given id if it belongs to logged-in user
- Users
  - GET /users/me - get details of logged-in user
  - PATCH /users/me
    - Update details of logged-in user
    - { picture?: string, name?: string, gender?: string, dob?: date, zipcode?: string }