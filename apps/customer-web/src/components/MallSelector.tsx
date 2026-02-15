import React, { useState } from 'react';
import { Popup, List, SearchBar, Tag } from 'antd-mobile';
import { DownOutline, LocationFill } from 'antd-mobile-icons';
import { useAuthStore } from '../store/auth';
import { malls } from '../data/malls';

const PRIMARY = '#00694B';

interface MallSelectorProps {
  style?: React.CSSProperties;
  showLabel?: boolean;
}

export default function MallSelector({ style, showLabel = true }: MallSelectorProps) {
  const [visible, setVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const { currentMallId, setCurrentMall } = useAuthStore();

  const currentMall = malls.find((m) => m.id === currentMallId) || malls[0];

  const filteredMalls = malls.filter((m) => {
    if (!searchText) return true;
    return (
      m.name.toLowerCase().includes(searchText.toLowerCase()) ||
      m.nameTW.includes(searchText) ||
      m.region.includes(searchText) ||
      m.address.includes(searchText)
    );
  });

  // 按地区分组
  const mallsByRegion = filteredMalls.reduce((acc, mall) => {
    if (!acc[mall.region]) acc[mall.region] = [];
    acc[mall.region].push(mall);
    return acc;
  }, {} as Record<string, typeof malls>);

  const handleSelect = (mallId: string) => {
    setCurrentMall(mallId);
    setVisible(false);
    setSearchText('');
  };

  return (
    <>
      <div
        onClick={() => setVisible(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          cursor: 'pointer',
          padding: '6px 12px',
          background: 'rgba(255,255,255,0.15)',
          borderRadius: 20,
          ...style,
        }}
      >
        <LocationFill fontSize={14} />
        <span style={{ fontSize: 14, fontWeight: 500, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {currentMall.nameTW}
        </span>
        <DownOutline fontSize={12} />
      </div>

      <Popup
        visible={visible}
        onMaskClick={() => {
          setVisible(false);
          setSearchText('');
        }}
        position="bottom"
        bodyStyle={{
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: '80vh',
          overflow: 'auto',
        }}
      >
        <div style={{ padding: '16px 16px 8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 18, fontWeight: 600, color: '#333' }}>選擇商場</span>
            <span
              onClick={() => {
                setVisible(false);
                setSearchText('');
              }}
              style={{ color: PRIMARY, fontSize: 14, cursor: 'pointer' }}
            >
              關閉
            </span>
          </div>

          <SearchBar
            placeholder="搜尋商場名稱或地區"
            value={searchText}
            onChange={setSearchText}
            style={{ '--background': '#f5f5f5', '--border-radius': '20px', marginBottom: 12 } as React.CSSProperties}
          />

          {Object.entries(mallsByRegion).map(([region, regionMalls]) => (
            <div key={region} style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: 13,
                color: '#999',
                padding: '8px 0',
                borderBottom: '1px solid #f0f0f0',
                marginBottom: 8,
              }}>
                {region}
              </div>
              <List style={{ '--border-top': 'none', '--border-bottom': 'none' }}>
                {regionMalls.map((mall) => (
                  <List.Item
                    key={mall.id}
                    onClick={() => handleSelect(mall.id)}
                    arrow={false}
                    style={{
                      background: mall.id === currentMallId ? `${PRIMARY}10` : 'transparent',
                      borderRadius: 8,
                      marginBottom: 4,
                    }}
                    extra={
                      mall.id === currentMallId ? (
                        <Tag color="success" style={{ fontSize: 11 }}>當前</Tag>
                      ) : null
                    }
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <div style={{
                        fontSize: 15,
                        fontWeight: mall.id === currentMallId ? 600 : 400,
                        color: mall.id === currentMallId ? PRIMARY : '#333',
                      }}>
                        {mall.nameTW}
                      </div>
                      <div style={{ fontSize: 12, color: '#999' }}>
                        {mall.nameEN} · {mall.floors.length}層
                      </div>
                      <div style={{ fontSize: 11, color: '#bbb', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <LocationFill fontSize={10} />
                        {mall.address}
                      </div>
                    </div>
                  </List.Item>
                ))}
              </List>
            </div>
          ))}

          {filteredMalls.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
              未找到符合條件的商場
            </div>
          )}
        </div>
      </Popup>
    </>
  );
}
