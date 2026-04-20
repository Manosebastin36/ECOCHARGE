from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display  = ['id', 'user', 'station_name', 'station_location',
                     'payment_method', 'total_amount', 'status', 'created_at']
    list_filter   = ['status', 'payment_method']
    search_fields = ['user__username', 'station_name', 'station_location']
    ordering      = ['-created_at']

