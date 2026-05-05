from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List
import uuid
import json
import asyncio
import random
from pydantic import BaseModel

from models import Restaurant, MenuItem, Order, OrderItem
from redis_client import (
    set_order, get_order, push_pending_order, get_pending_orders,
    push_ready_order, get_ready_orders, update_partner_location,
    publish_order_update, publish_location_update, remove_pending_order, remove_ready_order,
    in_memory_orders, in_memory_pending, in_memory_ready
)
from seed_data import restaurants_data

app = FastAPI(title="FoodRush API")

@app.get("/")
async def root():
    return {"status": "ok", "message": "FoodRush API is running"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active websocket connections: role -> user_id -> WebSocket
active_connections: Dict[str, Dict[str, WebSocket]] = {
    "customer": {},
    "restaurant": {},
    "partner": {}
}

class ConnectionManager:
    async def connect(self, websocket: WebSocket, role: str, user_id: str):
        await websocket.accept()
        if role in active_connections:
            active_connections[role][user_id] = websocket

    def disconnect(self, role: str, user_id: str):
        if role in active_connections and user_id in active_connections[role]:
            del active_connections[role][user_id]

    async def send_personal_message(self, message: dict, role: str, user_id: str):
        if role in active_connections and user_id in active_connections[role]:
            await active_connections[role][user_id].send_json(message)

    async def broadcast(self, message: dict, role: str):
        if role in active_connections:
            for connection in active_connections[role].values():
                await connection.send_json(message)

manager = ConnectionManager()

# --- Auth ---
class LoginRequest(BaseModel):
    name: str
    role: str
    email: str = ""
    phone: str = ""
    restaurantName: str = ""
    restaurantAddress: str = ""
    gstNumber: str = ""

@app.post("/api/login")
async def login(req: LoginRequest):
    user_id = str(uuid.uuid4())
    return {
        "user_id": user_id, 
        "name": req.name, 
        "role": req.role,
        "email": req.email,
        "phone": req.phone,
        "restaurantName": req.restaurantName,
        "restaurantAddress": req.restaurantAddress,
        "gstNumber": req.gstNumber
    }

# --- Restaurant ---
@app.get("/api/restaurants")
async def get_restaurants():
    return restaurants_data

@app.get("/api/restaurants/{id}/menu")
async def get_menu(id: str):
    for r in restaurants_data:
        if r["id"] == id:
            return r["menu"]
    raise HTTPException(status_code=404, detail="Restaurant not found")

@app.post("/api/restaurants/{id}/menu")
async def add_menu_item(id: str, item: MenuItem):
    for r in restaurants_data:
        if r["id"] == id:
            r["menu"].append(item.model_dump())
            return {"status": "success", "item": item}
    raise HTTPException(status_code=404, detail="Restaurant not found")

@app.delete("/api/restaurants/{id}/menu/{item_id}")
async def delete_menu_item(id: str, item_id: str):
    for r in restaurants_data:
        if r["id"] == id:
            r["menu"] = [m for m in r["menu"] if m["id"] != item_id]
            return {"status": "success"}
    raise HTTPException(status_code=404, detail="Restaurant not found")

# --- Orders ---
class CreateOrderRequest(BaseModel):
    customer_id: str
    restaurant_id: str
    items: List[OrderItem]
    total_amount: float
    customer_lat: float
    customer_lng: float

@app.post("/api/orders")
async def place_order(req: CreateOrderRequest):
    order_id = str(uuid.uuid4())
    order_data = Order(
        id=order_id,
        customer_id=req.customer_id,
        restaurant_id=req.restaurant_id,
        items=req.items,
        total_amount=req.total_amount,
        status="Placed",
        customer_lat=req.customer_lat,
        customer_lng=req.customer_lng
    ).model_dump()
    
    set_order(order_id, order_data)
    push_pending_order(order_id)
    in_memory_orders[order_id] = order_data
    in_memory_pending.append(order_id)
    
    # Notify restaurant
    await manager.broadcast({"type": "order_placed", "order": order_data}, "restaurant")
    
    return {"order_id": order_id, "status": "Placed"}

@app.get("/api/orders/{order_id}")
async def get_order_details(order_id: str):
    order = get_order(order_id)
    if not order:
        order = in_memory_orders.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@app.get("/api/orders/customer/{customer_id}")
async def get_customer_orders(customer_id: str):
    orders = [o for o in in_memory_orders.values() if o["customer_id"] == customer_id]
    return orders

@app.get("/api/orders/restaurant/{restaurant_id}")
async def get_restaurant_orders(restaurant_id: str):
    orders = [o for o in in_memory_orders.values() if o["restaurant_id"] == restaurant_id]
    return orders

@app.get("/api/orders/partner/available")
async def get_available_orders():
    ready_ids = get_ready_orders() or in_memory_ready
    orders = []
    for oid in ready_ids:
        o = get_order(oid) or in_memory_orders.get(oid)
        if o:
            orders.append(o)
    return orders

# --- Delivery ---
@app.get("/api/partners/available")
async def get_available_partners():
    return list(active_connections["partner"].keys())

@app.post("/api/partners/{partner_id}/accept/{order_id}")
async def partner_accept_order(partner_id: str, order_id: str):
    order = get_order(order_id) or in_memory_orders.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order["status"] = "Picked Up"
    order["partner_id"] = partner_id
    set_order(order_id, order)
    in_memory_orders[order_id] = order
    
    remove_ready_order(order_id)
    if order_id in in_memory_ready:
        in_memory_ready.remove(order_id)
    
    await manager.send_personal_message({"type": "order_picked_up", "order_id": order_id, "order": order}, "customer", order["customer_id"])
    await manager.send_personal_message({"type": "order_picked_up", "order_id": order_id, "order": order}, "restaurant", order["restaurant_id"])
    
    return {"status": "success"}

# --- WebSocket ---
@app.websocket("/ws/{role}/{user_id}")
async def websocket_endpoint(websocket: WebSocket, role: str, user_id: str):
    await manager.connect(websocket, role, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            msg_type = message.get("type")
            
            if msg_type in ["order_confirmed", "order_rejected", "order_preparing", "order_ready"]:
                order_id = message["order_id"]
                order = get_order(order_id) or in_memory_orders.get(order_id)
                if order:
                    status_map = {
                        "order_confirmed": "Confirmed",
                        "order_rejected": "Rejected",
                        "order_preparing": "Preparing",
                        "order_ready": "Ready for Pickup"
                    }
                    order["status"] = status_map[msg_type]
                    set_order(order_id, order)
                    in_memory_orders[order_id] = order
                    
                    if msg_type == "order_ready":
                        push_ready_order(order_id)
                        if order_id not in in_memory_ready:
                            in_memory_ready.append(order_id)
                        await manager.broadcast({"type": "new_available_order", "order": order}, "partner")
                    
                    await manager.send_personal_message({"type": msg_type, "order_id": order_id, "status": order["status"]}, "customer", order["customer_id"])

            elif msg_type == "order_delivered":
                order_id = message["order_id"]
                order = get_order(order_id) or in_memory_orders.get(order_id)
                if order:
                    order["status"] = "Delivered"
                    set_order(order_id, order)
                    in_memory_orders[order_id] = order
                    await manager.send_personal_message({"type": "order_delivered", "order_id": order_id}, "customer", order["customer_id"])
                    await manager.send_personal_message({"type": "order_delivered", "order_id": order_id}, "restaurant", order["restaurant_id"])

            elif msg_type == "location_update":
                lat = message["lat"]
                lng = message["lng"]
                order_id = message.get("order_id")
                
                if order_id:
                    order = get_order(order_id) or in_memory_orders.get(order_id)
                    if order:
                        await manager.send_personal_message({"type": "location_broadcast", "lat": lat, "lng": lng, "order_id": order_id}, "customer", order["customer_id"])
                        
    except WebSocketDisconnect:
        manager.disconnect(role, user_id)
    except Exception as e:
        manager.disconnect(role, user_id)
        print(f"WS error: {e}")

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
