import redis
import json

try:
    redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
    redis_client.ping()
except Exception as e:
    print(f"Redis not available: {e}")
    redis_client = None

def safe_redis_call(func):
    def wrapper(*args, **kwargs):
        if not redis_client:
            return None
        try:
            return func(*args, **kwargs)
        except redis.RedisError as e:
            print(f"Redis error: {e}")
            return None
    return wrapper

@safe_redis_call
def set_order(order_id, order_data):
    redis_client.hset(f"order:{order_id}", mapping={k: json.dumps(v) if isinstance(v, (list, dict)) else v for k, v in order_data.items()})

@safe_redis_call
def get_order(order_id):
    data = redis_client.hgetall(f"order:{order_id}")
    if data and 'items' in data:
        data['items'] = json.loads(data['items'])
    return data

@safe_redis_call
def push_pending_order(order_id):
    redis_client.rpush("orders:pending", order_id)

@safe_redis_call
def get_pending_orders():
    return redis_client.lrange("orders:pending", 0, -1)
    
@safe_redis_call
def remove_pending_order(order_id):
    redis_client.lrem("orders:pending", 0, order_id)

@safe_redis_call
def push_ready_order(order_id):
    redis_client.rpush("orders:ready", order_id)

@safe_redis_call
def get_ready_orders():
    return redis_client.lrange("orders:ready", 0, -1)

@safe_redis_call
def remove_ready_order(order_id):
    redis_client.lrem("orders:ready", 0, order_id)

@safe_redis_call
def update_partner_location(partner_id, lat, lng, timestamp):
    redis_client.hset(f"partner:location:{partner_id}", mapping={"lat": lat, "lng": lng, "timestamp": timestamp})

@safe_redis_call
def publish_order_update(order_id, status):
    redis_client.publish("channel:orders", json.dumps({"order_id": order_id, "status": status}))

@safe_redis_call
def publish_location_update(order_id, lat, lng):
    redis_client.publish(f"channel:location:{order_id}", json.dumps({"lat": lat, "lng": lng}))

# Fallback in-memory storage if Redis is down
in_memory_orders = {}
in_memory_pending = []
in_memory_ready = []
