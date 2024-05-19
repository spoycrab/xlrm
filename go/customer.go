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

type Customer struct {
	Id            int64  `json:"id"`
	FirstName     string `json:"firstName"`
	FullName      string `json:"fullName"`
	Document      string `json:"document"`
	Email         string `json:"email"`
	PhoneNumber   string `json:"phoneNumber"`
	Type          string `json:"type"`
	StreetAddress string `json:"streetAddress"`
	City          string `json:"city"`
	State         string `json:"state"`
	ZipCode       string `json:"zipCode"`
	Country       string `json:"country"`
	Hidden        uint8  `json:"hidden"`
	Created       string `json:"created"`
	Updated       string `json:"updated"`
}

func getCustomerById(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	result, err := selectCustomerById(id)
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

func registerCustomer(w http.ResponseWriter, r *http.Request) {
	var customer Customer

	err := json.NewDecoder(r.Body).Decode(&customer)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	if err := validateCustomer(customer); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	//To Do: Verificar se CPF/CPNJ ja esta cadastrado
	customer.Id = 0
	now := time.Now().Format(time.DateTime)
	customer.Created = now
	customer.Updated = now

	id, err := insertCustomer(&customer)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	ret, err := selectCustomerById(id)
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

func validateCustomer(customer Customer) error {
	if customer.FirstName == "" {
		return fmt.Errorf("firstName cannot be empty")
	}
	if customer.FullName == "" {
		return fmt.Errorf("fullName cannot be empty")
	}
	if customer.Document == "" { //TO DO: Validar CPF e CNPJ
		return fmt.Errorf("document cannot be empty")
	}
	if customer.Email == "" {
		return fmt.Errorf("email cannot be empty")
	}

	return nil
}

func insertCustomer(customer *Customer) (int64, error) {
	query := `
        INSERT INTO Customer (
            firstName, fullName, document, email, phoneNumber,
            type, streetAddress, city, state, zipCode,
            country, hidden, created, updated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
	result, err := db.Exec(query, customer.FirstName, customer.FullName,
		customer.Document, customer.Email, customer.PhoneNumber,
		customer.Type, customer.StreetAddress, customer.City,
		customer.State, customer.ZipCode, customer.Country,
		customer.Hidden, customer.Created, customer.Updated)
	if err != nil {
		return 0, err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	return id, nil
}

func selectCustomerById(value int64) (Customer, error) {
	var result Customer

	row := db.QueryRow("SELECT * FROM Customer WHERE id = ?;", value)

	if err := row.Scan(&result.Id, &result.FirstName, &result.FullName, &result.Document,
		&result.Email, &result.PhoneNumber, &result.Type, &result.StreetAddress,
		&result.City, &result.State, &result.ZipCode, &result.Country,
		&result.Hidden, &result.Created, &result.Updated); err != nil {
		if err == sql.ErrNoRows {
			return result, err
		}
		return result, err
	}

	return result, nil
}
