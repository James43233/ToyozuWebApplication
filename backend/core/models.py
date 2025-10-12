from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.contrib.auth import get_user_model
from django.utils import timezone
import random

class Brand(models.Model):
    brand_id = models.AutoField(primary_key=True, db_column='brand_id')
    name = models.CharField(max_length=100, db_column='name')
    description = models.CharField(max_length=100, db_column='description')

    class Meta:
        db_table = 'brand'
        managed = False

    def __str__(self):
        return self.name

class Category(models.Model):
    category_id = models.AutoField(primary_key=True, db_column='category_id')
    name = models.CharField(max_length=100, db_column='name')
    description = models.CharField(max_length=100, db_column='description')

    class Meta:
        db_table = 'category'
        managed = False

    def __str__(self):
        return self.name
    
class Condition(models.Model):
    condition_id = models.AutoField(primary_key=True, db_column='condition_id')
    name = models.CharField(max_length=50, db_column='name')

    class Meta:
        db_table = 'condition_item'
        managed = False

    def __str__(self):
        return self.name

class Product(models.Model):
    product_id = models.AutoField(primary_key=True, db_column='product_id')
    name = models.CharField(max_length=255, db_column='name')
    description = models.TextField(blank=True, db_column='description')
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, db_column='brand_id')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, db_column='category_id')
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2, db_column='purchase_price')
    selling_price = models.DecimalField(max_digits=10, decimal_places=2, db_column='selling_price')
    quantity = models.IntegerField(db_column='quantity')
    weight = models.FloatField(default=0.5, db_column='weight')  # ✅ new field

    class Meta:
        db_table = 'product'
        managed = False

class ProductImage(models.Model):
    id = models.AutoField(primary_key=True)
    product = models.ForeignKey(Product, related_name="images", on_delete=models.CASCADE, db_column='product_id')
    image = models.ImageField(upload_to="products/", db_column='image')

    class Meta:
        db_table = 'product_image'
        managed = False

class Car(models.Model):
    car_id = models.AutoField(primary_key=True)
    make = models.CharField(max_length=255)
    
    class Meta:
        db_table = 'cars'
        managed = False

    def __str__(self):
        return self.make

class CarModel(models.Model):
    model_id = models.AutoField(primary_key=True)
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name="models")
    model_name = models.CharField(max_length=255)
    
    class Meta: 
        db_table = 'car_models'
        managed = False

    def __str__(self):
        return f"{self.car.make} {self.model_name}"
    
class ProductYear(models.Model):
    year_id = models.AutoField(primary_key=True, db_column="year_id")
    year = models.IntegerField(db_column="year")

    class Meta:
        db_table = "product_years"
        managed = False   # or True if you want Django to manage it
class ProductCarCompatibility(models.Model):
    id = models.AutoField(primary_key=True)   # 👈 surrogate PK
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        db_column="product_id",
        related_name="compatible_cars"   # 👈 cleaner reverse accessor
    )

    car_model = models.ForeignKey(CarModel, on_delete=models.CASCADE, db_column="model_id")

    year_start = models.ForeignKey(
        ProductYear,
        on_delete=models.CASCADE,
        db_column="start_year_id",
        related_name="compatibility_start_set"   # ✅ unique
    )
    year_end = models.ForeignKey(
        ProductYear,
        on_delete=models.CASCADE,
        db_column="end_year_id",
        related_name="compatibility_end_set"     # ✅ unique
    )

    class Meta:
        db_table = "product_car_compatibility"
        managed = False
        unique_together = ("product", "car_model", "year_start", "year_end")



class Supplier(models.Model):
    supplier_id = models.AutoField(primary_key=True, db_column='supplier_id')
    name = models.CharField(max_length=255, db_column='name')
    contact_number = models.CharField(max_length=50, db_column='contact_number')
    address = models.CharField(max_length=255, db_column='address')

    class Meta:
        db_table = 'supplier'
        managed = False

    def __str__(self):
        return self.name
    
class Supply(models.Model):
    supply_id = models.AutoField(primary_key=True, db_column='supply_id')
    user = models.ForeignKey('UserEmployee', on_delete=models.CASCADE, db_column='user_id')
    supplier = models.ForeignKey('Supplier', on_delete=models.CASCADE, db_column='supplier_id')
    total_cost = models.DecimalField(max_digits=12, decimal_places=2, db_column='total_cost')
    receipt_number = models.CharField(max_length=100, db_column='receipt_number')
    date = models.DateField(db_column='date')

    class Meta:
        db_table = 'supply'
        managed = False

class SupplyDetails(models.Model):
    id = models.AutoField(primary_key=True)
    supply = models.ForeignKey('Supply', on_delete=models.CASCADE, db_column='supply_id')
    product = models.ForeignKey('Product', on_delete=models.CASCADE, db_column='product_id')
    quantity = models.IntegerField(db_column='quantity')
    price = models.DecimalField(max_digits=10, decimal_places=2, db_column='price')
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, db_column='sub_total')
    condition = models.ForeignKey('Condition', on_delete=models.CASCADE, db_column='condition_id')

    class Meta:
        db_table = 'supply_details'
        unique_together = (('supply', 'product'),)
        managed = False  # Django will not touch the table!
    def __str__(self):
        return f"SupplyDetails(id={self.id}, supply={self.supply_id}, product={self.product_id})"

class UserEmployeeManager(BaseUserManager):
    def create_user(self, username, password=None, email=None, mobile_phone=None, role=None, user_name=None, **extra_fields):
        if not username:
            raise ValueError('The Username must be set')
        email = self.normalize_email(email)
        user = self.model(
            username=username,
            email=email,
            mobile_phone=mobile_phone,
            role=role,
            User_name=user_name,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password, email=None, **extra_fields):
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(username, password, email, **extra_fields)

class RoleType(models.Model):
    role_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=100)

    class Meta:
        db_table = 'role_type'
        managed = False 
        
class UserEmployee(AbstractBaseUser, PermissionsMixin):
    user_id = models.AutoField(primary_key=True)
    user_name = models.CharField(max_length=255)
    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=128)
    email = models.EmailField(max_length=255, null=True, blank=True)
    mobile_phone = models.CharField(max_length=20, null=True, blank=True)
    # Add this field:
    contact_type = models.CharField(
        max_length=10,
        choices=[('email', 'Email'), ('phone', 'Phone')],
        default='email'
    )
    role = models.ForeignKey(RoleType, on_delete=models.SET_NULL, null=True, db_column='role_id')
    is_superuser = models.BooleanField(default=False)
    last_login = models.DateTimeField(null=True, blank=True)
    profile_picture = models.ImageField(upload_to="profile_pics/", null=True, blank=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['user_name', 'email']


    objects = UserEmployeeManager()

    class Meta:
        db_table = 'user_employee'
        managed = False  

    def __str__(self):
        return self.username

    @property
    def id(self):
        return self.user_id
    
User = get_user_model()

class UserOTP(models.Model):
    METHOD_CHOICES = (
        ('email', 'Email'),
        ('phone', 'Phone'),
    )

    id = models.AutoField(primary_key=True)
    user = models.ForeignKey('UserEmployee', on_delete=models.CASCADE, db_column='user_id', related_name='otps')
    code = models.CharField(max_length=6)
    method = models.CharField(max_length=10, choices=METHOD_CHOICES, default='email')
    confirmed = models.BooleanField(default=False)
    used = models.BooleanField(default=False)  # Optional: track if OTP has been used
    valid_until = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_otp'
        managed = True  # Now Django will handle migrations and DB table

    def __str__(self):
        return f"OTP for {self.user.username} via {self.method} (confirmed={self.confirmed})"

    @staticmethod
    def generate_code():
        import random
        return '{:06d}'.format(random.randint(0, 999999))

    def is_valid(self):
        from django.utils import timezone
        return not self.used and not self.confirmed and timezone.now() < self.valid_until
    
class EmailDevice(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=64)
    confirmed = models.BooleanField()
    user_id = models.IntegerField()
    token = models.CharField(max_length=16)
    valid_until = models.DateTimeField()
    email = models.CharField(max_length=254, null=True, blank=True)
    throttling_failure_count = models.PositiveIntegerField(null=True, blank=True)
    throttling_failure_timestamp = models.DateTimeField(null=True, blank=True)
    last_generated_timestamp = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(null=True, blank=True)
    last_used_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'otp_email_emaildevice'
        managed = False

    def __str__(self):
        return f"{self.email} (confirmed: {self.confirmed})"
    
class UserCart(models.Model):
    cart_id = models.AutoField(primary_key=True, db_column='cart_id')
    user = models.ForeignKey('UserEmployee', on_delete=models.CASCADE, db_column='user_id')
    product = models.ForeignKey('Product', on_delete=models.CASCADE, db_column='product_id')
    quantity = models.IntegerField(db_column='quantity', default=1)
    price_at_addition = models.DecimalField(max_digits=10, decimal_places=2, db_column='price_at_addition')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')

    class Meta:
        db_table = 'user_cart'
        managed = False
        unique_together = ('user', 'product')  # mirrors the DB constraint

    def __str__(self):
        return f"Cart item {self.product} x {self.quantity} for User {self.user}"
    
    
class Region(models.Model):
    region_id = models.AutoField(primary_key=True, db_column='region_id')
    name = models.CharField(max_length=255, db_column='name')

    class Meta:
        db_table = 'region'
        managed = False

    def __str__(self):
        return self.name

class Province(models.Model):
    province_id = models.AutoField(primary_key=True, db_column='province_id')
    region = models.ForeignKey(Region, on_delete=models.CASCADE, db_column='region_id')
    name = models.CharField(max_length=255, db_column='name')

    class Meta:
        db_table = 'province'
        managed = False

    def __str__(self):
        return self.name
    
class Municipality(models.Model):
    municipality_id = models.AutoField(primary_key=True, db_column='municipality_id')
    province = models.ForeignKey(Province, on_delete=models.CASCADE, db_column='province_id')
    name = models.CharField(max_length=255, db_column='name')
    postal_code = models.CharField(max_length=255, db_column='postal_code', null=True, blank=True)

    class Meta:
        db_table = 'municipality'
        managed = False

    def __str__(self):
        return self.name

    
class Barangay(models.Model):
    barangay_id = models.AutoField(primary_key=True, db_column='barangay_id')
    municipality = models.ForeignKey(Municipality, on_delete=models.CASCADE, db_column='municipality_id')
    name = models.CharField(max_length=255, db_column='name')

    class Meta:
        db_table = 'barangay'
        managed = False

class Courier(models.Model):
    courier_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    base_rate = models.DecimalField(max_digits=10, decimal_places=2)
    rate_per_kg = models.DecimalField(max_digits=10, decimal_places=2)
    max_weight = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    delivery_time = models.CharField(max_length=100, blank=True)

    class Meta:
        db_table = "courier"   # 👈 this tells Django to use the existing table name

    def __str__(self):
        return self.name

    def calculate_shipping(self, total_weight):
        if self.max_weight and total_weight > self.max_weight:
            raise ValueError(f"{self.name} only allows up to {self.max_weight} kg")
        return float(self.base_rate) + (float(self.rate_per_kg) * float(total_weight))


    

class Address(models.Model):
    address_id = models.AutoField(primary_key=True, db_column='address_id')
    user = models.ForeignKey('UserEmployee', on_delete=models.CASCADE, db_column='user_id', related_name='addresses')
    street_house_building_no = models.CharField(max_length=255, db_column='street_house_building_no')
    barangay = models.ForeignKey('Barangay', on_delete=models.SET_NULL, null=True, blank=True, db_column='barangay_id')
    is_default = models.BooleanField(default=False, db_column='is_default')

    class Meta:
        db_table = 'address'
        managed = False

    def __str__(self):
        return f"{self.street_house_building_no} (User {self.user_id})"
    
class Sale(models.Model):
    sale_id = models.AutoField(primary_key=True, db_column='sale_id')
    user = models.ForeignKey(
        'UserEmployee',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        db_column='user_id'
    )
    total_amount = models.IntegerField(null=True, blank=True, db_column='total_amount')
    payment_type = models.CharField(max_length=255, null=True, blank=True, db_column='payment_type')
    date = models.DateField(null=True, blank=True, db_column='date')

    class Meta:
        db_table = 'sale'
        managed = False  

    def __str__(self):
        return f"Sale #{self.sale_id} by User {self.user_id if self.user_id else 'N/A'}"


class SaleDetails(models.Model):
    sale_detail_id = models.AutoField(primary_key=True, db_column='sale_detail_id')
    product = models.ForeignKey('Product', on_delete=models.CASCADE, db_column='product_id', null=True, blank=True)
    quantity = models.IntegerField(db_column='quantity', null=True, blank=True)
    selling_price = models.IntegerField(db_column='selling_price', null=True, blank=True)
    sub_total = models.IntegerField(db_column='sub_total', null=True, blank=True)
    sale = models.ForeignKey('Sale', on_delete=models.CASCADE, db_column='sale_id', null=True, blank=True)

    class Meta:
        db_table = 'sale_details'
        managed = False

    def __str__(self):
        return f"SaleDetail #{self.sale_detail_id} for Sale #{self.sale.sale_id if self.sale else 'N/A'}"
    
    

class Delivery(models.Model):
    delivery_id = models.AutoField(primary_key=True, db_column='delivery_id')
    sale = models.ForeignKey('Sale', on_delete=models.CASCADE, db_column='sale_id')
    courier = models.ForeignKey('Courier', on_delete=models.SET_NULL, null=True, blank=True, db_column='courier_id')
    address = models.ForeignKey('Address', on_delete=models.SET_NULL, null=True, blank=True, db_column='address_id')
    delivery_fee = models.IntegerField(db_column='delivery_fee', default=0)
    overall_total = models.IntegerField(db_column='overall_total', default=0)
    date = models.DateField(db_column='date', null=True, blank=True)
    status = models.ForeignKey('DeliveryStatus', on_delete=models.SET_NULL, null=True, blank=True, db_column='status_id')
    tracking_number = models.CharField(max_length=255, db_column='tracking_number', null=True, blank=True)

    class Meta:
        db_table = 'delivery'
        managed = False

    def __str__(self):
        return f"Delivery #{self.delivery_id} for Sale #{self.sale.sale_id}"
    
class ModePayment(models.Model):
    payment_id = models.AutoField(primary_key=True, db_column='payment_id')
    sale = models.ForeignKey('Sale', on_delete=models.CASCADE, db_column='sale_id')
    merchant_id = models.IntegerField(db_column='merchant_id', null=True, blank=True)
    ref = models.CharField(max_length=255, db_column='ref', null=True, blank=True)

    class Meta:
        db_table = 'mode_payment'
        managed = False

    def __str__(self):
        return f"Payment #{self.payment_id} for Sale #{self.sale.sale_id}"

class DeliveryStatus(models.Model):
    status_id = models.AutoField(primary_key=True, db_column='status_id')
    status_name = models.CharField(max_length=100, db_column='status_name')
    description = models.TextField(db_column='description', null=True, blank=True)
    sequence_order = models.IntegerField(db_column='sequence_order', default=0)

    class Meta:
        db_table = 'delivery_statuses'
        managed = False

    def __str__(self):
        return self.status_name
