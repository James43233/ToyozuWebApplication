from django.urls import path, include
from rest_framework import routers
from . import views
from .views import (
    LoginView,
    TwoFAVerifyView,
    RegisterEmployeeView,
    LowStockProductsView,
    TopSellingProductsView,
    RecentTransactionsView,
    AvailableProductsStatsView,
    CurrentUserProfileView,
    UploadProfilePictureView,
    SupplyReceiptView,
    SupplierListView,
    ProductImageUploadView,
    UserListView,
    UserDetailView,
    ProductAdminDeleteView,
)

router = routers.DefaultRouter()
router.register(r'products', views.ProductViewSet, basename='product')
router.register(r'brands', views.BrandViewSet)
router.register(r'categories', views.CategoryViewSet)
router.register(r'suppliers', views.SupplierViewSet)
router.register(r'supplies', views.SupplyViewSet)
router.register(r'supply-details', views.SupplyDetailsViewSet)
router.register(r'conditions', views.ConditionViewSet)
router.register(r'compatibilities', views.CompatibilityViewSet)
router.register(r'cars', views.CarViewSet, basename='car')
router.register(r'car-models', views.CarModelViewSet, basename='car-model')
router.register(r'years', views.ProductYearViewSet, basename='product-year')
router.register(r'cart', views.UserCartViewSet, basename='cart')
router.register(r'regions', views.RegionViewSet, basename='region')
router.register(r'provinces', views.ProvinceViewSet, basename='province')
router.register(r'municipalities', views.MunicipalityViewSet, basename='municipality')
router.register(r'barangays', views.BarangayViewSet, basename='barangay')
router.register(r'addresses', views.AddressViewSet, basename='address')
router.register(r'checkout', views.CheckoutViewSet, basename='checkout')

urlpatterns = [
    # auth
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/verify-otp/', TwoFAVerifyView.as_view(), name='verify-otp'),
    path('api/register/', RegisterEmployeeView.as_view(), name='register-employee'),

    # router-backed REST resources (standard CRUD)
    path('api/', include(router.urls)),

    # product-specific custom endpoints
    path('api/products/<int:product_id>/admin_delete/', ProductAdminDeleteView.as_view(), name='admin_delete_product'),
    path('api/products/<int:product_id>/upload-images/', ProductImageUploadView.as_view()),

    # dashboard/analytics endpoints
    path('api/low-stock-products/', LowStockProductsView.as_view()),
    path('api/top-selling-products/', TopSellingProductsView.as_view()),
    path('api/recent-transactions/', RecentTransactionsView.as_view()),
    path('api/product-stats/', AvailableProductsStatsView.as_view()),

    # profile & user
    path('api/profile/me/', CurrentUserProfileView.as_view(), name='current-user-profile'),
    path('api/profile/upload/', UploadProfilePictureView.as_view(), name='profile-upload'),
    path('api/users/', UserListView.as_view(), name='user-list'),
    path('api/users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),

    # supplies/suppliers
    path('api/supply-receipts/', SupplyReceiptView.as_view()),
    path('api/suppliers/', SupplierListView.as_view()),

    # misc function views
    path('api/couriers/', views.get_couriers, name='get_couriers'),
    path('api/calculate-shipping/', views.calculate_shipping_cost, name='calculate-shipping'),
    
    # deliveries
    path('api/deliveries/', views.list_deliveries, name='list_deliveries'),
    path('api/deliveries/<int:pk>/', views.delivery_detail, name='delivery_detail'),
    path('api/deliveries/user/<int:user_id>/', views.get_user_deliveries, name='get_user_deliveries'),

    # delivery statuses
    path('api/delivery-statuses/', views.list_delivery_statuses, name='list_delivery_statuses'),

    # legacy/compat routes (if you still need them)
    path('api/delivery/user/<int:user_id>/', views.get_user_deliveries, name='get_user_deliveries_legacy'),

    # orders: move POST-only endpoint to a create-specific path so GET /api/orders/ won't hit it
    path('api/orders/create/', views.place_order, name='place_order_create'),
]