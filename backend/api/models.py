from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)

    # Use email as the primary login field
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

class MuscleGroup(models.Model):
    name = models.CharField(max_length=50, unique=True)
    code = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.name

class SubExercise(models.Model):
    name = models.CharField(max_length=100)
    muscle_group = models.ForeignKey(MuscleGroup, on_delete=models.CASCADE, related_name='exercises')

    class Meta:
        unique_together = ('name', 'muscle_group')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.muscle_group.name})"

class WorkoutLog(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='workout_logs')
    date = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=100, blank=True)
    is_draft = models.BooleanField(default=False)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        status = "Draft" if self.is_draft else "Completed"
        return f"{self.user.email} - {self.name or 'Workout'} on {self.date.strftime('%Y-%m-%d %H:%M')} ({status})"

class WorkoutExerciseLog(models.Model):
    workout_log = models.ForeignKey(WorkoutLog, on_delete=models.CASCADE, related_name='exercises')
    sub_exercise = models.ForeignKey(SubExercise, on_delete=models.CASCADE)
    weight = models.DecimalField(max_digits=6, decimal_places=2)
    reps = models.PositiveIntegerField()
    sets = models.PositiveIntegerField()
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.sub_exercise.name}: {self.sets} sets x {self.reps} reps @ {self.weight}"
