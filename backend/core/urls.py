from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView,
    StationListView, StationDetailView,
    BookingView, BookingDetailView,
    AdminBookingView,
    UserListView, UserDetailView,
)

urlpatterns = [
    # Auth
    path('register/',       RegisterView.as_view(),    name='register'),
    path('login/',          LoginView.as_view(),        name='login'),
    path('token/refresh/',  TokenRefreshView.as_view(), name='token_refresh'),

    # Stations (GET = public, POST/PUT/PATCH/DELETE = admin)
    path('stations/',          StationListView.as_view(),   name='stations'),
    path('stations/<int:pk>/', StationDetailView.as_view(), name='station_detail'),

    # Bookings (user)
    path('bookings/',          BookingView.as_view(),       name='bookings'),
    path('bookings/<int:pk>/', BookingDetailView.as_view(), name='booking_detail'),

    # Admin only
    path('admin/bookings/', AdminBookingView.as_view(), name='admin_bookings'),
    path('users/',          UserListView.as_view(),     name='users'),
    path('users/<int:pk>/', UserDetailView.as_view(),   name='user_detail'),
]
