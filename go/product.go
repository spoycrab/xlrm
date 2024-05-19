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
	//To Do: Verificar se ja existe PROD com o mesmo CODIGO
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
