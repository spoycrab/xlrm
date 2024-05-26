package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/klassmann/cpfcnpj"
)

type Customer struct {
	Id            int64  `json:"id"`
	FirstName     string `json:"firstName"`
	FullName      string `json:"fullName"`
	Document      string `json:"document"`
	Email         string `json:"email"`
	PhoneNumber   string `json:"phoneNumber"`
	Type          uint8  `json:"type"`
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

// /api/customer/getCustumerByDocument?document=2312323
func getCustumerByDocument(w http.ResponseWriter, r *http.Request) {
	document := r.URL.Query().Get("document")

	if document == "" {
		http.Error(w, "Document parameter is required", http.StatusBadRequest)
		return
	}

	var customer Customer

	// Realizar a consulta no banco de dados
	query := `
		SELECT id, firstName, fullName, document, email, phoneNumber, type, streetAddress, city, state, zipCode, country, hidden, created, updated
		FROM Customer
		WHERE document = ?
	`
	row := db.QueryRow(query, document)

	// Varredura dos resultados na struct Customer
	err := row.Scan(&customer.Id, &customer.FirstName, &customer.FullName, &customer.Document,
		&customer.Email, &customer.PhoneNumber, &customer.Type, &customer.StreetAddress,
		&customer.City, &customer.State, &customer.ZipCode, &customer.Country,
		&customer.Hidden, &customer.Created, &customer.Updated)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Customer not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to query database", http.StatusInternalServerError)
		log.Println("Error querying database:", err)
		return
	}

	// Retornar os resultados como JSON
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(customer); err != nil {
		http.Error(w, "Failed to encode response as JSON", http.StatusInternalServerError)
		log.Println("Error encoding response as JSON:", err)
		return
	}
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

	_, err = selectCustomerByDocument(customer.Document)
	if err == nil {
		log.Println("Document is invalid or already taken.")
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, `{"err": "Document is invalid or already taken."}`+"\n")
		return
	}

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
	if customer.Email == "" {
		return fmt.Errorf("email cannot be empty")
	}
	if customer.Document == "" {
		return fmt.Errorf("document cannot be empty")
	}
	//Validar CPF/CPNJ
	if !cpfcnpj.ValidateCPF(customer.Document) && !cpfcnpj.ValidateCNPJ(customer.Document) {
		return fmt.Errorf("invalid document (CPF/CPNJ)")
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

func selectCustomerByDocument(value string) (Customer, error) {
	var result Customer

	if !cpfcnpj.ValidateCPF(value) && !cpfcnpj.ValidateCNPJ(value) {
		return result, fmt.Errorf("invalid document (CPF/CPNJ)")
	}
	row := db.QueryRow("SELECT * FROM customer WHERE document = ?;", value)
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

// api/customer/getCustomersByName?name=nome
func getCustomersByName(w http.ResponseWriter, r *http.Request) {
	name := r.URL.Query().Get("name")

	if name == "" {
		http.Error(w, "Name parameter is required", http.StatusBadRequest)
		return
	}

	// Realizar a consulta no banco de dados
	query := `
			SELECT id, firstName, fullName, document, email, phoneNumber, type, streetAddress, city, state, zipCode, country, hidden, created, updated
			FROM Customer
			WHERE firstName LIKE ? OR fullName LIKE ?
		`
	rows, err := db.Query(query, "%"+name+"%", "%"+name+"%")
	if err != nil {
		http.Error(w, "Failed to query database", http.StatusInternalServerError)
		log.Println("Error querying database:", err)
		return
	}
	defer rows.Close()

	// Iterar sobre os resultados e adicionar à lista de clientes
	var customers []Customer
	for rows.Next() {
		var customer Customer
		if err := rows.Scan(&customer.Id, &customer.FirstName, &customer.FullName, &customer.Document,
			&customer.Email, &customer.PhoneNumber, &customer.Type, &customer.StreetAddress,
			&customer.City, &customer.State, &customer.ZipCode, &customer.Country,
			&customer.Hidden, &customer.Created, &customer.Updated); err != nil {
			http.Error(w, "Failed to scan database result", http.StatusInternalServerError)
			log.Println("Error scanning database result:", err)
			return
		}
		customers = append(customers, customer)
	}

	// Verificar se houve erros na iteração
	if err := rows.Err(); err != nil {
		http.Error(w, "Failed to iterate over database results", http.StatusInternalServerError)
		log.Println("Error iterating over database results:", err)
		return
	}

	// Retornar os resultados como JSON
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(customers); err != nil {
		http.Error(w, "Failed to encode response as JSON", http.StatusInternalServerError)
		log.Println("Error encoding response as JSON:", err)
		return
	}
}
func getAllCustomers(w http.ResponseWriter, r *http.Request) {
	query := `
			SELECT id, firstName, fullName, document, email, phoneNumber, type, streetAddress, city, state, zipCode, country, hidden, created, updated
			FROM customer
		`

	// Realizar a consulta no banco de dados
	rows, err := db.Query(query)
	if err != nil {
		http.Error(w, "Failed to query database", http.StatusInternalServerError)
		log.Println("Error querying database:", err)
		return
	}
	defer rows.Close()

	// Iterar sobre os resultados e adicionar à lista de clientes
	var customers []Customer
	for rows.Next() {
		var customer Customer
		if err := rows.Scan(&customer.Id, &customer.FirstName, &customer.FullName, &customer.Document,
			&customer.Email, &customer.PhoneNumber, &customer.Type, &customer.StreetAddress,
			&customer.City, &customer.State, &customer.ZipCode, &customer.Country,
			&customer.Hidden, &customer.Created, &customer.Updated); err != nil {
			http.Error(w, "Failed to scan database result", http.StatusInternalServerError)
			log.Println("Error scanning database result:", err)
			return
		}
		customers = append(customers, customer)
	}

	// Verificar se houve erros na iteração
	if err := rows.Err(); err != nil {
		http.Error(w, "Failed to iterate over database results", http.StatusInternalServerError)
		log.Println("Error iterating over database results:", err)
		return
	}

	// Retornar os resultados como JSON
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(customers); err != nil {
		http.Error(w, "Failed to encode response as JSON", http.StatusInternalServerError)
		log.Println("Error encoding response as JSON:", err)
		return
	}
}
