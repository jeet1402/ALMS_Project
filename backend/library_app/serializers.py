from rest_framework import serializers
from .models import Book, Member, Transaction
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = '__all__'

class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = '__all__'

class TransactionSerializer(serializers.ModelSerializer):
    fine = serializers.SerializerMethodField()
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_author = serializers.CharField(source='book.author', read_only=True)
    due_date =  serializers.CharField(source='book.due_date', read_only=True)
    issue_date = serializers.CharField(source='book.issue_date', read_only=True)

    class Meta:
        model = Transaction
        fields = ['id', 'book', 'member', 'issue_date', 'due_date', 'return_date', 'fine']

    def get_fine(self, obj):
        return obj.calculate_fine()

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['is_staff'] = user.is_staff
        return token
