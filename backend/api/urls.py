from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, UserProfileView, MuscleGroupListView, SubExerciseListView, WorkoutLogViewSet

router = DefaultRouter()
router.register(r'workouts', WorkoutLogViewSet, basename='workout')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('muscle-groups/', MuscleGroupListView.as_view(), name='muscle-groups'),
    path('exercises/', SubExerciseListView.as_view(), name='exercises'),
    path('', include(router.urls)),
]
