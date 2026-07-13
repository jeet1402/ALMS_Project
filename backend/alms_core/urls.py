from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from library_app.views import (
    BookViewSet, MemberViewSet, TransactionViewSet, 
    reserve_book, pay_fines, return_book # Added return_book
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'books', BookViewSet)
router.register(r'members', MemberViewSet)
router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/reserve/', reserve_book, name='reserve_book'),
    path('api/pay-fines/', pay_fines, name='pay_fines'),
    path('api/return/<int:transaction_id>/', return_book, name='return_book'), # Added
]
