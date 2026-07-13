from django.shortcuts import get_object_or_404
from rest_framework import viewsets, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.utils import timezone
from datetime import timedelta
from .models import Book, Transaction, Member
from .serializers import BookSerializer, TransactionSerializer, MemberSerializer
from .permissions import IsLibrarian

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'author', 'topic']  # Supports Search by Topic per DFD

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Admin sees all transactions; students see only their own
        if self.request.user.is_staff:
            return Transaction.objects.all()
        return Transaction.objects.filter(member=self.request.user.member)

class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    permission_classes = [IsLibrarian] # Members should generally be managed by librarians

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reserve_book(request):
    book_id = request.data.get('book')
    book = get_object_or_404(Book, id=book_id)
    member = get_object_or_404(Member, user=request.user)
    
    if book.available_copies > 0:
        Transaction.objects.create(
            member=member,
            book=book,
            issue_date=timezone.now(),
            due_date=timezone.now() + timedelta(days=14)
        )
        book.available_copies -= 1
        book.save()
        return Response({"message": "Reserved successfully!"})
    return Response({"error": "Out of stock"}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def pay_fines(request):
    member = get_object_or_404(Member, user=request.user)
    Transaction.objects.filter(member=member, fine__gt=0).update(fine=0)
    return Response({"message": "Fines cleared"})

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def return_book(request, transaction_id):
    transaction = get_object_or_404(Transaction, id=transaction_id)
    if not transaction.return_date:
        transaction.return_date = timezone.now()
        transaction.book.available_copies += 1
        transaction.book.save()
        transaction.save()
        return Response({"message": "Book returned successfully"})
    return Response({"error": "Already returned"}, status=400)
