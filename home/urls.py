from django.urls import path
from . import views

app_name = "home"

urlpatterns = [
    path("", views.HomeView.as_view(), name="home_view"),
    path("inside-meeting/<str:room_name>/", views.InsideMeetingView.as_view(), name="inside_meeting_view"),
]
