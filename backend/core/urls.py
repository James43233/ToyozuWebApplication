from django import views
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework import routers
from .views import *
from . import views

router = routers.DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'brands', BrandViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'suppliers', SupplierViewSet)
router.register(r'supplies', SupplyViewSet)
router.register(r'supply-details', SupplyDetailsViewSet)
router.register(r'conditions', ConditionViewSet)
router.register(r'compatibilities', CompatibilityViewSet)
router.register(r'cars', CarViewSet, basename='car')
router.register(r'car-models', CarModelViewSet, basename='car-model')
router.register(r'years', ProductYearViewSet, basename='product-year')
router.register(r'cart', UserCartViewSet, basename='cart')
router.register(r'regions', RegionViewSet, basename='region')
router.register(r'provinces', ProvinceViewSet, basename='province')
router.register(r'municipalities', MunicipalityViewSet, basename='municipality')
router.register(r'barangays', BarangayViewSet, basename='barangay')
router.register(r'addresses', AddressViewSet, basename='address')
router.register(r'checkout', CheckoutViewSet, basename='checkout')

urlpatterns = [
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/', include(router.urls)),
    path('api/products/<int:product_id>/admin_delete/', ProductAdminDeleteView.as_view(), name='admin_delete_product'),
    path('api/verify-otp/', TwoFAVerifyView.as_view(), name='verify-otp'),
    path('api/register/', RegisterEmployeeView.as_view(), name='register-employee'),
    path('api/low-stock-products/', LowStockProductsView.as_view()),
    path('api/top-selling-products/', TopSellingProductsView.as_view()),
    path('api/recent-transactions/', RecentTransactionsView.as_view()),
    path('api/product-stats/', AvailableProductsStatsView.as_view()),
    path('api/profile/me/', CurrentUserProfileView.as_view(), name='current-user-profile'),
    path("api/profile/upload/", UploadProfilePictureView.as_view(), name="profile-upload"),
    path("api/supply-receipts/", SupplyReceiptView.as_view()),
    path("api/suppliers/", SupplierListView.as_view()),
    path("api/brands/", BrandListView.as_view()),
    path("api/categories/", CategoryListView.as_view()),
    path("api/products/<int:product_id>/upload-images/", ProductImageUploadView.as_view()),
    path("api/conditions/", ConditionListView.as_view()),
    path('api/couriers/', views.get_couriers, name='get_couriers'),  # ✅ fixed
    path('api/calculate-shipping/', calculate_shipping_cost, name='calculate-shipping'),  # ✅ fixed
    path('api/orders/', place_order),  # <-- Add this for POST order creation
    path('api/deliveries/user/<int:user_id>/', user_deliveries),
    path('api/delivery/user/<int:user_id>/', views.get_user_deliveries, name='get_user_deliveries'),
    path('api/deliveries/<int:pk>/', views.update_delivery_status, name='update_delivery_status'),
    path('api/deliveries/<int:pk>/', views.delivery_detail, name='delivery_detail'),
    path('api/deliveries/', views.list_deliveries, name='list_deliveries'),
    path('api/delivery-statuses/', views.list_delivery_statuses, name='list_delivery_statuses'),

]




