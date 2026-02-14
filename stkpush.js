const axios = require('axios');
const { accessToken } = require('./accessToken');

const stkPush = async () => {
  const shortCode = '174379';
  const phone = '254798440982'; // Use a valid Safaricom number or test number
MPESA_SHORTCODE=174379
  const passkey = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'; // Your real or sandbox passkey
  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const password = Buffer.from(shortCode + passkey + timestamp).toString('base64');

  const url = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
  const token = await accessToken();

  const data = {
    BusinessShortCode: 174379,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: '10000',
    PartyA: 254798440982, // Use a valid Safaricom number or test number
    PartyB: 174379,
    PhoneNumber: phone,
    CallBackURL: 'https://39d5-197-136-187-86.ngrok-free.app/callback',
    AccountReference: 'GETCASH',
    TransactionDesc: 'Test STK Push',
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('STK Push Response:', response.data);
  } catch (error) {
    console.error('STK Push Error:', error.response?.data || error.message);
  }
};

stkPush();