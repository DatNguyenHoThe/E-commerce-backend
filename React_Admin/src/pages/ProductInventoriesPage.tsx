import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Select, Checkbox, Tag, Typography, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, WarningOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuthStore } from '../stores/useAuthStore';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

interface ProductInventory {
  _id: string;
  quantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  lastRestocked: string;
  createdAt: string;
  updatedAt: string;
  product: {
    _id: string;
    product_name: string;
  };
  variant: {
    _id: string;
    variantName: string;
  } | null;
  location: {
    _id: string;
    name: string;
  } | null;
  status: 'normal' | 'low' | 'out_of_stock';
}

interface Pagination {
  totalRecord: number;
  limit: number;
  page: number;
}

const ProductInventoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, tokens } = useAuthStore();
  const [form] = Form.useForm();

  const [inventories, setInventories] = useState<ProductInventory[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ totalRecord: 0, limit: 10, page: 1 });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<ProductInventory | null>(null);
  const [searchText, setSearchText] = useState('');
  const [products, setProducts] = useState<{ _id: string; product_name: string }[]>([]);
  const [variants, setVariants] = useState<{ _id: string; variantName: string }[]>([]);
  const [locations, setLocations] = useState<{ _id: string; name: string }[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchVariants();
    fetchLocations();
    fetchInventories();
  }, [tokens?.accessToken, pagination.page, pagination.limit, searchText]);

  const fetchProducts = async () => {
    try {
      if (!tokens?.accessToken) return;

      const response = await axios.get('http://localhost:8889/api/v1/products', {
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
        params: { limit: 100 },
      });

      setProducts(response.data.data.products.map((p: any) => ({
        _id: p._id,
        product_name: p.product_name
      })));
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchVariants = async () => {
    try {
      if (!tokens?.accessToken) return;

      const response = await axios.get('http://localhost:8889/api/v1/product-variants', {
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
        params: { limit: 100 },
      });

      setVariants(response.data.data.variants.map((v: any) => ({
        _id: v._id,
        variantName: v.variantName
      })));
    } catch (error) {
      console.error('Error fetching variants:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      if (!tokens?.accessToken) return;

      const response = await axios.get('http://localhost:8889/api/v1/locations', {
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
        params: { limit: 100 },
      });

      setLocations(response.data.data.locations.map((l: any) => ({
        _id: l._id,
        name: l.name
      })));
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const fetchInventories = async () => {
    try {
      if (!tokens?.accessToken) {
        message.error('Vui lòng đăng nhập để tiếp tục');
        navigate('/login');
        return;
      }

      setLoading(true);
      const response = await axios.get('http://localhost:8889/api/v1/product-inventories', {
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchText
        },
      });

      setInventories(response.data.data.inventories);
      setPagination(response.data.data.pagination);
    } catch (error: any) {
      handleError(error, 'Lỗi khi lấy danh sách kho');
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchText(value);
  };

  const handleAddInventory = () => {
    setSelectedInventory(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditInventory = (inventory: ProductInventory) => {
    setSelectedInventory(inventory);
    form.setFieldsValue({
      product: inventory.product._id,
      variant: inventory.variant?._id,
      location: inventory.location?._id,
      quantity: inventory.quantity,
      reservedQuantity: inventory.reservedQuantity,
      lowStockThreshold: inventory.lowStockThreshold,
      lastRestocked: inventory.lastRestocked,
    });
    setIsModalOpen(true);
  };

  const handleDeleteInventory = (inventoryId: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa mục này?',
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
          await axios.delete(`http://localhost:8889/api/v1/product-inventories/${inventoryId}`, {
            headers: { Authorization: `Bearer ${tokens.accessToken}` },
          });

          message.success('Xóa mục thành công');
          fetchInventories();
        } catch (error: any) {
          handleError(error, 'Lỗi khi xóa mục');
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

      if (selectedInventory) {
        await axios.put(`http://localhost:8889/api/v1/product-inventories/${selectedInventory._id}`, values, {
          headers: { Authorization: `Bearer ${tokens.accessToken}` },
        });

        message.success('Cập nhật mục thành công');
      } else {
        await axios.post('http://localhost:8889/api/v1/product-inventories', values, {
          headers: { Authorization: `Bearer ${tokens.accessToken}` },
        });

        message.success('Tạo mới mục thành công');
      }

      setIsModalOpen(false);
      fetchInventories();
    } catch (error: any) {
      handleError(error, 'Lỗi khi xử lý mục');
    } finally {
      setSaving(false);
    }
  };

  const getStatus = (inventory: ProductInventory) => {
    if (inventory.quantity <= 0) return 'out_of_stock';
    if (inventory.quantity <= inventory.lowStockThreshold) return 'low';
    return 'normal';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'out_of_stock': return '#ff4d4f';
      case 'low': return '#faad14';
      default: return '#52c41a';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'out_of_stock': return 'Hết Hàng';
      case 'low': return 'Kho Đầy';
      default: return 'Bình Thường';
    }
  };

  const columns = [
    {
      title: 'Sản Phẩm',
      dataIndex: 'product',
      key: 'product',
      render: (product: any) => <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{product.product_name}</span>,
      sorter: (a: ProductInventory, b: ProductInventory) => a.product.product_name.localeCompare(b.product.product_name),
      sortDirections: ['ascend', 'descend'] as ('ascend' | 'descend')[],
    },
    {
      title: 'Biến Đổi',
      dataIndex: 'variant',
      key: 'variant',
      render: (variant: any) => variant?.variantName || '-',
      sorter: (a: ProductInventory, b: ProductInventory) => (a.variant?.variantName || '').localeCompare(b.variant?.variantName || ''),
      sortDirections: ['ascend', 'descend'] as ('ascend' | 'descend')[],
    },
    {
      title: 'Kho',
      dataIndex: 'location',
      key: 'location',
      render: (location: any) => location?.name || '-',
      sorter: (a: ProductInventory, b: ProductInventory) => (a.location?.name || '').localeCompare(b.location?.name || ''),
      sortDirections: ['ascend', 'descend'] as ('ascend' | 'descend')[],
    },
    {
      title: 'Tồn Kho',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number) => <span>{quantity} sản phẩm</span>,
      sorter: (a: ProductInventory, b: ProductInventory) => a.quantity - b.quantity,
      sortDirections: ['ascend', 'descend'] as ('ascend' | 'descend')[],
    },
    {
      title: 'Đã Đặt',
      dataIndex: 'reservedQuantity',
      key: 'reservedQuantity',
      render: (reservedQuantity: number) => <span>{reservedQuantity} sản phẩm</span>,
      sorter: (a: ProductInventory, b: ProductInventory) => a.reservedQuantity - b.reservedQuantity,
      sortDirections: ['ascend', 'descend'] as ('ascend' | 'descend')[],
    },
    {
      title: 'Ngưỡng Cảnh Báo',
      dataIndex: 'lowStockThreshold',
      key: 'lowStockThreshold',
      render: (threshold: number) => <span>{threshold} sản phẩm</span>,
      sorter: (a: ProductInventory, b: ProductInventory) => a.lowStockThreshold - b.lowStockThreshold,
      sortDirections: ['ascend', 'descend'] as ('ascend' | 'descend')[],
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Lần Nhập Hàng Cuối',
      dataIndex: 'lastRestocked',
      key: 'lastRestocked',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
      sorter: (a: ProductInventory, b: ProductInventory) => new Date(a.lastRestocked).getTime() - new Date(b.lastRestocked).getTime(),
      sortDirections: ['ascend', 'descend'] as ('ascend' | 'descend')[],
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: ProductInventory) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEditInventory(record)}
          >
            Sửa
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteInventory(record._id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4}>Quản Lý Kho Hàng</Title>
        </div>
        <div>
          <Space>
            <Input
              placeholder="Tìm kiếm..."
              onChange={handleSearch}
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddInventory}
            >
              Thêm Mới Mục
            </Button>
          </Space>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={inventories}
        loading={loading}
        pagination={{
          ...pagination,
          onChange: (page: number, pageSize: number) => {
            setPagination({ ...pagination, page, limit: pageSize });
          },
          showSizeChanger: true,
        }}
        rowKey="_id"
        scroll={{ x: 1500 }}
      />

      <Modal
        title={selectedInventory ? 'Chỉnh sửa mục' : 'Thêm mới mục'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={saving}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="product"
            label="Sản Phẩm"
            rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}
          >
            <Select
              showSearch
              placeholder="Chọn sản phẩm"
              optionFilterProp="children"
            >
              {products.map((p) => (
                <Select.Option key={p._id} value={p._id}>
                  {p.product_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="variant"
            label="Biến Đổi"
          >
            <Select
              showSearch
              placeholder="Chọn biến đổi"
              optionFilterProp="children"
            >
              {variants.map((v) => (
                <Select.Option key={v._id} value={v._id}>
                  {v.variantName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="location"
            label="Kho"
          >
            <Select
              showSearch
              placeholder="Chọn kho"
              optionFilterProp="children"
            >
              {locations.map((l) => (
                <Select.Option key={l._id} value={l._id}>
                  {l.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Tồn Kho"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng tồn kho' }]}
          >
            <InputNumber min={0} />
          </Form.Item>

          <Form.Item
            name="reservedQuantity"
            label="Đã Đặt"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng đã đặt' }]}
          >
            <InputNumber min={0} />
          </Form.Item>

          <Form.Item
            name="lowStockThreshold"
            label="Ngưỡng Cảnh Báo"
            rules={[{ required: true, message: 'Vui lòng nhập ngưỡng cảnh báo' }]}
          >
            <InputNumber min={0} />
          </Form.Item>

          <Form.Item
            name="lastRestocked"
            label="Lần Nhập Hàng Cuối"
          >
            <Input placeholder="Nhập ngày theo định dạng YYYY-MM-DD" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductInventoriesPage;
