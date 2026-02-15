import { MallInfo, Merchant } from '../store/auth';

// Link REIT 旗下商场数据
export const malls: MallInfo[] = [
  {
    id: 'fw',
    name: 'Festival Walk',
    nameTW: '又一城',
    nameEN: 'Festival Walk',
    address: '九龍塘達之路80號',
    addressEN: '80 Tat Chee Avenue, Kowloon Tong',
    region: '九龍',
    floors: ['MTR', 'G', 'UG', 'L1', 'L2', 'LG1', 'LG2'],
  },
  {
    id: 'hp',
    name: 'Hollywood Plaza',
    nameTW: '荷里活廣場',
    nameEN: 'Hollywood Plaza',
    address: '九龍鑽石山龍蟠街3號',
    addressEN: '3 Lung Poon Street, Diamond Hill',
    region: '九龍',
    floors: ['G', 'L1', 'L2', 'L3'],
  },
  {
    id: 'tp',
    name: 'Tai Po Plaza',
    nameTW: '大埔超級城',
    nameEN: 'Tai Po Plaza',
    address: '新界大埔超級城',
    addressEN: 'Tai Po Market, New Territories',
    region: '新界',
    floors: ['G', 'L1', 'L2', 'L3'],
  },
  {
    id: 'dc',
    name: 'Dragon Centre',
    nameTW: '西九龍中心',
    nameEN: 'Dragon Centre',
    address: '九龍深水埗欽州街37K號',
    addressEN: '37K Yen Chow Street, Sham Shui Po',
    region: '九龍',
    floors: ['G', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9'],
  },
  {
    id: 'tml',
    name: 'Tuen Mun Town Plaza',
    nameTW: '屯門市廣場',
    nameEN: 'Tuen Mun Town Plaza',
    address: '新界屯門屯順街1號',
    addressEN: '1 Tuen Shun Street, Tuen Mun',
    region: '新界',
    floors: ['G', 'L1', 'L2', 'L3', 'L4', 'L5'],
  },
  {
    id: 'kgp',
    name: 'Kai Tin Shopping Centre',
    nameTW: '啟田商場',
    nameEN: 'Kai Tin Shopping Centre',
    address: '九龍藍田啟田道51號',
    addressEN: '51 Kai Tin Road, Lam Tin',
    region: '九龍',
    floors: ['G', 'L1', 'L2'],
  },
];

// 商户分类
export const categories = [
  { key: 'all', label: '全部', labelEN: 'All' },
  { key: '時裝', label: '時裝', labelEN: 'Fashion' },
  { key: '美妝', label: '美妝護膚', labelEN: 'Beauty' },
  { key: '珠寶', label: '珠寶鐘錶', labelEN: 'Jewelry' },
  { key: '鞋履', label: '鞋履配件', labelEN: 'Footwear' },
  { key: '運動', label: '運動戶外', labelEN: 'Sports' },
  { key: '餐飲', label: '餐飲美食', labelEN: 'F&B' },
  { key: '家品', label: '家品生活', labelEN: 'Home' },
  { key: '服務', label: '服務', labelEN: 'Services' },
];

// 所有商户数据（按商场分组）
export const merchants: Merchant[] = [
  // ========== Festival Walk (又一城) ==========
  // Fashion & Beauty - LG1
  { id: 'fw-abercrombie', mallId: 'fw', name: 'Abercrombie & Fitch', floor: 'LG1', unit: 'LG1-01', category: '時裝', subCategory: 'Fashion & Beauty', stampMultiplier: 1, tags: ['時裝', '休閒'] },
  { id: 'fw-agnesb', mallId: 'fw', name: 'agnès b.', floor: 'LG1', unit: 'LG1-05', category: '時裝', subCategory: 'Ladies Fashion', stampMultiplier: 1, tags: ['時裝', '法國品牌'] },
  { id: 'fw-birkenstock', mallId: 'fw', name: 'BIRKENSTOCK', floor: 'LG1', unit: 'LG1-08', category: '鞋履', subCategory: 'Footwear', stampMultiplier: 1, tags: ['鞋履', '德國品牌'] },
  { id: 'fw-charleskeith', mallId: 'fw', name: 'CHARLES & KEITH', floor: 'LG1', unit: 'LG1-12', category: '鞋履', subCategory: 'Accessories & Footwear', stampMultiplier: 1, tags: ['鞋履', '手袋'] },
  { id: 'fw-clubmonaco', mallId: 'fw', name: 'CLUB MONACO', floor: 'LG1', unit: 'LG1-15', category: '時裝', subCategory: 'Casual Chic', stampMultiplier: 1, tags: ['時裝', '休閒'] },
  { id: 'fw-colehaan', mallId: 'fw', name: 'Cole Haan', floor: 'LG1', unit: 'LG1-18', category: '鞋履', subCategory: 'Accessories & Footwear', stampMultiplier: 1, tags: ['鞋履', '美國品牌'] },
  { id: 'fw-descente', mallId: 'fw', name: 'DESCENTE', floor: 'LG1', unit: 'LG1-22', category: '運動', subCategory: 'Sports Apparel', stampMultiplier: 1.5, tags: ['運動', '日本品牌', '印花1.5倍'] },
  { id: 'fw-casetify', mallId: 'fw', name: 'CASETiFY STUDIO', floor: 'LG1', unit: 'LG1-30', category: '配件', subCategory: 'Smart Living', stampMultiplier: 1, tags: ['手機殼', '配件'] },
  { id: 'fw-apple', mallId: 'fw', name: 'Apple Festival Walk', floor: 'LG1', unit: 'LG1-40', category: '電子', subCategory: 'Major Store', stampMultiplier: 1, tags: ['Apple', '電子產品', '旗艦店'], hours: '10:00-22:00', phone: '2972 1500' },

  // Fashion & Beauty - LG2
  { id: 'fw-boss', mallId: 'fw', name: 'BOSS', floor: 'LG2', unit: 'LG2-01', category: '時裝', subCategory: 'Men\'s Wear', stampMultiplier: 1, tags: ['男裝', '德國品牌'] },
  { id: 'fw-chowsangsang', mallId: 'fw', name: 'Chow Sang Sang', nameTW: '周生生', floor: 'LG2', unit: 'LG2-12', category: '珠寶', subCategory: 'Jewellery & Timepieces', stampMultiplier: 1, tags: ['珠寶', '金飾'] },
  { id: 'fw-chowtaifook', mallId: 'fw', name: 'CHOW TAI FOOK', nameTW: '周大福', floor: 'LG2', unit: 'LG2-15', category: '珠寶', subCategory: 'Jewellery & Timepieces', stampMultiplier: 1, tags: ['珠寶', '金飾'] },
  { id: 'fw-gucci', mallId: 'fw', name: 'GUCCI Timepieces & Jewelry', floor: 'LG2', unit: 'LG2-18', category: '珠寶', subCategory: 'Jewellery & Timepieces', stampMultiplier: 1, tags: ['鐘錶', '珠寶', '奢華品牌'] },
  { id: 'fw-eslite', mallId: 'fw', name: 'eslite spectrum', nameTW: '誠品生活', floor: 'LG2', unit: 'LG2-30', category: '書店', subCategory: 'Books & Gifts', stampMultiplier: 1, tags: ['書店', '文創', '生活風格'], hours: '10:00-22:00' },

  // Health & Beauty - G
  { id: 'fw-chanelbeaute', mallId: 'fw', name: 'CHANEL BEAUTÉ', floor: 'G', unit: 'G-01', category: '美妝', subCategory: 'Health & Beauty', stampMultiplier: 1, tags: ['美妝', '奢華品牌'] },
  { id: 'fw-diorbeauty', mallId: 'fw', name: 'Dior Beauty', floor: 'G', unit: 'G-10', category: '美妝', subCategory: 'Health & Beauty', stampMultiplier: 1, tags: ['美妝', '奢華品牌'] },
  { id: 'fw-starbucks', mallId: 'fw', name: 'Starbucks', nameTW: '星巴克', floor: 'G', unit: 'G-G12', category: '餐飲', subCategory: 'Food & Beverage', stampMultiplier: 1, tags: ['咖啡', '輕食'], hours: '07:30-22:30', phone: '2265 8328' },
  { id: 'fw-7eleven', mallId: 'fw', name: '7-Eleven', floor: 'G', unit: 'G-20', category: '便利店', subCategory: 'Home & Leisure', stampMultiplier: 0.5, tags: ['便利店'] },

  // Health & Beauty - UG
  { id: 'fw-aesop', mallId: 'fw', name: 'Aēsop', floor: 'UG', unit: 'UG-01', category: '護膚', subCategory: 'Health & Beauty', stampMultiplier: 1, tags: ['護膚', '澳洲品牌'] },
  { id: 'fw-bathandbodyworks', mallId: 'fw', name: 'Bath & Body Works', floor: 'UG', unit: 'UG-10', category: '身體護理', subCategory: 'Health & Beauty', stampMultiplier: 1, tags: ['身體護理', '香氛'] },
  { id: 'fw-francfranc', mallId: 'fw', name: 'Francfranc', floor: 'UG', unit: 'UG-25', category: '家品', subCategory: 'Home & Leisure', stampMultiplier: 1, tags: ['家品', '日本品牌'] },
  { id: 'fw-cinema', mallId: 'fw', name: 'Festival Grand Cinema', nameTW: '又一城Grand戲院', floor: 'UG', unit: 'UG-50', category: '娛樂', subCategory: 'Entertainment', stampMultiplier: 0.5, tags: ['電影院', '娛樂'], hours: '11:00-00:00' },
  { id: 'fw-pizzaexpress', mallId: 'fw', name: 'PizzaExpress', floor: 'UG', unit: 'UG-R05', category: '餐飲', subCategory: 'Food & Beverage', stampMultiplier: 1, tags: ['意式', 'Pizza'], hours: '11:30-22:30' },

  // Fashion - L1
  { id: 'fw-uniqlo', mallId: 'fw', name: 'UNIQLO', floor: 'L1', unit: 'L1-30', category: '時裝', subCategory: 'Fashion & Beauty', stampMultiplier: 1, tags: ['時裝', '日本品牌', '基本款'], hours: '10:00-22:00' },
  { id: 'fw-g2000', mallId: 'fw', name: 'G2000', floor: 'L1', unit: 'L1-10', category: '時裝', subCategory: 'Fashion & Beauty', stampMultiplier: 1, tags: ['正裝', '香港品牌'] },
  { id: 'fw-giordano', mallId: 'fw', name: 'Giordano', floor: 'L1', unit: 'L1-12', category: '時裝', subCategory: 'Fashion & Beauty', stampMultiplier: 1, tags: ['休閒', '香港品牌'] },
  { id: 'fw-gigasports', mallId: 'fw', name: 'GigaSports', floor: 'L1', unit: 'L1-20', category: '運動', subCategory: 'Sports Apparel', stampMultiplier: 1, tags: ['運動', '運動用品'] },
  { id: 'fw-pacificcoffee', mallId: 'fw', name: 'Pacific Coffee', nameTW: '太平洋咖啡', floor: 'L1', unit: 'L1-102', category: '餐飲', subCategory: 'Food & Beverage', stampMultiplier: 1, tags: ['咖啡', '輕食'], hours: '07:30-22:00' },
  { id: 'fw-genkisushi', mallId: 'fw', name: 'Genki Sushi', nameTW: '元氣壽司', floor: 'L1', unit: 'L1-108', category: '餐飲', subCategory: 'Food & Beverage', stampMultiplier: 1, tags: ['日式', '壽司'], hours: '11:00-22:00' },

  // Fashion & Sports - L2
  { id: 'fw-columbia', mallId: 'fw', name: 'Columbia Sportswear', floor: 'L2', unit: 'L2-01', category: '運動', subCategory: 'Sports Apparel', stampMultiplier: 1, tags: ['戶外', '美國品牌'] },
  { id: 'fw-ecco', mallId: 'fw', name: 'ECCO', floor: 'L2', unit: 'L2-08', category: '鞋履', subCategory: 'Footwear', stampMultiplier: 1, tags: ['鞋履', '丹麥品牌'] },
  { id: 'fw-drkong', mallId: 'fw', name: 'Dr. Kong', nameTW: '護足博士', floor: 'L2', unit: 'L2-12', category: '鞋履', subCategory: 'Footwear', stampMultiplier: 1, tags: ['鞋履', '健康', '香港品牌'] },
  { id: 'fw-tamjai', mallId: 'fw', name: 'TamJai Yunnan Mixian', nameTW: '譚仔雲南米線', floor: 'L2', unit: 'L2-R12', category: '餐飲', subCategory: 'Food & Beverage', stampMultiplier: 1, tags: ['中式', '米線', '香港品牌'], hours: '11:00-22:30' },

  // MTR Level
  { id: 'fw-fortress', mallId: 'fw', name: 'Fortress', nameTW: '豐澤', floor: 'MTR', unit: 'MTR-01', category: '電器', subCategory: 'Home & Leisure', stampMultiplier: 1, tags: ['電器', '電子產品'], hours: '10:00-22:00' },

  // ========== Hollywood Plaza (荷里活廣場) ==========
  { id: 'hp-uniqlo', mallId: 'hp', name: 'UNIQLO', floor: 'L2', unit: 'L2-01', category: '時裝', subCategory: 'Fashion', stampMultiplier: 1, tags: ['時裝', '日本品牌'], hours: '10:00-22:00' },
  { id: 'hp-h&m', mallId: 'hp', name: 'H&M', floor: 'L2', unit: 'L2-10', category: '時裝', subCategory: 'Fashion', stampMultiplier: 1, tags: ['時裝', '快時尚'], hours: '10:00-22:00' },
  { id: 'hp-adidas', mallId: 'hp', name: 'adidas', floor: 'L1', unit: 'L1-05', category: '運動', subCategory: 'Sports', stampMultiplier: 1, tags: ['運動', '德國品牌'] },
  { id: 'hp-nike', mallId: 'hp', name: 'Nike', floor: 'L1', unit: 'L1-08', category: '運動', subCategory: 'Sports', stampMultiplier: 1, tags: ['運動', '美國品牌'] },
  { id: 'hp-watsons', mallId: 'hp', name: 'Watsons', nameTW: '屈臣氏', floor: 'G', unit: 'G-01', category: '美妝', subCategory: 'Health & Beauty', stampMultiplier: 1, tags: ['美妝', '藥房'] },
  { id: 'hp-mannings', mallId: 'hp', name: 'Mannings', nameTW: '萬寧', floor: 'G', unit: 'G-05', category: '美妝', subCategory: 'Health & Beauty', stampMultiplier: 1, tags: ['美妝', '藥房'] },
  { id: 'hp-starbucks', mallId: 'hp', name: 'Starbucks', nameTW: '星巴克', floor: 'G', unit: 'G-10', category: '餐飲', subCategory: 'F&B', stampMultiplier: 1, tags: ['咖啡'], hours: '07:30-22:00' },
  { id: 'hp-mcdonalds', mallId: 'hp', name: "McDonald's", nameTW: '麥當勞', floor: 'G', unit: 'G-15', category: '餐飲', subCategory: 'F&B', stampMultiplier: 0.5, tags: ['快餐'], hours: '06:00-00:00' },
  { id: 'hp-cinema', mallId: 'hp', name: 'Emperor Cinemas', nameTW: '英皇戲院', floor: 'L3', unit: 'L3-01', category: '娛樂', subCategory: 'Entertainment', stampMultiplier: 0.5, tags: ['電影院', '娛樂'], hours: '10:00-00:00' },
  { id: 'hp-fairwood', mallId: 'hp', name: 'Fairwood', nameTW: '大快活', floor: 'L1', unit: 'L1-20', category: '餐飲', subCategory: 'F&B', stampMultiplier: 1, tags: ['港式', '快餐'], hours: '07:00-23:00' },
  { id: 'hp-sukiya', mallId: 'hp', name: 'Sukiya', nameTW: '食其家', floor: 'L1', unit: 'L1-25', category: '餐飲', subCategory: 'F&B', stampMultiplier: 1, tags: ['日式', '牛丼'], hours: '11:00-22:00' },
  { id: 'hp-fortress', mallId: 'hp', name: 'Fortress', nameTW: '豐澤', floor: 'L2', unit: 'L2-15', category: '電器', subCategory: 'Electronics', stampMultiplier: 1, tags: ['電器'], hours: '10:00-22:00' },

  // ========== Tai Po Plaza (大埔超級城) ==========
  { id: 'tp-aeon', mallId: 'tp', name: 'AEON', nameTW: '永旺', floor: 'L1', unit: 'L1-01', category: '超市', subCategory: 'Supermarket', stampMultiplier: 0.5, tags: ['超市', '日本品牌'], hours: '09:00-22:30' },
  { id: 'tp-uniqlo', mallId: 'tp', name: 'UNIQLO', floor: 'L2', unit: 'L2-05', category: '時裝', subCategory: 'Fashion', stampMultiplier: 1, tags: ['時裝', '日本品牌'], hours: '10:00-22:00' },
  { id: 'tp-giordano', mallId: 'tp', name: 'Giordano', floor: 'L1', unit: 'L1-10', category: '時裝', subCategory: 'Fashion', stampMultiplier: 1, tags: ['休閒', '香港品牌'] },
  { id: 'tp-bossini', mallId: 'tp', name: 'Bossini', floor: 'L1', unit: 'L1-12', category: '時裝', subCategory: 'Fashion', stampMultiplier: 1, tags: ['休閒', '香港品牌'] },
  { id: 'tp-watsons', mallId: 'tp', name: 'Watsons', nameTW: '屈臣氏', floor: 'G', unit: 'G-08', category: '美妝', subCategory: 'Health & Beauty', stampMultiplier: 1, tags: ['美妝', '藥房'] },
  { id: 'tp-parknshop', mallId: 'tp', name: "PARKnSHOP", nameTW: '百佳', floor: 'G', unit: 'G-01', category: '超市', subCategory: 'Supermarket', stampMultiplier: 0.5, tags: ['超市'] },
  { id: 'tp-starbucks', mallId: 'tp', name: 'Starbucks', nameTW: '星巴克', floor: 'L1', unit: 'L1-15', category: '餐飲', subCategory: 'F&B', stampMultiplier: 1, tags: ['咖啡'], hours: '07:30-22:00' },
  { id: 'tp-maxim', mallId: 'tp', name: "Maxim's MX", nameTW: '美心MX', floor: 'L2', unit: 'L2-10', category: '餐飲', subCategory: 'F&B', stampMultiplier: 1, tags: ['港式', '快餐'], hours: '07:00-22:00' },
  { id: 'tp-cinema', mallId: 'tp', name: 'UA Tai Po', nameTW: 'UA大埔', floor: 'L3', unit: 'L3-01', category: '娛樂', subCategory: 'Entertainment', stampMultiplier: 0.5, tags: ['電影院'], hours: '10:00-00:00' },
  { id: 'tp-chowsangsang', mallId: 'tp', name: 'Chow Sang Sang', nameTW: '周生生', floor: 'G', unit: 'G-15', category: '珠寶', subCategory: 'Jewelry', stampMultiplier: 1, tags: ['珠寶', '金飾'] },

  // ========== Dragon Centre (西九龍中心) ==========
  { id: 'dc-nike', mallId: 'dc', name: 'Nike', floor: 'L2', unit: 'L2-01', category: '運動', subCategory: 'Sports', stampMultiplier: 1, tags: ['運動', '美國品牌'] },
  { id: 'dc-adidas', mallId: 'dc', name: 'adidas', floor: 'L2', unit: 'L2-05', category: '運動', subCategory: 'Sports', stampMultiplier: 1, tags: ['運動', '德國品牌'] },
  { id: 'dc-newbalance', mallId: 'dc', name: 'New Balance', floor: 'L2', unit: 'L2-10', category: '運動', subCategory: 'Sports', stampMultiplier: 1, tags: ['運動', '美國品牌'] },
  { id: 'dc-jordan', mallId: 'dc', name: 'Jordan', floor: 'L3', unit: 'L3-01', category: '運動', subCategory: 'Sports', stampMultiplier: 1.5, tags: ['運動', '籃球', '印花1.5倍'] },
  { id: 'dc-uniqlo', mallId: 'dc', name: 'UNIQLO', floor: 'L1', unit: 'L1-01', category: '時裝', subCategory: 'Fashion', stampMultiplier: 1, tags: ['時裝', '日本品牌'], hours: '10:00-22:00' },
  { id: 'dc-h&m', mallId: 'dc', name: 'H&M', floor: 'L1', unit: 'L1-10', category: '時裝', subCategory: 'Fashion', stampMultiplier: 1, tags: ['時裝', '快時尚'] },
  { id: 'dc-apple', mallId: 'dc', name: 'Apple Premium Reseller', floor: 'L4', unit: 'L4-01', category: '電子', subCategory: 'Electronics', stampMultiplier: 1, tags: ['Apple', '電子產品'] },
  { id: 'dc-jollibee', mallId: 'dc', name: 'Jollibee', floor: 'G', unit: 'G-01', category: '餐飲', subCategory: 'F&B', stampMultiplier: 1, tags: ['快餐', '菲律賓'] },
  { id: 'dc-yoshinoya', mallId: 'dc', name: 'Yoshinoya', nameTW: '吉野家', floor: 'G', unit: 'G-10', category: '餐飲', subCategory: 'F&B', stampMultiplier: 1, tags: ['日式', '牛丼'] },
  { id: 'dc-icerink', mallId: 'dc', name: 'Ice Rink', nameTW: '溜冰場', floor: 'L9', unit: 'L9-01', category: '娛樂', subCategory: 'Entertainment', stampMultiplier: 0.5, tags: ['溜冰', '娛樂'] },
  { id: 'dc-arcade', mallId: 'dc', name: 'Timezone', floor: 'L7', unit: 'L7-01', category: '娛樂', subCategory: 'Entertainment', stampMultiplier: 0.5, tags: ['遊戲機', '娛樂'] },

  // ========== Tuen Mun Town Plaza (屯門市廣場) ==========
  { id: 'tml-uniqlo', mallId: 'tml', name: 'UNIQLO', floor: 'L2', unit: 'L2-01', category: '時裝', subCategory: 'Fashion', stampMultiplier: 1, tags: ['時裝', '日本品牌'], hours: '10:00-22:00' },
  { id: 'tml-zara', mallId: 'tml', name: 'ZARA', floor: 'L2', unit: 'L2-10', category: '時裝', subCategory: 'Fashion', stampMultiplier: 1, tags: ['時裝', '西班牙品牌'] },
  { id: 'tml-h&m', mallId: 'tml', name: 'H&M', floor: 'L1', unit: 'L1-01', category: '時裝', subCategory: 'Fashion', stampMultiplier: 1, tags: ['時裝', '快時尚'] },
  { id: 'tml-aeon', mallId: 'tml', name: 'AEON', nameTW: '永旺', floor: 'G', unit: 'G-01', category: '超市', subCategory: 'Supermarket', stampMultiplier: 0.5, tags: ['超市', '日本品牌'], hours: '09:00-22:30' },
  { id: 'tml-watsons', mallId: 'tml', name: 'Watsons', nameTW: '屈臣氏', floor: 'L1', unit: 'L1-15', category: '美妝', subCategory: 'Health & Beauty', stampMultiplier: 1, tags: ['美妝', '藥房'] },
  { id: 'tml-sasa', mallId: 'tml', name: 'SaSa', nameTW: '莎莎', floor: 'L1', unit: 'L1-20', category: '美妝', subCategory: 'Health & Beauty', stampMultiplier: 1, tags: ['美妝', '化妝品'] },
  { id: 'tml-fortress', mallId: 'tml', name: 'Fortress', nameTW: '豐澤', floor: 'L3', unit: 'L3-01', category: '電器', subCategory: 'Electronics', stampMultiplier: 1, tags: ['電器'] },
  { id: 'tml-broadway', mallId: 'tml', name: 'Broadway', nameTW: '百老匯', floor: 'L3', unit: 'L3-10', category: '電器', subCategory: 'Electronics', stampMultiplier: 1, tags: ['電器'] },
  { id: 'tml-cinema', mallId: 'tml', name: 'The Grand Cinema', nameTW: '嘉禾大影城', floor: 'L5', unit: 'L5-01', category: '娛樂', subCategory: 'Entertainment', stampMultiplier: 0.5, tags: ['電影院'], hours: '10:00-00:00' },
  { id: 'tml-starbucks', mallId: 'tml', name: 'Starbucks', nameTW: '星巴克', floor: 'G', unit: 'G-20', category: '餐飲', subCategory: 'F&B', stampMultiplier: 1, tags: ['咖啡'], hours: '07:30-22:00' },
  { id: 'tml-chowtaifook', mallId: 'tml', name: 'CHOW TAI FOOK', nameTW: '周大福', floor: 'L1', unit: 'L1-25', category: '珠寶', subCategory: 'Jewelry', stampMultiplier: 1, tags: ['珠寶', '金飾'] },

  // ========== Kai Tin Shopping Centre (啟田商場) ==========
  { id: 'kgp-wellcome', mallId: 'kgp', name: 'Wellcome', nameTW: '惠康', floor: 'G', unit: 'G-01', category: '超市', subCategory: 'Supermarket', stampMultiplier: 0.5, tags: ['超市'] },
  { id: 'kgp-watsons', mallId: 'kgp', name: 'Watsons', nameTW: '屈臣氏', floor: 'G', unit: 'G-05', category: '美妝', subCategory: 'Health & Beauty', stampMultiplier: 1, tags: ['美妝', '藥房'] },
  { id: 'kgp-mannings', mallId: 'kgp', name: 'Mannings', nameTW: '萬寧', floor: 'G', unit: 'G-08', category: '美妝', subCategory: 'Health & Beauty', stampMultiplier: 1, tags: ['美妝', '藥房'] },
  { id: 'kgp-bossini', mallId: 'kgp', name: 'Bossini', floor: 'L1', unit: 'L1-01', category: '時裝', subCategory: 'Fashion', stampMultiplier: 1, tags: ['休閒', '香港品牌'] },
  { id: 'kgp-cafe', mallId: 'kgp', name: 'Café de Coral', nameTW: '大家樂', floor: 'L1', unit: 'L1-05', category: '餐飲', subCategory: 'F&B', stampMultiplier: 1, tags: ['港式', '快餐'], hours: '07:00-22:00' },
  { id: 'kgp-fairwood', mallId: 'kgp', name: 'Fairwood', nameTW: '大快活', floor: 'L1', unit: 'L1-10', category: '餐飲', subCategory: 'F&B', stampMultiplier: 1, tags: ['港式', '快餐'], hours: '07:00-23:00' },
  { id: 'kgp-7eleven', mallId: 'kgp', name: '7-Eleven', floor: 'G', unit: 'G-15', category: '便利店', subCategory: 'Convenience', stampMultiplier: 0.5, tags: ['便利店'] },
  { id: 'kgp-bankofchina', mallId: 'kgp', name: 'Bank of China', nameTW: '中國銀行', floor: 'G', unit: 'G-20', category: '服務', subCategory: 'Services', stampMultiplier: 0, tags: ['銀行'] },
];

// 根据商场ID获取商户
export const getMerchantsByMall = (mallId: string): Merchant[] => {
  return merchants.filter((m) => m.mallId === mallId);
};

// 根据ID获取商场
export const getMallById = (mallId: string): MallInfo | undefined => {
  return malls.find((m) => m.id === mallId);
};

// 搜索商户（支持名称、分类、标签）
export const searchMerchants = (
  mallId: string,
  keyword: string,
  floor?: string,
  category?: string
): Merchant[] => {
  const mallMerchants = getMerchantsByMall(mallId);

  return mallMerchants.filter((m) => {
    const matchFloor = !floor || floor === 'all' || m.floor === floor;
    const matchCategory = !category || category === 'all' ||
      m.category === category ||
      m.category.includes(category) ||
      m.subCategory.toLowerCase().includes(category.toLowerCase());
    const matchSearch = !keyword ||
      m.name.toLowerCase().includes(keyword.toLowerCase()) ||
      (m.nameTW && m.nameTW.includes(keyword)) ||
      m.tags.some((t) => t.includes(keyword));

    return matchFloor && matchCategory && matchSearch;
  });
};
