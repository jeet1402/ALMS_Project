from django.db import models
from django.contrib.auth.models import User # Add this line
from datetime import date

class Book(models.Model):
    # ... (rest of your Book model code)
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=100)
    isbn = models.CharField(max_length=13, unique=True)
    is_available = models.BooleanField(default=True)
    total_copies = models.IntegerField(default=1)
    available_copies = models.IntegerField(default=1)

    def __str__(self):
        return self.title

class Member(models.Model):
    # Now 'User' will be recognized
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='member', null=True)
    member_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    
    def __str__(self):
        return self.name

class Transaction(models.Model):
    # ... (rest of your Transaction model code)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    member = models.ForeignKey(Member, on_delete=models.CASCADE)
    issue_date = models.DateField(auto_now_add=True)
    due_date = models.DateField()
    return_date = models.DateField(null=True, blank=True)

    def calculate_fine(self):
        today = date.today()
        if self.return_date:
            # If returned, calculate fine based on return date
            if self.return_date > self.due_date:
                return (self.return_date - self.due_date).days * 5
        elif today > self.due_date:
            # If not yet returned, calculate fine based on today
            return (today - self.due_date).days * 5
        return 0
