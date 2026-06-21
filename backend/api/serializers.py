from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import MuscleGroup, SubExercise, WorkoutLog, WorkoutExerciseLog

User = get_user_model()

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data.get('username'),
            email=validated_data.get('email'),
            password=validated_data.get('password')
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'is_staff', 'is_superuser')

class SubExerciseSerializer(serializers.ModelSerializer):
    muscle_group_name = serializers.CharField(source='muscle_group.name', read_only=True)
    muscle_group_code = serializers.CharField(source='muscle_group.code', read_only=True)

    class Meta:
        model = SubExercise
        fields = ('id', 'name', 'muscle_group', 'muscle_group_name', 'muscle_group_code')

class MuscleGroupSerializer(serializers.ModelSerializer):
    exercises = SubExerciseSerializer(many=True, read_only=True)

    class Meta:
        model = MuscleGroup
        fields = ('id', 'name', 'code', 'exercises')

class WorkoutExerciseLogSerializer(serializers.ModelSerializer):
    sub_exercise_id = serializers.PrimaryKeyRelatedField(
        queryset=SubExercise.objects.all(), source='sub_exercise'
    )
    sub_exercise_name = serializers.CharField(source='sub_exercise.name', read_only=True)
    muscle_group_name = serializers.CharField(source='sub_exercise.muscle_group.name', read_only=True)
    muscle_group_code = serializers.CharField(source='sub_exercise.muscle_group.code', read_only=True)

    class Meta:
        model = WorkoutExerciseLog
        fields = ('id', 'sub_exercise_id', 'sub_exercise_name', 'muscle_group_name', 'muscle_group_code', 'weight', 'reps', 'sets', 'order')

class WorkoutLogSerializer(serializers.ModelSerializer):
    exercises = WorkoutExerciseLogSerializer(many=True)
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = WorkoutLog
        fields = ('id', 'user', 'date', 'name', 'is_draft', 'exercises')

    def create(self, validated_data):
        exercises_data = validated_data.pop('exercises', [])
        validated_data['user'] = self.context['request'].user
        workout_log = WorkoutLog.objects.create(**validated_data)
        
        for idx, exercise_data in enumerate(exercises_data):
            order_val = exercise_data.pop('order', idx)
            WorkoutExerciseLog.objects.create(
                workout_log=workout_log,
                order=order_val,
                **exercise_data
            )
        return workout_log

    def update(self, instance, validated_data):
        exercises_data = validated_data.pop('exercises', None)
        
        instance.name = validated_data.get('name', instance.name)
        instance.is_draft = validated_data.get('is_draft', instance.is_draft)
        instance.save()
        
        if exercises_data is not None:
            instance.exercises.all().delete()
            for idx, exercise_data in enumerate(exercises_data):
                order_val = exercise_data.pop('order', idx)
                WorkoutExerciseLog.objects.create(
                    workout_log=instance,
                    order=order_val,
                    **exercise_data
                )
        return instance
