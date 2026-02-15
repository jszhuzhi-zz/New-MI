import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, Card, Button, Toast, Tag, Grid, ProgressBar, Modal } from 'antd-mobile';
import { GiftOutline, FireFill, CheckCircleFill } from 'antd-mobile-icons';
import { useLocale } from '../../hooks/useLocale';

const PRIMARY = '#00694B';
const GOLD = '#C4A962';

interface CheckInDay {
  day: number;
  date: string;
  reward: number;
  isBonus: boolean;
  isCheckedIn: boolean;
  isFuture: boolean;
}

export default function CheckInPage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const today = new Date();
  const [checkedInDays, setCheckedInDays] = useState<number[]>([1, 2, 3, 4, 5]); // Demo: already checked in 5 days
  const [consecutiveDays, setConsecutiveDays] = useState(5);
  const [totalStamps, setTotalStamps] = useState(75); // Total earned from check-in this month
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [earnedReward, setEarnedReward] = useState(0);

  // Generate calendar for current month
  const calendarDays = useMemo(() => {
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();

    const days: (CheckInDay | null)[] = [];

    // Add empty slots for days before the 1st
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const isWeekend = new Date(year, month, day).getDay() === 0 || new Date(year, month, day).getDay() === 6;
      const isBonus = day === 7 || day === 14 || day === 21 || day === 28; // Weekly bonus days
      const baseReward = isWeekend ? 15 : 10;
      const reward = isBonus ? baseReward * 2 : baseReward;

      days.push({
        day,
        date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        reward,
        isBonus,
        isCheckedIn: checkedInDays.includes(day),
        isFuture: day > today.getDate(),
      });
    }

    return days;
  }, [today, checkedInDays]);

  // Consecutive bonus rewards
  const consecutiveRewards = [
    { days: 7, reward: 50, name: t('customerApp.day7Reward') },
    { days: 14, reward: 100, name: t('customerApp.day14Reward') },
    { days: 21, reward: 200, name: t('customerApp.day21Reward') },
    { days: 30, reward: 500, name: t('customerApp.fullAttendance') },
  ];

  const handleCheckIn = () => {
    const todayDay = today.getDate();
    if (checkedInDays.includes(todayDay)) {
      Toast.show({ content: t('customerApp.alreadyCheckedIn'), icon: 'fail' });
      return;
    }

    const todayData = calendarDays.find((d) => d && d.day === todayDay);
    const reward = todayData?.reward || 10;

    setCheckedInDays([...checkedInDays, todayDay]);
    setConsecutiveDays(consecutiveDays + 1);
    setTotalStamps(totalStamps + reward);
    setEarnedReward(reward);
    setShowRewardModal(true);

    // Check for consecutive day bonus
    const newConsecutive = consecutiveDays + 1;
    const bonus = consecutiveRewards.find((r) => r.days === newConsecutive);
    if (bonus) {
      setTimeout(() => {
        Modal.alert({
          title: `🎉 ${t('customerApp.bonusReward')}`,
          content: t('customerApp.congratsConsecutive', { days: bonus.days, stamps: bonus.reward }),
          confirmText: t('customerApp.awesome'),
        });
        setTotalStamps((prev) => prev + bonus.reward);
      }, 1500);
    }
  };

  const isTodayCheckedIn = checkedInDays.includes(today.getDate());
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const monthProgress = (checkedInDays.length / new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()) * 100;

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: 100 }}>
      <NavBar onBack={() => navigate(-1)} style={{ background: PRIMARY, color: '#fff' }}>
        {t('customerApp.dailyCheckIn')}
      </NavBar>

      {/* Header Stats */}
      <div style={{
        background: `linear-gradient(135deg, ${PRIMARY} 0%, #004D36 100%)`,
        padding: '20px 16px 60px', color: '#fff', position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 32, fontWeight: 700 }}>{consecutiveDays}</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{t('customerApp.consecutiveDays')}</div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.3)' }} />
          <div>
            <div style={{ fontSize: 32, fontWeight: 700 }}>{totalStamps}</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{t('customerApp.monthlyStamps')}</div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.3)' }} />
          <div>
            <div style={{ fontSize: 32, fontWeight: 700 }}>{checkedInDays.length}</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{t('customerApp.monthlyCheckIns')}</div>
          </div>
        </div>
      </div>

      {/* Check-in Button Card */}
      <div style={{ padding: '0 16px', marginTop: -40 }}>
        <Card style={{ borderRadius: 16, textAlign: 'center', padding: '24px 16px' }}>
          <div style={{ marginBottom: 16 }}>
            {isTodayCheckedIn ? (
              <CheckCircleFill fontSize={64} color={PRIMARY} />
            ) : (
              <div style={{
                width: 80, height: 80, borderRadius: 40, background: `${PRIMARY}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto'
              }}>
                <GiftOutline fontSize={40} color={PRIMARY} />
              </div>
            )}
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#333', marginBottom: 8 }}>
            {isTodayCheckedIn ? t('customerApp.checkedInToday') : t('customerApp.canEarnToday')}
          </div>
          {!isTodayCheckedIn && (
            <div style={{ fontSize: 28, fontWeight: 700, color: PRIMARY, marginBottom: 16 }}>
              +{calendarDays.find((d) => d && d.day === today.getDate())?.reward || 10} {t('customerApp.stamps')}
            </div>
          )}
          <Button
            block
            color="primary"
            size="large"
            disabled={isTodayCheckedIn}
            onClick={handleCheckIn}
            style={{
              '--background-color': isTodayCheckedIn ? '#e0e0e0' : PRIMARY,
              '--border-color': isTodayCheckedIn ? '#e0e0e0' : PRIMARY,
              borderRadius: 24,
              fontWeight: 600,
              fontSize: 16,
            } as React.CSSProperties}
          >
            {isTodayCheckedIn ? `✓ ${t('customerApp.checkedIn')}` : t('customerApp.checkInNow')}
          </Button>
        </Card>
      </div>

      {/* Consecutive Rewards Progress */}
      <div style={{ padding: 16 }}>
        <Card style={{ borderRadius: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FireFill fontSize={18} color="#ff6b00" />
            {t('customerApp.checkInRewards')}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            {consecutiveRewards.map((r, i) => (
              <div key={i} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 22, margin: '0 auto 8px',
                  background: consecutiveDays >= r.days ? PRIMARY : '#f0f0f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: consecutiveDays >= r.days ? '#fff' : '#999',
                  fontSize: 12, fontWeight: 600,
                }}>
                  {consecutiveDays >= r.days ? '✓' : r.days}
                </div>
                <div style={{ fontSize: 11, color: consecutiveDays >= r.days ? PRIMARY : '#999' }}>
                  +{r.reward} {t('customerApp.stamps')}
                </div>
              </div>
            ))}
          </div>
          <ProgressBar
            percent={Math.min((consecutiveDays / 30) * 100, 100)}
            style={{ '--fill-color': PRIMARY, '--track-width': '8px' } as React.CSSProperties}
          />
          <div style={{ fontSize: 12, color: '#999', textAlign: 'center', marginTop: 8 }}>
            {t('customerApp.nextRewardIn', { days: Math.max(7 - (consecutiveDays % 7), 0) })}
          </div>
        </Card>
      </div>

      {/* Calendar */}
      <div style={{ padding: '0 16px 16px' }}>
        <Card style={{ borderRadius: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>
            {today.getFullYear()}/{today.getMonth() + 1} {t('customerApp.checkInCalendar')}
          </div>

          {/* Week header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
            {weekDays.map((d, i) => (
              <div key={i} style={{
                textAlign: 'center', fontSize: 12, color: '#999', padding: '4px 0'
              }}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {calendarDays.map((day, i) => (
              <div
                key={i}
                style={{
                  aspectRatio: '1', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  borderRadius: 8, fontSize: 14, position: 'relative',
                  background: day?.isCheckedIn ? `${PRIMARY}15` : day?.isFuture ? '#fafafa' : '#fff',
                  border: day && day.day === today.getDate() ? `2px solid ${PRIMARY}` : '1px solid #f0f0f0',
                  color: day?.isFuture ? '#ccc' : day?.isCheckedIn ? PRIMARY : '#333',
                  fontWeight: day && day.day === today.getDate() ? 700 : 400,
                }}
              >
                {day && (
                  <>
                    <span>{day.day}</span>
                    {day.isCheckedIn && (
                      <CheckCircleFill
                        fontSize={14}
                        color={PRIMARY}
                        style={{ position: 'absolute', top: 2, right: 2 }}
                      />
                    )}
                    {day.isBonus && !day.isCheckedIn && !day.isFuture && (
                      <Tag
                        style={{
                          '--background-color': GOLD,
                          '--text-color': '#fff',
                          fontSize: 8, padding: '0 2px',
                          position: 'absolute', bottom: 2, transform: 'scale(0.8)'
                        } as React.CSSProperties}
                      >
                        2倍
                      </Tag>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, marginTop: 12, justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#999' }}>
              <div style={{ width: 12, height: 12, borderRadius: 6, background: `${PRIMARY}15`, border: `1px solid ${PRIMARY}` }} />
              {t('customerApp.checkedIn')}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#999' }}>
              <Tag style={{ '--background-color': GOLD, '--text-color': '#fff', fontSize: 8, padding: '0 2px' } as React.CSSProperties}>2x</Tag>
              {t('customerApp.doubleStampDay')}
            </div>
          </div>
        </Card>
      </div>

      {/* Rules */}
      <div style={{ padding: '0 16px 16px' }}>
        <Card style={{ borderRadius: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>{t('customerApp.checkInRules')}</div>
          <div style={{ fontSize: 13, color: '#666', lineHeight: 1.8 }}>
            <p style={{ margin: '0 0 8px' }}>1. {t('customerApp.rule1')}</p>
            <p style={{ margin: '0 0 8px' }}>2. {t('customerApp.rule2')}</p>
            <p style={{ margin: '0 0 8px' }}>3. {t('customerApp.rule3')}</p>
            <p style={{ margin: '0 0 8px' }}>4. {t('customerApp.rule4')}</p>
            <p style={{ margin: 0 }}>5. {t('customerApp.rule5')}</p>
          </div>
        </Card>
      </div>

      {/* Reward Modal */}
      <Modal
        visible={showRewardModal}
        title=""
        content={
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#333', marginBottom: 8 }}>{t('customerApp.checkInSuccess')}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: PRIMARY }}>+{earnedReward} {t('customerApp.stamps')}</div>
            <div style={{ fontSize: 14, color: '#999', marginTop: 12 }}>
              {t('customerApp.consecutiveCheckIn')} {consecutiveDays} {t('customerApp.consecutiveDays')}
            </div>
          </div>
        }
        closeOnAction
        onClose={() => setShowRewardModal(false)}
        actions={[
          {
            key: 'confirm',
            text: t('customerApp.awesome'),
            primary: true,
          },
        ]}
      />
    </div>
  );
}
