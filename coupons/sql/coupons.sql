--
-- ER/Studio 8.0 SQL Code Generation
-- Company :      Microsoft
-- Project :      DATA MODEL
-- Author :       Microsoft
--
-- Date Created : Tuesday, September 27, 2016 20:27:26
-- Target DBMS : MySQL 5.x
--

-- 
-- TABLE: Admin 
--

CREATE TABLE Admin(
    ADMINID     CHAR(32)        NOT NULL,
    USERNAME    VARCHAR(16)     NOT NULL,
    HASH        VARCHAR(128)    NOT NULL,
    PRIMARY KEY (ADMINID)
)ENGINE=MYISAM
;



-- 
-- TABLE: user 
--

CREATE TABLE user(
    USERID         VARCHAR(32)      NOT NULL,
    USERNAME       VARCHAR(16)      NOT NULL,
    PASSWORD       VARCHAR(128)     NOT NULL,
    ADMINID        CHAR(32)         NOT NULL,
    COMPANYNAME    VARCHAR(64)      NOT NULL,
    PUBLICKEY      VARCHAR(1024)    NOT NULL,
    PRIMARY KEY (USERID)
)ENGINE=MYISAM
;



-- 
-- TABLE: user 
--

ALTER TABLE user ADD CONSTRAINT RefAdmin1 
    FOREIGN KEY (ADMINID)
    REFERENCES Admin(ADMINID)
;


