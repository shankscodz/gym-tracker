from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from api.models import MuscleGroup, SubExercise, WorkoutLog, WorkoutExerciseLog

User = get_user_model()

class GymTrackerAPITests(APITestCase):

    def setUp(self):
        # Create test users
        self.user1 = User.objects.create_user(
            username='user1',
            email='user1@test.com',
            password='Password123'
        )
        self.user2 = User.objects.create_user(
            username='user2',
            email='user2@test.com',
            password='Password123'
        )
        
        # Create muscle groups and exercises
        self.legs = MuscleGroup.objects.create(name='Legs', code='LEG')
        self.squat = SubExercise.objects.create(name='Barbell Squats', muscle_group=self.legs)
        self.press = SubExercise.objects.create(name='Leg Press', muscle_group=self.legs)

        # URLs
        self.register_url = reverse('register')
        self.token_url = reverse('token_obtain_pair')
        self.muscle_groups_url = reverse('muscle-groups')
        self.workout_list_url = reverse('workout-list')

    def get_jwt_token(self, email, password):
        response = self.client.post(self.token_url, {'email': email, 'password': password})
        return response.data['access']

    def test_user_registration(self):
        data = {
            'username': 'newuser',
            'email': 'newuser@test.com',
            'password': 'NewPassword123'
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email='newuser@test.com').exists())

    def test_user_login(self):
        response = self.client.post(self.token_url, {
            'email': 'user1@test.com',
            'password': 'Password123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_fetch_muscle_groups_requires_auth(self):
        response = self.client.get(self.muscle_groups_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        token = self.get_jwt_token('user1@test.com', 'Password123')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(self.muscle_groups_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Legs')

    def test_create_workout_log(self):
        token = self.get_jwt_token('user1@test.com', 'Password123')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        data = {
            'name': 'Leg Day',
            'is_draft': False,
            'exercises': [
                {
                    'sub_exercise_id': self.squat.id,
                    'weight': '100.50',
                    'reps': 8,
                    'sets': 4,
                    'order': 0
                },
                {
                    'sub_exercise_id': self.press.id,
                    'weight': '200.00',
                    'reps': 10,
                    'sets': 3,
                    'order': 1
                }
            ]
        }
        
        response = self.client.post(self.workout_list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(WorkoutLog.objects.count(), 1)
        self.assertEqual(WorkoutExerciseLog.objects.count(), 2)
        
        log = WorkoutLog.objects.first()
        self.assertEqual(log.user, self.user1)
        self.assertEqual(log.name, 'Leg Day')
        self.assertEqual(log.is_draft, False)

    def test_workout_logs_are_isolated(self):
        WorkoutLog.objects.create(user=self.user1, name="User1 Workout", is_draft=False)
        
        token = self.get_jwt_token('user2@test.com', 'Password123')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        response = self.client.get(self.workout_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)
        
        token = self.get_jwt_token('user1@test.com', 'Password123')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        response = self.client.get(self.workout_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'User1 Workout')
