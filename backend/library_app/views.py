from django.utils import timezone # Add this
from datetime import timedelta
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Book, Member, Transaction
from .serializers import BookSerializer, MemberSerializer, TransactionSerializer
from django.utils import timezone
from rest_framework import filters

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    # Add search capability
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'author', 'topic'] # 'topic' matches your DFD requirement

class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer

class TransactionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TransactionSerializer
    queryset = Transaction.objects.none()

    def get_queryset(self):
        # Only return transactions belonging to the logged-in user's member profile
        return Transaction.objects.filter(member=self.request.user.member)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reserve_book(request):
    book = Book.objects.get(id=request.data['book'])
    if book.available_copies > 0:
        Transaction.objects.create(
            member=request.user.member,
            book=book,
            issue_date=timezone.now(),
            due_date=timezone.now() + timedelta(days=14) # Define 14-day loan period
        )
        book.available_copies -= 1
        book.save()
        return Response({"message": "Reserved successfully!"})
    return Response({"error": "Out of Stock"}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def pay_fines(request):
    # Only clear fines for books that are already returned OR update logic to clear all
    Transaction.objects.filter(member=request.user.member, fine__gt=0).update(fine=0)
    return Response({"message": "Fines cleared"})

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def return_book(request, transaction_id):
    transaction = Transaction.objects.get(id=transaction_id)
    book = transaction.book
    transaction.return_date = timezone.now()
    transaction.save()
    book.available_copies += 1
    book.save()
    return Response({"message": "Returned!"})
