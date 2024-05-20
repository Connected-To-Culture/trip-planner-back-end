import User from "~/models/userModel";

// GET all user that machtes a query

export const getAll = async (query: Record<string, any>) => {
    const users = await User.find(query);
    return users;
};

// GET one user with ID 

export const getOne = async (query: Record<string, any>) => {
    const foundCompany = await User.findById(query);
    return foundCompany;
};

// TODO 
// REPLACE
// DELETE 
// PATCH 

export * as userService from "./user";