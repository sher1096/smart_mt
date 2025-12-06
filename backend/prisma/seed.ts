import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化数据...');

  // 1. 创建默认管理员
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      name: '超级管理员',
      phone: '13800138000',
      email: 'admin@hospital.com',
      status: 1,
    },
  });
  console.log('创建管理员:', admin.username);

  // 2. 创建科室分类
  const categories = [
    { name: '内科', sort: 1 },
    { name: '外科', sort: 2 },
    { name: '妇产科', sort: 3 },
    { name: '儿科', sort: 4 },
    { name: '五官科', sort: 5 },
    { name: '中医科', sort: 6 },
    { name: '医技科', sort: 7 },
  ];

  for (const cat of categories) {
    await prisma.departmentCategory.upsert({
      where: { id: categories.indexOf(cat) + 1 },
      update: cat,
      create: cat,
    });
  }
  console.log('创建科室分类:', categories.length);

  // 3. 创建科室
  const departments = [
    { categoryId: 1, name: '心内科', description: '心血管内科疾病诊治', location: '门诊楼2层', phone: '0571-88888001', sort: 1 },
    { categoryId: 1, name: '呼吸内科', description: '呼吸系统疾病诊治', location: '门诊楼2层', phone: '0571-88888002', sort: 2 },
    { categoryId: 1, name: '消化内科', description: '消化系统疾病诊治', location: '门诊楼3层', phone: '0571-88888003', sort: 3 },
    { categoryId: 1, name: '神经内科', description: '神经系统疾病诊治', location: '门诊楼3层', phone: '0571-88888004', sort: 4 },
    { categoryId: 2, name: '普外科', description: '普通外科手术', location: '门诊楼4层', phone: '0571-88888005', sort: 1 },
    { categoryId: 2, name: '骨科', description: '骨骼、关节疾病诊治', location: '门诊楼4层', phone: '0571-88888006', sort: 2 },
    { categoryId: 2, name: '泌尿外科', description: '泌尿系统疾病诊治', location: '门诊楼5层', phone: '0571-88888007', sort: 3 },
    { categoryId: 3, name: '妇科', description: '妇科疾病诊治', location: '门诊楼6层', phone: '0571-88888008', sort: 1 },
    { categoryId: 3, name: '产科', description: '产前检查、分娩', location: '门诊楼6层', phone: '0571-88888009', sort: 2 },
    { categoryId: 4, name: '小儿内科', description: '儿童内科疾病诊治', location: '门诊楼7层', phone: '0571-88888010', sort: 1 },
    { categoryId: 5, name: '眼科', description: '眼部疾病诊治', location: '门诊楼8层', phone: '0571-88888011', sort: 1 },
    { categoryId: 5, name: '耳鼻喉科', description: '耳鼻喉疾病诊治', location: '门诊楼8层', phone: '0571-88888012', sort: 2 },
    { categoryId: 5, name: '口腔科', description: '口腔疾病诊治', location: '门诊楼8层', phone: '0571-88888013', sort: 3 },
    { categoryId: 6, name: '中医内科', description: '中医内科诊疗', location: '门诊楼9层', phone: '0571-88888014', sort: 1 },
    { categoryId: 7, name: '检验科', description: '医学检验', location: '医技楼1层', phone: '0571-88888015', sort: 1 },
    { categoryId: 7, name: '影像科', description: 'CT、MRI、X光检查', location: '医技楼2层', phone: '0571-88888016', sort: 2 },
  ];

  for (let i = 0; i < departments.length; i++) {
    await prisma.department.upsert({
      where: { id: i + 1 },
      update: departments[i],
      create: { ...departments[i], status: 1 },
    });
  }
  console.log('创建科室:', departments.length);

  // 4. 创建医生
  const doctorPassword = await bcrypt.hash('doctor123', 10);
  const doctors = [
    { departmentId: 1, name: '张明', username: 'doctor_zhangming', title: '主任医师', specialty: '冠心病、高血压', introduction: '从医30年，擅长心血管疾病诊治', phone: '13900001001' },
    { departmentId: 1, name: '李华', username: 'doctor_lihua', title: '副主任医师', specialty: '心律失常、心力衰竭', introduction: '从医20年，专注心脏电生理', phone: '13900001002' },
    { departmentId: 2, name: '王强', username: 'doctor_wangqiang', title: '主任医师', specialty: '哮喘、肺癌', introduction: '呼吸科专家', phone: '13900001003' },
    { departmentId: 3, name: '赵雪', username: 'doctor_zhaoxue', title: '副主任医师', specialty: '胃炎、肠炎', introduction: '消化内镜专家', phone: '13900001004' },
    { departmentId: 5, name: '刘伟', username: 'doctor_liuwei', title: '主任医师', specialty: '腹腔镜手术', introduction: '普外科手术专家', phone: '13900001005' },
    { departmentId: 6, name: '陈刚', username: 'doctor_chengang', title: '副主任医师', specialty: '骨折、关节置换', introduction: '骨科微创手术专家', phone: '13900001006' },
    { departmentId: 8, name: '吴芳', username: 'doctor_wufang', title: '主任医师', specialty: '妇科肿瘤', introduction: '妇科专家', phone: '13900001007' },
    { departmentId: 10, name: '周丽', username: 'doctor_zhouli', title: '副主任医师', specialty: '儿童感冒、发热', introduction: '儿科专家', phone: '13900001008' },
  ];

  for (let i = 0; i < doctors.length; i++) {
    await prisma.doctor.upsert({
      where: { id: i + 1 },
      update: { ...doctors[i], password: doctorPassword },
      create: { ...doctors[i], password: doctorPassword, status: 1 },
    });
  }
  console.log('创建医生:', doctors.length);

  // 5. 创建药品分类
  const medicineCategories = [
    { name: '西药', sort: 1 },
    { name: '中成药', sort: 2 },
    { name: '中药饮片', sort: 3 },
    { name: '保健品', sort: 4 },
  ];

  for (const cat of medicineCategories) {
    await prisma.medicineCategory.upsert({
      where: { id: medicineCategories.indexOf(cat) + 1 },
      update: cat,
      create: cat,
    });
  }
  console.log('创建药品分类:', medicineCategories.length);

  // 6. 创建药品
  const medicines = [
    { categoryId: 1, name: '阿莫西林胶囊', specification: '0.5g*24粒', manufacturer: '华北制药', unit: '盒', price: 15.00, stock: 1000 },
    { categoryId: 1, name: '布洛芬缓释片', specification: '0.3g*20片', manufacturer: '中美史克', unit: '盒', price: 22.50, stock: 800 },
    { categoryId: 1, name: '阿司匹林肠溶片', specification: '100mg*30片', manufacturer: '拜耳', unit: '盒', price: 28.00, stock: 600 },
    { categoryId: 1, name: '奥美拉唑肠溶胶囊', specification: '20mg*14粒', manufacturer: '阿斯利康', unit: '盒', price: 35.00, stock: 500 },
    { categoryId: 1, name: '氯雷他定片', specification: '10mg*6片', manufacturer: '扬子江药业', unit: '盒', price: 18.00, stock: 700 },
    { categoryId: 2, name: '板蓝根颗粒', specification: '10g*20袋', manufacturer: '白云山', unit: '盒', price: 12.00, stock: 1200 },
    { categoryId: 2, name: '感冒清热颗粒', specification: '12g*10袋', manufacturer: '同仁堂', unit: '盒', price: 16.00, stock: 900 },
    { categoryId: 2, name: '六味地黄丸', specification: '200丸', manufacturer: '同仁堂', unit: '瓶', price: 25.00, stock: 400 },
  ];

  for (let i = 0; i < medicines.length; i++) {
    await prisma.medicine.upsert({
      where: { id: i + 1 },
      update: medicines[i],
      create: { ...medicines[i], status: 1 },
    });
  }
  console.log('创建药品:', medicines.length);

  // 7. 创建体检项目
  const examItems = [
    { name: '血常规', price: 25.00, description: '血液常规检查', normalRange: '参考检验报告', unit: '次' },
    { name: '尿常规', price: 20.00, description: '尿液常规检查', normalRange: '参考检验报告', unit: '次' },
    { name: '肝功能', price: 80.00, description: '肝功能检查', normalRange: 'ALT 0-40 U/L', unit: '次' },
    { name: '肾功能', price: 60.00, description: '肾功能检查', normalRange: '肌酐 44-133 μmol/L', unit: '次' },
    { name: '血糖', price: 15.00, description: '空腹血糖检查', normalRange: '3.9-6.1 mmol/L', unit: '次' },
    { name: '血脂', price: 50.00, description: '血脂四项检查', normalRange: '参考检验报告', unit: '次' },
    { name: '心电图', price: 30.00, description: '12导联心电图', normalRange: '正常心律', unit: '次' },
    { name: '胸部X光', price: 80.00, description: '胸部正侧位片', normalRange: '无异常', unit: '次' },
    { name: 'B超（肝胆脾）', price: 120.00, description: '腹部B超检查', normalRange: '无异常', unit: '次' },
    { name: '甲状腺功能', price: 150.00, description: '甲功五项检查', normalRange: '参考检验报告', unit: '次' },
  ];

  for (let i = 0; i < examItems.length; i++) {
    await prisma.examItem.upsert({
      where: { id: i + 1 },
      update: examItems[i],
      create: { ...examItems[i], status: 1 },
    });
  }
  console.log('创建体检项目:', examItems.length);

  // 8. 创建系统配置
  const systemConfigs = [
    { key: 'hospital_name', value: '智慧医疗中心', name: '医院名称', type: 'text' },
    { key: 'hospital_phone', value: '0571-88888888', name: '联系电话', type: 'text' },
    { key: 'hospital_address', value: '浙江省杭州市西湖区文三路100号', name: '医院地址', type: 'text' },
    { key: 'hospital_email', value: 'contact@hospital.com', name: '邮箱', type: 'text' },
    { key: 'working_hours', value: '周一至周日 8:00-17:00', name: '工作时间', type: 'text' },
    { key: 'hospital_intro', value: '智慧医疗中心是一家集医疗、教学、科研为一体的现代化综合医院。', name: '医院简介', type: 'textarea' },
  ];

  for (const config of systemConfigs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: config,
      create: config,
    });
  }
  console.log('创建系统配置:', systemConfigs.length);

  // 9. 创建导航
  const navigations = [
    { name: '首页', path: '/', icon: 'home', sort: 1, status: 1 },
    { name: '预约挂号', path: '/appointment', icon: 'calendar', sort: 2, status: 1 },
    { name: '科室导航', path: '/departments', icon: 'building', sort: 3, status: 1 },
    { name: '名医介绍', path: '/doctors', icon: 'user-md', sort: 4, status: 1 },
    { name: '健康资讯', path: '/news', icon: 'newspaper', sort: 5, status: 1 },
    { name: '就诊指南', path: '/guide', icon: 'info-circle', sort: 6, status: 1 },
  ];

  for (let i = 0; i < navigations.length; i++) {
    await prisma.navigation.upsert({
      where: { id: i + 1 },
      update: navigations[i],
      create: navigations[i],
    });
  }
  console.log('创建导航:', navigations.length);

  // 10. 创建页面内容
  const pageContents = [
    { code: 'about', title: '关于我们', content: '<h2>医院简介</h2><p>智慧医疗中心成立于2000年，是一家集医疗、教学、科研为一体的现代化综合性医院...</p>' },
    { code: 'privacy', title: '隐私政策', content: '<h2>隐私政策</h2><p>我们非常重视您的隐私保护...</p>' },
    { code: 'terms', title: '服务条款', content: '<h2>服务条款</h2><p>欢迎使用智慧医疗服务...</p>' },
  ];

  for (const page of pageContents) {
    await prisma.pageContent.upsert({
      where: { code: page.code },
      update: page,
      create: page,
    });
  }
  console.log('创建页面内容:', pageContents.length);

  // 11. 创建诊前须知
  const diagnosisGuides = [
    { title: '就诊须知', content: '<p>1. 请携带本人有效身份证件</p><p>2. 建议提前15分钟到达医院</p><p>3. 如需空腹检查，请提前禁食</p>', sort: 1 },
    { title: '预约挂号说明', content: '<p>1. 可通过网站、APP、电话预约</p><p>2. 预约成功后请按时就诊</p><p>3. 如需取消请提前24小时</p>', sort: 2 },
    { title: '医保报销说明', content: '<p>1. 请携带医保卡</p><p>2. 部分检查项目需自费</p><p>3. 详情请咨询医保窗口</p>', sort: 3 },
  ];

  for (let i = 0; i < diagnosisGuides.length; i++) {
    await prisma.diagnosisGuide.upsert({
      where: { id: i + 1 },
      update: diagnosisGuides[i],
      create: { ...diagnosisGuides[i], status: 1 },
    });
  }
  console.log('创建诊前须知:', diagnosisGuides.length);

  // 12. 创建新闻
  const news = [
    { title: '我院引进最新CT设备', content: '<p>为提升诊疗水平，我院引进了最新一代256层螺旋CT...</p>', type: 2, status: 1, sort: 1 },
    { title: '春季养生小贴士', content: '<p>春季是养生的好时节，建议多吃蔬菜水果...</p>', type: 1, status: 1, sort: 2 },
    { title: '五一假期门诊安排通知', content: '<p>五一假期期间，我院门诊正常开诊...</p>', type: 0, status: 1, sort: 3 },
  ];

  for (let i = 0; i < news.length; i++) {
    await prisma.news.upsert({
      where: { id: i + 1 },
      update: news[i],
      create: { ...news[i], views: 0 },
    });
  }
  console.log('创建新闻:', news.length);

  console.log('数据初始化完成！');
  console.log('----------------------------------------');
  console.log('管理员账号: admin / admin123');
  console.log('医生账号: doctor_zhangming / doctor123');
  console.log('----------------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
