const express = require('express');
const { createPool } = require('mysql2/promise');

const app = express();
app.use(express.json());

const pool = createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "ass4_db"
});
async function connectDB() {
    try {
        const connection = await pool.getConnection();
        console.log("Database connected successfully");
        connection.release();
    } catch (error) {
        console.log(error.message);
    }
}
connectDB();

async function createTables() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Suppliers (
                SupplierID INT PRIMARY KEY AUTO_INCREMENT,
                SupplierName VARCHAR(100) NOT NULL,
                ContactNumber VARCHAR(30)
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS Products (
                ProductID INT PRIMARY KEY AUTO_INCREMENT,
                ProductName VARCHAR(100) NOT NULL,
                Price DECIMAL(10,2) NOT NULL,
                StockQuantity INT NOT NULL,
                SupplierID INT,
                FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID)
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS Sales (
                SaleID INT PRIMARY KEY AUTO_INCREMENT,
                ProductID INT,
                QuantitySold INT NOT NULL,
                SaleDate DATE,
                FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
            )
        `);

        console.log("Tables are ready");
    } catch (error) {
        console.log(error.message);
    }
}
createTables();

app.post("/products", async (req, res) => {
    try {
        const { ProductName, Price, StockQuantity, SupplierID } = req.body;
        const [result] = await pool.query(
            `INSERT INTO Products (ProductName, Price, StockQuantity, SupplierID)
             VALUES (?, ?, ?, ?)`,
            [ProductName, Price, StockQuantity, SupplierID]
        );
        res.status(201).json({
            message: "Product created successfully",
            ProductID: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get("/products", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM Products");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get("/products/:id", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM Products WHERE ProductID = ?",
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put("/products/add-category", async (req, res) => {
    try {
        await pool.query(
            "ALTER TABLE Products ADD COLUMN Category VARCHAR(100)"
        );
        res.json({ message: "Category added" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete("/products/remove-category", async (req, res) => {
    try {
        await pool.query("ALTER TABLE Products DROP COLUMN Category");
        res.json({ message: "Category removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put("/suppliers/change-contact", async (req, res) => {
    try {
        await pool.query(
            "ALTER TABLE Suppliers MODIFY ContactNumber VARCHAR(15)"
        );
        res.json({ message: "ContactNumber changed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put("/products/require-name", async (req, res) => {
    try {
        await pool.query(
            "ALTER TABLE Products MODIFY ProductName VARCHAR(100) NOT NULL"
        );
        res.json({ message: "ProductName is now NOT NULL" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put("/products/:id", async (req, res) => {
    try {
        const { ProductName, Price, StockQuantity, SupplierID } = req.body;
        const [result] = await pool.query(
            `UPDATE Products
             SET ProductName = ?, Price = ?, StockQuantity = ?, SupplierID = ?
             WHERE ProductID = ?`,
            [ProductName, Price, StockQuantity, SupplierID, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json({ message: "Product updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete("/products/:id", async (req, res) => {
    try {
        const [result] = await pool.query(
            "DELETE FROM Products WHERE ProductID = ?",
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post("/suppliers", async (req, res) => {
    try {
        const { SupplierName, ContactNumber } = req.body;
        const [result] = await pool.query(
            "INSERT INTO Suppliers (SupplierName, ContactNumber) VALUES (?, ?)",
            [SupplierName, ContactNumber]
        );
        res.status(201).json({
            message: "Supplier created",
            SupplierID: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get("/suppliers", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM Suppliers");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put("/suppliers/change-contact", async (req, res) => {
    try {
        await pool.query(
            "ALTER TABLE Suppliers MODIFY ContactNumber VARCHAR(15)"
        );
        res.json({ message: "ContactNumber changed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put("/suppliers/:id", async (req, res) => {
    try {
        const { SupplierName, ContactNumber } = req.body;
        const [result] = await pool.query(
            `UPDATE Suppliers SET SupplierName = ?, ContactNumber = ?
             WHERE SupplierID = ?`,
            [SupplierName, ContactNumber, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Supplier not found" });
        }
        res.json({ message: "Supplier updated" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete("/suppliers/:id", async (req, res) => {
    try {
        const [result] = await pool.query(
            "DELETE FROM Suppliers WHERE SupplierID = ?",
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Supplier not found" });
        }
        res.json({ message: "Supplier deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post("/sales", async (req, res) => {
    try {
        const { ProductID, QuantitySold, SaleDate } = req.body;
        const [result] = await pool.query(
            `INSERT INTO Sales (ProductID, QuantitySold, SaleDate)
             VALUES (?, ?, ?)`,
            [ProductID, QuantitySold, SaleDate]
        );
        res.status(201).json({
            message: "Sale recorded",
            SaleID: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get("/sales", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM Sales");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get("/sales/product/:productId", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM Sales WHERE ProductID = ?",
            [req.params.productId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
app.post("/insert-data", async (req, res) => {
    try {
        const [supplier] = await pool.query(
            "INSERT INTO Suppliers (SupplierName, ContactNumber) VALUES (?, ?)",
            ["FreshFoods", "01001234567"]
        );

        const supplierID = supplier.insertId;

        const [milk] = await pool.query(
            "INSERT INTO Products (ProductName, Price, StockQuantity, SupplierID) VALUES (?, ?, ?, ?)",
            ["Milk", 15.00, 50, supplierID]
        );

        await pool.query(
            "INSERT INTO Products (ProductName, Price, StockQuantity, SupplierID) VALUES (?, ?, ?, ?)",
            ["Bread", 10.00, 30, supplierID]
        );

        await pool.query(
            "INSERT INTO Products (ProductName, Price, StockQuantity, SupplierID) VALUES (?, ?, ?, ?)",
            ["Eggs", 20.00, 40, supplierID]
        );

        await pool.query(
            "INSERT INTO Sales (ProductID, QuantitySold, SaleDate) VALUES (?, ?, ?)",
            [milk.insertId, 2, "2025-05-20"]
        );

        res.status(201).json({ message: "Data inserted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
app.put("/products/update-bread-price", async (req, res) => {
    try {
        const [result] = await pool.query(
            "UPDATE Products SET Price = ? WHERE ProductName = ?",
            [25.00, "Bread"]
        );

        res.json({ message: "Bread price updated", affectedRows: result.affectedRows });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
app.delete("/products/delete-eggs", async (req, res) => {
    try {
        const [result] = await pool.query(
            "DELETE FROM Products WHERE ProductName = ?",
            ["Eggs"]
        );

        res.json({ message: "Eggs deleted", affectedRows: result.affectedRows });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
app.get("/reports/total-sold", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT Products.ProductName,
                   COALESCE(SUM(Sales.QuantitySold),0) AS TotalQuantitySold
            FROM Products
            LEFT JOIN Sales ON Products.ProductID = Sales.ProductID
            GROUP BY Products.ProductID, Products.ProductName
        `);

        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});