import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:7070/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const productAPI = {
  getAll: async () => {
    const { data } = await api.get('/products');
    return data;
  },

  create: async (product) => {
    const { data } = await api.post('/products', product);
    return data;
  },

  update: async (id, product) => {
    const { data } = await api.put(`/products/${id}`, product);
    return data;
  },

  delete: async (id) => {
    await api.delete(`/products/${id}`);
    return true;
  },

  updateStock: async (id, adjustment) => {
    console.log('Sending stock update:', { id, adjustment }); // Debug log
    const response = await api.patch(`/products/${id}/stock`, { 
      adjustment: parseInt(adjustment)
    });
    return response.data;
  },
};

export const orderAPI = {
  create: async (orderData) => {
    const response = await api.post('/transactions/order', orderData);
    return response.data;
  }
};

export const voucherAPI = {
  validate: async (code) => {
    try {
      const response = await api.post('/vouchers/validate', { code });
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  getAll: async () => {
    const response = await api.get('/vouchers');
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/vouchers', data);
    return response.data;
    
  },

  update: async (code, voucherData) => {
    const response = await api.put(`/vouchers/${code}`, voucherData);
    return response.data;
  },

  delete: async (code) => {
    await api.delete(`/vouchers/${code}`);
    return true;
  }
};

export const transactionAPI = {
  getAll: async (params = {}) => {
    let queryParams = new URLSearchParams();
    
    if (params.startDate) {
      queryParams.append('startDate', params.startDate);
    }
    if (params.endDate) {
      queryParams.append('endDate', params.endDate);
    }

    const queryString = queryParams.toString();
    const response = await api.get(`/transactions${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  }
}; 