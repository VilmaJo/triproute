DROP TABLE if exists geometries;
DROP TABLE if exists trips;
DROP TABLE if exists users;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    profile_url VARCHAR(255),
    bio VARCHAR(500),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trips (
    id SERIAL PRIMARY KEY, 
    userId INT REFERENCES users(id) NOT NULL,
    tripName VARCHAR(255) NOT NULL, 
    tripType VARCHAR(255) NOT NULL, 
    geom geometry
);

CREATE TABLE trips (
     id SERIAL PRIMARY KEY,
     userId INT REFERENCES users(id) NOT NULL,
     tripName VARCHAR(255) NOT NULL,
     tripType VARCHAR(255) NOT NULL,
     geom GEOMETRY

);

CREATE TABLE trips (
     id SERIAL PRIMARY KEY,
     userId INT REFERENCES users(id) NOT NULL,
     tripName VARCHAR(255) NOT NULL,
     tripType VARCHAR(255) NOT NULL,
     coords REAL[],

);
