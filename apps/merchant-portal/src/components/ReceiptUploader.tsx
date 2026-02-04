import React, { useState } from 'react';
import { Upload, Button, Modal, message, Space, Typography } from 'antd';
import {
  CameraOutlined,
  UploadOutlined,
  EyeOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload';
import { useLocale } from '../hooks/useLocale';

const { Text } = Typography;

interface ReceiptUploaderProps {
  value?: string;
  onChange?: (url: string | undefined) => void;
  maxSize?: number; // in MB
}

const labels: Record<string, Record<string, string>> = {
  uploadText: {
    'zh-CN': '上传小票照片',
    'zh-TW': '上傳小票照片',
    en: 'Upload Receipt Photo',
  },
  cameraText: {
    'zh-CN': '拍照上传',
    'zh-TW': '拍照上傳',
    en: 'Take Photo',
  },
  fileText: {
    'zh-CN': '选择文件',
    'zh-TW': '選擇文件',
    en: 'Choose File',
  },
  hint: {
    'zh-CN': '支持 JPG/PNG 格式，文件大小不超过 {size}MB',
    'zh-TW': '支持 JPG/PNG 格式，文件大小不超過 {size}MB',
    en: 'Supports JPG/PNG format, max {size}MB',
  },
  preview: {
    'zh-CN': '小票预览',
    'zh-TW': '小票預覽',
    en: 'Receipt Preview',
  },
  sizeError: {
    'zh-CN': '文件大小不能超过 {size}MB',
    'zh-TW': '文件大小不能超過 {size}MB',
    en: 'File size cannot exceed {size}MB',
  },
  typeError: {
    'zh-CN': '仅支持 JPG/PNG 格式图片',
    'zh-TW': '僅支持 JPG/PNG 格式圖片',
    en: 'Only JPG/PNG images are supported',
  },
  uploadSuccess: {
    'zh-CN': '上传成功',
    'zh-TW': '上傳成功',
    en: 'Upload successful',
  },
};

const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({
  value,
  onChange,
  maxSize = 5,
}) => {
  const { locale } = useLocale();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>(
    value
      ? [
          {
            uid: '-1',
            name: 'receipt.jpg',
            status: 'done',
            url: value,
          },
        ]
      : []
  );

  const getLabel = (key: string) => labels[key]?.[locale] || labels[key]?.en || key;

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    const isValidType = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isValidType) {
      message.error(getLabel('typeError'));
      return false;
    }
    const isValidSize = file.size / 1024 / 1024 < maxSize;
    if (!isValidSize) {
      message.error(getLabel('sizeError').replace('{size}', String(maxSize)));
      return false;
    }
    return true;
  };

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (newFileList.length > 0 && newFileList[0].status === 'done') {
      const url = newFileList[0].response?.url || newFileList[0].url;
      onChange?.(url);
      message.success(getLabel('uploadSuccess'));
    } else if (newFileList.length === 0) {
      onChange?.(undefined);
    }
  };

  const handleRemove = () => {
    setFileList([]);
    onChange?.(undefined);
  };

  // Mock upload to simulate server response
  const customRequest: UploadProps['customRequest'] = (options) => {
    const { onSuccess, file } = options;
    setTimeout(() => {
      const mockUrl = URL.createObjectURL(file as Blob);
      onSuccess?.({ url: mockUrl });
    }, 800);
  };

  return (
    <div>
      <Upload
        listType="picture-card"
        fileList={fileList}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        onRemove={handleRemove}
        customRequest={customRequest}
        maxCount={1}
        accept="image/jpeg,image/png"
        capture="environment"
      >
        {fileList.length === 0 && (
          <div>
            <CameraOutlined style={{ fontSize: 24, color: '#999' }} />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {getLabel('uploadText')}
              </Text>
            </div>
          </div>
        )}
      </Upload>

      {fileList.length === 0 && (
        <Space style={{ marginTop: 8 }}>
          <Upload
            showUploadList={false}
            beforeUpload={beforeUpload}
            customRequest={customRequest}
            onChange={handleChange}
            accept="image/jpeg,image/png"
            capture="environment"
          >
            <Button size="small" icon={<CameraOutlined />}>
              {getLabel('cameraText')}
            </Button>
          </Upload>
          <Upload
            showUploadList={false}
            beforeUpload={beforeUpload}
            customRequest={customRequest}
            onChange={handleChange}
            accept="image/jpeg,image/png"
          >
            <Button size="small" icon={<UploadOutlined />}>
              {getLabel('fileText')}
            </Button>
          </Upload>
        </Space>
      )}

      <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 4 }}>
        {getLabel('hint').replace('{size}', String(maxSize))}
      </Text>

      {fileList.length > 0 && fileList[0].url && (
        <Space style={{ marginTop: 8 }}>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setPreviewOpen(true)}
          />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={handleRemove}
          />
        </Space>
      )}

      <Modal
        open={previewOpen}
        title={getLabel('preview')}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        {fileList[0]?.url && (
          <img
            alt="receipt"
            style={{ width: '100%' }}
            src={fileList[0].url}
          />
        )}
      </Modal>
    </div>
  );
};

export default ReceiptUploader;
