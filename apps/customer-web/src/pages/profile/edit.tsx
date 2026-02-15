import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, Form, Input, Button, Toast, ImageUploader, DatePicker, Card, Dialog } from 'antd-mobile';
import { CameraOutline } from 'antd-mobile-icons';
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
  const [birthdayPhotos, setBirthdayPhotos] = useState<FileItem[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAvatarUpload = async (file: File): Promise<{ url: string }> => {
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 500));
    const url = URL.createObjectURL(file);
    return { url };
  };

  const handleBirthdayPhotoUpload = async (file: File): Promise<{ url: string }> => {
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

    // Calculate birthday bonus
    let birthdayBonus = 0;
    if (birthdayPhotos.length > 0 && form.birthday) {
      birthdayBonus = 100; // 100 stamps for birthday photo
    }

    setUser({
      ...user,
      name: form.name,
      nameEn: form.nameEn,
      phone: form.phone,
      email: form.email,
      birthday: form.birthday ? dayjs(form.birthday).format('YYYY-MM-DD') : null,
      avatar: avatar[0]?.url || null,
      stampBalance: (user?.stampBalance || 0) + birthdayBonus,
    });

    setSaving(false);

    if (birthdayBonus > 0) {
      Dialog.alert({
        title: '生日獎勵',
        content: `恭喜！您已獲得 ${birthdayBonus} 印花生日獎勵！`,
        confirmText: '太好了',
      });
    } else {
      Toast.show({ icon: 'success', content: '資料已更新' });
    }
    navigate(-1);
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <NavBar onBack={() => navigate(-1)} style={{ background: '#fff' }}>
        編輯資料
      </NavBar>

      {/* Avatar */}
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
        <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>點擊更換頭像</div>
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
            label="生日"
            onClick={() => setShowDatePicker(true)}
            extra={form.birthday ? dayjs(form.birthday).format('YYYY-MM-DD') : '選擇日期'}
          />
        </Form>
      </div>

      {/* Birthday Photo Upload */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🎂 生日照片</span>
            <span style={{
              background: `${GOLD}20`, color: GOLD,
              fontSize: 11, padding: '2px 8px', borderRadius: 10,
            }}>
              +100 印花
            </span>
          </div>
        }
        style={{ margin: 16, borderRadius: 12 }}
      >
        <div style={{ padding: '8px 0' }}>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
            上傳您的生日照片（如身份證或護照），首次驗證可獲得100印花獎勵
          </div>
          <ImageUploader
            value={birthdayPhotos}
            onChange={setBirthdayPhotos}
            upload={handleBirthdayPhotoUpload}
            maxCount={1}
          >
            <div style={{
              width: '100%', height: 100, border: '2px dashed #d9d9d9',
              borderRadius: 8, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', color: '#999',
            }}>
              <CameraOutline fontSize={24} />
              <span style={{ fontSize: 12, marginTop: 4 }}>點擊上傳照片</span>
            </div>
          </ImageUploader>
          <div style={{ fontSize: 11, color: '#bbb', marginTop: 8 }}>
            * 照片僅用於生日驗證，我們會妥善保護您的隱私
          </div>
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
