from datetime import timedelta

from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import viewsets, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Book, Member, Transaction
from .permissions import IsLibrarianOrReadOnly
from .serializers import BookSerializer, MemberSerializer, TransactionSerializer


class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [IsLibrarianOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'author']


class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    permission_classes = [IsLibrarianOrReadOnly]


class TransactionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TransactionSerializer

    def get_queryset(self):
        user = self.request.user
        # Staff/librarians see the full circulation desk; members see only their own.
        if user.is_staff:
            return Transaction.objects.all().order_by('-issue_date')
        member = getattr(user, 'member', None)
        if member is None:
            return Transaction.objects.none()
        return Transaction.objects.filter(member=member).order_by('-issue_date')


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reserve_book(request):
    member = getattr(request.user, 'member', None)
    if member is None:
        return Response({"error": "This account has no member profile."}, status=400)

    book_id = request.data.get('book')
    book = get_object_or_404(Book, id=book_id)

    if book.available_copies <= 0:
        return Response({"error": "Out of Stock"}, status=400)

    Transaction.objects.create(
        member=member,
        book=book,
        due_date=timezone.now().date() + timedelta(days=14),
    )
    book.available_copies -= 1
    book.save()
    return Response({"message": "Reserved successfully!"})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def pay_fines(request):
    user = request.user
    if user.is_staff:
        candidates = Transaction.objects.filter(fine_paid=False)
    else:
        member = getattr(user, 'member', None)
        if member is None:
            return Response({"error": "This account has no member profile."}, status=400)
        candidates = Transaction.objects.filter(member=member, fine_paid=False)

    # fine is computed, not a DB column, so it can't be filtered in the query —
    # evaluate it in Python and only mark the ones that actually owe something.
    to_clear = [t.id for t in candidates if t.calculate_fine() > 0]
    Transaction.objects.filter(id__in=to_clear).update(fine_paid=True)

    return Response({"message": "Fines cleared", "cleared_count": len(to_clear)})


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def return_book(request, transaction_id):
    transaction = get_object_or_404(Transaction, id=transaction_id)
    user = request.user

    # Ownership check: only staff or the member who owns this transaction may return it.
    if not user.is_staff:
        member = getattr(user, 'member', None)
        if member is None or transaction.member_id != member.id:
            return Response({"error": "You do not have permission to return this book."}, status=403)

    if transaction.return_date is not None:
        return Response({"error": "This book has already been returned."}, status=400)

    transaction.return_date = timezone.now().date()
    transaction.save()

    book = transaction.book
    book.available_copies += 1
    book.save()

    return Response({"message": "Returned!"})
