import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  NavBar,
  Card,
  Button,
  Dialog,
  Toast,
  Input,
  List,
  Tag,
  Empty,
  Popup,
  Form,
  Radio,
  Space,
} from 'antd-mobile';
import { AddOutline, DeleteOutline, RightOutline } from 'antd-mobile-icons';
import { useTranslation } from '../../locales';
import { useSettingsStore, type Locale } from '../../store/settings';
import { useAuthStore } from '../../store/auth';

interface LicensePlate {
  id: string;
  plateNumber: string;
  isDefault: boolean;
  vehicleType: 'car' | 'motorcycle';
}

interface ParkingRecord {
  id: string;
  plateNumber: string;
  entryTime: string;
  exitTime?: string;
  duration: number; // in minutes
  fee: number;
  status: 'parking' | 'paid' | 'pending';
  location: Record<Locale, string>;
}

const mockPlates: LicensePlate[] = [
  { id: 'p1', plateNumber: 'AB 1234', isDefault: true, vehicleType: 'car' },
  { id: 'p2', plateNumber: 'CD 5678', isDefault: false, vehicleType: 'car' },
];

const mockRecordsData: ParkingRecord[] = [
  {
    id: 'r1',
    plateNumber: 'AB 1234',
    entryTime: '2026-02-17 10:30',
    duration: 125,
    fee: 45,
    status: 'parking',
    location: { 'zh-TW': '領展廣場·觀塘', 'zh-CN': '领展广场·观塘', en: 'Link Square · Kwun Tong' },
  },
  {
    id: 'r2',
    plateNumber: 'AB 1234',
    entryTime: '2026-02-15 14:00',
    exitTime: '2026-02-15 17:30',
    duration: 210,
    fee: 70,
    status: 'paid',
    location: { 'zh-TW': '樂富廣場', 'zh-CN': '乐富广场', en: 'Lok Fu Place' },
  },
  {
    id: 'r3',
    plateNumber: 'CD 5678',
    entryTime: '2026-02-14 09:00',
    exitTime: '2026-02-14 12:00',
    duration: 180,
    fee: 60,
    status: 'paid',
    location: { 'zh-TW': 'TKO Gateway', 'zh-CN': 'TKO Gateway', en: 'TKO Gateway' },
  },
];

// Car Icon
const CarIcon = ({ color = '#00694B' }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M19 17h1c.6 0 1-.4 1-1v-3c0-.6-.4-1-1-1h-1l-3-5c-.3-.6-1-1-1.6-1H8.6c-.6 0-1.3.4-1.6 1l-3 5H3c-.6 0-1 .4-1 1v3c0 .6.4 1 1 1h1"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="7" cy="17" r="2" stroke={color} strokeWidth="1.5" />
    <circle cx="17" cy="17" r="2" stroke={color} strokeWidth="1.5" />
    <path d="M5 12l2-4h10l2 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Stamp Icon for redemption
const StampIcon = ({ color = '#00694B' }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
    <path d="M12 7v5l3 3" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default function ParkingPage() {
  const navigate = useNavigate();
  const { t, locale } = useTranslation();
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();
  const user = useAuthStore((s) => s.user);
  const stampBalance = user?.stampBalance || 2580;

  const [plates, setPlates] = useState<LicensePlate[]>(mockPlates);
  const [records, setRecords] = useState<ParkingRecord[]>(mockRecordsData);
  const [showAddPlate, setShowAddPlate] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ParkingRecord | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'stamps'>('cash');
  const [newPlateNumber, setNewPlateNumber] = useState('');
  const [newVehicleType, setNewVehicleType] = useState<'car' | 'motorcycle'>('car');

  const localizedRecords = useMemo(() => {
    return records.map((r) => ({
      ...r,
      locationText: r.location[locale],
    }));
  }, [records, locale]);

  const parkingRecord = localizedRecords.find((r) => r.status === 'parking');
  const historyRecords = localizedRecords.filter((r) => r.status !== 'parking');

  const STAMP_TO_HKD = 10; // 10 stamps = 1 HKD

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (locale === 'en') {
      return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }
    return hours > 0 ? `${hours}小時${mins}分鐘` : `${mins}分鐘`;
  };

  const addPlate = () => {
    if (!newPlateNumber.trim()) {
      Toast.show({ content: t('parking.enterPlateNumber'), icon: 'fail' });
      return;
    }

    const newPlate: LicensePlate = {
      id: `p${Date.now()}`,
      plateNumber: newPlateNumber.toUpperCase(),
      isDefault: plates.length === 0,
      vehicleType: newVehicleType,
    };
    setPlates([...plates, newPlate]);
    setNewPlateNumber('');
    setShowAddPlate(false);
    Toast.show({ content: t('parking.plateAdded'), icon: 'success' });
  };

  const deletePlate = async (id: string) => {
    const result = await Dialog.confirm({
      content: t('parking.confirmDeletePlate'),
      confirmText: t('common.confirm'),
      cancelText: t('common.cancel'),
    });
    if (result) {
      setPlates(plates.filter((p) => p.id !== id));
      Toast.show({ content: t('parking.plateDeleted'), icon: 'success' });
    }
  };

  const setDefaultPlate = (id: string) => {
    setPlates(
      plates.map((p) => ({
        ...p,
        isDefault: p.id === id,
      }))
    );
    Toast.show({ content: t('parking.defaultPlateSet'), icon: 'success' });
  };

  const handlePayment = () => {
    if (!selectedRecord) return;

    if (paymentMethod === 'stamps') {
      const requiredStamps = selectedRecord.fee * STAMP_TO_HKD;
      if (stampBalance < requiredStamps) {
        Toast.show({ content: t('parking.insufficientStamps'), icon: 'fail' });
        return;
      }
    }

    // Mark as paid
    setRecords(
      records.map((r) =>
        r.id === selectedRecord.id
          ? { ...r, status: 'paid' as const, exitTime: new Date().toISOString().slice(0, 16).replace('T', ' ') }
          : r
      )
    );

    setShowPayment(false);
    setSelectedRecord(null);
    Toast.show({ content: t('parking.paymentSuccess'), icon: 'success' });
  };

  const openPayment = (record: ParkingRecord) => {
    setSelectedRecord(record);
    setPaymentMethod('cash');
    setShowPayment(true);
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: 20 }}>
      <NavBar onBack={() => navigate(-1)} style={{ background: colors.primary }}>
        <span style={{ color: '#fff' }}>{t('parking.title')}</span>
      </NavBar>

      {/* Current Parking */}
      {parkingRecord && (
        <div style={{ padding: '16px 16px 0' }}>
          <Card
            style={{
              borderRadius: 12,
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
            }}
          >
            <div style={{ color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <CarIcon color="#fff" />
                <span style={{ fontSize: 18, fontWeight: 600 }}>{t('parking.currentParking')}</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
                {parkingRecord.plateNumber}
              </div>
              <div style={{ opacity: 0.8, fontSize: 14, marginBottom: 8 }}>
                {parkingRecord.locationText}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                <div>
                  <div style={{ opacity: 0.7, fontSize: 12 }}>{t('parking.duration')}</div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{formatDuration(parkingRecord.duration)}</div>
                </div>
                <div>
                  <div style={{ opacity: 0.7, fontSize: 12 }}>{t('parking.currentFee')}</div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>HK${parkingRecord.fee}</div>
                </div>
              </div>
              <Button
                block
                style={{
                  marginTop: 16,
                  background: '#fff',
                  color: colors.primary,
                  border: 'none',
                  fontWeight: 600,
                }}
                onClick={() => openPayment(parkingRecord)}
              >
                {t('parking.payNow')}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* License Plates */}
      <div style={{ padding: '16px 16px 0' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 600, color: '#333' }}>{t('parking.myPlates')}</span>
          <Button
            size="small"
            style={{ background: colors.primary, color: '#fff', border: 'none' }}
            onClick={() => setShowAddPlate(true)}
          >
            <AddOutline /> {t('parking.addPlate')}
          </Button>
        </div>
        <Card style={{ borderRadius: 12 }}>
          {plates.length === 0 ? (
            <Empty description={t('parking.noPlates')} style={{ padding: '24px 0' }} />
          ) : (
            <List style={{ '--border-top': 'none', '--border-bottom': 'none' } as React.CSSProperties}>
              {plates.map((plate) => (
                <List.Item
                  key={plate.id}
                  prefix={<CarIcon color={colors.primary} />}
                  extra={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {plate.isDefault && (
                        <Tag color="primary" style={{ background: colors.primary }}>
                          {t('parking.default')}
                        </Tag>
                      )}
                      <DeleteOutline
                        style={{ color: '#ff4d4f', fontSize: 18 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePlate(plate.id);
                        }}
                      />
                    </div>
                  }
                  onClick={() => !plate.isDefault && setDefaultPlate(plate.id)}
                >
                  <div style={{ fontWeight: 600 }}>{plate.plateNumber}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>
                    {plate.vehicleType === 'car' ? t('parking.car') : t('parking.motorcycle')}
                  </div>
                </List.Item>
              ))}
            </List>
          )}
        </Card>
      </div>

      {/* Stamp Redemption Info */}
      <div style={{ padding: '16px 16px 0' }}>
        <Card style={{ borderRadius: 12, background: '#FFF9E6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                background: '#C4A962',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <StampIcon color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#333' }}>{t('parking.stampRedemption')}</div>
              <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
                {t('parking.stampRate', { stamps: STAMP_TO_HKD })}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#C4A962' }}>
                {stampBalance.toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: '#999' }}>{t('parking.availableStamps')}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Parking History */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#333', marginBottom: 12 }}>
          {t('parking.history')}
        </div>
        {historyRecords.length === 0 ? (
          <Card style={{ borderRadius: 12 }}>
            <Empty description={t('parking.noHistory')} style={{ padding: '24px 0' }} />
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {historyRecords.map((record) => (
              <Card key={record.id} style={{ borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{record.plateNumber}</div>
                    <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
                      {record.locationText}
                    </div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                      {record.entryTime} - {record.exitTime}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>HK${record.fee}</div>
                    <Tag
                      color={record.status === 'paid' ? 'success' : 'warning'}
                      style={{ marginTop: 4 }}
                    >
                      {record.status === 'paid' ? t('parking.paid') : t('parking.pending')}
                    </Tag>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Plate Popup */}
      <Popup
        visible={showAddPlate}
        onMaskClick={() => setShowAddPlate(false)}
        bodyStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20 }}
      >
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>{t('parking.addPlate')}</div>
        <Form layout="vertical">
          <Form.Item label={t('parking.plateNumber')}>
            <Input
              placeholder={t('parking.plateNumberPlaceholder')}
              value={newPlateNumber}
              onChange={setNewPlateNumber}
              style={{ textTransform: 'uppercase' }}
            />
          </Form.Item>
          <Form.Item label={t('parking.vehicleType')}>
            <Radio.Group
              value={newVehicleType}
              onChange={(val) => setNewVehicleType(val as 'car' | 'motorcycle')}
            >
              <Space direction="horizontal">
                <Radio value="car">{t('parking.car')}</Radio>
                <Radio value="motorcycle">{t('parking.motorcycle')}</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
        </Form>
        <Button
          block
          color="primary"
          style={{ marginTop: 16, background: colors.primary }}
          onClick={addPlate}
        >
          {t('common.confirm')}
        </Button>
      </Popup>

      {/* Payment Popup */}
      <Popup
        visible={showPayment}
        onMaskClick={() => setShowPayment(false)}
        bodyStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20 }}
      >
        {selectedRecord && (
          <>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>{t('parking.payment')}</div>
            <Card style={{ borderRadius: 12, marginBottom: 16, background: '#f5f5f5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: '#666' }}>{t('parking.plateNumber')}</span>
                <span style={{ fontWeight: 600 }}>{selectedRecord.plateNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: '#666' }}>{t('parking.duration')}</span>
                <span style={{ fontWeight: 600 }}>{formatDuration(selectedRecord.duration)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>{t('parking.totalFee')}</span>
                <span style={{ fontWeight: 700, fontSize: 18, color: colors.primary }}>
                  HK${selectedRecord.fee}
                </span>
              </div>
            </Card>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                {t('parking.paymentMethod')}
              </div>
              <Radio.Group
                value={paymentMethod}
                onChange={(val) => setPaymentMethod(val as 'cash' | 'stamps')}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Card
                    style={{
                      borderRadius: 12,
                      border: paymentMethod === 'cash' ? `2px solid ${colors.primary}` : '1px solid #eee',
                    }}
                    onClick={() => setPaymentMethod('cash')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Radio value="cash" />
                      <div>
                        <div style={{ fontWeight: 600 }}>{t('parking.payCash')}</div>
                        <div style={{ fontSize: 12, color: '#999' }}>HK${selectedRecord.fee}</div>
                      </div>
                    </div>
                  </Card>
                  <Card
                    style={{
                      borderRadius: 12,
                      border: paymentMethod === 'stamps' ? `2px solid ${colors.primary}` : '1px solid #eee',
                    }}
                    onClick={() => setPaymentMethod('stamps')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Radio value="stamps" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{t('parking.payStamps')}</div>
                        <div style={{ fontSize: 12, color: '#999' }}>
                          {selectedRecord.fee * STAMP_TO_HKD} {t('parking.stamps')}
                        </div>
                      </div>
                      {stampBalance < selectedRecord.fee * STAMP_TO_HKD && (
                        <Tag color="danger">{t('parking.insufficient')}</Tag>
                      )}
                    </div>
                  </Card>
                </Space>
              </Radio.Group>
            </div>

            <Button
              block
              color="primary"
              style={{ background: colors.primary }}
              onClick={handlePayment}
              disabled={
                paymentMethod === 'stamps' && stampBalance < selectedRecord.fee * STAMP_TO_HKD
              }
            >
              {t('parking.confirmPayment')}
            </Button>
          </>
        )}
      </Popup>
    </div>
  );
}
