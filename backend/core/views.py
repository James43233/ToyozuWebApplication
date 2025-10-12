from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from django.db import transaction
from decimal import Decimal


from django.contrib.auth.hashers import check_password
from .models import  (UserEmployee, Product, Brand, Category, Supplier, Supply, SupplyDetails, Condition,
                      EmailDevice, ProductImage, ProductCarCompatibility, Car, CarModel, ProductYear, UserCart,
                      Region, Province, Municipality, Barangay, Address)


from .serializers import *

from .serializers import LoginSerializer, TwoFAVerifySerializer
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
import random
from .utils import send_sms_otp


User = get_user_model()

def send_otp_to_user(user):
    import random
    from django.utils import timezone
    code = '{:06d}'.format(random.randint(0, 999999))
    valid_until = timezone.now() + timezone.timedelta(minutes=10)
    # Save OTP device entry
    EmailDevice.objects.create(
        name="default",
        confirmed=False,
        user_id=user.pk,
        token=code,
        valid_until=valid_until,
        email=user.email,
        throttling_failure_count=0,
        created_at=timezone.now(),
    )
    # Send OTP via preferred channel
    if hasattr(user, "contact_type") and user.contact_type == 'phone' and user.phone_number:
        send_sms_otp(user.phone_number, code)
    elif hasattr(user, "email") and user.email:
        send_mail(
            'Your verification code',
            f'Your OTP code is: {code}',
            getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@example.com"),
            [user.email],
            fail_silently=False,
        )
    else:
        print("No valid contact method for OTP!")
        
        
class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            send_otp_to_user(user)
            
            return Response({
                "detail": "OTP sent, please check your email.",
                "otp_required": True,
                "role_id": user.role_id,
                "user_id": user.user_id,  # ✅ ADD THIS LINE
                "username": user.username,
                "email": user.email,
                "phone": getattr(user, "mobile_phone", None)
            })

    
        else:
            return Response({"detail": "Invalid credentials"}, status=400)

class TwoFAVerifyView(APIView):
    def post(self, request):
        serializer = TwoFAVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data['username']
        code = serializer.validated_data['token']

        # 🧩 Step 1: Validate user
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid username."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # 🧩 Step 2: Validate OTP
        now = timezone.now()
        otp_qs = EmailDevice.objects.filter(
            user_id=user.pk,
            token=code,
            confirmed=False,
            valid_until__gte=now
        ).order_by('-created_at')

        if not otp_qs.exists():
            return Response(
                {"error": "Invalid or expired verification code."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # 🧩 Step 3: Mark OTP as used
        otp = otp_qs.first()
        otp.confirmed = True
        otp.valid_until = now  # expire immediately
        otp.save()

        # 🧩 Step 4: Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        # 🧩 Step 5: Return response with user_id included
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user_id": user.user_id,  # ✅ Added this
            "role_id": user.role_id,
            "username": user.username,
            "email": user.email,
            "phone": getattr(user, "mobile_phone", None),
            "message": "MFA verification successful."
        }, status=status.HTTP_200_OK)

        
class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserEmployeeSerializer
    permission_classes = [permissions.IsAuthenticated]  # safer than AllowAny
    queryset = UserEmployee.objects.all()
    lookup_field = "user_id"

class CurrentUserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserEmployeeSerializer(request.user)
        return Response(serializer.data)
    
class UploadProfilePictureView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get("profile_picture")
        if not file:
            return Response({"error": "No file uploaded"}, status=400)
        request.user.profile_picture = file
        request.user.save(update_fields=["profile_picture"])
        return Response({"message": "Profile picture updated"})

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by("-product_id").distinct()

    def get_serializer_class(self):
        if self.action in ["list", "retrieve", "update", "partial_update"]:
            return ProductJoinedSerializer
        return ProductSerializer

class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer

class SupplyViewSet(viewsets.ModelViewSet):
    queryset = Supply.objects.all()
    serializer_class = SupplySerializer


class SupplyDetailsViewSet(viewsets.ModelViewSet):
    queryset = SupplyDetails.objects.all().order_by("-id")
    serializer_class = SupplyDetailsSerializer

    def perform_create(self, serializer):
        # Just save — stock update handled inside serializer
        serializer.save()


class ConditionViewSet(viewsets.ModelViewSet):
    queryset = Condition.objects.all()
    serializer_class = ConditionSerializer

class SupplyReceiptViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Supply.objects.all()
    serializer_class = SupplyReceiptSerializer
    
class SupplyReceiptsList(APIView):
    def get(self, request):
        receipts = Supply.objects.all().values('supply_id', 'receipt_number')
        return Response(list(receipts))
    
class StockInProductView(APIView):
    def post(self, request):
        serializer = StockInSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        product = serializer.validated_data['product']
        supply = serializer.validated_data['supply']
        condition = serializer.validated_data['condition']
        quantity = serializer.validated_data['quantity']
        price = serializer.validated_data['price']

        with transaction.atomic():
            # Create supply detail
            SupplyDetails.objects.create(
                supply=supply,
                product=product,
                quantity=quantity,
                price=price,
                subtotal=Decimal(quantity) * price,
                condition=condition
            )

            # Update product stock
            product.purchase_price = price
            product.quantity = product.quantity + quantity
            product.save()

        return Response(
            {"message": "Stock-in successful.", "product_id": product.product_id, "new_quantity": product.quantity},
            status=status.HTTP_201_CREATED
        )

    
    
class SupplyCreateView(APIView):
    def post(self, request):
        receipt_number = request.data.get('receipt_number')
        supplier_id = request.data.get('supplier')


        if not receipt_number or not supplier_id:
            return Response({'error': 'Receipt number and supplier are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            supplier = Supplier.objects.get(pk=supplier_id)
        except Supplier.DoesNotExist:
            return Response({'error': 'Supplier does not exist.'}, status=status.HTTP_400_BAD_REQUEST)


        supply = Supply.objects.create(
            receipt_number=receipt_number,
            supplier=supplier,

        )
        return Response({
            'supply_id': supply.supply_id,
            'receipt_number': supply.receipt_number,
            'supplier_id': supplier.supplier_id,
            'supplier_name': supplier.name,
        }, status=status.HTTP_201_CREATED)
        

class ProductAdminDeleteView(APIView):
    def post(self, request, product_id):
        username = request.data.get('username')
        password = request.data.get('password')
        if not username or not password:
            return Response({'error': 'Username and password required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = UserEmployee.objects.get(username=username)
        except UserEmployee.DoesNotExist:
            return Response({'error': 'Admin user not found or wrong credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

        # Use check_password instead of direct password comparison
        if not check_password(password, user.password):
            return Response({'error': 'Admin user not found or wrong credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

        if user.role_id != 1:
            return Response({'error': 'Not authorized. Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            product = Product.objects.get(pk=product_id)
            product.delete()
            return Response({'message': 'Product deleted.'}, status=status.HTTP_200_OK)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)
        
class RegisterEmployeeView(APIView):
    def post(self, request):
        serializer = UserEmployeeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'detail': 'Employee registered!'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class LowStockProductsView(APIView):
    def get(self, request):
        products = Product.objects.filter(quantity__lte=10).order_by('quantity')
        data = [{"product_id": p.product_id, "name": p.name, "quantity": p.quantity} for p in products]
        return Response(data)
    
class TopSellingProductsView(APIView):
    def get(self, request):
        top_products = (
            SupplyDetails.objects
            .values(product_id=F('product__product_id'), product_name=F('product__name'))
            .annotate(sales_count=Count('product_id'), total_revenue=Sum('subtotal'))
            .order_by('-sales_count')[:5]
        )
        return Response(top_products)
    
class RecentTransactionsView(APIView):
    def get(self, request):
        transactions = Supply.objects.select_related('supplier', 'user').order_by('-date')[:5]
        data = [
            {
                "supply_id": t.supply_id,
                "receipt_number": t.receipt_number,
                "supplier": t.supplier.name if t.supplier else "",
                "user": t.user.username if t.user else "",
                "total_cost": str(t.total_cost),
                "date": t.date
            }
            for t in transactions
        ]
        return Response(data)
    
class AvailableProductsStatsView(APIView):
    def get(self, request):
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute('SELECT * FROM available_products_view')
            row = cursor.fetchone()
        data = {
            "Total_Available_Products": row[0] if row else 0
        }
        return Response(data)
    
def send_otp(user, otp_code):
    if user.contact_type == 'phone' and user.phone_number:
        send_sms_otp(user.phone_number, otp_code)  # This will print to the console
        
class SupplyReceiptView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print("DEBUG --- SupplyReceiptView POST ---")
        print("User:", request.user)
        print("Is authenticated:", getattr(request.user, "is_authenticated", None))
        print("Role id:", getattr(request.user, "role_id", None))
        print("Request data:", request.data)

        data = request.data
        receipt_number = data.get("receiptNumber")
        supplier_name = data.get("supplierName")
        date = data.get("date")
        items = data.get("items", [])

        if not all([receipt_number, supplier_name, date, items]):
            return Response({"error": "Missing required fields"}, status=400)

        allowed_roles = [1, 2, 3]
        user_role_id = getattr(request.user, "role_id", None)
        if user_role_id not in allowed_roles:
            return Response({"error": "Not authorized"}, status=403)

        try:
            supplier = Supplier.objects.get(name=supplier_name)
        except Supplier.DoesNotExist:
            return Response({"error": "Supplier not found"}, status=400)

        with transaction.atomic():
            supply = Supply.objects.create(
                receipt_number=receipt_number,
                supplier=supplier,
                user=request.user,
                date=date,
                total_cost=Decimal("0.00")
            )

            total_cost = Decimal("0.00")

            for item in items:
                print("DEBUG: Processing item:", item)
                try:
                    product = Product.objects.get(name=item["productName"])
                except Product.DoesNotExist:
                    return Response({"error": f"Product '{item['productName']}' not found"}, status=400)

                quantity = int(item.get("quantity", 0))
                price = Decimal(item.get("unitPrice", "0"))
                subtotal = quantity * price

                condition = Condition.objects.first()
                if not condition:
                    return Response({"error": "No condition available"}, status=400)

                # ✅ Create using serializer to trigger proper stock update
                SupplyDetails.objects.create(
                    supply=supply,
                    product=product,
                    quantity=quantity,
                    price=price,
                    subtotal=subtotal,
                    condition=condition
                )

                # ❌ Removed manual quantity update — serializer handles it
                # product.quantity += quantity
                # product.purchase_price = price
                # product.save()

                total_cost += subtotal

            supply.total_cost = total_cost
            supply.save()

        print("DEBUG: Receipt saved successfully")
        return Response({"message": "Receipt saved successfully"}, status=201)


class SupplierListView(generics.ListAPIView):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer

class BrandListView(generics.ListAPIView):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    
class ProductImageUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]   # <-- Add this line!

    def post(self, request, product_id):
        product = Product.objects.get(pk=product_id)
        files = request.FILES.getlist("images")  # multiple files

        if not files:
            return Response({"error": "No images uploaded"}, status=400)

        created = []
        for f in files[:5]:  # limit to 5
            img = ProductImage.objects.create(product=product, image=f)
            created.append(ProductImageSerializer(img).data)

        return Response({"images": created}, status=201)

class ConditionListView(generics.ListAPIView):
    queryset = Condition.objects.all()
    serializer_class = ConditionSerializer
    
    
class SupplierCreateView(APIView):
    def post(self, request):
        serializer = SupplierSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class CompatibilityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ProductCarCompatibility.objects.select_related(
        "car_model__car", "year_start", "year_end"
    )
    serializer_class = CompatibilityOptionSerializer

class CarViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Car.objects.all()
    serializer_class = CarSerializer

class CarModelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CarModel.objects.all()
    serializer_class = CarModelSerializer

class ProductYearViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ProductYear.objects.all()
    serializer_class = ProductYearSerializer


class UserCartViewSet(viewsets.ModelViewSet):
    queryset = UserCart.objects.all()
    serializer_class = UserCartSerializer

    def get_queryset(self):
        """
        Allow filtering by user_id so frontend can call:
        GET /api/cart/?user=1
        """
        user_id = self.request.query_params.get("user")
        if user_id and user_id.isdigit():
            return self.queryset.filter(user_id=int(user_id))
        return self.queryset.none()

    def create(self, request, *args, **kwargs):
        """
        Add to cart. If product already exists for this user, update quantity.
        """
        user_id = request.data.get("user")
        product_id = request.data.get("product")
        quantity = int(request.data.get("quantity", 1))
        price_at_addition = request.data.get("price_at_addition")

        # Guard against missing user/product
        if not user_id or not product_id:
            return Response({"error": "User and product are required"}, status=400)

        try:
            user = UserEmployee.objects.get(pk=user_id)
            product = Product.objects.get(pk=product_id)
        except (UserEmployee.DoesNotExist, Product.DoesNotExist):
            return Response({"error": "Invalid user or product"}, status=400)

        cart_item, created = UserCart.objects.get_or_create(
            user=user,
            product=product,
            defaults={"quantity": quantity, "price_at_addition": price_at_addition},
        )

        if not created:
            # If already exists, increment quantity
            cart_item.quantity = F("quantity") + quantity
            cart_item.save(update_fields=["quantity"])
            cart_item.refresh_from_db()

        serializer = self.get_serializer(cart_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        """
        Remove item from cart.
        """
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


# ADDRESS SECTION


class RegionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer

class ProvinceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Province.objects.all()
    serializer_class = ProvinceSerializer

    def get_queryset(self):
        region_id = self.request.query_params.get("region")
        if region_id:
            return self.queryset.filter(region_id=region_id)
        return self.queryset

class MunicipalityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Municipality.objects.all()
    serializer_class = MunicipalitySerializer

    def get_queryset(self):
        province_id = self.request.query_params.get("province")
        if province_id:
            return self.queryset.filter(province_id=province_id)
        return self.queryset

class BarangayViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Barangay.objects.all()
    serializer_class = BarangaySerializer

    def get_queryset(self):
        municipality_id = self.request.query_params.get("municipality")
        if municipality_id:
            return self.queryset.filter(municipality_id=municipality_id)
        return self.queryset

class AddressViewSet(viewsets.ModelViewSet):
    queryset = Address.objects.all()
    serializer_class = AddressSerializer

    def get_queryset(self):
        user_id = self.request.query_params.get("user")
        if user_id:
            return self.queryset.filter(user_id=user_id)
        return self.queryset.none()


#CHECKOUT VIEWSET

class CheckoutViewSet(viewsets.ViewSet):
    @transaction.atomic
    def create(self, request):
        user = request.data.get("user")
        address_id = request.data.get("address")
        courier_id = request.data.get("courier")
        payment_type = request.data.get("payment_method")
        items = request.data.get("items", [])
        subtotal = request.data.get("subtotal", 0)
        total = request.data.get("total", 0)
        delivery_fee = total - subtotal

        # 1. Create Sale
        sale = Sale.objects.create(
            user_id=user,
            total_amount=subtotal,
            payment_type=payment_type,
            date=now().date(),
        )

        # 2. Create SaleDetails
        for item in items:
            SaleDetails.objects.create(
                sale=sale,
                product_id=item["product"],
                quantity=item["quantity"],
                selling_price=item["price"],
                sub_total=item["quantity"] * item["price"],
            )

        # 3. Create Delivery
        pending_status = DeliveryStatus.objects.order_by("sequence_order").first()
        delivery = Delivery.objects.create(
            sale=sale,
            courier_id=courier_id,
            address_id=address_id,
            delivery_fee=delivery_fee,
            overall_total=total,
            date=now().date(),
            status=pending_status,
            tracking_number=f"TRK-{sale.sale_id}-{now().strftime('%Y%m%d')}",
        )

        # 4. Create ModePayment (optional, depends on your flow)
        ModePayment.objects.create(
            sale=sale,
            ref=f"REF-{sale.sale_id}-{now().strftime('%H%M%S')}",
        )

        return Response(
            {
                "sale_id": sale.sale_id,
                "delivery_id": delivery.delivery_id,
                "total": total,
                "message": "Order placed successfully",
            },
            status=status.HTTP_201_CREATED,
        )


@api_view(["POST"])
def calculate_shipping_cost(request):
    print("DEBUG request.data:", request.data)
    """
    Example request:
    {
        "courier_id": 1,
        "products": [ { "product_id": 4, "quantity": 2 }, { "product_id": 7, "quantity": 1 } ]
    }
    """
    courier_id = request.data.get("courier_id")
    products = request.data.get("products", [])

    try:
        courier = Courier.objects.get(pk=courier_id)
    except Courier.DoesNotExist:
        return Response({"error": "Courier not found"}, status=404)

    # Calculate total weight based on each product's weight and quantity
    total_weight = 0
    for item in products:
        try:
            product = Product.objects.get(pk=item["product_id"])
            quantity = int(item.get("quantity", 1))
            total_weight += product.weight * quantity
        except Product.DoesNotExist:
            return Response({"error": f"Product ID {item['product_id']} not found"}, status=404)

    # Compute shipping cost using courier's rates
    try:
        cost = courier.calculate_shipping(total_weight)
    except ValueError as e:
        return Response({"error": str(e)}, status=400)

    return Response({
        "courier": courier.name,
        "total_weight": total_weight,
        "shipping_cost": cost
    })
    
@api_view(['GET'])
def get_couriers(request):
    print("🟢 [DEBUG] get_couriers endpoint triggered")  # Debug log
    couriers = Courier.objects.all()
    serializer = CourierSerializer(couriers, many=True)
    print(f"🟢 [DEBUG] Found {len(couriers)} couriers")
    return Response(serializer.data)


@api_view(['POST'])
def place_order(request):
    print("\n[DEBUG] Received order request.")
    print("[DEBUG] Raw request.data:", request.data)

    data = request.data
    try:
        user_id = data['user']
        address_id = data['address_id']
        courier_id = data['courier']
        payment_type = data['payment_method']
        items = data['items']
        subtotal = data['subtotal']
        total = data['total']
        print(f"[DEBUG] Extracted fields: user_id={user_id}, address_id={address_id}, courier_id={courier_id}, payment_type={payment_type}, subtotal={subtotal}, total={total}")
        print(f"[DEBUG] Number of items: {len(items)}")
    except Exception as e:
        print("[DEBUG] Error extracting fields from payload:", str(e))
        return Response({"error": "Missing or invalid fields in request.", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            # Create Sale record
            print("[DEBUG] Creating Sale record...")
            sale = Sale.objects.create(
                user_id=user_id,
                total_amount=total,
                payment_type=payment_type,
                date=timezone.now().date()
            )
            print(f"[DEBUG] Sale created: sale_id={sale.pk}")

            purchased_product_ids = []  # track items to remove from cart later

            # Add SaleDetails and deduct product quantity
            for idx, item in enumerate(items):
                print(f"[DEBUG] Processing item {idx}: {item}")
                product_id = item['product_id']
                quantity = item['quantity']
                price = item['price']
                purchased_product_ids.append(product_id)

                try:
                    product = Product.objects.get(pk=product_id)
                    print(f"[DEBUG] Product {product_id} - Current stock: {product.quantity}, Ordered: {quantity}")
                except Product.DoesNotExist:
                    raise Exception(f"Product {product_id} does not exist.")

                if product.quantity < quantity:
                    raise Exception(f"Insufficient stock for product {product_id}")

                product.quantity -= quantity
                product.save()
                print(f"[DEBUG] Product {product_id} stock updated to: {product.quantity}")

                SaleDetails.objects.create(
                    sale=sale,
                    product_id=product_id,
                    quantity=quantity,
                    selling_price=price,
                    sub_total=price * quantity
                )
                print(f"[DEBUG] SaleDetails created for product {product_id}")

            # Create Delivery record
            print("[DEBUG] Creating Delivery record...")
            delivery = Delivery.objects.create(
                sale=sale,
                courier_id=courier_id,
                address_id=address_id,
                delivery_fee=total - subtotal,
                overall_total=total,
                date=timezone.now().date(),
                status_id=1,  # Pending by default
                tracking_number=f"T#{sale.pk:010d}"
            )
            print(f"[DEBUG] Delivery created: delivery_id={delivery.pk}")

            # 🧹 Remove only purchased items from user cart
            print(f"[DEBUG] Removing purchased items from cart for user {user_id}: {purchased_product_ids}")
            deleted_count, _ = UserCart.objects.filter(
                user_id=user_id,
                product_id__in=purchased_product_ids
            ).delete()
            print(f"[DEBUG] Removed {deleted_count} item(s) from user cart successfully.")

        print("[DEBUG] Transaction committed, order placed successfully.")
        return Response(
            {
                "message": "Order placed successfully.",
                "sale_id": sale.pk,
                "delivery_id": delivery.pk
            },
            status=status.HTTP_201_CREATED
        )

    except Exception as e:
        print("[DEBUG] Order placement failed:", str(e))
        return Response(
            {"error": "Order placement failed.", "details": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

        
@api_view(['GET'])
def user_deliveries(request, user_id):
    # Find all sales for this user
    sale_ids = Sale.objects.filter(user_id=user_id).values_list('sale_id', flat=True)
    # Find all deliveries for those sales
    deliveries = Delivery.objects.filter(sale__sale_id__in=sale_ids)
    serializer = DeliverySerializer(deliveries, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_user_deliveries(request, user_id):
    try:
        deliveries = Delivery.objects.filter(sale__user_id=user_id)
        serializer = DeliverySerializer(deliveries, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['PATCH'])
def update_delivery_status(request, pk):
    try:
        delivery = Delivery.objects.get(pk=pk)
    except Delivery.DoesNotExist:
        return Response({'error': 'Delivery not found'}, status=404)

    serializer = DeliverySerializer(delivery, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

@api_view(['GET', 'PATCH'])
def delivery_detail(request, pk):
    """Retrieve or update a delivery"""
    try:
        delivery = Delivery.objects.get(pk=pk)
    except Delivery.DoesNotExist:
        return Response({'error': 'Delivery not found'}, status=404)

    if request.method == 'GET':
        serializer = DeliverySerializer(delivery)
        return Response(serializer.data)

    elif request.method == 'PATCH':
        serializer = DeliverySerializer(delivery, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

@api_view(['GET'])
def list_deliveries(request):
    deliveries = Delivery.objects.all()
    serializer = DeliverySerializer(deliveries, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def list_delivery_statuses(request):
    statuses = DeliveryStatus.objects.order_by("sequence_order")
    serializer = DeliveryStatusSerializer(statuses, many=True)
    return Response(serializer.data)