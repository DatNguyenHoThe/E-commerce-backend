import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuthStore } from '../stores/useAuthStore';
import { useNavigate } from 'react-router-dom';

interface Cart {
  _id: string;
  items: Array<{
    productId: string;
    quantity: number;
    name: string;
    price: number;
  }>;
  totalAmount: number;
  user: {
    _id: string;
    userName: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  totalRecord: number;
  limit: number;
  page: number;
}

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, tokens } = useAuthStore();
  const [form] = Form.useForm();

  const [carts, setCarts] = useState<Cart[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ totalRecord: 0, limit: 10, page: 1 });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCart, setSelectedCart] = useState<Cart | null>(null);

  const isAdmin = user?.roles === 'admin';

  useEffect(() => {
    fetchCarts();
    fetchUsers();
  }, [tokens?.accessToken, pagination.page, pagination.limit]);

  const fetchCarts = async () => {
    try {
      if (!tokens?.accessToken) {
        message.error('Vui lòng đăng nhập để tiếp tục');
        navigate('/login');
        return;
      }

      setLoading(true);
      const response = await axios.get('http://localhost:8889/api/v1/carts', {
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
        params: { page: pagination.page, limit: pagination.limit },
      });

      setCarts(response.data.data.carts);
      setPagination(response.data.data.pagination);
    } catch (error: any) {
      handleError(error, 'Lỗi khi lấy danh sách giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      if (!tokens?.accessToken) {
        message.error('Vui lòng đăng nhập để tiếp tục');
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:8889/api/v1/users', {
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
      });

      setUsers(response.data.data.users);
    } catch (error: any) {
      handleError(error, 'Lỗi khi lấy danh sách người dùng');
    }
  };

  const handleError = (error: any, defaultMessage: string) => {
    if (error.response?.status === 401) {
      message.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại');
      navigate('/login');
    } else if (error.response?.data?.message) {
      message.error(error.response.data.message);
    } else {
      message.error(defaultMessage);
    }
  };

  const handleAddCart = () => {
    setSelectedCart(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditCart = (cart: Cart) => {
    setSelectedCart(cart);
    form.setFieldsValue({
      user: cart.user._id,
      items: cart.items.map(item => `${item.productId},${item.quantity},${item.name},${item.price}`).join('\n'),
      totalAmount: cart.totalAmount,
    });
    setIsModalOpen(true);
  };

  const handleDeleteCart = (cartId: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa giỏ hàng này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          if (!tokens?.accessToken) {
            message.error('Vui lòng đăng nhập để tiếp tục');
            navigate('/login');
            return;
          }

          setLoading(true);
          await axios.delete(`http://localhost:8889/api/v1/carts/${cartId}`, {
            headers: { Authorization: `Bearer ${tokens.accessToken}` },
          });

          message.success('Xóa giỏ hàng thành công');
          fetchCarts();
        } catch (error: any) {
          handleError(error, 'Lỗi khi xóa giỏ hàng');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleModalOk = async () => {
    try {
      if (!tokens?.accessToken) {
        message.error('Vui lòng đăng nhập để tiếp tục');
        navigate('/login');
        return;
      }

      setSaving(true);
      const values = await form.validateFields();

      // Kiểm tra và xử lý dữ liệu items
      const items = values.items
        .split('\n')
        .filter((item: string) => item.trim())
        .map((item: string) => {
          const parts = item.split(',');
          if (parts.length !== 4) {
            throw new Error('Mỗi dòng phải có 4 trường: productId,quantity,name,price');
          }
          
          const [productId, quantity, name, price] = parts;
          
          // Validate dữ liệu
          if (!productId.trim()) {
            throw new Error('productId không được để trống');
          }
          if (!quantity.trim() || isNaN(parseInt(quantity.trim()))) {
            throw new Error('quantity phải là số hợp lệ');
          }
          if (!name.trim()) {
            throw new Error('name không được để trống');
          }
          if (!price.trim() || isNaN(parseFloat(price.trim()))) {
            throw new Error('price phải là số hợp lệ');
          }

          return {
            productId: productId.trim(),
            quantity: parseInt(quantity.trim()),
            name: name.trim(),
            price: parseFloat(price.trim())
          };
        });

      // Validate tổng tiền
      const totalAmount = parseFloat(values.totalAmount);
      if (isNaN(totalAmount) || totalAmount <= 0) {
        throw new Error('Tổng tiền phải là số dương');
      }

      // Kiểm tra xem tổng tiền có khớp với tổng giá trị các item không
      const calculatedTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
        throw new Error('Tổng tiền không khớp với tổng giá trị các item');
      }

      const data = {
        user: values.user,
        items,
        totalAmount
      };

      if (selectedCart) {
        await axios.put(`http://localhost:8889/api/v1/carts/${selectedCart._id}`, data, {
          headers: { Authorization: `Bearer ${tokens.accessToken}` },
        });

        message.success('Cập nhật giỏ hàng thành công');
      } else {
        await axios.post('http://localhost:8889/api/v1/carts', data, {
          headers: { Authorization: `Bearer ${tokens.accessToken}` },
        });

        message.success('Tạo mới giỏ hàng thành công');
      }

      setIsModalOpen(false);
      fetchCarts();
    } catch (error: any) {
      console.error('Error:', error);
      if (error.message) {
        message.error(error.message);
      } else if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Lỗi khi xử lý giỏ hàng');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleTableChange = (newPagination: any) => {
    setPagination({
      ...pagination,
      page: newPagination.current,
      limit: newPagination.pageSize,
    });
  };

  const columns = [
    { title: 'Người Dùng', dataIndex: ['user', 'userName'], key: 'user' },
    { 
      title: 'Sản Phẩm', 
      dataIndex: 'items', 
      key: 'items',
      render: (items: any) => items.map((item: any) => `${item.name} x ${item.quantity}`).join(', ') 
    },
    { title: 'Tổng Tiền', dataIndex: 'totalAmount', key: 'totalAmount' },
    { title: 'Ngày Tạo', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Cart) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEditCart(record)}
          >
            Sửa
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteCart(record._id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddCart}
        >
          Thêm Mới Giỏ Hàng
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={carts}
        loading={loading}
        pagination={{
          ...pagination,
          onChange: handleTableChange,
          showSizeChanger: true,
        }}
        rowKey="_id"
      />

      <Modal
        title={selectedCart ? 'Chỉnh sửa giỏ hàng' : 'Thêm mới giỏ hàng'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="user"
            label="Người Dùng"
            rules={[{ required: true, message: 'Vui lòng chọn người dùng' }]}
          >
            <Select
              disabled={!!selectedCart}
              placeholder="Chọn người dùng"
              options={users.map(user => ({
                value: user._id,
                label: `${user.fullName} (${user.userName})`
              }))}
            />
          </Form.Item>

          <Form.Item
            name="items"
            label="Sản Phẩm"
            rules={[{ required: true, message: 'Vui lòng thêm sản phẩm' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Mỗi sản phẩm trên một dòng: productId,quantity,name,price"
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Form.Item
            name="totalAmount"
            label="Tổng Tiền"
            rules={[{ required: true, message: 'Vui lòng nhập tổng tiền' }]}
          >
            <Input
              type="number"
              min={0}
              addonAfter="VND"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CartPage;
