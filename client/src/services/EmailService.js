// src/services/EmailService.js
// This file will contain our Email service configuration and helper functions

import emailjs from '@emailjs/browser';


const SERVICE_ID = 'service_qxts0pm';
const CONTACT_TEMPLATE_ID = 'template_qteza8n';
const RECEIPT_TEMPLATE_ID = 'template_bz42frj';
const PUBLIC_KEY = '4mkVLrDow6KHpQsP9';

// Function to send contact form emails
export const sendContactEmail = async (formData) => {
  try {
    const result = await emailjs.send(
      SERVICE_ID,
      CONTACT_TEMPLATE_ID,
      formData,
      PUBLIC_KEY
    );
    return { success: true, result };
  } catch (error) {
    console.error('Error sending contact email:', error);
    return { success: false, error };
  }
};

// Function to send payment receipt emails
export const sendPaymentReceipt = async (paymentData) => {
  try {
    // Format date
    const paymentDate = paymentData.paymentDate || paymentData.createdAt;
    const formattedDate = new Date(paymentDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Prepare email template parameters
    const templateParams = {
      email: paymentData.userEmail,
      to_name: paymentData.userName || 'Valued Customer',
      transaction_id: paymentData.transactionId || paymentData._id,
      payment_date: formattedDate,
      payment_amount: `NPR ${paymentData.amount?.toLocaleString() || 0}`,
      payment_method: paymentData.method?.toUpperCase() || 'ONLINE',
      payment_status: paymentData.status,
      payment_type: paymentData.bookingType === 'shifting' ? 'Shifting Service' : 'Property Booking',
      receipt_number: `RCPT-${Date.now().toString().substring(7)}`,
      company_name: 'RentPal',
      company_address: 'Kathmandu, Nepal'
    };
    
    const result = await emailjs.send(
      SERVICE_ID,
      RECEIPT_TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    );
    
    return { success: true, result };
  } catch (error) {
    console.error('Error sending receipt email:', error);
    return { success: false, error };
  }
};