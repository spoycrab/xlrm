package main

import (
	"database/sql"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/go-sql-driver/mysql"
	"github.com/google/uuid"
)

type session struct {
	permissions int
	email string
}

const (
	perRegistered = 1 << iota
	perRejected
	perAccepted
	perCust
	perProduct
	perSale
	perAdmin
)

var db *sql.DB
var sessions = make(map[string]session)
var dir = "../ng/dist/ng/browser"
var fileHandler http.Handler

var lfile string
var lflags int

func main() {
	flag.StringVar(&lfile, "log", "", "")
	flag.IntVar(&lflags, "lflags", log.LstdFlags, "")
	flag.Parse()
	if lfile != "" {
		f, err := os.OpenFile(lfile, os.O_APPEND | os.O_CREATE | os.O_WRONLY, 0644)
		if err != nil {
			log.Println(err)
		} else {
			log.SetOutput(f)
		}
	}
	log.SetFlags(lflags)

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
	http.HandleFunc("OPTIONS /api/customer/deleteCustomer", cors(nil))
	http.HandleFunc("OPTIONS /api/customer/updateCustomer", cors(nil))

	http.HandleFunc("OPTIONS /api/product/{id}", cors(nil))
	http.HandleFunc("OPTIONS /api/product/register", cors(nil))
	http.HandleFunc("OPTIONS /api/product/getAllProducts", cors(nil))
	http.HandleFunc("OPTIONS /api/product/getProductsByDate", cors(nil))
	http.HandleFunc("OPTIONS /api/product/getProductsByQuery", cors(nil))
	http.HandleFunc("OPTIONS /api/product/updateProduct", cors(nil))
	http.HandleFunc("OPTIONS /api/product/updateProductQuantity", cors(nil))
	http.HandleFunc("OPTIONS /api/product/deleteProduct", cors(nil))

	http.HandleFunc("OPTIONS /api/user/{id}", cors(nil))
	http.HandleFunc("OPTIONS /api/user/login", cors(nil))
	http.HandleFunc("OPTIONS /api/user/logout", cors(nil))
	http.HandleFunc("OPTIONS /api/user/register", cors(nil))
	http.HandleFunc("OPTIONS /api/user/selectAllAllowed", cors(nil))
	http.HandleFunc("OPTIONS /api/user/selectAllAllowedWithoutPermission", cors(nil))
	http.HandleFunc("OPTIONS /api/user/getAllRejected", cors(nil))
	http.HandleFunc("OPTIONS /api/user/selectUnregisteredUsers", cors(nil))
	http.HandleFunc("OPTIONS /api/user/setUserPermission", cors(nil))

	http.HandleFunc("GET /api/customer/{id}", logger(cors(getCustomerById)))
	http.HandleFunc("GET /api/customer/getAllCustomers", logger(cors(getAllCustomers)))
	http.HandleFunc("GET /api/customer/getCustumerByDocument", logger(cors(getCustumerByDocument)))
	http.HandleFunc("GET /api/customer/getCustomersByName", logger(cors(getCustomersByName)))
	http.HandleFunc("POST /api/customer/register", logger(cors(registerCustomer)))
	http.HandleFunc("POST /api/customer/deleteCustomer", logger(cors(deleteCustomer)))
	http.HandleFunc("POST /api/customer/updateCustomer", logger(cors(updateCustomer)))

	http.HandleFunc("GET /api/product/{id}", logger(cors(getProductById)))
	http.HandleFunc("GET /api/product/getAllProducts", logger(cors(getAllProducts)))
	http.HandleFunc("GET /api/product/getProductsByDate", logger(cors(getProductsByDate)))
	http.HandleFunc("GET /api/product/getProductsByQuery", logger(cors(getProductsByQuery)))
	http.HandleFunc("POST /api/product/register", logger(cors(registerProduct)))
	http.HandleFunc("POST /api/product/updateProduct", logger(cors(updateProduct)))
	http.HandleFunc("POST /api/product/updateProductQuantity", logger(cors(updateProductQuantity)))
	http.HandleFunc("POST /api/product/deleteProduct", logger(cors(deleteProduct)))

	http.HandleFunc("GET /api/user/{id}", logger(cors(getUserById)))
	http.HandleFunc("GET /api/user/selectAllAllowed", logger(cors(selectAllAllowed)))
	http.HandleFunc("GET /api/user/selectAllAllowedWithoutPermission", logger(cors(selectAllAllowedWithoutPermission)))
	http.HandleFunc("GET /api/user/getAllRejected", logger(cors(getAllRejected)))
	http.HandleFunc("GET /api/user/selectUnregisteredUsers", logger(cors(selectUnregisteredUsers)))
	http.HandleFunc("POST /api/user/login", cors(login))
	http.HandleFunc("POST /api/user/logout", logger(cors(logout)))
	http.HandleFunc("POST /api/user/register", cors(registerUser))
	http.HandleFunc("POST /api/user/setUserPermission", logger(auth(cors(setUserPermission), perAdmin)))

	fileHandler = http.FileServer(http.Dir(dir))
	http.HandleFunc("GET /", staticHandler(false, false, -1))
	http.HandleFunc("GET /cadastrarCliente", staticHandler(true, true, -1))
	http.HandleFunc("GET /cadastrarProduto", staticHandler(true, true, -1))
	http.HandleFunc("GET /concederAcesso", staticHandler(true, true, -1))
	http.HandleFunc("GET /estadoUsuario", staticHandler(true, true, -1))
	http.HandleFunc("GET /login", staticHandler(true, false, -1))
	http.HandleFunc("GET /pesquisarCliente", staticHandler(true, false, -1))
	http.HandleFunc("GET /reavaliarUsuario", staticHandler(true, true, -1))
	http.HandleFunc("GET /register", staticHandler(true, false, -1))
	http.HandleFunc("GET /telaInicio", staticHandler(true, true, -1))
	http.HandleFunc("GET /visualizarProduto", staticHandler(true, true, -1))
	log.Println("Listening...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func logger(f http.HandlerFunc) http.HandlerFunc {
	return func (w http.ResponseWriter, r *http.Request) {
		var b strings.Builder

		cookie, err := getSession(r)
		if err != nil {
			log.Println(err)
		} else {
			fmt.Fprintf(&b, "%s ", sessions[cookie.Value].email)
		}
		fmt.Fprintf(&b, "%s %s %s", r.Method, r.URL.Path, r.Proto)
		log.Println(b.String())
		f.ServeHTTP(w, r)
	}
}

func auth(f http.HandlerFunc, per int) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := getSession(r)
		if err != nil {
			log.Println(err)
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		session := sessions[cookie.Value]
		if (session.permissions & per) > 0 {
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

func staticHandler(isdir bool, private bool, per int) http.HandlerFunc {
	return func (w http.ResponseWriter, r *http.Request) {
		if isdir {
			r.URL.Path = r.URL.Path + "/"
		}
		if !private {
			log.Printf("Serving %s\n", r.URL.Path)
			fileHandler.ServeHTTP(w, r)
			return
		}
		cookie, err := getSession(r)
		if err != nil {
			log.Println(err)
			log.Println("Redirecting to /login")
			redirect(w, r, "login")
			return
		}
		_, exists := sessions[cookie.Value]
		log.Println(exists)
		if !exists {
			log.Printf("'%s' is not a valid session!\n", cookie.Value)
			log.Println("Redirecting to /login")
			redirect(w, r, "login")
			return
		}
		log.Printf("Serving %s\n", r.URL.Path)
		fileHandler.ServeHTTP(w, r)
	}
}

func getSession(r *http.Request) (*http.Cookie, error) {
	cookie, err := r.Cookie("session")
	if err != nil {
		return nil, err
	}
	err = uuid.Validate(cookie.Value)
	if err != nil {
		return nil, err
	}
	return cookie, nil
}

func redirect(w http.ResponseWriter, r *http.Request, newPath string) {
	if q := r.URL.RawQuery; q != "" {
		newPath += "?" + q
	}
	w.Header().Set("Location", newPath)
	w.WriteHeader(http.StatusFound)
}
