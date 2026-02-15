import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, Form, Input, Button, Toast, ImageUploader, DatePicker, Card, Dialog, List } from 'antd-mobile';
import { CameraOutline, CheckCircleFill } from 'antd-mobile-icons';
import { useAuthStore } from '../../store/auth';
import dayjs from 'dayjs';

const PRIMARY = '#00694B';
const GOLD = '#C4A962';

interface FileItem {
  url: string;
}

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState({
    name: user?.name || '',
    nameEn: user?.nameEn || '',
    phone: user?.phone || '',
    email: user?.email || '',
    birthday: user?.birthday ? new Date(user.birthday) : null,
  });
  const [avatar, setAvatar] = useState<FileItem[]>(
    user?.avatar ? [{ url: user.avatar }] : []
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  // Track if user already got bonuses
  const hadAvatar = !!user?.avatar;
  const hadBirthday = !!user?.birthday;

  const handleAvatarUpload = async (file: File): Promise<{ url: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const url = URL.createObjectURL(file);
    return { url };
  };

  const handleSave = async () => {
    if (!form.name) {
      Toast.show({ icon: 'fail', content: '請輸入姓名' });
      return;
    }

    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Calculate bonuses for first-time completion
    let totalBonus = 0;
    const bonusItems: string[] = [];

    // First time uploading avatar
    if (!hadAvatar && avatar.length > 0) {
      totalBonus += 50;
      bonusItems.push('上傳頭像 +50');
    }

    // First time registering birthday
    if (!hadBirthday && form.birthday) {
      totalBonus += 100;
      bonusItems.push('登記生日 +100');
    }

    setUser({
      ...user,
      name: form.name,
      nameEn: form.nameEn,
      phone: form.phone,
      email: form.email,
      birthday: form.birthday ? dayjs(form.birthday).format('YYYY-MM-DD') : null,
      avatar: avatar[0]?.url || null,
      stampBalance: (user?.stampBalance || 0) + totalBonus,
    });

    setSaving(false);

    if (totalBonus > 0) {
      Dialog.alert({
        title: '恭喜獲得印花獎勵！',
        content: (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
            <div style={{ marginBottom: 12 }}>
              {bonusItems.map((item, i) => (
                <div key={i} style={{ color: GOLD, fontWeight: 500, marginBottom: 4 }}>{item}</div>
              ))}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: PRIMARY }}>
              共 +{totalBonus} 印花
            </div>
          </div>
        ),
        confirmText: '太好了',
      });
    } else {
      Toast.show({ icon: 'success', content: '資料已更新' });
    }
    navigate(-1);
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <NavBar
        onBack={() => navigate(-1)}
        style={{
          '--height': '44px',
          background: '#fff',
        } as React.CSSProperties}
      >
        編輯資料
      </NavBar>

      {/* Avatar Section */}
      <div style={{ padding: '24px 16px', textAlign: 'center', background: '#fff' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div style={{
            width: 80, height: 80, borderRadius: 40,
            background: avatar[0] ? `url(${avatar[0].url}) center/cover` : '#e0e0e0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, color: '#fff', overflow: 'hidden',
          }}>
            {!avatar[0] && '👤'}
          </div>
          <ImageUploader
            value={avatar}
            onChange={setAvatar}
            upload={handleAvatarUpload}
            maxCount={1}
            style={{ '--cell-size': '80px' } as React.CSSProperties}
          >
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 28, height: 28, borderRadius: 14,
              background: PRIMARY, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #fff',
            }}>
              <CameraOutline fontSize={14} />
            </div>
          </ImageUploader>
        </div>
        <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
          點擊更換頭像
          {!hadAvatar && !avatar[0] && (
            <span style={{ color: GOLD, marginLeft: 4 }}>+50印花</span>
          )}
          {hadAvatar && (
            <span style={{ color: PRIMARY, marginLeft: 4 }}>
              <CheckCircleFill fontSize={12} /> 已完成
            </span>
          )}
        </div>
      </div>

      {/* Form */}
      <div style={{ padding: '16px', background: '#fff', marginTop: 8 }}>
        <Form layout="horizontal">
          <Form.Item label="姓名" required>
            <Input
              placeholder="請輸入姓名"
              value={form.name}
              onChange={v => setForm({ ...form, name: v })}
            />
          </Form.Item>
          <Form.Item label="英文名">
            <Input
              placeholder="請輸入英文名"
              value={form.nameEn}
              onChange={v => setForm({ ...form, nameEn: v })}
            />
          </Form.Item>
          <Form.Item label="手機號碼">
            <Input
              placeholder="請輸入手機號碼"
              type="tel"
              value={form.phone}
              onChange={v => setForm({ ...form, phone: v })}
            />
          </Form.Item>
          <Form.Item label="電郵地址">
            <Input
              placeholder="請輸入電郵地址"
              type="email"
              value={form.email}
              onChange={v => setForm({ ...form, email: v })}
            />
          </Form.Item>
          <Form.Item
            label={
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>生日</span>
                {!hadBirthday && !form.birthday && (
                  <span style={{
                    background: `${GOLD}20`, color: GOLD,
                    fontSize: 10, padding: '1px 6px', borderRadius: 8,
                  }}>
                    +100印花
                  </span>
                )}
                {hadBirthday && (
                  <CheckCircleFill fontSize={14} color={PRIMARY} />
                )}
              </div>
            }
            onClick={() => !hadBirthday && setShowDatePicker(true)}
            extra={
              form.birthday
                ? dayjs(form.birthday).format('YYYY-MM-DD')
                : hadBirthday
                  ? user?.birthday
                  : '選擇日期'
            }
            disabled={hadBirthday}
          />
        </Form>
      </div>

      {/* Bonus Tips */}
      <Card style={{ margin: 16, borderRadius: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>🎁</span> 完善資料賺印花
        </div>
        <List style={{ '--border-top': 'none', '--border-bottom': 'none' } as React.CSSProperties}>
          <List.Item
            prefix={hadAvatar ? <CheckCircleFill color={PRIMARY} /> : <span style={{ opacity: 0.3 }}>○</span>}
            extra={<span style={{ color: hadAvatar ? '#999' : GOLD }}>+50</span>}
          >
            <span style={{ color: hadAvatar ? '#999' : '#333' }}>上傳頭像</span>
          </List.Item>
          <List.Item
            prefix={hadBirthday ? <CheckCircleFill color={PRIMARY} /> : <span style={{ opacity: 0.3 }}>○</span>}
            extra={<span style={{ color: hadBirthday ? '#999' : GOLD }}>+100</span>}
          >
            <span style={{ color: hadBirthday ? '#999' : '#333' }}>登記生日</span>
          </List.Item>
        </List>
        <div style={{ fontSize: 11, color: '#999', marginTop: 8 }}>
          * 每項任務僅首次完成可獲得印花獎勵
        </div>
      </Card>

      {/* Save Button */}
      <div style={{ padding: '16px' }}>
        <Button
          block
          color="primary"
          loading={saving}
          onClick={handleSave}
          style={{ '--background-color': PRIMARY, borderRadius: 8, height: 44 } as React.CSSProperties}
        >
          保存修改
        </Button>
      </div>

      {/* Date Picker */}
      <DatePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onConfirm={date => {
          setForm({ ...form, birthday: date });
          setShowDatePicker(false);
        }}
        min={new Date(1920, 0, 1)}
        max={new Date()}
        title="選擇生日"
      />
    </div>
  );
}
