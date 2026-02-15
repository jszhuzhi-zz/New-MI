import React, { useState, useRef } from 'react';
import {
  Card,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Table,
  Tag,
  Modal,
  Result,
  Input,
  Divider,
  Statistic,
  message,
  Spin,
  List,
  Avatar,
} from 'antd';
import {
  ScanOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  GiftOutlined,
  UserOutlined,
  CreditCardOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface MemberInfo {
  id: string;
  name: string;
  phone: string;
  cardNo: string;
  tier: string;
  stampBalance: number;
  avatar?: string;
}

interface CouponInfo {
  id: string;
  name: string;
  type: 'voucher' | 'discount' | 'gift';
  value: string;
  expiry: string;
  status: 'valid' | 'used' | 'expired';
  merchant?: string;
}

const mockMember: MemberInfo = {
  id: 'member-001',
  name: '陳小明',
  phone: '9123****',
  cardNo: 'LM-2024-0088',
  tier: 'Gold 金卡',
  stampBalance: 2580,
};

const mockCoupons: CouponInfo[] = [
  { id: 'c1', name: 'HK$50商場禮券', type: 'voucher', value: 'HK$50', expiry: '2025-03-31', status: 'valid' },
  { id: 'c2', name: '餐飲9折優惠', type: 'discount', value: '9折', expiry: '2025-02-28', status: 'valid' },
  { id: 'c3', name: '免費停車2小時', type: 'gift', value: '2小時', expiry: '2025-04-30', status: 'valid' },
];

const recentVerifications = [
  { id: 1, member: '王先生', coupon: 'HK$100禮券', time: '14:32', status: 'success' },
  { id: 2, member: '李小姐', coupon: '餐飲9折', time: '14:15', status: 'success' },
  { id: 3, member: '張先生', coupon: 'HK$50禮券', time: '13:58', status: 'success' },
  { id: 4, member: '陳小姐', coupon: '過期優惠券', time: '13:42', status: 'failed' },
];

const ScanVerify: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<CouponInfo | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setScanning(true);

      // Simulate scan after 2 seconds
      setTimeout(() => {
        stopScanner();
        setMember(mockMember);
        message.success('已識別會員');
      }, 2000);
    } catch (err) {
      message.error('無法啟動相機，請檢查權限設置');
    }
  };

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setScanning(false);
  };

  const handleManualSearch = () => {
    if (!manualCode) {
      message.warning('請輸入會員卡號');
      return;
    }
    setMember(mockMember);
    message.success('已找到會員');
    setManualCode('');
  };

  const handleSelectCoupon = (coupon: CouponInfo) => {
    setSelectedCoupon(coupon);
    setShowVerifyModal(true);
  };

  const handleVerify = async () => {
    setVerifying(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setVerifying(false);
    setVerified(true);
  };

  const handleCloseVerifyModal = () => {
    setShowVerifyModal(false);
    setSelectedCoupon(null);
    setVerified(false);
  };

  const handleReset = () => {
    setMember(null);
    setSelectedCoupon(null);
    setVerified(false);
  };

  const getCouponTypeColor = (type: string) => {
    switch (type) {
      case 'voucher': return 'gold';
      case 'discount': return 'blue';
      case 'gift': return 'green';
      default: return 'default';
    }
  };

  const getCouponTypeName = (type: string) => {
    switch (type) {
      case 'voucher': return '禮券';
      case 'discount': return '折扣';
      case 'gift': return '禮品';
      default: return type;
    }
  };

  return (
    <div>
      <Title level={4}>
        <ScanOutlined style={{ marginRight: 8 }} />
        掃碼核銷
      </Title>

      <Row gutter={[24, 24]}>
        {/* Left: Scan & Member Info */}
        <Col xs={24} lg={12}>
          {/* Scanner */}
          <Card
            title={<><VideoCameraOutlined /> 掃描會員二維碼</>}
            bordered={false}
            style={{ borderRadius: 12, marginBottom: 16 }}
          >
            {scanning ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    style={{
                      width: '100%',
                      maxWidth: 300,
                      height: 250,
                      objectFit: 'cover',
                      borderRadius: 12,
                      background: '#000',
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 180,
                    height: 180,
                    border: '3px solid #00694B',
                    borderRadius: 12,
                  }} />
                </div>
                <div style={{ marginTop: 16 }}>
                  <Spin tip="正在掃描..." />
                </div>
                <Button style={{ marginTop: 12 }} onClick={stopScanner}>取消</Button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <ScanOutlined style={{ fontSize: 64, color: '#00694B', marginBottom: 16 }} />
                <div>
                  <Button
                    type="primary"
                    size="large"
                    icon={<ScanOutlined />}
                    onClick={startScanner}
                    style={{ background: '#00694B', marginBottom: 16 }}
                  >
                    開始掃描
                  </Button>
                </div>
                <Divider>或</Divider>
                <Space.Compact style={{ width: '80%' }}>
                  <Input
                    placeholder="輸入會員卡號"
                    value={manualCode}
                    onChange={e => setManualCode(e.target.value)}
                    onPressEnter={handleManualSearch}
                  />
                  <Button type="primary" onClick={handleManualSearch}>查詢</Button>
                </Space.Compact>
              </div>
            )}
          </Card>

          {/* Member Info */}
          {member && (
            <Card
              title={<><UserOutlined /> 會員信息</>}
              bordered={false}
              style={{ borderRadius: 12 }}
              extra={<Button size="small" onClick={handleReset}>重新掃描</Button>}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <Avatar size={64} icon={<UserOutlined />} style={{ background: '#00694B' }} />
                <div>
                  <Title level={5} style={{ margin: 0 }}>{member.name}</Title>
                  <Text type="secondary">{member.cardNo}</Text>
                  <br />
                  <Tag color="gold">{member.tier}</Tag>
                </div>
              </div>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="可用印花" value={member.stampBalance} valueStyle={{ color: '#00694B' }} />
                </Col>
                <Col span={12}>
                  <Statistic title="可用優惠券" value={mockCoupons.length} />
                </Col>
              </Row>

              <Divider>可核銷優惠券</Divider>

              <List
                dataSource={mockCoupons}
                renderItem={coupon => (
                  <List.Item
                    actions={[
                      <Button
                        key="verify"
                        type="primary"
                        size="small"
                        style={{ background: '#00694B' }}
                        onClick={() => handleSelectCoupon(coupon)}
                      >
                        核銷
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<GiftOutlined style={{ fontSize: 24, color: '#C4A962' }} />}
                      title={coupon.name}
                      description={
                        <Space>
                          <Tag color={getCouponTypeColor(coupon.type)}>{getCouponTypeName(coupon.type)}</Tag>
                          <Text type="secondary">有效期至 {coupon.expiry}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}
        </Col>

        {/* Right: Recent Verifications */}
        <Col xs={24} lg={12}>
          <Card
            title="今日核銷記錄"
            bordered={false}
            style={{ borderRadius: 12 }}
          >
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <Statistic title="今日核銷" value={28} suffix="筆" />
              </Col>
              <Col span={8}>
                <Statistic title="成功" value={26} valueStyle={{ color: '#52c41a' }} />
              </Col>
              <Col span={8}>
                <Statistic title="失敗" value={2} valueStyle={{ color: '#ff4d4f' }} />
              </Col>
            </Row>

            <Table
              dataSource={recentVerifications}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                { title: '時間', dataIndex: 'time', width: 70 },
                { title: '會員', dataIndex: 'member', width: 100 },
                { title: '優惠券', dataIndex: 'coupon' },
                {
                  title: '狀態',
                  dataIndex: 'status',
                  width: 80,
                  render: (status) => (
                    <Tag color={status === 'success' ? 'green' : 'red'}>
                      {status === 'success' ? '成功' : '失敗'}
                    </Tag>
                  )
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Verify Modal */}
      <Modal
        open={showVerifyModal}
        onCancel={handleCloseVerifyModal}
        footer={null}
        width={400}
        centered
      >
        {!verified ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <GiftOutlined style={{ fontSize: 48, color: '#C4A962', marginBottom: 16 }} />
            <Title level={4}>{selectedCoupon?.name}</Title>
            <div style={{ marginBottom: 24 }}>
              <Tag color={getCouponTypeColor(selectedCoupon?.type || '')} style={{ fontSize: 14 }}>
                {selectedCoupon?.value}
              </Tag>
            </div>
            <div style={{ marginBottom: 24 }}>
              <Text>會員：{member?.name}</Text>
              <br />
              <Text type="secondary">卡號：{member?.cardNo}</Text>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              loading={verifying}
              onClick={handleVerify}
              style={{ background: '#00694B', width: 200 }}
            >
              確認核銷
            </Button>
          </div>
        ) : (
          <Result
            status="success"
            title="核銷成功！"
            subTitle={`已成功核銷「${selectedCoupon?.name}」`}
            extra={[
              <Button
                key="close"
                type="primary"
                onClick={handleCloseVerifyModal}
                style={{ background: '#00694B' }}
              >
                完成
              </Button>
            ]}
          />
        )}
      </Modal>
    </div>
  );
};

export default ScanVerify;
