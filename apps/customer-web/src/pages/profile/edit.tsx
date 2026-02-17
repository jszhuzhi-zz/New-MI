import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, Form, Input, Button, Toast, ImageUploader, DatePicker, Card, Dialog, List } from 'antd-mobile';
import { CameraOutline, CheckCircleFill } from 'antd-mobile-icons';
import { useAuthStore } from '../../store/auth';
import { useSettingsStore } from '../../store/settings';
import { useTranslation } from '../../locales';
import dayjs from 'dayjs';

const GOLD = '#C4A962';

interface FileItem {
  url: string;
}

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();
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
      Toast.show({ icon: 'fail', content: t('profileEdit.nameRequired') });
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
      bonusItems.push(`${t('profileEdit.uploadAvatar')} +50`);
    }

    // First time registering birthday
    if (!hadBirthday && form.birthday) {
      totalBonus += 100;
      bonusItems.push(`${t('profileEdit.registerBirthday')} +100`);
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
        title: t('profileEdit.congratulations'),
        content: (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
            <div style={{ marginBottom: 12 }}>
              {bonusItems.map((item, i) => (
                <div key={i} style={{ color: GOLD, fontWeight: 500, marginBottom: 4 }}>{item}</div>
              ))}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: colors.primary }}>
              {t('profileEdit.totalBonus')} +{totalBonus} {t('profileEdit.stampBonus')}
            </div>
          </div>
        ),
        confirmText: t('scan.great'),
      });
    } else {
      Toast.show({ icon: 'success', content: t('profileEdit.updated') });
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
        {t('profileEdit.title')}
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
              background: colors.primary, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #fff',
            }}>
              <CameraOutline fontSize={14} />
            </div>
          </ImageUploader>
        </div>
        <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
          {t('profileEdit.changeAvatar')}
          {!hadAvatar && !avatar[0] && (
            <span style={{ color: GOLD, marginLeft: 4 }}>+50 {t('profileEdit.stampBonus')}</span>
          )}
          {hadAvatar && (
            <span style={{ color: colors.primary, marginLeft: 4 }}>
              <CheckCircleFill fontSize={12} /> {t('profile.completed')}
            </span>
          )}
        </div>
      </div>

      {/* Form */}
      <div style={{ padding: '16px', background: '#fff', marginTop: 8 }}>
        <Form layout="horizontal">
          <Form.Item label={t('profile.name')} required>
            <Input
              placeholder={t('profileEdit.enterName')}
              value={form.name}
              onChange={v => setForm({ ...form, name: v })}
            />
          </Form.Item>
          <Form.Item label={t('profileEdit.englishName')}>
            <Input
              placeholder={t('profileEdit.enterEnglishName')}
              value={form.nameEn}
              onChange={v => setForm({ ...form, nameEn: v })}
            />
          </Form.Item>
          <Form.Item label={t('profile.phone')}>
            <Input
              placeholder={t('profileEdit.enterPhone')}
              type="tel"
              value={form.phone}
              onChange={v => setForm({ ...form, phone: v })}
            />
          </Form.Item>
          <Form.Item label={t('profile.email')}>
            <Input
              placeholder={t('profileEdit.enterEmail')}
              type="email"
              value={form.email}
              onChange={v => setForm({ ...form, email: v })}
            />
          </Form.Item>
          <Form.Item
            label={
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{t('profile.birthday')}</span>
                {!hadBirthday && !form.birthday && (
                  <span style={{
                    background: `${GOLD}20`, color: GOLD,
                    fontSize: 10, padding: '1px 6px', borderRadius: 8,
                  }}>
                    +100 {t('profileEdit.stampBonus')}
                  </span>
                )}
                {hadBirthday && (
                  <CheckCircleFill fontSize={14} color={colors.primary} />
                )}
              </div>
            }
            onClick={() => !hadBirthday && setShowDatePicker(true)}
            extra={
              form.birthday
                ? dayjs(form.birthday).format('YYYY-MM-DD')
                : hadBirthday
                  ? user?.birthday
                  : t('profileEdit.selectDate')
            }
            disabled={hadBirthday}
          />
        </Form>
      </div>

      {/* Bonus Tips */}
      <Card style={{ margin: 16, borderRadius: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>🎁</span> {t('profileEdit.bonusTitle')}
        </div>
        <List style={{ '--border-top': 'none', '--border-bottom': 'none' } as React.CSSProperties}>
          <List.Item
            prefix={hadAvatar ? <CheckCircleFill color={colors.primary} /> : <span style={{ opacity: 0.3 }}>○</span>}
            extra={<span style={{ color: hadAvatar ? '#999' : GOLD }}>+50</span>}
          >
            <span style={{ color: hadAvatar ? '#999' : '#333' }}>{t('profileEdit.uploadAvatar')}</span>
          </List.Item>
          <List.Item
            prefix={hadBirthday ? <CheckCircleFill color={colors.primary} /> : <span style={{ opacity: 0.3 }}>○</span>}
            extra={<span style={{ color: hadBirthday ? '#999' : GOLD }}>+100</span>}
          >
            <span style={{ color: hadBirthday ? '#999' : '#333' }}>{t('profileEdit.registerBirthday')}</span>
          </List.Item>
        </List>
        <div style={{ fontSize: 11, color: '#999', marginTop: 8 }}>
          * {t('profileEdit.bonusNote')}
        </div>
      </Card>

      {/* Save Button */}
      <div style={{ padding: '16px' }}>
        <Button
          block
          color="primary"
          loading={saving}
          onClick={handleSave}
          style={{ '--background-color': colors.primary, borderRadius: 8, height: 44 } as React.CSSProperties}
        >
          {t('profileEdit.saveChanges')}
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
        title={t('profile.birthday')}
      />
    </div>
  );
}
