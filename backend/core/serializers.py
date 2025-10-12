from rest_framework import serializers
from django.db import connection, transaction
from rest_framework import generics, permissions
from .models import *


class UserEmployeeSerializer(serializers.ModelSerializer):
    role_id = serializers.IntegerField(source="role.role_id", read_only=True)
    role_name = serializers.CharField(source="role.name", read_only=True)  # 👈 safe

    class Meta:
        model = UserEmployee
        fields = [
            "user_id",
            "user_name",
            "username",
            "email",
            "mobile_phone",
            "role_id",
            "role_name",        # 👈 now valid because we defined it above
            "profile_picture",
        ]

        

        
class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ConditionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Condition
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    brand = BrandSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    brand_id = serializers.PrimaryKeyRelatedField(queryset=Brand.objects.all(), source='brand', write_only=True)
    category_id = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), source='category', write_only=True)
    class Meta:
        model = Product
        fields = ['product_id', 'name', 'description', 'brand', 'brand_id', 'category', 'category_id', 'purchase_price', 'selling_price', 'quantity']
        
class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ['supplier_id', 'name', 'contact_number', 'address']


class SupplySerializer(serializers.ModelSerializer):

    supplier_name = serializers.CharField(source='supplier.name', read_only=True)

    class Meta:
        model = Supply
     
        fields = ['supply_id', 'receipt_number', 'supplier', 'supplier_name', 'user', 'total_cost', 'date']
        
class SupplyDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupplyDetails
        fields = ['supply', 'product', 'quantity', 'price', 'sub_total', 'condition']

    def create(self, validated_data):
        # Create the supply detail record
        supply_detail = super().create(validated_data)

        # Update the product stock (live quantity)
        product = supply_detail.product
        product.quantity = product.quantity + supply_detail.quantity
        product.save(update_fields=["quantity"])
        print(f"✅ Stock updated for product {product.product_id}, new qty: {product.quantity}")

        return supply_detail
class SupplyReceiptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supply
        fields = ['supply_id', 'receipt_number']
        

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image"]
        
class CarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Car
        fields = ["car_id", "make"]

class CarModelSerializer(serializers.ModelSerializer):
    car_id = serializers.IntegerField(source="car.car_id", read_only=True)

    class Meta:
        model = CarModel
        fields = ["model_id", "car_id", "model_name"]


class ProductYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductYear
        fields = ["year_id", "year"]
        
class ProductCarCompatibilitySerializer(serializers.ModelSerializer):
    car_model = CarModelSerializer(read_only=True)
    year_start = ProductYearSerializer(read_only=True)
    year_end = ProductYearSerializer(read_only=True)

    class Meta:
        model = ProductCarCompatibility
        fields = ["id", "product", "car_model", "year_start", "year_end"]


class ProductCarCompatibilityWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCarCompatibility
        fields = ["car_model", "year_start", "year_end"]  # ✅ no product, no id




class ProductJoinedSerializer(serializers.ModelSerializer):
    # Read-only names
    category_name = serializers.CharField(source="category.name", read_only=True)
    brand_name = serializers.CharField(source="brand.name", read_only=True)

    # ✅ Add writable fields for update
    brand_id = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.all(), source="brand", write_only=True, required=False
    )
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source="category", write_only=True, required=False
    )

    condition_item = serializers.SerializerMethodField()
    supplier_name = serializers.SerializerMethodField()
    supply_date = serializers.SerializerMethodField()

    images = ProductImageSerializer(many=True, read_only=True)
    compatible_cars = ProductCarCompatibilityWriteSerializer(many=True)

    class Meta:
        model = Product
        fields = [
            "product_id",
            "name",
            "description",
            "brand_name",
            "category_name",
            "brand_id",          # ✅ new
            "category_id",       # ✅ new
            "condition_item",
            "supplier_name",
            "supply_date",
            "purchase_price",
            "selling_price",
            "weight",
            "quantity",
            "images",
            "compatible_cars",
        ]
        extra_kwargs = {
            "category": {"required": False},
            "brand": {"required": False},
            "selling_price": {"required": False},
            "description": {"required": False},
            "weight": {"required": False},
        }

    # -------------------
    # Custom field getters
    # -------------------
    def get_condition_item(self, obj):
        detail = (
            SupplyDetails.objects
            .filter(product=obj)
            .select_related("condition", "supply")
            .order_by("-supply__date")
            .first()
        )
        return detail.condition.name if detail and detail.condition else None

    def get_supplier_name(self, obj):
        detail = (
            SupplyDetails.objects
            .filter(product=obj)
            .select_related("supply__supplier")
            .order_by("-supply__date")
            .first()
        )
        return (
            detail.supply.supplier.name
            if detail and detail.supply and detail.supply.supplier
            else None
        )

    def get_supply_date(self, obj):
        detail = (
            SupplyDetails.objects
            .filter(product=obj)
            .select_related("supply")
            .order_by("-supply__date")
            .first()
        )
        return detail.supply.date if detail and detail.supply else None

    # -------------------
    # Override update to handle compatibilities
    # -------------------
    def update(self, instance, validated_data):
        compat_data = validated_data.pop("compatible_cars", [])
        instance = super().update(instance, validated_data)

        # Reset compatibilities
        ProductCarCompatibility.objects.filter(product=instance).delete()

        for c in compat_data:
            ProductCarCompatibility.objects.create(
                product=instance,
                car_model_id=getattr(c["car_model"], "pk", c["car_model"]),
                year_start_id=getattr(c["year_start"], "pk", c["year_start"]),
                year_end_id=getattr(c["year_end"], "pk", c["year_end"]),
            )
        return instance

    # -------------------
    # Unified representation
    # -------------------
    def to_representation(self, instance):
        rep = super().to_representation(instance)

        rep["quantity"] = instance.__dict__.get("quantity", instance.quantity)

        rep["compatible_cars"] = ProductCarCompatibilitySerializer(
            instance.compatible_cars.all(), many=True
        ).data

        return rep




    
class CompatibilityOptionSerializer(serializers.ModelSerializer):
    label = serializers.SerializerMethodField()

    class Meta:
        model = ProductCarCompatibility
        fields = ["product", "car_model", "year_start", "year_end", "label"]

    def get_label(self, obj):
        car = obj.car_model.car.make
        model = obj.car_model.model_name
        start = obj.year_start.year if obj.year_start else "?"
        end = obj.year_end.year if obj.year_end else "?"
        return f"{car} {model} {start}-{end}"



class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

class TwoFAVerifySerializer(serializers.Serializer):
    username = serializers.CharField()
    token = serializers.CharField()





class SaleSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.customer_name', read_only=True)
    
    class Meta:
        model = Sale
        fields = ['sale_id', 'date', 'total_amount', 'customer_name']
        
        
class StockInSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    receipt_number = serializers.CharField()
    quantity = serializers.IntegerField(min_value=1)
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    condition_id = serializers.IntegerField()

    def validate(self, data):
        # Validate related objects exist
        try:
            data['product'] = Product.objects.get(pk=data['product_id'])
        except Product.DoesNotExist:
            raise serializers.ValidationError({"product_id": "Product does not exist."})

        try:
            data['supply'] = Supply.objects.get(receipt_number=data['receipt_number'])
        except Supply.DoesNotExist:
            raise serializers.ValidationError({"receipt_number": "Supply with this receipt number does not exist."})

        try:
            data['condition'] = Condition.objects.get(pk=data['condition_id'])
        except Condition.DoesNotExist:
            raise serializers.ValidationError({"condition_id": "Condition does not exist."})

        return data


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ["supplier_id", "name"]

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ["brand_id", "name"]

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["category_id", "name"]
        

# USER CART TO SALES TO DELIVERY SERIALIZERS

class SaleDetailsSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = SaleDetails
        fields = ["sale_detail_id", "product", "product_name", "quantity", "selling_price", "sub_total"]

class DeliverySerializer(serializers.ModelSerializer):
    courier_name = serializers.CharField(source="courier.name", read_only=True)
    status_name = serializers.CharField(source="status.status_name", read_only=True)
    address_text = serializers.CharField(source="address.street_house_building_no", read_only=True)
    items = serializers.SerializerMethodField()
    customer_name = serializers.CharField(source="sale.user.user_name", read_only=True)  # 👈 added
    username = serializers.CharField(source="sale.user.username", read_only=True)        # 👈 added

    class Meta:
        model = Delivery
        fields = [
            "delivery_id",
            "sale",
            "courier",
            "courier_name",
            "address",
            "address_text",
            "delivery_fee",
            "overall_total",
            "date",
            "status",
            "status_name",
            "tracking_number",
            "items",
            "customer_name",
            "username",
        ]

    def get_items(self, obj):
        from .models import SaleDetails
        sale_items = SaleDetails.objects.filter(sale=obj.sale)
        return SaleDetailsSerializer(sale_items, many=True).data


class ModePaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModePayment
        fields = ["payment_id", "sale", "merchant_id", "ref"]

class SaleSerializer(serializers.ModelSerializer):
    details = SaleDetailsSerializer(many=True, read_only=True, source="saledetails_set")
    delivery = DeliverySerializer(read_only=True, source="delivery_set", many=True)
    payment = ModePaymentSerializer(read_only=True, source="modepayment_set", many=True)

    class Meta:
        model = Sale
        fields = [
            "sale_id", "user", "total_amount", "payment_type", "date",
            "details", "delivery", "payment"
        ]

class UserCartSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    brand_name = serializers.CharField(source="product.brand.name", read_only=True)
    selling_price = serializers.DecimalField(source="product.selling_price", max_digits=10, decimal_places=2, read_only=True)
    category_name = serializers.CharField(source="product.category.name", read_only=True)
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = UserCart
        fields = [
            "user",
            "product",
            "quantity",
            "price_at_addition",
            "created_at",
            "updated_at",
            "product_name",
            "brand_name",
            "category_name", 
            "selling_price",
            "product_image",
        ]

    def get_product_image(self, obj):
        """Return full URL for the first product image, or None if missing."""
        request = self.context.get("request")

        first_image = getattr(obj.product.images.first(), "image", None)
        if first_image and hasattr(first_image, "url"):
            # build full URL like: http://localhost:8000/media/products/DSCF1045.png
            return request.build_absolute_uri(first_image.url) if request else first_image.url

        # fallback placeholder if no image
        return request.build_absolute_uri("/media/placeholder.svg") if request else "/media/placeholder.svg"

        
        
class CheckoutSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    address_id = serializers.IntegerField()
    payment_type = serializers.CharField()
    merchant_id = serializers.IntegerField(required=False, allow_null=True)
    ref = serializers.CharField(required=False, allow_blank=True)
    courier_id = serializers.IntegerField()
    delivery_fee = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)

    def create(self, validated_data):
        from django.db import transaction
        from django.utils import timezone
        from .models import Sale, SaleDetails, UserCart, Delivery, ModePayment, DeliveryStatus

        user_id = validated_data["user_id"]
        address_id = validated_data["address_id"]
        payment_type = validated_data["payment_type"]
        merchant_id = validated_data.get("merchant_id")
        ref = validated_data.get("ref")
        courier_id = validated_data["courier_id"]
        delivery_fee = validated_data.get("delivery_fee", 0)

        cart_items = UserCart.objects.filter(user_id=user_id)
        if not cart_items.exists():
            raise serializers.ValidationError("Cart is empty")

        with transaction.atomic():
            # Create Sale
            sale = Sale.objects.create(
                user_id=user_id,
                total_amount=0,
                payment_type=payment_type,
                date=timezone.now().date()
            )

            total = 0
            for item in cart_items.select_related("product"):
                if item.product.quantity < item.quantity:
                    raise serializers.ValidationError(
                        f"Not enough stock for {item.product.name}"
                    )
                subtotal = item.quantity * item.price_at_addition
                SaleDetails.objects.create(
                    sale=sale,
                    product=item.product,
                    quantity=item.quantity,
                    selling_price=item.price_at_addition,
                    sub_total=subtotal
                )
                # Deduct stock
                item.product.quantity -= item.quantity
                item.product.save(update_fields=["quantity"])
                total += subtotal

            sale.total_amount = total
            sale.save(update_fields=["total_amount"])

            # Mode of Payment
            ModePayment.objects.create(
                sale=sale,
                merchant_id=merchant_id if payment_type.lower() == "online" else None,
                ref=ref if payment_type.lower() == "online" else "COD"
            )

            # Delivery
            pending_status = DeliveryStatus.objects.order_by("sequence_order").first()
            delivery = Delivery.objects.create(
                sale=sale,
                courier_id=courier_id,
                address_id=address_id,
                delivery_fee=delivery_fee,
                overall_total=total + delivery_fee,
                status=pending_status,
                tracking_number=f"TRK{sale.sale_id:06d}"
            )

            # Clear cart
            cart_items.delete()

        return {
            "sale_id": sale.sale_id,
            "total_amount": sale.total_amount,
            "delivery_id": delivery.delivery_id,
            "tracking_number": delivery.tracking_number,
            "message": "Order placed successfully"
        }



# Address Serializers
class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ["region_id", "name"]

class ProvinceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Province
        fields = ["province_id", "name", "region"]

class MunicipalitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Municipality
        fields = ["municipality_id", "name", "province", "postal_code"]

class BarangaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Barangay
        fields = ["barangay_id", "name", "municipality"]

class AddressSerializer(serializers.ModelSerializer):
    barangay_name = serializers.CharField(source="barangay.name", read_only=True)
    municipality_name = serializers.CharField(source="barangay.municipality.name", read_only=True)
    province_name = serializers.CharField(source="barangay.municipality.province.name", read_only=True)
    region_name = serializers.CharField(source="barangay.municipality.province.region.name", read_only=True)

    class Meta:
        model = Address
        fields = [
            "address_id",
            "user",
            "street_house_building_no",
            "barangay",
            "barangay_name",
            "municipality_name",
            "province_name",
            "region_name",
            "is_default",
        ]
        
class CourierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Courier
        fields = ['courier_id', 'name', 'base_rate', 'rate_per_kg', 'max_weight', 'delivery_time']
        
        

class DeliveryStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryStatus
        fields = ["status_id", "status_name", "description", "sequence_order"]