from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, MuscleGroup, SubExercise, WorkoutLog, WorkoutExerciseLog

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['email', 'username', 'is_staff', 'is_superuser', 'is_active']
    ordering = ['email']

class SubExerciseInline(admin.TabularInline):
    model = SubExercise
    extra = 1

class MuscleGroupAdmin(admin.ModelAdmin):
    list_display = ['name', 'code']
    search_fields = ['name', 'code']
    inlines = [SubExerciseInline]

class WorkoutExerciseLogInline(admin.TabularInline):
    model = WorkoutExerciseLog
    extra = 1

class WorkoutLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'name', 'date', 'is_draft']
    list_filter = ['is_draft', 'date']
    search_fields = ['user__email', 'name']
    inlines = [WorkoutExerciseLogInline]

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(MuscleGroup, MuscleGroupAdmin)
admin.site.register(SubExercise)
admin.site.register(WorkoutLog, WorkoutLogAdmin)
