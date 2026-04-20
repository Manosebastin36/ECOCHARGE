from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='Booking',
            fields=[
                ('id',               models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('station_id',       models.IntegerField()),
                ('station_name',     models.CharField(max_length=200)),
                ('station_location', models.CharField(max_length=200)),
                ('payment_method',   models.CharField(max_length=50)),
                ('booking_fee',      models.DecimalField(decimal_places=2, default=30.0, max_digits=8)),
                ('charging_fee',     models.DecimalField(decimal_places=2, default=200.0, max_digits=8)),
                ('total_amount',     models.DecimalField(decimal_places=2, default=230.0, max_digits=8)),
                ('status',           models.CharField(max_length=20, choices=[('confirmed', 'Confirmed'), ('cancelled', 'Cancelled')], default='confirmed')),
                ('created_at',       models.DateTimeField(auto_now_add=True)),
                ('user',             models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bookings', to='auth.user')),
            ],
            options={'ordering': ['-created_at']},
        ),
    ]
