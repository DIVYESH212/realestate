/*
 * @file: universal.js
 * @description: It Contain function layer for all commom function.
 * @author: Sandip Vaghasiya
 */

import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

import { successAction, failAction } from "./response";
import Message from "./messages"; 
import bcrypt from "bcryptjs";


const getJwtKey = () => process.env.JWT_KEY || process.env.JWT_SECRET || 'your_jwt_secret_key';
const getJwtAlgo = () => process.env.JWT_ALGO || 'HS256';

// password encryption.
export const encryptpassword = async (password) => {
  // return md5(password);
  const salt = await bcrypt.genSaltSync(10);
  const hashPassword = await bcrypt.hashSync(password, salt);
  return hashPassword;
};

export const decryptPassword = async (password, oldPassword) => {
  const matchPassword = await bcrypt.compare(password, oldPassword);
  return matchPassword;
};

// Generate random strings.
export const generateRandom = (length = 32, alphanumeric = true) => {
    let data = "",
      keys = "";
  
    if (alphanumeric) {
      keys = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    } else {
      keys = "0123456789";
    }
  
    for (let i = 0; i < length; i++) {
      data += keys.charAt(Math.floor(Math.random() * keys.length));
    }
  
    return data;
  };

/*********** WEB Generate JWT token *************/
export const generateJwtTokenFn = async (userIdObj) => {
    return new Promise((resolve, reject) => {
      jwt.sign(
        userIdObj,
        getJwtKey(),
        { algorithm: getJwtAlgo(), expiresIn: "24h" },
        function (err, encode) {
          if (err) {
            reject(err);
          } else {
            resolve(encode);
          }
        }
      );
    });
  };
  /*********** Test Decode JWT token *************/
  export const decodeJwtTokenFn = (req, res, next) => {
    let Authorization =
      req["headers"]["Authorization"] || req["headers"]["authorization"] || req.query?.token;

    if (!Authorization) {
      return res.status(401).json(failAction("Authorization not found!", 401));
    }

    if (typeof Authorization === "string" && Authorization.startsWith("Bearer ")) {
      Authorization = Authorization.slice(7).trim();
    }

    jwt.verify(Authorization, getJwtKey(), function (err, decoded) {
      if (err) {
        return res.status(401).json(failAction("Authorization not found!", 401));
      } else {
        const uid = decoded.userId || decoded.id || decoded._id;
        req.user = {
          userId: uid,
          _id: uid,
          id: uid,
          email: decoded.email,
          username: decoded.username
        };
        
        next();
      }
    });
  };