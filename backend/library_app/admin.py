from django.contrib import admin
from .models import Book, Member, Transaction

admin.site.register(Member)
admin.site.register(Transaction)

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'total_copies', 'available_copies')
