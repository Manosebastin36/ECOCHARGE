from django.db import models
from django.contrib.auth.models import User


class Station(models.Model):
    STATUS_CHOICES = [
        ('Available', 'Available'),
        ('Busy',      'Busy'),
    ]
    name         = models.CharField(max_length=200)
    location     = models.CharField(max_length=200)
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Available')
    charger_type = models.CharField(max_length=50, default='Type 2')
    power_kw     = models.IntegerField(default=22)
    lat          = models.FloatField(default=0.0)
    lng          = models.FloatField(default=0.0)
    created_at   = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} — {self.location}"

    class Meta:
        ordering = ['name']


class Booking(models.Model):
    STATUS_CHOICES = [
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]
    user             = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    station_id       = models.IntegerField()
    station_name     = models.CharField(max_length=200)
    station_location = models.CharField(max_length=200)
    payment_method   = models.CharField(max_length=50)
    booking_fee      = models.DecimalField(max_digits=8, decimal_places=2, default=30.00)
    charging_fee     = models.DecimalField(max_digits=8, decimal_places=2, default=200.00)
    total_amount     = models.DecimalField(max_digits=8, decimal_places=2, default=230.00)
    status           = models.CharField(max_length=20, choices=STATUS_CHOICES, default='confirmed')
    created_at       = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} → {self.station_name}"

    class Meta:
        ordering = ['-created_at']
