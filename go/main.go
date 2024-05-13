package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/go-sql-driver/mysql"
)

type Session struct {
	Permissions uint8
}

var db *sql.DB
var sessions = make(map[string]Session)

func main() {
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

	http.HandleFunc("OPTIONS /api/user/{id}", corsHandler)
	http.HandleFunc("OPTIONS /api/user/register", corsHandler)
	http.HandleFunc("OPTIONS /api/user/login", corsHandler)
	http.HandleFunc("OPTIONS /api/user/logout", corsHandler)

	http.HandleFunc("GET /api/user/{id}", setCors(getUserById))
	http.HandleFunc("POST /api/user/register", setCors(registerUser))
	http.HandleFunc("POST /api/user/login", setCors(loginUser))
	http.HandleFunc("POST /api/user/logout", setCors(logOutUser))
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
