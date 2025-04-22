import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuthStore } from '../stores/useAuthStore';
import { useNavigate } from 'react-router-dom';

interface Notification {
  _id: string;
  type: 'order' | 'payment' | 'account' | 'promotion';
  title: string;
  message: string;
  metadata: any;
  isRead: boolean;
  user: {
    _id: string;
    userName: string;
  };
  createdAt: string;
}

interface Pagination {
  totalRecord: number;
  limit: number;
  page: number;
}

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, tokens } = useAuthStore();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ totalRecord: 0, limit: 10, page: 1 });
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.roles === 'admin';

  useEffect(() => {
    fetchNotifications();
  }, [tokens?.accessToken, pagination.page, pagination.limit]);

  const fetchNotifications = async () => {
    try {
      if (!tokens?.accessToken) {
        message.error('Vui lòng đăng nhập để tiếp tục');
        navigate('/login');
        return;
      }

      setLoading(true);
      const response = await axios.get('http://localhost:8889/api/v1/notifications', {
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
        params: { page: pagination.page, limit: pagination.limit },
      });

      setNotifications(response.data.data.notifications);
      setPagination(response.data.data.pagination);
    } catch (error: any) {
      handleError(error, 'Lỗi khi lấy danh sách thông báo');
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

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      if (!tokens?.accessToken) {
        message.error('Vui lòng đăng nhập để tiếp tục');
        navigate('/login');
        return;
      }

      await axios.put(`http://localhost:8889/api/v1/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
      });

      message.success('Đánh dấu thông báo thành công');
      fetchNotifications();
    } catch (error: any) {
      handleError(error, 'Lỗi khi đánh dấu thông báo');
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
          'order': { color: '#1890ff', label: 'Đơn Hàng' },
          'payment': { color: '#2db7f5', label: 'Thanh Toán' },
          'account': { color: '#87d068', label: 'Tài Khoản' },
          'promotion': { color: '#f50', label: 'Khuyến Mãi' }
        };
        return <span style={{ color: typeMap[type]?.color }}>{typeMap[type]?.label}</span>;
      }
    },
    { 
      title: 'Tiêu Đề', 
      dataIndex: 'title', 
      key: 'title'
    },
    { 
      title: 'Nội Dung', 
      dataIndex: 'message', 
      key: 'message'
    },
    { 
      title: 'Người Nhận', 
      dataIndex: ['user', 'userName'], 
      key: 'user'
    },
    { 
      title: 'Trạng Thái', 
      dataIndex: 'isRead', 
      key: 'isRead',
      render: (isRead: boolean, record: Notification) => (
        <Button
          type="text"
          icon={isRead ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          onClick={() => handleMarkAsRead(isRead ? '' : record._id)}
        >
          {isRead ? 'Đã Đọc' : 'Chưa Đọc'}
        </Button>
      )
    },
    { 
      title: 'Ngày Tạo', 
      dataIndex: 'createdAt', 
      key: 'createdAt'
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Danh Sách Thông Báo</h2>
      </div>

      <Table
        columns={columns}
        dataSource={notifications}
        loading={loading}
        pagination={{
          ...pagination,
          onChange: handleTableChange,
          showSizeChanger: true,
        }}
        rowKey="_id"
      />
    </div>
  );
};

export default NotificationsPage;
