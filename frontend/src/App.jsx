import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [newOrder, setNewOrder] = useState({
    customer_id: "",
    product_id: "",
    quantity: "",
  });
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
const [newCustomer, setNewCustomer] = useState({
  name: "",
  email: "",
  phone: "",
});
  const [editingProduct, setEditingProduct] = useState(null);

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
  });
  const handleDeleteProduct = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/products/${productId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      setProducts(products.filter((product) => product.id !== productId));
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    }
  };
  const handleEditProduct = (product) => {
    setEditingProduct(product);
  };
  
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/products/${editingProduct.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editingProduct.name,
            description: editingProduct.description,
            price: Number(editingProduct.price),
            category: editingProduct.category,
            stock: Number(editingProduct.stock),
          }),
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to update product");
      }
  
      const updatedProduct = await response.json();
  
      setProducts(
        products.map((product) =>
          product.id === updatedProduct.id ? updatedProduct : product
        )
      );
  
      setEditingProduct(null);
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product");
    }
  };
  const handleCreateOrder = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_id: Number(newOrder.customer_id),
          product_id: Number(newOrder.product_id),
          quantity: Number(newOrder.quantity),
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Failed to create order");
      }
      const productsResponse = await fetch(
        "http://127.0.0.1:8000/products"
      );
      
      const updatedProducts = await productsResponse.json();
      
      setProducts(updatedProducts);
      const ordersResponse = await fetch("http://127.0.0.1:8000/orders");
      const updatedOrders = await ordersResponse.json();
      setOrders(updatedOrders);
      alert("Order created successfully!");
      setNewOrder({
        customer_id: "",
        product_id: "",
        quantity: "",
      });
  
      setShowOrderForm(false);
    } catch (error) {
      console.error("Error creating order:", error);
      alert(error.message);
    }
  };
  const handleAddCustomer = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/customers",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newCustomer),
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to add customer");
      }
  
      const addedCustomer = await response.json();
  
      setCustomers([...customers, addedCustomer]);
  
      setNewCustomer({
        name: "",
        email: "",
        phone: "",
      });
  
      setShowCustomerForm(false);
    } catch (error) {
      console.error("Error adding customer:", error);
      alert("Failed to add customer");
    }
  };
  const handleAddProduct = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch("http://127.0.0.1:8000/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newProduct,
          price: Number(newProduct.price),
          stock: Number(newProduct.stock),
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to add product");
      }
  
      const addedProduct = await response.json();
  
      setProducts([...products, addedProduct]);
  
      setNewProduct({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
      });
  
      setShowForm(false);
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product");
    }
  };
  useEffect(() => {
    fetch("http://127.0.0.1:8000/products")
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
      });
  }, []);
  useEffect(() => {
    fetch("http://127.0.0.1:8000/customers")
      .then((response) => response.json())
      .then((data) => {
        setCustomers(data);
      })
      .catch((error) => {
        console.error("Error fetching customers:", error);
      });
  }, []);
  useEffect(() => {
    fetch("http://127.0.0.1:8000/orders")
      .then((response) => response.json())
      .then((data) => {
        setOrders(data);
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
      });
  }, []);
  const lowStock = products.filter(
    (product) => product.stock <= 5
  ).length;

  return (
    <div className="app">
      <header className="header">
      <h1>
        <span className="bakery-icon">✦</span> Sweet Bakery
      </h1>
      <p>Freshly Baked • Freshly Served</p>
        <p>Bakery Management System</p>
      </header>

      <main>
      <section className="dashboard">
      <div className="cards">
      <div className="card">
            <h3>Products</h3>
            <p>{products.length}</p>
          </div>

          <div className="card">
            <h3>Inventory Items</h3>
            <p>{products.length}</p>
          </div>

          <div className="card">
            <h3>Low Stock</h3>
            <p>{lowStock}</p>
          </div>
          
          <div className="card">
            <h3>Total Orders</h3>
            <p>{orders.length}</p>
          </div>

          <div className="card">
            <h3>Total Sales</h3>
            <p>₹{orders.reduce((total, order) => total + order.total_price, 0)}</p>
           </div>

           </div>
        </section>

        <section>
  <h2>Inventory</h2>

  <div className="inventory-summary">
    <p>
      Total inventory items: <strong>{products.length}</strong>
    </p>

    <p>
      Low stock items: <strong>{lowStock}</strong>
    </p>
  </div>

  <div className="inventory-list">
    {products.map((product) => (
      <div className="inventory-item" key={product.id}>
        <div className="inventory-info">
          <h3>{product.name}</h3>

          <span className="category-badge">
            {product.category}
          </span>

          <p>{product.description}</p>
        </div>

        <div className="inventory-stock">
          <span className="inventory-label">
            Current Stock
          </span>

          <strong>{product.stock}</strong>

          <span className="inventory-label">
            Minimum Stock: 5
          </span>

          <span
            className={
              product.stock <= 5
                ? "stock-badge low"
                : "stock-badge good"
            }
          >
            {product.stock <= 5 ? "Low Stock" : "In Stock"}
          </span>
        </div>

        <div className="inventory-action">
          <button
            onClick={() => handleEditProduct(product)}
          >
            Edit
          </button>
        </div>
      </div>
    ))}
  </div>
</section>
       <section>
  <h2>Customers</h2>
  <button
  className="add-customer-btn"
  onClick={() => setShowCustomerForm(!showCustomerForm)}
>
+ Add Customer
</button>

  {showCustomerForm && (
  <div className="customer-form">
     <input
  type="text"
  placeholder="Customer name"
  value={newCustomer.name}
  onChange={(e) =>
    setNewCustomer({ ...newCustomer, name: e.target.value })
  }
/>

<input
  type="email"
  placeholder="Customer email"
  value={newCustomer.email}
  onChange={(e) =>
    setNewCustomer({ ...newCustomer, email: e.target.value })
  }
/>

<input
  type="text"
  placeholder="Customer phone"
  value={newCustomer.phone}
  onChange={(e) =>
    setNewCustomer({ ...newCustomer, phone: e.target.value })
  }
/>

<button onClick={handleAddCustomer}>Add Customer</button> 
    </div>
  )}
  {customers.map((customer) => (
  <div className="customer-card" key={customer.id}>
    <h3>{customer.name}</h3>
    <p>{customer.email}</p>
    <p>{customer.phone}</p>
  </div>
))}
     </section>
       <section>
       <div className="products-header">
  <h2>Products</h2>

  <input
  type="text"
  placeholder="Search products..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  style={{
    width: "120px",
    height: "38px",
    fontSize: "14px",
    padding: "8px"
  }}
/>
  <select
    value={categoryFilter}
    onChange={(e) => setCategoryFilter(e.target.value)}
  >
    <option value="">All Categories</option>
    <option value="Cake">Cake</option>
  </select>
  <button onClick={() => setShowForm(!showForm)}>
  + Add Product
  </button>
</div>
{editingProduct && (
  <form className="product-form edit-form" onSubmit={handleUpdateProduct}>
    <h3>Edit Product</h3>

    <input
      type="text"
      placeholder="Product name"
      value={editingProduct.name || ""}
      onChange={(e) =>
        setEditingProduct({
          ...editingProduct,
          name: e.target.value,
        })
      }
      required
    />

    <input
      type="text"
      placeholder="Description"
      value={editingProduct.description || ""}
      onChange={(e) =>
        setEditingProduct({
          ...editingProduct,
          description: e.target.value,
        })
      }
    />

    <input
      type="number"
      placeholder="Price"
      value={editingProduct.price || ""}
      onChange={(e) =>
        setEditingProduct({
          ...editingProduct,
          price: e.target.value,
        })
      }
      required
    />

    <input
      type="text"
      placeholder="Category"
      value={editingProduct.category || ""}
      onChange={(e) =>
        setEditingProduct({
          ...editingProduct,
          category: e.target.value,
        })
      }
      required
    />

    <input
      type="number"
      placeholder="Stock"
      value={editingProduct.stock || ""}
      onChange={(e) =>
        setEditingProduct({
          ...editingProduct,
          stock: e.target.value,
        })
      }
      required
    />

    <button type="submit">Save Changes</button>

    <button
      type="button"
      onClick={() => setEditingProduct(null)}
    >
      Cancel
    </button>
  </form>
)}
  {showForm && (
    <form className="product-form" onSubmit={handleAddProduct}>
      <input
        type="text"
        placeholder="Product name"
        value={newProduct.name}
        onChange={(e) =>
          setNewProduct({ ...newProduct, name: e.target.value })
        }
        required
      />

      <input
        type="text"
        placeholder="Description"
        value={newProduct.description}
        onChange={(e) =>
          setNewProduct({ ...newProduct, description: e.target.value })
        }
      />

      <input
        type="number"
        placeholder="Price"
        value={newProduct.price}
        onChange={(e) =>
          setNewProduct({ ...newProduct, price: e.target.value })
        }
        required
      />

      <input
        type="text"
        placeholder="Category"
        value={newProduct.category}
        onChange={(e) =>
          setNewProduct({ ...newProduct, category: e.target.value })
        }
        required
      />

      <input
        type="number"
        placeholder="Stock"
        value={newProduct.stock}
        onChange={(e) =>
          setNewProduct({ ...newProduct, stock: e.target.value })
        }
        required
      />

      <button type="submit">Add Product</button>

      <button type="button" onClick={() => setShowForm(false)}>
        Cancel
      </button>
    </form>
  )}

  {loading ? (
    <p>Loading products...</p>
  ) : (
            <div className="products">
              {products
               .filter(
                 (product) =>
                  product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                  (categoryFilter === "" || product.category === categoryFilter)
               )
               .map((product) => (
                <div className="product-card" key={product.id}>
                <h3>{product.name}</h3>
                 
                 <span className="category-badge">
                  {product.category}
                 </span>

                 <p>{product.description}</p>
                  <strong>₹{product.price}</strong>
                  <p>Stock: {product.stock}</p>
                  <p>Minimum Stock: 5</p>
                  <p className={product.stock <= 5 ? "stock-badge low" : "stock-badge good"}>
                     {product.stock <= 5 ? "Low Stock" : "In Stock"}
                  </p>
                  <button onClick={() => handleEditProduct(product)}>Edit</button>
                  <button onClick={() => handleDeleteProduct(product.id)}>Delete</button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
  <div className="products-header">
    <h2>Orders</h2>
    <button onClick={() => setShowOrderForm(!showOrderForm)}>
    + Create Order
    </button>
  </div>

  {showOrderForm && (
  <div className="order-form">
  <select
  value={newOrder.customer_id}
  onChange={(e) =>
    setNewOrder({ ...newOrder, customer_id: e.target.value })
  }
>
  <option value="">Select Customer</option>

  {customers.map((customer) => (
    <option key={customer.id} value={customer.id}>
      {customer.name}
    </option>
  ))}
</select>

<select
  value={newOrder.product_id}
  onChange={(e) =>
    setNewOrder({
      ...newOrder,
      product_id: e.target.value,
      quantity: "",
    })
  }
>
  <option value="">Select Product</option>

  {products.map((product) => (
  <option
    key={product.id}
    value={product.id}
    disabled={product.stock === 0}
  >
    {product.name} {product.stock === 0 ? "(Out of Stock)" : ""}
  </option>
))}
</select>   

<input
  type="number"
  placeholder="Quantity"
  min="1"
  max={
    products.find(
      (product) => product.id === Number(newOrder.product_id)
    )?.stock || 1
  }
  value={newOrder.quantity}
  onChange={(e) =>
    setNewOrder({ ...newOrder, quantity: e.target.value })
  }
/>

{newOrder.product_id && (
  <p>
    Available stock:{" "}
    {products.find(
      (product) => product.id === Number(newOrder.product_id)
    )?.stock ?? 0}
  </p>
)}

<button onClick={handleCreateOrder}>
  Create Order
</button>
    </div>
  )}
  {orders.map((order) => (
  <div className="order-card" key={order.id}>
    <div>
      <strong>Order #{order.id}</strong>
      <p>Customer: {order.customer_name}</p>
    </div>

    <div>
      <p>Quantity: {order.quantity}</p>
      <p>Total: ₹{order.total_price}</p>
      <p
  className={`order-status ${
    order.status?.toLowerCase() === "completed"
      ? "completed"
      : "pending"
  }`}
>
  {order.status}
</p>
    </div>
  </div>
))}
</section>

</main>
    </div>
  );
}

export default App;