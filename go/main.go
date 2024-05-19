package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/go-sql-driver/mysql"
)

type Session struct {
	Permissions uint8
}

var ignoreCookies = false

var db *sql.DB
var sessions = make(map[string]Session)

func main() {
	for i := 1; i < len(os.Args); i++ {
		if os.Args[i] == "--no-cookies" {
			ignoreCookies = true
		}
	}

	config := mysql.Config{
		User:   os.Getenv("DBUSER"),
		Passwd: os.Getenv("DBPASS"),
		Net:    "tcp",
		Addr:   "127.0.0.1:3306",
		DBName: "xlrm",
		/* ParseTime: true, */
	}

	var err error

	db, err = sql.Open("mysql", config.FormatDSN())
	if err != nil {
		log.Fatal(err)
	}
	err = db.Ping()
	if err != nil {
		log.Fatal(err)
	}
	//User
	http.HandleFunc("OPTIONS /api/user/{id}", corsHandler)
	http.HandleFunc("OPTIONS /api/user/selectUnregisteredUsers", corsHandler)
	http.HandleFunc("OPTIONS /api/user/register", corsHandler)
	http.HandleFunc("OPTIONS /api/user/login", corsHandler)
	http.HandleFunc("OPTIONS /api/user/logout", corsHandler)
	http.HandleFunc("OPTIONS /api/user/setUserPermission", corsHandler)
	http.HandleFunc("OPTIONS /api/user/selectAllAllowed", corsHandler)
	http.HandleFunc("OPTIONS /api/user/selectAllAllowedWithoutPermission", corsHandler)

	http.HandleFunc("GET /api/user/{id}", setCors(getUserById))
	http.HandleFunc("GET /api/user/selectUnregisteredUsers", setCors(selectUnregisteredUsers))
	http.HandleFunc("POST /api/user/register", setCors(registerUser))
	http.HandleFunc("POST /api/user/login", setCors(loginUser))
	http.HandleFunc("POST /api/user/logout", setCors(logOutUser))
	http.HandleFunc("POST /api/user/setUserPermission", setCors(setUserPermission))
	http.HandleFunc("GET /api/user/selectAllAllowed", setCors(selectAllAllowed))
	http.HandleFunc("GET /api/user/selectAllAllowedWithoutPermission", setCors(selectAllAllowedWithoutPermission))

	//Product
	http.HandleFunc("OPTIONS /api/product/{id}", corsHandler)
	http.HandleFunc("OPTIONS /api/product/register", corsHandler)

	http.HandleFunc("GET /api/product/{id}", setCors(getProductById))
	http.HandleFunc("POST /api/product/register", setCors(registerProduct))

	//Customer
	http.HandleFunc("OPTIONS /api/customer/{id}", corsHandler)
	http.HandleFunc("OPTIONS /api/customer/register", corsHandler)

	http.HandleFunc("GET /api/customer/{id}", setCors(getCustomerById))
	http.HandleFunc("POST /api/customer/register", setCors(registerCustomer))

	fmt.Println("Listening...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func corsHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("info: %s %s\n", r.Method, r.URL.Path)
	setCorsHeaders(w, r)
	w.WriteHeader(http.StatusNoContent)
}

func setCors(f http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		setCorsHeaders(w, r)
		f.ServeHTTP(w, r)
	}
}

func setCorsHeaders(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS, POST")
}
