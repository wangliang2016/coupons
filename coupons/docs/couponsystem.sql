--
-- ER/Studio 8.0 SQL Code Generation
-- Company :      Microsoft
-- Project :      Model1.DM1
-- Author :       Microsoft
--
-- Date Created : Tuesday, October 11, 2016 16:09:33
-- Target DBMS : MySQL 5.x
--

-- 
-- TABLE: brand 
--

CREATE TABLE brand(
    BRANDCODE      CHAR(6)        NOT NULL,
    BRANDNAME      VARCHAR(50),
    BRANDSTATE     CHAR(2),
    INPUTPERSON    CHAR(6),
    INPUTDATE      DATE,
    CHECKPERSON    CHAR(6),
    CHECKDATE      DATE,
    PRIMARY KEY (BRANDCODE)
)ENGINE=MYISAM
;



-- 
-- TABLE: coupon_instance 
--

CREATE TABLE coupon_instance(
    ID            INT            NOT NULL,
    COUPONID      VARCHAR(18)    NOT NULL,
    USERCODE      VARCHAR(32),
    TEMPLATEID    CHAR(16)       NOT NULL,
    STATUS        INT,
    createdAt     DATETIME,
    updatedAt     DATETIME,
    USERID        VARCHAR(16)    NOT NULL,
    PRIMARY KEY (ID)
)ENGINE=MYISAM
;



-- 
-- TABLE: coupon_instance_log 
--

CREATE TABLE coupon_instance_log(
    ID            INT            NOT NULL,
    _ID           INT,
    USERCODE      VARCHAR(32),
    COUPONID      VARCHAR(18)    NOT NULL,
    TEMPLATEID    CHAR(16),
    TMPSTATUS     INT,
    OPERATION     TINYINT,
    USERID        VARCHAR(16)    NOT NULL,
    createdAt     DATETIME,
    PRIMARY KEY (ID)
)ENGINE=MYISAM
;



-- 
-- TABLE: coupon_template 
--

CREATE TABLE coupon_template(
    TEMPLATEID          CHAR(16)         NOT NULL,
    TEMPLATECODE        VARCHAR(16)      NOT NULL,
    TEMPLATECONTENT     VARCHAR(1024),
    DATEEFFECTIVE       DATETIME,
    DATEEXPIRES         DATETIME,
    SALIENCE            TINYINT,
    MERCHANTCODE        CHAR(6)          NOT NULL,
    DEPTCODE            VARCHAR(8)       NOT NULL,
    BRANDCODE           CHAR(6)          NOT NULL,
    TYPECODE            VARCHAR(1),
    RULEJSON            TEXT,
    RULESCRIPT          TEXT,
    RULEOBJ             VARCHAR(8),
    TOTALNUMBER         DATETIME,
    HAVEDISTRIBUTED     INT,
    STYLETEMPLATE       VARCHAR(1),
    TEMPLATEDESCRIPT    TEXT,
    USERID              VARCHAR(16)      NOT NULL,
    createdAt           DATETIME,
    updatedAt           DATETIME,
    PRIMARY KEY (TEMPLATEID)
)ENGINE=MYISAM
;



-- 
-- TABLE: coupon_template_log 
--

CREATE TABLE coupon_template_log(
    ID                  INT              NOT NULL,
    TEMPLATEID          CHAR(16),
    TEMPLATECODE        VARCHAR(16)      NOT NULL,
    TEMPLATECONTENT     VARCHAR(1024),
    DATEEFFECTIVE       DATETIME,
    DATEEXPIRES         DATETIME,
    SALIENCE            TINYINT,
    MERCHANTCODE        CHAR(6),
    DEPTCODE            VARCHAR(1024),
    BRANDCODE           VARCHAR(1024),
    TYPECODE            VARCHAR(1),
    RULEJSON            TEXT,
    RULESCRIPT          TEXT,
    RULEOBJ             VARCHAR(8),
    TOTALNUMBER         DATETIME,
    HAVEDISTRIBUTED     INT,
    STYLETEMPLATE       VARCHAR(1),
    TEMPLATEDESCRIPT    TEXT,
    TMPSTATUS           INT,
    OPERATION           TINYINT,
    USERID              VARCHAR(16)      NOT NULL,
    createdAt           DATETIME,
    PRIMARY KEY (ID)
)ENGINE=MYISAM
;



-- 
-- TABLE: coupon_type_common 
--

CREATE TABLE coupon_type_common(
    ID             CHAR(10)          NOT NULL,
    TEMPLATEID     CHAR(16),
    COUPONBASE     DECIMAL(12, 2),
    COUPONVALUE    DECIMAL(12, 2),
    PRIMARY KEY (ID)
)ENGINE=MYISAM
;



-- 
-- TABLE: coupons_log 
--

CREATE TABLE coupons_log(
    ID               INT              NOT NULL,
    USERID           VARCHAR(16)      NOT NULL,
    INTERFACENAME    VARCHAR(1024),
    POSTPARAMS       TEXT,
    STATUS           CHAR(10),
    RETURNRESULT     TEXT,
    createdAt        DATETIME,
    PRIMARY KEY (ID)
)ENGINE=MYISAM
;



-- 
-- TABLE: dept 
--

CREATE TABLE dept(
    DEPTCODE         VARCHAR(8)     NOT NULL,
    DEPTNAME         VARCHAR(30),
    DEPTSHORTNAME    VARCHAR(16),
    ADDRESSCODE      CHAR(3),
    TELEPHONE        VARCHAR(50),
    FAX              VARCHAR(50),
    MANAGER          CHAR(6),
    CONTACT          CHAR(6),
    DEPTTYPE         CHAR(2),
    PRIMARY KEY (DEPTCODE)
)ENGINE=MYISAM
;



-- 
-- TABLE: merchant 
--

CREATE TABLE merchant(
    MERCHANTCODE       CHAR(6)        NOT NULL,
    MERCHANTNAME       VARCHAR(50),
    LEGALPERSON        VARCHAR(10),
    COMPANYPROPERTY    VARCHAR(20),
    INPUTPERSON        CHAR(6),
    INPUTDATE          DATE,
    CHECKPERSON        CHAR(6),
    CHECKDATE          DATE,
    PRIMARY KEY (MERCHANTCODE)
)ENGINE=MYISAM
;



-- 
-- TABLE: user 
--

CREATE TABLE user(
    USERID          VARCHAR(16)      NOT NULL,
    MERCHANTCODE    CHAR(6),
    ROLE            CHAR(1),
    USERNAME        VARCHAR(16)      NOT NULL,
    SALT            VARCHAR(64)      NOT NULL,
    HASH            VARCHAR(128),
    PUBLICKEY       VARCHAR(1024)    NOT NULL,
    createdAt       DATETIME         NOT NULL,
    updatedAt       DATETIME,
    PRIMARY KEY (USERID)
)ENGINE=MYISAM
;



-- 
-- TABLE: coupon_instance 
--

ALTER TABLE coupon_instance ADD CONSTRAINT Refcoupon_template23 
    FOREIGN KEY (TEMPLATEID)
    REFERENCES coupon_template(TEMPLATEID)
;

ALTER TABLE coupon_instance ADD CONSTRAINT Refuser27 
    FOREIGN KEY (USERID)
    REFERENCES user(USERID)
;


-- 
-- TABLE: coupon_instance_log 
--

ALTER TABLE coupon_instance_log ADD CONSTRAINT Refuser20 
    FOREIGN KEY (USERID)
    REFERENCES user(USERID)
;

ALTER TABLE coupon_instance_log ADD CONSTRAINT Refcoupon_instance26 
    FOREIGN KEY (_ID)
    REFERENCES coupon_instance(ID)
;


-- 
-- TABLE: coupon_template 
--

ALTER TABLE coupon_template ADD CONSTRAINT Refdept12 
    FOREIGN KEY (DEPTCODE)
    REFERENCES dept(DEPTCODE)
;

ALTER TABLE coupon_template ADD CONSTRAINT Refbrand16 
    FOREIGN KEY (BRANDCODE)
    REFERENCES brand(BRANDCODE)
;

ALTER TABLE coupon_template ADD CONSTRAINT Refmerchant18 
    FOREIGN KEY (MERCHANTCODE)
    REFERENCES merchant(MERCHANTCODE)
;

ALTER TABLE coupon_template ADD CONSTRAINT Refuser19 
    FOREIGN KEY (USERID)
    REFERENCES user(USERID)
;


-- 
-- TABLE: coupon_template_log 
--

ALTER TABLE coupon_template_log ADD CONSTRAINT Refuser21 
    FOREIGN KEY (USERID)
    REFERENCES user(USERID)
;

ALTER TABLE coupon_template_log ADD CONSTRAINT Refcoupon_template24 
    FOREIGN KEY (TEMPLATEID)
    REFERENCES coupon_template(TEMPLATEID)
;


-- 
-- TABLE: coupon_type_common 
--

ALTER TABLE coupon_type_common ADD CONSTRAINT Refcoupon_template17 
    FOREIGN KEY (TEMPLATEID)
    REFERENCES coupon_template(TEMPLATEID)
;


-- 
-- TABLE: coupons_log 
--

ALTER TABLE coupons_log ADD CONSTRAINT Refuser22 
    FOREIGN KEY (USERID)
    REFERENCES user(USERID)
;


