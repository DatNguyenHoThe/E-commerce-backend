import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Switch, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuthStore } from '../stores/useAuthStore';
import { useNavigate } from 'react-router-dom';

interface PaymentMethod {
  _id: string;
  type: 'credit_card' | 'paypal' | 'bank_account';
  provider: string;
  accountNumber: string;
  expiryDate: string;
  cardholderName: string;
  billingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  isDefault: boolean;
  metadata: any;
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

const PaymentMethodsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, tokens } = useAuthStore();
  const [form] = Form.useForm();

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ totalRecord: 0, limit: 10, page: 1 });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);

  const isAdmin = user?.roles === 'admin';

  useEffect(() => {
    fetchPaymentMethods();
  }, [tokens?.accessToken, pagination.page, pagination.limit]);

  const fetchPaymentMethods = async () => {
    try {
      if (!tokens?.accessToken) {
        message.error('Vui lòng đăng nhập để tiếp tục');
        navigate('/login');
        return;
      }

      setLoading(true);
      const response = await axios.get('http://localhost:8889/api/v1/payment-methods', {
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
        params: { page: pagination.page, limit: pagination.limit },
      });

      setPaymentMethods(response.data.data.paymentMethods);
      setPagination(response.data.data.pagination);
    } catch (error: any) {
      handleError(error, 'Lỗi khi lấy danh sách phương thức thanh toán');
    } finally {
      setLoading(false);
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

  const handleAddPaymentMethod = () => {
    setSelectedPaymentMethod(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditPaymentMethod = (paymentMethod: PaymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
    form.setFieldsValue({
      type: paymentMethod.type,
      provider: paymentMethod.provider,
      accountNumber: paymentMethod.accountNumber,
      expiryDate: paymentMethod.expiryDate,
      cardholderName: paymentMethod.cardholderName,
      billingAddress: paymentMethod.billingAddress,
      isDefault: paymentMethod.isDefault,
      metadata: paymentMethod.metadata,
    });
    setIsModalOpen(true);
  };

  const handleDeletePaymentMethod = (paymentMethodId: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa phương thức thanh toán này?',
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
          await axios.delete(`http://localhost:8889/api/v1/payment-methods/${paymentMethodId}`, {
            headers: { Authorization: `Bearer ${tokens.accessToken}` },
          });

          message.success('Xóa phương thức thanh toán thành công');
          fetchPaymentMethods();
        } catch (error: any) {
          handleError(error, 'Lỗi khi xóa phương thức thanh toán');
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

      if (selectedPaymentMethod) {
        await axios.put(`http://localhost:8889/api/v1/payment-methods/${selectedPaymentMethod._id}`, values, {
          headers: { Authorization: `Bearer ${tokens.accessToken}` },
        });

        message.success('Cập nhật phương thức thanh toán thành công');
      } else {
        await axios.post('http://localhost:8889/api/v1/payment-methods', values, {
          headers: { Authorization: `Bearer ${tokens.accessToken}` },
        });

        message.success('Tạo mới phương thức thanh toán thành công');
      }

      setIsModalOpen(false);
      fetchPaymentMethods();
    } catch (error: any) {
      handleError(error, 'Lỗi khi xử lý phương thức thanh toán');
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
    { 
      title: 'Loại', 
      dataIndex: 'type', 
      key: 'type',
      render: (type: string) => {
        const typeMap: { [key: string]: { color: string; label: string } } = {
          'credit_card': { color: '#1890ff', label: 'Thẻ Tín Dụng' },
          'paypal': { color: '#2db7f5', label: 'PayPal' },
          'bank_account': { color: '#87d068', label: 'Tài Khoản Ngân Hàng' }
        };
        return <span style={{ color: typeMap[type]?.color }}>{typeMap[type]?.label}</span>;
      }
    },
    { 
      title: 'Nhà Cung Cấp', 
      dataIndex: 'provider', 
      key: 'provider'
    },
    { 
      title: 'Số Tài Khoản', 
      dataIndex: 'accountNumber', 
      key: 'accountNumber'
    },
    { 
      title: 'Tên Chủ Thẻ', 
      dataIndex: 'cardholderName', 
      key: 'cardholderName'
    },
    { 
      title: 'Ngày Hết Hạn', 
      dataIndex: 'expiryDate', 
      key: 'expiryDate'
    },
    { 
      title: 'Địa Chỉ Nợ', 
      dataIndex: 'billingAddress', 
      key: 'billingAddress',
      render: (address: any) => 
        `${address.fullName}\n${address.addressLine1}${address.addressLine2 ? ', ' + address.addressLine2 : ''}\n${address.city}, ${address.state} ${address.postalCode}\n${address.country}`
    },
    { 
      title: 'Mặc Định', 
      dataIndex: 'isDefault', 
      key: 'isDefault',
      render: (isDefault: boolean) => (
        <Switch checked={isDefault} />
      )
    },
    { 
      title: 'Người Sử Dụng', 
      dataIndex: ['user', 'userName'], 
      key: 'user'
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: PaymentMethod) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEditPaymentMethod(record)}
          >
            Sửa
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeletePaymentMethod(record._id)}
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
          onClick={handleAddPaymentMethod}
        >
          Thêm Mới Phương Thức Thanh Toán
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={paymentMethods}
        loading={loading}
        pagination={{
          ...pagination,
          onChange: handleTableChange,
          showSizeChanger: true,
        }}
        rowKey="_id"
      />

      <Modal
        title={selectedPaymentMethod ? 'Chỉnh sửa phương thức thanh toán' : 'Thêm mới phương thức thanh toán'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="type"
            label="Loại"
            rules={[{ required: true, message: 'Vui lòng chọn loại phương thức thanh toán' }]}
          >
            <Select options={[
              { value: 'credit_card', label: 'Thẻ Tín Dụng' },
              { value: 'paypal', label: 'PayPal' },
              { value: 'bank_account', label: 'Tài Khoản Ngân Hàng' }
            ]} />
          </Form.Item>

          <Form.Item
            name="provider"
            label="Nhà Cung Cấp"
            rules={[{ required: true, message: 'Vui lòng nhập nhà cung cấp' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="accountNumber"
            label="Số Tài Khoản"
            rules={[{ required: true, message: 'Vui lòng nhập số tài khoản' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="expiryDate"
            label="Ngày Hết Hạn"
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item
            name="cardholderName"
            label="Tên Chủ Thẻ"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="billingAddress.fullName"
            label="Họ Tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="billingAddress.addressLine1"
            label="Địa Chỉ 1"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ 1' }]}
          >
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item
            name="billingAddress.addressLine2"
            label="Địa Chỉ 2"
          >
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item
            name="billingAddress.city"
            label="Thành Phố"
            rules={[{ required: true, message: 'Vui lòng nhập thành phố' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="billingAddress.state"
            label="Tỉnh/Thành"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="billingAddress.postalCode"
            label="Mã Bưu Chính"
            rules={[{ required: true, message: 'Vui lòng nhập mã bưu chính' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="billingAddress.country"
            label="Quốc Gia"
            rules={[{ required: true, message: 'Vui lòng nhập quốc gia' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="isDefault"
            label="Mặc Định"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="metadata"
            label="Điều Kiện Khác"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PaymentMethodsPage;
