package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/go-sql-driver/mysql"
	"github.com/google/uuid"
)

type Session struct {
	Permissions int
}

const (
	PerRegistered = 0
	PerRejected   = 1
	PerAccepted   = 2
	PerCust       = 4
	PerProduct    = 8
	PerSale       = 16
	PerAll        = 32
)

var cookies = true

var db *sql.DB
var sessions = make(map[string]Session)

func main() {
	for i := 1; i < len(os.Args); i++ {
		switch os.Args[i] {
		case "--no-cookies":
			cookies = false
		default:
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

	http.HandleFunc("OPTIONS /api/customer/{id}", cors(nil))
	http.HandleFunc("OPTIONS /api/customer/getAllCustomers", cors(nil))
	http.HandleFunc("OPTIONS /api/customer/getCustumerByDocument", cors(nil))
	http.HandleFunc("OPTIONS /api/customer/getCustomersByName", cors(nil))
	http.HandleFunc("OPTIONS /api/customer/register", cors(nil))

	http.HandleFunc("OPTIONS /api/product/{id}", cors(nil))
	http.HandleFunc("OPTIONS /api/product/register", cors(nil))
	http.HandleFunc("OPTIONS /api/product/getAllProducts", cors(nil))
	http.HandleFunc("OPTIONS /api/product/getProductsByDate", cors(nil))
	http.HandleFunc("OPTIONS /api/product/getProductsByQuery", cors(nil))

	http.HandleFunc("OPTIONS /api/user/{id}", cors(nil))
	http.HandleFunc("OPTIONS /api/user/login", cors(nil))
	http.HandleFunc("OPTIONS /api/user/logout", cors(nil))
	http.HandleFunc("OPTIONS /api/user/register", cors(nil))
	http.HandleFunc("OPTIONS /api/user/selectAllAllowed", cors(nil))
	http.HandleFunc("OPTIONS /api/user/selectAllAllowedWithoutPermission", cors(nil))
	http.HandleFunc("OPTIONS /api/user/selectUnregisteredUsers", cors(nil))
	http.HandleFunc("OPTIONS /api/user/setUserPermission", cors(nil))
	http.HandleFunc("OPTIONS /api/user/getAllRejected", cors(nil))

	http.HandleFunc("GET /api/customer/{id}", cors(getCustomerById))
	http.HandleFunc("GET /api/customer/getAllCustomers", cors(getAllCustomers))
	http.HandleFunc("GET /api/customer/getCustumerByDocument", cors(getCustumerByDocument))
	http.HandleFunc("GET /api/customer/getCustomersByName", cors(getCustomersByName))
	http.HandleFunc("POST /api/customer/register", cors(registerCustomer))

	http.HandleFunc("GET /api/product/{id}", cors(getProductById))
	http.HandleFunc("GET /api/product/getAllProducts", cors(getAllProducts))
	http.HandleFunc("GET /api/product/getProductsByDate", cors(getProductsByDate)) //Exemplo de requisiçao por url: http://localhost:8080/api/product/getProductsByDate?startDate=2024-05-01&endDate=2024-08-31
	http.HandleFunc("GET /api/product/getProductsByQuery", cors(getProductsByQuery))
	http.HandleFunc("POST /api/product/register", cors(registerProduct))

	http.HandleFunc("GET /api/user/{id}", cors(getUserById))
	http.HandleFunc("GET /api/user/selectAllAllowed", cors(selectAllAllowed))
	http.HandleFunc("GET /api/user/selectAllAllowedWithoutPermission", cors(selectAllAllowedWithoutPermission))
	http.HandleFunc("GET /api/user/selectUnregisteredUsers", cors(selectUnregisteredUsers))
	/* http.HandleFunc("POST /api/user/login", cors(auth(login, PerCust | PerProduct | PerSale | PerAll))) */
	/* http.HandleFunc("POST /api/user/logout", cors(auth(logout, PerCust | PerProduct | PerSale | PerAll))) */
	http.HandleFunc("POST /api/user/login", cors(login))
	http.HandleFunc("POST /api/user/logout", cors(logout))
	http.HandleFunc("POST /api/user/register", cors(registerUser))
	http.HandleFunc("POST /api/user/setUserPermission", cors(setUserPermission))

	http.HandleFunc("GET /api/user/getAllRejected", cors(selectRejected))

	log.Println("Listening...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func auth(f http.HandlerFunc, permissions int) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("session")
		if err != nil {
			log.Println(err)
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		err = uuid.Validate(cookie.Value)
		if err != nil {
			log.Println(err)
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		session := sessions[cookie.Value]
		if (session.Permissions & permissions) > 0 {
			f.ServeHTTP(w, r)
		} else {
			w.WriteHeader(http.StatusForbidden)
		}
	}
}

func cors(f http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		setCorsHeaders(w, r)
		if f != nil {
			f.ServeHTTP(w, r)
		} else {
			w.WriteHeader(http.StatusNoContent)
		}
	}
}

func setCorsHeaders(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:4200")
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS, POST")
}
