package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"
)

type Product struct {
	Id           int64   `json:"id"`
	Code         int32   `json:"code"`
	Name         string  `json:"name"`
	Manufacturer string  `json:"manufacturer"`
	Description  string  `json:"description"`
	Quantity     int32   `json:"quantity"`
	Price        float64 `json:"price"`
	Hidden       uint8   `json:"hidden"`
	Created      string  `json:"created"`
	Updated      string  `json:"updated"`
}

func getProductById(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	result, err := selectProductById(id)
	if err == sql.ErrNoRows {
		w.WriteHeader(http.StatusNotFound)
		return
	} else if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	b, err := json.Marshal(result)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	fmt.Fprintf(w, "%s\n", string(b))
}

func registerProduct(w http.ResponseWriter, r *http.Request) {
	var product Product

	err := json.NewDecoder(r.Body).Decode(&product)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	if err := validateProduct(product); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	_, err = selectProductByCode(int64(product.Code))
	if err == nil {
		log.Println("Product Code is invalid or already in use")
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, `{"err": "Product Code is invalid or already in use."}`+"\n")
		return
	}
	product.Id = 0
	now := time.Now().Format(time.DateTime)
	product.Created = now
	product.Updated = now

	id, err := insertProduct(&product)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	ret, err := selectProductById(id)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	b, err := json.Marshal(ret)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Location", strconv.FormatInt(id, 10))
	w.WriteHeader(http.StatusCreated)

	fmt.Fprintf(w, "%s\n", string(b))
}

func validateProduct(product Product) error {
	if product.Name == "" {
		return fmt.Errorf("name cannot be empty")
	}
	if product.Manufacturer == "" {
		return fmt.Errorf("manufacturer cannot be empty")
	}
	if product.Quantity < 0 {
		return fmt.Errorf("quantity cannot be negative")
	}
	if product.Price < 0 {
		return fmt.Errorf("price cannot be negative")
	}
	return nil
}

func selectProductById(value int64) (Product, error) {
	var result Product

	row := db.QueryRow("SELECT * FROM Product WHERE id = ?;", value)

	if err := row.Scan(&result.Id, &result.Code, &result.Name, &result.Manufacturer,
		&result.Description, &result.Quantity, &result.Price, &result.Hidden,
		&result.Created, &result.Updated); err != nil {
		if err == sql.ErrNoRows {
			return result, err
		}
		return result, err
	}
	return result, nil
}

func selectProductByCode(value int64) (Product, error) {
	var result Product

	row := db.QueryRow("SELECT * FROM Product WHERE code = ?;", value)

	if err := row.Scan(&result.Id, &result.Code, &result.Name, &result.Manufacturer,
		&result.Description, &result.Quantity, &result.Price, &result.Hidden,
		&result.Created, &result.Updated); err != nil {
		if err == sql.ErrNoRows {
			return result, err
		}
		return result, err
	}
	return result, nil
}

func insertProduct(product *Product) (int64, error) {
	query := `INSERT INTO Product (code, name, manufacturer, description, quantity, price, hidden, created, updated)
	VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
	result, err := db.Exec(query, product.Code, product.Name, product.Manufacturer, product.Description, product.Quantity, product.Price, product.Hidden, product.Created, product.Updated)
	if err != nil {
		return 0, err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}
	return id, nil
}

// getProductsByDate?startDate=2024-05-01&endDate=2024-08-31
func getProductsByDate(w http.ResponseWriter, r *http.Request) {

	startDate := r.URL.Query().Get("startDate")
	endDate := r.URL.Query().Get("endDate")

	if startDate == "" || endDate == "" {
		http.Error(w, "startDate and endDate parameters are required", http.StatusBadRequest)
		return
	}

	// Parse the start and end dates
	start, err := time.Parse("2006-01-02", startDate)
	if err != nil {
		http.Error(w, "Invalid startDate format. Use YYYY-MM-DD", http.StatusBadRequest)
		return
	}
	end, err := time.Parse("2006-01-02", endDate)
	if err != nil {
		http.Error(w, "Invalid endDate format. Use YYYY-MM-DD", http.StatusBadRequest)
		return
	}

	// Realizar a consulta no banco de dados
	query := `
			SELECT id, code, name, manufacturer, description, quantity, price, hidden, created, updated
			FROM Product
			WHERE created BETWEEN ? AND ?
		`
	rows, err := db.Query(query, start, end)
	if err != nil {
		http.Error(w, "Failed to query database", http.StatusInternalServerError)
		log.Println("Error querying database:", err)
		return
	}
	defer rows.Close()

	// Iterar sobre os resultados e adicionar à lista de produtos
	var products []Product
	for rows.Next() {
		var product Product
		if err := rows.Scan(&product.Id, &product.Code, &product.Name, &product.Manufacturer,
			&product.Description, &product.Quantity, &product.Price, &product.Hidden,
			&product.Created, &product.Updated); err != nil {
			http.Error(w, "Failed to scan database result", http.StatusInternalServerError)
			log.Println("Error scanning database result:", err)
			return
		}
		products = append(products, product)
	}

	// Verificar se houve erros na iteração
	if err := rows.Err(); err != nil {
		http.Error(w, "Failed to iterate over database results", http.StatusInternalServerError)
		log.Println("Error iterating over database results:", err)
		return
	}

	// Retornar os resultados como JSON
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(products); err != nil {
		http.Error(w, "Failed to encode response as JSON", http.StatusInternalServerError)
		log.Println("Error encoding response as JSON:", err)
		return
	}
}

func getProductsByQuery(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")
	name := r.URL.Query().Get("name")
	manufacturer := r.URL.Query().Get("manufacturer")
	description := r.URL.Query().Get("description")

	// Construir a consulta SQL dinamicamente
	query := `
			SELECT id, code, name, manufacturer, description, quantity, price, hidden, created, updated
			FROM Product
			WHERE hidden = 0
		`
	args := []interface{}{}

	if code != "" {
		query += " AND code LIKE ?"
		args = append(args, "%"+code+"%")
	}
	if name != "" {
		query += " AND name LIKE ?"
		args = append(args, "%"+name+"%")
	}
	if manufacturer != "" {
		query += " AND manufacturer LIKE ?"
		args = append(args, "%"+manufacturer+"%")
	}
	if description != "" {
		query += " AND description LIKE ?"
		args = append(args, "%"+description+"%")
	}

	// Realizar a consulta no banco de dados
	rows, err := db.Query(query, args...)
	if err != nil {
		http.Error(w, "Failed to query database", http.StatusInternalServerError)
		log.Println("Error querying database:", err)
		return
	}
	defer rows.Close()

	// Iterar sobre os resultados e adicionar à lista de produtos
	var products []Product
	for rows.Next() {
		var product Product
		if err := rows.Scan(&product.Id, &product.Code, &product.Name, &product.Manufacturer,
			&product.Description, &product.Quantity, &product.Price, &product.Hidden,
			&product.Created, &product.Updated); err != nil {
			http.Error(w, "Failed to scan database result", http.StatusInternalServerError)
			log.Println("Error scanning database result:", err)
			return
		}
		products = append(products, product)
	}

	// Verificar se houve erros na iteração
	if err := rows.Err(); err != nil {
		http.Error(w, "Failed to iterate over database results", http.StatusInternalServerError)
		log.Println("Error iterating over database results:", err)
		return
	}

	// Retornar os resultados como JSON
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(products); err != nil {
		http.Error(w, "Failed to encode response as JSON", http.StatusInternalServerError)
		log.Println("Error encoding response as JSON:", err)
		return
	}
}

func getAllProducts(w http.ResponseWriter, r *http.Request) {
	query := `
			SELECT id, code, name, manufacturer, description, quantity, price, hidden, created, updated
			FROM Product WHERE hidden = 0
		`

	// Realizar a consulta no banco de dados
	rows, err := db.Query(query)
	if err != nil {
		http.Error(w, "Failed to query database", http.StatusInternalServerError)
		log.Println("Error querying database:", err)
		return
	}
	defer rows.Close()

	// Iterar sobre os resultados e adicionar à lista de produtos
	var products []Product
	for rows.Next() {
		var product Product
		if err := rows.Scan(&product.Id, &product.Code, &product.Name, &product.Manufacturer,
			&product.Description, &product.Quantity, &product.Price, &product.Hidden,
			&product.Created, &product.Updated); err != nil {
			http.Error(w, "Failed to scan database result", http.StatusInternalServerError)
			log.Println("Error scanning database result:", err)
			return
		}
		products = append(products, product)
	}

	// Verificar se houve erros na iteração
	if err := rows.Err(); err != nil {
		http.Error(w, "Failed to iterate over database results", http.StatusInternalServerError)
		log.Println("Error iterating over database results:", err)
		return
	}

	// Retornar os resultados como JSON
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(products); err != nil {
		http.Error(w, "Failed to encode response as JSON", http.StatusInternalServerError)
		log.Println("Error encoding response as JSON:", err)
		return
	}
}

func updateProduct(w http.ResponseWriter, r *http.Request) {

	type ProductTemp struct {
		Id           int64    `json:"id"`
		Code         int32    `json:"code"`
		Name         *string  `json:"name"`
		Manufacturer *string  `json:"manufacturer"`
		Description  *string  `json:"description"`
		Quantity     *int32   `json:"quantity"`
		Price        *float64 `json:"price"`
		Hidden       *uint8   `json:"hidden"`
	}

	var product ProductTemp

	err := json.NewDecoder(r.Body).Decode(&product)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	res, err := selectProductByCode(int64(product.Code))
	if err != nil {
		http.Error(w, "Product not found", http.StatusBadRequest)
		return
	}
	query := "UPDATE Product SET "
	params := []interface{}{}
	if product.Name != nil {
		query += "name = ?, "
		params = append(params, *product.Name)
	}
	if product.Manufacturer != nil {
		query += "manufacturer = ?, "
		params = append(params, *product.Manufacturer)
	}
	if product.Description != nil {
		query += "description = ?, "
		params = append(params, *product.Description)
	}
	if product.Quantity != nil {
		query += "quantity = ?, "
		params = append(params, *product.Quantity)
	}
	if product.Price != nil {
		query += "price = ?, "
		params = append(params, *product.Price)
	}
	if product.Hidden != nil {
		query += "hidden = ?, "
		params = append(params, *product.Hidden)
	}
	query += "updated = NOW() WHERE id = ?"
	params = append(params, res.Id)

	_, err = db.Exec(query, params...)
	if err != nil {
		http.Error(w, "Failed to update product", http.StatusInternalServerError)
		log.Println("Error updating product:", err)
		return
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprint(w, "Product updated successfully")

}

func updateProductQuantity(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Code     int64 `json:"code"`
		Quantity int   `json:"quantity"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		log.Println("Error decoding JSON:", err)
		return
	}

	var currentQuantity int
	query := "SELECT quantity FROM Product WHERE code = ?"
	if err := db.QueryRow(query, req.Code).Scan(&currentQuantity); err != nil {
		http.Error(w, "Product not found", http.StatusNotFound)
		log.Println("Error fetching product quantity:", err)
		return
	}

	newQuantity := currentQuantity + req.Quantity
	if newQuantity < 0 {
		http.Error(w, "Total Quantity cannot be negative", http.StatusBadRequest)
		return
	}

	updateQuery := "UPDATE Product SET quantity = ?, updated = NOW() WHERE code = ?"
	_, err := db.Exec(updateQuery, newQuantity, req.Code)
	if err != nil {
		http.Error(w, "Failed to update product quantity", http.StatusInternalServerError)
		log.Println("Error updating product quantity:", err)
		return
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "Product quantity updated successfully")

}

func deleteProduct(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Code int64 `json:"code"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		log.Println("Error decoding JSON:", err)
		return
	}

	product, err := selectProductByCode(int64(req.Code))
	if err != nil {
		http.Error(w, "Product not found", http.StatusBadRequest)
		return
	}

	if product.Hidden != 0 {
		http.Error(w, "Product Already Deleted", http.StatusBadRequest)
		return
	}

	query := ` UPDATE Product 
			SET hidden = 1, updated = NOW()
			WHERE code = ?
	`
	_, err = db.Exec(query, req.Code)
	if err != nil {
		http.Error(w, "Failed to update product", http.StatusInternalServerError)
		log.Println("Error updating product:", err)
		return
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "Product updated successfully")
}
