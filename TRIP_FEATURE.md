# Trip Details Feature

This feature allows users to view detailed ticket/trip information for their subscriptions.

## Overview

When a subscription is created, it can have associated trip details that show available bus trips that match the subscription criteria. Each trip includes:

- Route code and name
- Departure and arrival times
- Departure and arrival stations
- Travel duration
- Available seats
- Price

## Backend API

### Trip Model

The `Trip` model stores detailed information about bus trips:

```go
type Trip struct {
    ID              uuid.UUID  // UUID v7
    SubscriptionID  uuid.UUID  // Related subscription
    RouteCode       string     // e.g., "SGN-HAN"
    RouteName       string     // e.g., "Sài Gòn - Hà Nội"
    DepartureTime   time.Time
    ArrivalTime     time.Time
    DepartureStation string
    ArrivalStation  string
    TravelTime      string     // e.g., "12h 30m"
    AvailableSeats  int32
    Price           float64
    CreatedAt       int64
    UpdatedAt       int64
}
```

### API Endpoints

#### Create a Trip
```
POST /api/trips
```

Body:
```json
{
  "subscription_id": "uuid",
  "route_code": "SGN-HAN",
  "route_name": "Sài Gòn - Hà Nội",
  "departure_time": "2025-10-25T08:00:00Z",
  "arrival_time": "2025-10-25T20:00:00Z",
  "departure_station": "Bến xe Miền Đông",
  "arrival_station": "Bến xe Gia Lâm",
  "travel_time": "12h 00m",
  "available_seats": 25,
  "price": 450000
}
```

#### Get Trips by Subscription
```
GET /api/trips/subscription/:subscriptionId
```

Returns an array of trips for the specified subscription, ordered by departure time.

#### Delete a Trip
```
DELETE /api/trips/:id
```

### Get User Subscriptions (Updated)

The `GET /api/subscriptions/:userId` endpoint now returns subscriptions with their associated trips:

```json
[
  {
    "id": "uuid",
    "user_id": "auth0|123",
    "email": "user@example.com",
    "origin_id": 1,
    "origin_code": "SGN",
    "destination_id": 2,
    "destination_code": "HAN",
    "date_time": "2025-10-25T00:00:00Z",
    "is_active": true,
    "trips": [
      {
        "id": "uuid",
        "subscription_id": "uuid",
        "route_code": "SGN-HAN",
        "route_name": "Sài Gòn - Hà Nội",
        "departure_time": "2025-10-25T08:00:00Z",
        "arrival_time": "2025-10-25T20:00:00Z",
        "departure_station": "Bến xe Miền Đông",
        "arrival_station": "Bến xe Gia Lâm",
        "travel_time": "12h 00m",
        "available_seats": 25,
        "price": 450000
      }
    ]
  }
]
```

## Frontend

### Dashboard Display

The dashboard now displays trip details for each subscription:

- **No trips found**: Shows "Chưa tìm thấy chuyến xe phù hợp"
- **Trips available**: Shows a list of trips with all details

### Admin Page

A new admin page at `/admin` allows manual entry of trip data for testing purposes. This is useful for:

1. Testing the UI without integrating with an external bus ticket API
2. Demonstrating the feature
3. Manual data entry if needed

To access: Navigate to `http://localhost:3000/admin` after logging in.

## Usage Flow

1. User creates a subscription for a route (e.g., SGN → HAN)
2. System checks for available trips (currently manual via admin page)
3. Trips are associated with the subscription
4. User sees trip details in the dashboard
5. User can see:
   - Route information
   - Departure/arrival times and stations
   - Travel duration
   - Available seats
   - Price

## Future Enhancements

- Integration with FUTA Bus API for automatic trip discovery
- Automatic notification when new trips are found
- Trip comparison and booking links
- Price history and alerts
