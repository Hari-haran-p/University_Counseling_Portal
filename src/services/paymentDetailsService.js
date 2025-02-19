// src/services/paymentDetailsService.js
import axios from "axios";

export const getPaymentDetailsData = async () => {
    try {
        const response = await axios.get(`/api/paymentDetails`);
        return response.data;
    } catch (error) {
        console.error("Error fetching payment details data:", error);
        throw error;
    }
};

// Function to save payment details data
export const savePaymentDetailsData = async (data) => {
    try {
        const response = await axios.post(`/api/paymentDetails`, data);
        return response.data;
    } catch (error) {
        console.error("Error saving payment details data:", error);
        throw error;
    }
};