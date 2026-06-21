from django.core.management.base import BaseCommand
from api.models import MuscleGroup, SubExercise
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with initial muscle groups, sub-exercises, and a default admin user.'

    def handle(self, *args, **options):
        # 1. Seed Muscle Groups and Sub-Exercises
        data = {
            'Legs': {
                'code': 'LEG',
                'exercises': [
                    'Leg Extensions',
                    'Barbell Squats',
                    'Bulgarian Squats',
                    'Hamstring Curls',
                    'Leg Press',
                    'Hyperextension',
                    'Calf Raise',
                    'Abductor Machine'
                ]
            },
            'Glutes': {
                'code': 'GLUTES',
                'exercises': [
                    'Hip Thrust',
                    'Sumo Deadlift',
                    'Bulgarian Squats',
                    'Glute Bridges',
                    'Squats',
                    'Leg Press',
                    'Back Extension',
                    'Abductor Machine'
                ]
            },
            'Core/Abs': {
                'code': 'Abs',
                'exercises': [
                    'Plank',
                    'Superman',
                    'Mountain Climber',
                    'Leg Raisers',
                    'Bicycle Crunch',
                    'Flutter Kicks'
                ]
            },
            'Chest': {
                'code': 'CHEST',
                'exercises': [
                    'Bench Press',
                    'Incline Dumbbell Press',
                    'Chest Fly',
                    'Push-ups'
                ]
            },
            'Triceps': {
                'code': 'tri',
                'exercises': [
                    'Tricep Pushdowns',
                    'Overhead Tricep Extension',
                    'Skull Crushers',
                    'Dips'
                ]
            },
            'Biceps': {
                'code': 'bisep',
                'exercises': [
                    'Barbell Curls',
                    'Hammer Curls',
                    'Preacher Curls',
                    'Concentration Curls'
                ]
            },
            'Shoulders': {
                'code': 'sholder',
                'exercises': [
                    'Overhead Press',
                    'Lateral Raises',
                    'Front Raises',
                    'Face Pulls'
                ]
            },
            'Lat': {
                'code': 'LAT',
                'exercises': [
                    'Pullups',
                    'Machine Row',
                    'Cable Row',
                    'Hyperextension',
                    'Barbell Row',
                    'T-Bar Row',
                    'Lat Pulldown'
                ]
            }
        }

        for mg_name, mg_data in data.items():
            mg, created = MuscleGroup.objects.get_or_create(
                name=mg_name,
                defaults={'code': mg_data['code']}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created Muscle Group: {mg_name}"))
            else:
                mg.code = mg_data['code']
                mg.save()

            for ex_name in mg_data['exercises']:
                ex, ex_created = SubExercise.objects.get_or_create(
                    name=ex_name,
                    muscle_group=mg
                )
                if ex_created:
                    self.stdout.write(self.style.SUCCESS(f"  Created Exercise: {ex_name}"))

        # 2. Seed Default Admin User
        admin_email = 'admin@gymtracker.com'
        admin_username = 'admin'
        admin_password = 'AdminPassword123'
        
        if not User.objects.filter(email=admin_email).exists():
            User.objects.create_superuser(
                username=admin_username,
                email=admin_email,
                password=admin_password
            )
            self.stdout.write(self.style.SUCCESS(f"Created Superuser: {admin_email} / {admin_password}"))
        else:
            self.stdout.write(self.style.WARNING(f"Superuser {admin_email} already exists."))
