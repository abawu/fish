# Etxplore API Documentation

## Base URL

```
http://localhost:3000/api/v1
```

## Getting Started

1. Make sure your backend server is running on `http://localhost:3000` (or set the API base for the frontend using Vite env below)
2. The frontend is configured to connect to this backend automatically
3. All authenticated requests require a Bearer token in the Authorization header

## Authentication

All authenticated requests automatically include the token from localStorage via axios interceptors.

### Endpoints

#### Sign Up

```
POST /api/v1/users/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "passwordConfirm": "password123"
}

Response: { token: string, data: { user: {...} } }
```

#### Login

```
POST /api/v1/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: { token: string, data: { user: {...} } }
```

#### Forgot Password

```
POST /api/v1/users/forgotPassword
Content-Type: application/json

{
  "email": "john@example.com"
}

Response: { status: "success", message: "Token sent to email" }
```

#### Reset Password

```
PATCH /api/v1/users/resetPassword/:token
Content-Type: application/json

{
  "password": "newpassword123",
  "passwordConfirm": "newpassword123"
}

Response: { token: string, data: { user: {...} } }
```

#### Update My Password

```
PATCH /api/v1/users/updateMyPassword
Authorization: Bearer {token}
Content-Type: application/json

{
  "passwordCurrent": "currentpassword",
  "password": "newpassword123",
  "passwordConfirm": "newpassword123"
}

Response: { token: string, data: { user: {...} } }
```

## Experiences

The platform has been transformed from Tours to an Experience Booking Platform where users can become hosts and create experiences.

### Endpoints

#### Get All Experiences

```
GET /api/v1/experiences
GET /api/v1/experiences?sort=price

Response: { status: "success", results: number, data: { data: [...] } }
```

**Supported Query Parameters:**

- `price[gte]`, `price[lte]`, `price[gt]`, `price[lt]`: Filter by price
- `sort`: price, -price, ratingsAverage, -ratingsAverage, createdAt, -createdAt
- `fields`: Select specific fields (e.g., fields=title,duration,price)
- `page`, `limit`: Pagination

#### Get Single Experience

```
GET /api/v1/experiences/:id

Response: { status: "success", data: { data: {...} } }
```

#### Get Top 5 Cheap Experiences

```
GET /api/v1/experiences/top-5-cheap

Response: { status: "success", results: number, data: { data: [...] } }
```

#### Get Experience Statistics

```
GET /api/v1/experiences/experience-stats

Response: { status: "success", data: { stats: [...] } }
```

#### Get Monthly Plan

```
GET /api/v1/experiences/monthly-plan/:year
Authorization: Bearer {token}

Example: GET /api/v1/experiences/monthly-plan/2024

Response: { status: "success", data: { plan: [...] } }
```

#### Get Experiences Within Radius

```
GET /api/v1/experiences/experiences-within/:distance/center/:latlng/unit/:unit

Example: GET /api/v1/experiences/experiences-within/200/center/34.111745,-118.113491/unit/mi

Response: { status: "success", results: number, data: { data: [...] } }
```

#### Get Distances to Experiences

```
GET /api/v1/experiences/distances/:latlng/unit/:unit

Example: GET /api/v1/experiences/distances/34.111745,-118.113491/unit/mi

Response: { status: "success", data: { data: [...] } }
```

#### Create Experience (Admin or Approved Host Only)

```
POST /api/v1/experiences
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Traditional Coffee Ceremony",
  "duration": "2 hours",
  "maxGuests": 6,
  "price": 500,
  "description": "Learn traditional Ethiopian coffee preparation",
  "location": "Addis Ababa, Ethiopia",
  "imageCover": "coffee-ceremony.jpg",
  "images": ["image1.jpg", "image2.jpg"]
}

Response: { status: "success", data: { data: {...} } }
```

#### Update Experience (Admin or Host Owner Only)

```
PATCH /api/v1/experiences/:id
Authorization: Bearer {token}
Content-Type: application/json or multipart/form-data (for images)

{
  "price": 550,
  "maxGuests": 8
}

Response: { status: "success", data: { data: {...} } }
```

#### Delete Experience (Admin Only)

```
DELETE /api/v1/experiences/:id
Authorization: Bearer {token}

Response: { status: "success", data: null }
```

## Reviews

### Endpoints

#### Get All Reviews

```
GET /api/v1/reviews
Authorization: Bearer {token}

Response: { status: "success", results: number, data: { data: [...] } }
```

#### Get Single Review

```
GET /api/v1/reviews/:id
Authorization: Bearer {token}

Response: { status: "success", data: { data: {...} } }
```

#### Get Reviews for Experience

```
GET /api/v1/experiences/:experienceId/reviews
Authorization: Bearer {token}

Response: { status: "success", results: number, data: { data: [...] } }
```

#### Create Review

```
POST /api/v1/reviews
Authorization: Bearer {token}
Content-Type: application/json

{
  "review": "Amazing experience!",
  "rating": 5,
  "experience": "experienceId",
  "user": "userId"
}

Response: { status: "success", data: { data: {...} } }
```

#### Create Review for Experience (Nested Route)

```
POST /api/v1/experiences/:experienceId/reviews
Authorization: Bearer {token}
Content-Type: application/json

{
  "review": "Amazing experience!",
  "rating": 5
}

Response: { status: "success", data: { data: {...} } }
```

#### Update Review

```
PATCH /api/v1/reviews/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "rating": 4,
  "review": "Updated review"
}

Response: { status: "success", data: { data: {...} } }
```

#### Delete Review

```
DELETE /api/v1/reviews/:id
Authorization: Bearer {token}

Response: { status: "success", data: null }
```

## Users

### Endpoints

#### Get All Users (Admin Only)

```
GET /api/v1/users
GET /api/v1/users?role=user
Authorization: Bearer {token}

Response: { status: "success", results: number, data: { data: [...] } }
```

#### Get Single User (Admin Only)

```
GET /api/v1/users/:id
Authorization: Bearer {token}

Response: { status: "success", data: { data: {...} } }
```

#### Get Current User

```
GET /api/v1/users/me
Authorization: Bearer {token}

Response: { status: "success", data: { data: {...} } }
```

#### Update Current User

```
PATCH /api/v1/users/updateMe
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "New Name",
  "email": "newemail@example.com"
}

Response: { status: "success", data: { user: {...} } }
```

#### Delete Current User

```
DELETE /api/v1/users/deleteMe
Authorization: Bearer {token}

Response: { status: "success", data: null }
```

#### Update User (Admin Only)

```
PATCH /api/v1/users/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name"
}

Response: { status: "success", data: { data: {...} } }
```

#### Delete User (Admin Only)

```
DELETE /api/v1/users/:id
Authorization: Bearer {token}

Response: { status: "success", data: null }
```

#### Apply to Become a Host

```
POST /api/v1/users/applyForHost
Authorization: Bearer {token}

Response: { status: "success", data: { user: {...} } }
```

#### Get Pending Host Applications (Admin Only)

```
GET /api/v1/users/pending-hosts
Authorization: Bearer {token}

Response: { status: "success", results: number, data: { data: [...] } }
```

#### Approve Host (Admin Only)

```
PATCH /api/v1/users/approve-host/:id
Authorization: Bearer {token}

Response: { status: "success", data: { user: {...} } }
```

#### Reject Host (Admin Only)

```
PATCH /api/v1/users/reject-host/:id
Authorization: Bearer {token}

Response: { status: "success", data: { user: {...} } }
```

## Bookings

### Endpoints

#### Get All Bookings (Admin Only)

```
GET /api/v1/bookings
Authorization: Bearer {token}

Response: { status: "success", results: number, data: { data: [...] } }
```

#### Get Single Booking

```
GET /api/v1/bookings/:id
Authorization: Bearer {token}

Response: { status: "success", data: { data: {...} } }
```

#### Get My Bookings

```
GET /api/v1/bookings/my-bookings
Authorization: Bearer {token}

Response: { status: "success", results: number, data: { data: [...] } }
```

#### Create Booking

```
POST /api/v1/bookings
Authorization: Bearer {token}
Content-Type: application/json

{
  "experience": "experienceId"
}

Response: { status: "success", data: { data: {...} } }
```

#### Get Checkout Session

```
GET /api/v1/bookings/checkout-session/:experienceId
Authorization: Bearer {token}

Response: { status: "success", data: { session } }
```

## Frontend Pages Connected to API

### Public Pages

1. **Home** (`/`)

   - Fetches top 5 cheap experiences
   - Uses: `GET /api/v1/experiences/top-5-cheap`

2. **All Experiences** (`/experiences` or `/tours`)

   - Lists all experiences with filters
   - Uses: `GET /api/v1/experiences` with query params

3. **Single Experience** (`/experiences/:id` or `/tours/:id`)

   - Shows experience details and reviews
   - Uses: `GET /api/v1/experiences/:id`
   - Uses: `GET /api/v1/experiences/:experienceId/reviews`

4. **About** (`/about`)

   - Static page

5. **Contact** (`/contact`)

   - Contact form (frontend only for now)

6. **Login** (`/login`)

   - Uses: `POST /api/v1/users/login`

7. **Signup** (`/signup`)

   - Uses: `POST /api/v1/users/signup`

8. **Forgot Password** (`/forgot-password`)

   - Uses: `POST /api/v1/users/forgotPassword`

9. **Reset Password** (`/reset-password/:token`)
   - Uses: `PATCH /api/v1/users/resetPassword/:token`

### Protected Pages (Require Authentication)

1. **Profile** (`/profile`)

   - Shows user info
   - Uses: `GET /api/v1/users/me`

2. **My Bookings** (`/my-bookings`)

   - Lists user's bookings
   - Uses: `GET /api/v1/bookings/my-bookings`

3. **My Reviews** (`/my-reviews`)
   - Lists user's reviews
   - Uses: `GET /api/v1/reviews` (filtered by user)
   - Delete review: `DELETE /api/v1/reviews/:id`

## Testing Locally

### Prerequisites

1. Backend server running on `http://localhost:3000`
2. Frontend running (default: `http://localhost:5173` with Vite). When deploying the frontend separately, set the environment variable `VITE_API_BASE_URL` at build time to point to your backend API (for example: `https://api.yourdomain.com/api/v1`).

### Step-by-Step Testing Guide

#### 1. Test Authentication Flow

1. Go to `/signup` and create a new account
2. Check that you're redirected to home and see your name in the navigation
3. Logout from `/profile`
4. Go to `/login` and login with your credentials
5. Test "Forgot Password" link (if backend email is configured)

#### 2. Test Experiences

1. Go to `/experiences` to see all experiences
2. Use the sort filters to filter experiences
3. Click on an experience to view details at `/experiences/:id`

#### 3. Test Host Application

1. While logged in as a regular user, go to `/profile`
2. Click "Apply to Become a Host" button
3. Admin can approve/reject host applications in `/admin/users`

#### 4. Test Bookings

1. While logged in, go to an experience detail page
2. Click "Join Experience" to initiate booking
3. Go to `/my-bookings` to see your bookings
4. Check that bookings display correctly

#### 5. Test Reviews

1. While logged in, go to `/my-reviews`
2. If you have reviews, they should display
3. Test delete functionality
4. Try creating a review on an experience page

### Troubleshooting

#### CORS Issues

If you see CORS errors, make sure your backend has CORS configured:

```javascript
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
```

#### 401 Unauthorized

- Check that the token is being stored in localStorage
- Check that the Authorization header is being sent
- Verify token hasn't expired

#### Network Errors

- Ensure backend is running on correct port (3000)
- Check that API_BASE_URL in `src/lib/api.ts` is correct
- Use browser DevTools Network tab to inspect requests

## API Response Format

All API responses follow this structure:

### Success Response

```json
{
  "status": "success",
  "results": 10,  // Optional, for collections
  "data": {
    "data": { ... } // Or array of data
  }
}
```

### Error Response

```json
{
  "status": "fail", // or "error"
  "message": "Error message here"
}
```

## Environment Variables

The frontend uses these configuration:

- `API_BASE_URL`: Set in `src/lib/api.ts` to `http://localhost:3000/api/v1`

For production, update this to your production API URL.
