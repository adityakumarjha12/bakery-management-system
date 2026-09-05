from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional

from database import engine, Base, SessionLocal
from models import Product, Inventory, Order, Customer

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Bakery Management System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://effervescent-kleicha-e9bd9b.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category: str
    stock: int = 0
class InventoryCreate(BaseModel):
    product_id: int
    quantity: int = 0
    minimum_stock: int = 5

@app.get("/")
def home():
    return {
        "message": "Welcome to the Bakery Management System!"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.get("/products")
def get_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()

    result = []

    for product in products:
        inventory = db.query(Inventory).filter(
            Inventory.product_id == product.id
        ).first()

        result.append({
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "price": product.price,
            "category": product.category,
            "stock": inventory.quantity if inventory else 0
        })

    return result

@app.post("/products")
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db)
):
    new_product = Product(
        name=product.name,
        description=product.description,
        price=product.price,
        category=product.category,
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    new_inventory = Inventory(
        product_id=new_product.id,
        quantity=product.stock,
        minimum_stock=5
    )

    db.add(new_inventory)
    db.commit()

    return {
        "id": new_product.id,
        "name": new_product.name,
        "description": new_product.description,
        "price": new_product.price,
        "category": new_product.category,
        "stock": new_inventory.quantity
    }
@app.put("/products/{product_id}")
def update_product(
    product_id: int,
    product: ProductCreate,
    db: Session = Depends(get_db)
):
    existing_product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not existing_product:
        return {"message": "Product not found"}

    existing_product.name = product.name
    existing_product.description = product.description
    existing_product.price = product.price
    existing_product.category = product.category
    existing_inventory = db.query(Inventory).filter(
        Inventory.product_id == product_id
    ).first()

    if existing_inventory:
        existing_inventory.quantity = product.stock
    db.commit()
    db.refresh(existing_product)

    return {
        "id": existing_product.id,
        "name": existing_product.name,
        "description": existing_product.description,
        "price": existing_product.price,
        "category": existing_product.category,
        "stock": existing_inventory.quantity if existing_inventory else 0
    }

@app.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    existing_product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not existing_product:
        return {"message": "Product not found"}

    existing_inventory = db.query(Inventory).filter(
        Inventory.product_id == product_id
    ).first()

    if existing_inventory:
        db.delete(existing_inventory)

    db.delete(existing_product)
    db.commit()

    return {"message": "Product deleted successfully"}
@app.post("/inventory")
def create_inventory(
    inventory: InventoryCreate,
    db: Session = Depends(get_db)
):
    new_inventory = Inventory(
        product_id=inventory.product_id,
        quantity=inventory.quantity,
        minimum_stock=inventory.minimum_stock
    )

    db.add(new_inventory)
    db.commit()
    db.refresh(new_inventory)

    return new_inventory


@app.get("/inventory")
def get_inventory(db: Session = Depends(get_db)):
    return db.query(Inventory).all()
@app.put("/inventory/{inventory_id}")
def update_inventory(
    inventory_id: int,
    quantity: int,
    minimum_stock: int,
    db: Session = Depends(get_db)
):
    existing_inventory = db.query(Inventory).filter(
        Inventory.id == inventory_id
    ).first()

    if not existing_inventory:
        return {"message": "Inventory not found"}

    existing_inventory.quantity = quantity
    existing_inventory.minimum_stock = minimum_stock

    db.commit()
    db.refresh(existing_inventory)

    return existing_inventory
@app.get("/inventory/low-stock")
def get_low_stock(db: Session = Depends(get_db)):
    low_stock_items = db.query(Inventory).filter(
        Inventory.quantity <= Inventory.minimum_stock
    ).all()

    return low_stock_items
class OrderCreate(BaseModel):
    customer_id: int
    product_id: int
    quantity: int


@app.post("/orders")
def create_order(
    order: OrderCreate,
    db: Session = Depends(get_db)
):
    customer = db.query(Customer).filter(
        Customer.id == order.customer_id
    ).first()

    if not customer:
        return {"message": "Customer not found"}

    product = db.query(Product).filter(
        Product.id == order.product_id
    ).first()

    if not product:
        return {"message": "Product not found"}

    if order.quantity <= 0:
        return {"message": "Quantity must be greater than 0"}

    inventory = db.query(Inventory).filter(
        Inventory.product_id == order.product_id
    ).first()

    if not inventory:
        return {"message": "Inventory not found"}

    if inventory.quantity < order.quantity:
        return {
            "message": "Insufficient stock",
            "available_stock": inventory.quantity
        }

    total_price = product.price * order.quantity

    new_order = Order(
    customer_id=order.customer_id,
    customer_name=customer.name,
    product_id=order.product_id,
    quantity=order.quantity,
    total_price=total_price,
    status="Pending"
    )

    inventory.quantity -= order.quantity

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    return new_order

@app.get("/orders")
def get_orders(db: Session = Depends(get_db)):
    return db.query(Order).all()
class OrderStatusUpdate(BaseModel):
    status: str


@app.put("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    order_status: OrderStatusUpdate,
    db: Session = Depends(get_db)
):
    existing_order = db.query(Order).filter(
        Order.id == order_id
    ).first()

    if not existing_order:
        return {"message": "Order not found"}

    allowed_statuses = [
        "Pending",
        "Preparing",
        "Ready",
        "Completed"
    ]

    if order_status.status not in allowed_statuses:
        return {
            "message": "Invalid status",
            "allowed_statuses": allowed_statuses
        }

    existing_order.status = order_status.status

    db.commit()
    db.refresh(existing_order)

    return existing_order
class CustomerCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None


@app.post("/customers")
def create_customer(
    customer: CustomerCreate,
    db: Session = Depends(get_db)
):
    new_customer = Customer(
        name=customer.name,
        phone=customer.phone,
        email=customer.email,
        address=customer.address
    )

    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)

    return new_customer


@app.get("/customers")
def get_customers(db: Session = Depends(get_db)):
    return db.query(Customer).all()


@app.put("/customers/{customer_id}")
def update_customer(
    customer_id: int,
    customer: CustomerCreate,
    db: Session = Depends(get_db)
):
    existing_customer = db.query(Customer).filter(
        Customer.id == customer_id
    ).first()

    if not existing_customer:
        return {"message": "Customer not found"}

    existing_customer.name = customer.name
    existing_customer.phone = customer.phone
    existing_customer.email = customer.email
    existing_customer.address = customer.address

    db.commit()
    db.refresh(existing_customer)

    return existing_customer


@app.delete("/inventory/{inventory_id}")
def delete_inventory(
    inventory_id: int,
    db: Session = Depends(get_db)
):
    existing_inventory = db.query(Inventory).filter(
        Inventory.id == inventory_id
    ).first()

    if not existing_inventory:
        return {"message": "Inventory not found"}

    db.delete(existing_inventory)
    db.commit()

    return {"message": "Inventory deleted successfully"}
@app.delete("/customers/{customer_id}")
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db)
):
    existing_customer = db.query(Customer).filter(
        Customer.id == customer_id
    ).first()

    if not existing_customer:
        return {"message": "Customer not found"}

    db.delete(existing_customer)
    db.commit()

    return {"message": "Customer deleted successfully"}
# Dashboard
@app.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    total_products = db.query(Product).count()
    total_customers = db.query(Customer).count()
    total_orders = db.query(Order).count()

    total_sales = db.query(Order).with_entities(
        func.sum(Order.total_price)
    ).scalar() or 0

    pending_orders = db.query(Order).filter(
        Order.status == "Pending"
    ).count()

    low_stock_items = db.query(Inventory).filter(
        Inventory.quantity <= Inventory.minimum_stock
    ).count()

    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "total_sales": total_sales,
        "pending_orders": pending_orders,
        "low_stock_items": low_stock_items
    }
