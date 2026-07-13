from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Book(models.Model):
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=100)
    isbn = models.CharField(max_length=13, unique=True)
    is_available = models.BooleanField(default=True)
    total_copies = models.IntegerField(default=1)
    available_copies = models.IntegerField(default=1)

    def save(self, *args, **kwargs):
        # Keep is_available in sync with available_copies instead of
        # letting it drift as a stale, never-updated flag.
        self.is_available = self.available_copies > 0
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Member(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='member', null=True)
    member_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    department = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Transaction(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    member = models.ForeignKey(Member, on_delete=models.CASCADE)
    issue_date = models.DateField(auto_now_add=True)
    due_date = models.DateField()
    return_date = models.DateField(null=True, blank=True)
    fine_paid = models.BooleanField(default=False)  # NEW: needed for pay_fines to work at all

    FINE_RATE_PER_DAY = 5

    def calculate_fine(self):
        if self.fine_paid:
            return 0
        if self.return_date:
            if self.return_date > self.due_date:
                return (self.return_date - self.due_date).days * self.FINE_RATE_PER_DAY
            return 0
        today = timezone.now().date()
        if today > self.due_date:
            return (today - self.due_date).days * self.FINE_RATE_PER_DAY
        return 0

    def __str__(self):
        return f"{self.member} - {self.book}"
