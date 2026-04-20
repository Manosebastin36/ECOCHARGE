from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Booking, Station


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model  = User
        fields = ['id', 'username', 'email', 'password']

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )


class StationSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Station
        fields = ['id', 'name', 'location', 'status', 'charger_type', 'power_kw', 'lat', 'lng']


class BookingSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model  = Booking
        fields = ['id', 'username', 'station_id', 'station_name', 'station_location',
                  'payment_method', 'booking_fee', 'charging_fee', 'total_amount',
                  'status', 'created_at']
        read_only_fields = ['id', 'username', 'booking_fee', 'charging_fee',
                            'total_amount', 'status', 'created_at']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ['id', 'username', 'email', 'is_staff', 'is_active', 'date_joined']
