from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .models import MuscleGroup, SubExercise, WorkoutLog
from .serializers import (
    UserRegisterSerializer,
    UserSerializer,
    MuscleGroupSerializer,
    SubExerciseSerializer,
    WorkoutLogSerializer
)

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserRegisterSerializer

class UserProfileView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class MuscleGroupListView(generics.ListAPIView):
    queryset = MuscleGroup.objects.all()
    serializer_class = MuscleGroupSerializer
    permission_classes = (permissions.IsAuthenticated,)

class SubExerciseListView(generics.ListAPIView):
    queryset = SubExercise.objects.all()
    serializer_class = SubExerciseSerializer
    permission_classes = (permissions.IsAuthenticated,)

class WorkoutLogViewSet(viewsets.ModelViewSet):
    serializer_class = WorkoutLogSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        # Restrict queries to the authenticated user's logs only
        return WorkoutLog.objects.filter(user=self.request.user).prefetch_related('exercises__sub_exercise')
