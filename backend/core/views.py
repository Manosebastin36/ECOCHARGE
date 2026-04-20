from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from .models import Booking, Station
from .serializers import (
    RegisterSerializer, BookingSerializer,
    StationSerializer, UserSerializer,
)


# ══════════════════════════════════════════════
#  AUTH — REGISTER
# ══════════════════════════════════════════════
class RegisterView(APIView):
    authentication_classes = []          # no token needed
    permission_classes     = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                "message": f"User '{user.username}' registered successfully!",
                "access":  str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id":       user.id,
                    "username": user.username,
                    "email":    user.email,
                    "is_staff": user.is_staff,
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ══════════════════════════════════════════════
#  AUTH — LOGIN
# ══════════════════════════════════════════════
class LoginView(APIView):
    authentication_classes = []          # no token needed to login
    permission_classes     = [AllowAny]

    def post(self, request):
        username = request.data.get("username", "").strip()
        password = request.data.get("password", "").strip()

        if not username or not password:
            return Response(
                {"error": "Username and password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not User.objects.filter(username=username).exists():
            return Response(
                {"error": "No account found. Please register first."},
                status=status.HTTP_404_NOT_FOUND
            )

        user = authenticate(request=request, username=username, password=password)

        if user is not None:
            if not user.is_active:
                return Response(
                    {"error": "Account is disabled."},
                    status=status.HTTP_403_FORBIDDEN
                )
            refresh = RefreshToken.for_user(user)
            return Response({
                "message":  "Login successful!",
                "access":   str(refresh.access_token),
                "refresh":  str(refresh),
                "user": {
                    "id":       user.id,
                    "username": user.username,
                    "email":    user.email,
                    "is_staff": user.is_staff,
                }
            }, status=status.HTTP_200_OK)

        return Response(
            {"error": "Incorrect password. Please try again."},
            status=status.HTTP_401_UNAUTHORIZED
        )


# ══════════════════════════════════════════════
#  STATIONS — GET public / POST admin only
# ══════════════════════════════════════════════
class StationListView(APIView):
    authentication_classes = [JWTAuthentication]

    def get_permissions(self):
        # GET is open to everyone
        if self.request.method == "GET":
            return [AllowAny()]
        # POST / PUT / DELETE requires admin
        return [IsAdminUser()]

    def get(self, request):
        stations = Station.objects.all()
        return Response(
            StationSerializer(stations, many=True).data,
            status=status.HTTP_200_OK
        )

    def post(self, request):
        print("POST /api/stations/ — user:", request.user,
              "| is_staff:", getattr(request.user, 'is_staff', False))
        serializer = StationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ══════════════════════════════════════════════
#  STATIONS — PUT / PATCH / DELETE admin only
# ══════════════════════════════════════════════
class StationDetailView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes     = [IsAdminUser]

    def get_object(self, pk):
        try:
            return Station.objects.get(pk=pk)
        except Station.DoesNotExist:
            return None

    def get(self, request, pk):
        s = self.get_object(pk)
        if not s:
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(StationSerializer(s).data)

    def put(self, request, pk):
        s = self.get_object(pk)
        if not s:
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = StationSerializer(s, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        s = self.get_object(pk)
        if not s:
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = StationSerializer(s, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        s = self.get_object(pk)
        if not s:
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        s.delete()
        return Response({"message": "Station deleted."}, status=status.HTTP_204_NO_CONTENT)


# ══════════════════════════════════════════════
#  BOOKINGS — User: list own / create
# ══════════════════════════════════════════════
class BookingView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes     = [IsAuthenticated]

    def get(self, request):
        bookings = Booking.objects.filter(user=request.user)
        return Response(BookingSerializer(bookings, many=True).data)

    def post(self, request):
        data     = request.data
        required = ['station_id', 'station_name', 'station_location', 'payment_method']
        for field in required:
            if not data.get(field):
                return Response(
                    {"error": f"'{field}' is required."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Mark station Busy in DB
        try:
            st = Station.objects.get(pk=data['station_id'])
            st.status = 'Busy'
            st.save()
        except Station.DoesNotExist:
            pass

        booking = Booking.objects.create(
            user             = request.user,
            station_id       = data['station_id'],
            station_name     = data['station_name'],
            station_location = data['station_location'],
            payment_method   = data['payment_method'],
            booking_fee      = 30.00,
            charging_fee     = 200.00,
            total_amount     = 230.00,
            status           = 'confirmed',
        )
        return Response({
            "message": "Booking confirmed!",
            "booking": BookingSerializer(booking).data,
        }, status=status.HTTP_201_CREATED)


# ══════════════════════════════════════════════
#  BOOKINGS — Cancel (user own / admin any)
# ══════════════════════════════════════════════
class BookingDetailView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes     = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            booking = (
                Booking.objects.get(pk=pk)
                if request.user.is_staff
                else Booking.objects.get(pk=pk, user=request.user)
            )
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

        # Set station back to Available
        try:
            st = Station.objects.get(pk=booking.station_id)
            st.status = 'Available'
            st.save()
        except Station.DoesNotExist:
            pass

        booking.status = 'cancelled'
        booking.save()
        return Response({"message": "Booking cancelled."})


# ══════════════════════════════════════════════
#  ADMIN — All bookings
# ══════════════════════════════════════════════
class AdminBookingView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes     = [IsAdminUser]

    def get(self, request):
        bookings = Booking.objects.all()
        return Response(BookingSerializer(bookings, many=True).data)


# ══════════════════════════════════════════════
#  ADMIN — Users list
# ══════════════════════════════════════════════
class UserListView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes     = [IsAdminUser]

    def get(self, request):
        users = User.objects.all().order_by('-date_joined')
        return Response(UserSerializer(users, many=True).data)


# ══════════════════════════════════════════════
#  ADMIN — User activate / delete
# ══════════════════════════════════════════════
class UserDetailView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes     = [IsAdminUser]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        if 'is_active' in request.data:
            user.is_active = request.data['is_active']
            user.save()
        return Response(UserSerializer(user).data)

    def delete(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        user.delete()
        return Response({"message": "User deleted."})
