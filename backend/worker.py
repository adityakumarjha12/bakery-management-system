import json
import time
import pika

RABBITMQ_HOST = "rabbitmq"

def connect_to_rabbitmq():
    while True:
        try:
            connection = pika.BlockingConnection(
                pika.ConnectionParameters(host=RABBITMQ_HOST)
            )
            print("Connected to RabbitMQ")
            return connection
        except Exception as e:
            print("Waiting for RabbitMQ...", e)
            time.sleep(5)


connection = connect_to_rabbitmq()
channel = connection.channel()

channel.queue_declare(queue="orders", durable=True)

def process_order(ch, method, properties, body):
    order = json.loads(body)

    print(
        f"Processing order #{order['order_id']} "
        f"for customer {order['customer_name']}"
    )

    print(
        f"Product ID: {order['product_id']}, "
        f"Quantity: {order['quantity']}, "
        f"Total: ₹{order['total_price']}"
    )

    print(f"Order #{order['order_id']} processed successfully")

    ch.basic_ack(delivery_tag=method.delivery_tag)


channel.basic_qos(prefetch_count=1)

channel.basic_consume(
    queue="orders",
    on_message_callback=process_order
)

print("Order worker is waiting for messages...")

channel.start_consuming()