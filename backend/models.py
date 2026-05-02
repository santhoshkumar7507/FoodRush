from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class MenuItem(BaseModel):
    id: str
    name: str
    price: float
    category: str
    veg: bool
    image: str

class Restaurant(BaseModel):
    id: str
    name: str
    cuisine: str
    rating: float
    delivery_fee: float
    eta: int
    lat: float
    lng: float
    menu: List[MenuItem]

class OrderItem(BaseModel):
    item_id: str
    name: str
    price: float
    quantity: int

class Order(BaseModel):
    id: str
    customer_id: str
    restaurant_id: str
    items: List[OrderItem]
    total_amount: float
    status: str
    customer_lat: float
    customer_lng: float
    partner_id: Optional[str] = None
