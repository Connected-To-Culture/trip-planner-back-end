import { Plan } from "~/models/planModel";

// GET all plans that matches the query 

export const getAll = async (query: Record<string, any>)=>{
    const plans = await Plan.find(query);
    return plans;
}; 

export const getOne = async () => {

};

export const create = async ()=>{

};

export * as planService from "./plans";