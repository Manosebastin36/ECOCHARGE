from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Station',
            fields=[
                ('id',           models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name',         models.CharField(max_length=200)),
                ('location',     models.CharField(max_length=200)),
                ('status',       models.CharField(max_length=20, choices=[('Available','Available'),('Busy','Busy')], default='Available')),
                ('charger_type', models.CharField(max_length=50, default='Type 2')),
                ('power_kw',     models.IntegerField(default=22)),
                ('lat',          models.FloatField(default=0.0)),
                ('lng',          models.FloatField(default=0.0)),
                ('created_at',   models.DateTimeField(auto_now_add=True)),
            ],
            options={'ordering': ['name']},
        ),
    ]
